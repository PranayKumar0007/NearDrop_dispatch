import 'dart:async';
import 'dart:convert';
import 'dart:math';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:geolocator/geolocator.dart';
import 'package:http/http.dart' as http;
import 'package:latlong2/latlong.dart';
import 'package:neardrop/core/config/app_config.dart';
import 'package:neardrop/core/services/azure_tts_service.dart';

// ── Models ────────────────────────────────────────────────────────────────────

class NavigationInstruction {
  final String instructionText;
  final int distanceM;
  final String maneuver;
  final int pointIndex;
  final double lat;
  final double lng;

  const NavigationInstruction({
    required this.instructionText,
    required this.distanceM,
    required this.maneuver,
    required this.pointIndex,
    required this.lat,
    required this.lng,
  });

  factory NavigationInstruction.fromJson(Map<String, dynamic> json) =>
      NavigationInstruction(
        instructionText: json['instruction_text'] as String? ?? '',
        distanceM: (json['distance_m'] as num?)?.toInt() ?? 0,
        maneuver: json['maneuver'] as String? ?? 'STRAIGHT',
        pointIndex: (json['point_index'] as num?)?.toInt() ?? 0,
        lat: (json['lat'] as num?)?.toDouble() ?? 0.0,
        lng: (json['lng'] as num?)?.toDouble() ?? 0.0,
      );
}

class NavigationState {
  final List<LatLng> polyline;
  final NavigationInstruction? currentInstruction;
  final NavigationInstruction? nextInstruction;
  final int remainingDistanceM;
  final int remainingTimeS;
  final bool isRecalculating;
  final bool hasArrived;
  final int? arrivalCountdownSeconds;
  final LatLng? driverPosition;
  final double? driverHeading;

  const NavigationState({
    this.polyline = const [],
    this.currentInstruction,
    this.nextInstruction,
    this.remainingDistanceM = 0,
    this.remainingTimeS = 0,
    this.isRecalculating = false,
    this.hasArrived = false,
    this.arrivalCountdownSeconds,
    this.driverPosition,
    this.driverHeading,
  });

  NavigationState copyWith({
    List<LatLng>? polyline,
    NavigationInstruction? currentInstruction,
    bool clearCurrentInstruction = false,
    NavigationInstruction? nextInstruction,
    bool clearNextInstruction = false,
    int? remainingDistanceM,
    int? remainingTimeS,
    bool? isRecalculating,
    bool? hasArrived,
    int? arrivalCountdownSeconds,
    LatLng? driverPosition,
    double? driverHeading,
  }) =>
      NavigationState(
        polyline: polyline ?? this.polyline,
        currentInstruction: clearCurrentInstruction
            ? null
            : currentInstruction ?? this.currentInstruction,
        nextInstruction: clearNextInstruction
            ? null
            : nextInstruction ?? this.nextInstruction,
        remainingDistanceM: remainingDistanceM ?? this.remainingDistanceM,
        remainingTimeS: remainingTimeS ?? this.remainingTimeS,
        isRecalculating: isRecalculating ?? this.isRecalculating,
        hasArrived: hasArrived ?? this.hasArrived,
        arrivalCountdownSeconds:
            arrivalCountdownSeconds ?? this.arrivalCountdownSeconds,
        driverPosition: driverPosition ?? this.driverPosition,
        driverHeading: driverHeading ?? this.driverHeading,
      );
}

// ── Engine ────────────────────────────────────────────────────────────────────

class NavigationEngine {
  static final NavigationEngine _instance = NavigationEngine._internal();
  factory NavigationEngine() => _instance;
  NavigationEngine._internal();

  final StreamController<NavigationState> _stateController =
      StreamController<NavigationState>.broadcast();
  Stream<NavigationState> get stateStream => _stateController.stream;

  NavigationState _state = const NavigationState();
  NavigationState get currentState => _state;

  StreamSubscription<Position>? _gpsSub;
  Timer? _arrivalTimer;
  bool _isNavigating = false;

  List<NavigationInstruction> _instructions = [];
  int _currentInstrIndex = 0;
  LatLng? _destination;
  String? _destinationName;
  LatLng? _lastKnownPosition;

  VoidCallback? onArrivalComplete;

  final FlutterSecureStorage _storage = const FlutterSecureStorage();

  void _emit(NavigationState state) {
    _state = state;
    if (!_stateController.isClosed) _stateController.add(state);
  }

  Future<void> startNavigation({
    required double destLat,
    required double destLng,
    required String customerName,
    VoidCallback? onArrival,
  }) async {
    if (_isNavigating) await stopNavigation();
    _isNavigating = true;
    onArrivalComplete = onArrival;
    _destination = LatLng(destLat, destLng);
    _destinationName = customerName;
    _currentInstrIndex = 0;

    // Get current position — use last known if GPS times out
    Position? current;
    try {
      current = await Geolocator.getCurrentPosition(
        desiredAccuracy: LocationAccuracy.high,
      ).timeout(const Duration(seconds: 10));
      _lastKnownPosition = LatLng(current.latitude, current.longitude);
    } catch (_) {
      current = null;
    }

    // Use last known or fall back to destination (so map doesn't show 0,0)
    final originLat =
        current?.latitude ?? _lastKnownPosition?.latitude ?? destLat;
    final originLng =
        current?.longitude ?? _lastKnownPosition?.longitude ?? destLng;

    _emit(_state.copyWith(
      isRecalculating: true,
      driverPosition: LatLng(originLat, originLng),
    ));

    await _fetchAndApplyRoute(originLat, originLng, destLat, destLng);

    // Speak first instruction
    if (_instructions.isNotEmpty) {
      AzureTtsService().speakImmediate(_instructions[0].instructionText);
    }

    // Start GPS tracking with more forgiving settings
    _gpsSub = Geolocator.getPositionStream(
      locationSettings: const LocationSettings(
        accuracy: LocationAccuracy.high,
        distanceFilter: 8, // Update every 8m (was 5m — gives more stability)
      ),
    ).listen(_onGpsUpdate);
  }

  Future<void> _fetchAndApplyRoute(
      double originLat, double originLng, double destLat, double destLng) async {
    try {
      final token = await _storage.read(key: 'jwt_token');
      final uri = Uri.parse(
        '${AppConfig.baseUrl}/navigation/route'
        '?origin_lat=$originLat&origin_lng=$originLng'
        '&dest_lat=$destLat&dest_lng=$destLng',
      );
      final resp = await http.get(
        uri,
        headers: {
          if (token != null) 'Authorization': 'Bearer $token',
        },
      ).timeout(const Duration(seconds: 15));

      if (resp.statusCode == 200) {
        final data = jsonDecode(resp.body) as Map<String, dynamic>;
        final rawPolyline = (data['polyline'] as List<dynamic>?) ?? [];
        final polyline = rawPolyline
            .map((p) => LatLng((p[0] as num).toDouble(), (p[1] as num).toDouble()))
            .toList();

        final rawInstrs = (data['instructions'] as List<dynamic>?) ?? [];
        _instructions = rawInstrs
            .map((i) => NavigationInstruction.fromJson(i as Map<String, dynamic>))
            .toList();
        _currentInstrIndex = 0;

        final totalDistM = (data['total_distance_m'] as num?)?.toInt() ?? 0;
        final totalTimeS = (data['total_time_s'] as num?)?.toInt() ?? 0;

        _emit(_state.copyWith(
          polyline: polyline,
          currentInstruction:
              _instructions.isNotEmpty ? _instructions[0] : null,
          nextInstruction:
              _instructions.length > 1 ? _instructions[1] : null,
          remainingDistanceM: totalDistM,
          remainingTimeS: totalTimeS,
          isRecalculating: false,
        ));
      } else {
        _emit(_state.copyWith(isRecalculating: false));
      }
    } catch (_) {
      _emit(_state.copyWith(isRecalculating: false));
    }
  }

  void _onGpsUpdate(Position pos) {
    if (!_isNavigating || _stateController.isClosed) return;

    final driverPos = LatLng(pos.latitude, pos.longitude);
    _lastKnownPosition = driverPos;

    // FIX: correct heading sign — positive heading means clockwise rotation
    // The map should rotate so the driver always faces "up" on screen
    final heading = pos.heading; // degrees, clockwise from North

    // Check if arrived at destination (80m threshold — was 50m, GPS drift fix)
    if (_destination != null) {
      final distToDest = _haversine(
          pos.latitude, pos.longitude, _destination!.latitude, _destination!.longitude);
      if (distToDest < 80) {
        _triggerArrival();
        return;
      }
    }

    // Advance through instructions: find the closest upcoming instruction point
    // instead of strictly checking the next index (fixes getting stuck)
    if (_currentInstrIndex < _instructions.length) {
      // Check if we're past the current instruction's point
      final instr = _instructions[_currentInstrIndex];
      final distToInstr =
          _haversine(pos.latitude, pos.longitude, instr.lat, instr.lng);

      if (distToInstr < 100) {
        // Close enough — speak and advance
        AzureTtsService().speak(instr.instructionText);
        _currentInstrIndex++;

        // Pre-announce next instruction if it's close
        if (_currentInstrIndex < _instructions.length) {
          final nextInstr = _instructions[_currentInstrIndex];
          final distToNext = _haversine(
              pos.latitude, pos.longitude, nextInstr.lat, nextInstr.lng);
          if (distToNext < 300) {
            // Announce upcoming turn
            AzureTtsService()
                .speak('In ${_formatDist(distToNext.round())}, ${nextInstr.instructionText}');
          }
        }
      }
    }

    // Route deviation check (200m threshold — was 150m, more forgiving)
    if (_state.polyline.isNotEmpty && !_state.isRecalculating) {
      final distToPolyline =
          _distanceToPolyline(pos.latitude, pos.longitude, _state.polyline);
      if (distToPolyline > 200) {
        _emit(_state.copyWith(
          isRecalculating: true,
          driverPosition: driverPos,
          driverHeading: heading,
        ));
        AzureTtsService().speak('Recalculating route');
        if (_destination != null) {
          _fetchAndApplyRoute(
              pos.latitude,
              pos.longitude,
              _destination!.latitude,
              _destination!.longitude);
        }
        return;
      }
    }

    // Remaining distance to destination
    int remainingDist = _state.remainingDistanceM;
    if (_destination != null) {
      remainingDist = _haversine(pos.latitude, pos.longitude,
              _destination!.latitude, _destination!.longitude)
          .round();
    }

    // ETA — use actual speed; default 25 km/h when stationary
    final speedKmh = pos.speed * 3.6;
    final effectiveSpeed = speedKmh > 5 ? speedKmh : 25.0;
    final remainingTimeS =
        ((remainingDist / 1000) / effectiveSpeed * 3600).round();

    final currentInstr = _currentInstrIndex < _instructions.length
        ? _instructions[_currentInstrIndex]
        : null;
    final nextInstr = _currentInstrIndex + 1 < _instructions.length
        ? _instructions[_currentInstrIndex + 1]
        : null;

    _emit(_state.copyWith(
      driverPosition: driverPos,
      driverHeading: heading, // FIX: removed negation — was -heading (wrong!)
      currentInstruction: currentInstr,
      clearCurrentInstruction: currentInstr == null,
      nextInstruction: nextInstr,
      clearNextInstruction: nextInstr == null,
      remainingDistanceM: remainingDist,
      remainingTimeS: remainingTimeS,
      isRecalculating: false,
    ));
  }

  String _formatDist(int metres) {
    if (metres >= 1000) return '${(metres / 1000).toStringAsFixed(1)} km';
    return '${metres} m';
  }

  void _triggerArrival() {
    _gpsSub?.cancel();
    _gpsSub = null;
    AzureTtsService()
        .speakImmediate("You have arrived at ${_destinationName ?? 'the destination'}");

    _emit(_state.copyWith(
      hasArrived: true,
      arrivalCountdownSeconds: 30,
    ));

    int countdown = 30;
    _arrivalTimer = Timer.periodic(const Duration(seconds: 1), (timer) {
      countdown--;
      _emit(_state.copyWith(arrivalCountdownSeconds: countdown));
      if (countdown <= 0) {
        timer.cancel();
        onArrivalComplete?.call();
      }
    });
  }

  Future<void> stopNavigation() async {
    _isNavigating = false;
    _gpsSub?.cancel();
    _gpsSub = null;
    _arrivalTimer?.cancel();
    _arrivalTimer = null;
    _instructions = [];
    _currentInstrIndex = 0;
    _destination = null;
    _emit(const NavigationState());
  }

  // ── Math helpers ─────────────────────────────────────────────────────────

  // Haversine distance in meters
  double _haversine(double lat1, double lon1, double lat2, double lon2) {
    const R = 6371000.0;
    final dLat = _toRad(lat2 - lat1);
    final dLon = _toRad(lon2 - lon1);
    final a = sin(dLat / 2) * sin(dLat / 2) +
        cos(_toRad(lat1)) * cos(_toRad(lat2)) * sin(dLon / 2) * sin(dLon / 2);
    return R * 2 * atan2(sqrt(a), sqrt(1 - a));
  }

  double _toRad(double deg) => deg * pi / 180;

  // Minimum distance from point to any segment on the polyline
  double _distanceToPolyline(double lat, double lon, List<LatLng> poly) {
    if (poly.isEmpty) return double.infinity;
    double minDist = double.infinity;
    for (final p in poly) {
      final d = _haversine(lat, lon, p.latitude, p.longitude);
      if (d < minDist) minDist = d;
    }
    return minDist;
  }

  void dispose() {
    _isNavigating = false;
    _gpsSub?.cancel();
    _arrivalTimer?.cancel();
    _stateController.close();
  }
}

// Flutter callback type alias
typedef VoidCallback = void Function();
