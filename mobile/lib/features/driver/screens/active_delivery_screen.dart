import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:flutter_map/flutter_map.dart';
import 'package:geolocator/geolocator.dart';
import 'package:flutter_tts/flutter_tts.dart';
import 'package:latlong2/latlong.dart';
import 'package:permission_handler/permission_handler.dart';
import 'package:neardrop/core/constants/strings.dart';
import 'package:neardrop/core/theme/app_theme.dart';
import 'package:neardrop/features/driver/bloc/delivery_bloc.dart';
import 'package:neardrop/features/driver/bloc/delivery_event.dart';
import 'package:neardrop/features/driver/bloc/delivery_state.dart';
import 'package:neardrop/features/driver/bloc/voice_bloc.dart';
import 'package:neardrop/features/driver/bloc/voice_event.dart';
import 'package:neardrop/features/driver/bloc/voice_state.dart';
import 'package:neardrop/features/driver/widgets/delivery_status_card.dart';
import 'package:neardrop/features/driver/widgets/hub_drop_sheet.dart';
import 'package:neardrop/features/driver/widgets/voice_mic_button.dart';
import 'package:neardrop/shared/widgets/offline_banner.dart';

class ActiveDeliveryScreen extends StatefulWidget {
  final int driverId;

  const ActiveDeliveryScreen({super.key, required this.driverId});

  @override
  State<ActiveDeliveryScreen> createState() => _ActiveDeliveryScreenState();
}

class _ActiveDeliveryScreenState extends State<ActiveDeliveryScreen> {
  final FlutterTts _tts = FlutterTts();
  LatLng? _currentLocation;
  bool _isOffline = false;

  // Default to Hyderabad center
  static const LatLng _defaultLocation = LatLng(17.4239, 78.4738);

  @override
  void initState() {
    super.initState();
    _initLocation();
    _initTts();
  }

  Future<void> _initTts() async {
    await _tts.setLanguage('en-IN');
    await _tts.setSpeechRate(0.5);
  }

  Future<void> _initLocation() async {
    final status = await Permission.location.request();
    if (status.isGranted) {
      try {
        final pos = await Geolocator.getCurrentPosition(
          desiredAccuracy: LocationAccuracy.high,
        );
        if (mounted) {
          setState(() {
            _currentLocation = LatLng(pos.latitude, pos.longitude);
          });
        }
      } catch (_) {
        if (mounted) setState(() => _currentLocation = _defaultLocation);
      }
    } else {
      if (mounted) setState(() => _currentLocation = _defaultLocation);
    }
  }

  Future<void> _speak(String text) async {
    await _tts.speak(text);
  }

  void _handleVoiceCommand(
    BuildContext context,
    VoiceCommandRecognized state,
  ) {
    final deliveryState = context.read<DeliveryBloc>().state;
    if (deliveryState is! DeliveryLoaded || deliveryState.delivery == null) return;
    final delivery = deliveryState.delivery!;

    switch (state.intent) {
      case 'delivered':
        context
            .read<DeliveryBloc>()
            .add(DeliveryCompleteRequested(delivery.id));
        _speak(AppStrings.deliveryComplete);
        break;
      case 'failed':
        final loc = _currentLocation ?? _defaultLocation;
        context.read<DeliveryBloc>().add(DeliveryFailRequested(
              deliveryId: delivery.id,
              lat: loc.latitude,
              lng: loc.longitude,
            ));
        _speak(AppStrings.broadcastingHubs);
        break;
      case 'arrived':
        _speak(AppStrings.arrivalConfirmed);
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text(AppStrings.arrivalConfirmed)),
        );
        break;
      default:
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('"${state.transcript}" — ${AppStrings.unrecognizedCommand}'),
          ),
        );
    }
    context.read<VoiceBloc>().add(const VoiceReset());
  }

  @override
  void dispose() {
    _tts.stop();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return BlocListener<VoiceBloc, VoiceState>(
      listener: (context, voiceState) {
        if (voiceState is VoiceCommandRecognized) {
          _handleVoiceCommand(context, voiceState);
        } else if (voiceState is VoiceError) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text(voiceState.message),
              backgroundColor: AppColors.error,
            ),
          );
        }
      },
      child: BlocBuilder<DeliveryBloc, DeliveryState>(
        builder: (context, state) {
          return Column(
            children: [
              if (_isOffline) const OfflineBanner(),
              Expanded(child: _buildBody(context, state)),
            ],
          );
        },
      ),
    );
  }

  Widget _buildBody(BuildContext context, DeliveryState state) {
    if (state is DeliveryLoading) {
      return const Center(
        child: CircularProgressIndicator(color: AppColors.accent),
      );
    }

    if (state is DeliveryCompleted) {
      return _SuccessView(onRefresh: () {
        context
            .read<DeliveryBloc>()
            .add(DeliveryLoadRequested(widget.driverId));
      });
    }

    if (state is DeliveryError) {
      return _ErrorView(
        message: state.message,
        onRetry: () => context
            .read<DeliveryBloc>()
            .add(DeliveryLoadRequested(widget.driverId)),
      );
    }

    if (state is DeliveryLoaded && state.delivery == null) {
      return _NoDeliveryView(
        onRefresh: () => context
            .read<DeliveryBloc>()
            .add(DeliveryLoadRequested(widget.driverId)),
      );
    }

    if (state is DeliveryFailed) {
      return DraggableScrollableSheet(
        initialChildSize: 0.5,
        minChildSize: 0.3,
        maxChildSize: 0.9,
        builder: (_, controller) => HubDropSheet(hubs: state.nearbyHubs),
      );
    }

    final delivery = state is DeliveryLoaded ? state.delivery : null;
    if (delivery == null) {
      return const Center(
          child: CircularProgressIndicator(color: AppColors.accent));
    }

    final driverLoc = _currentLocation ?? _defaultLocation;

    return Stack(
      children: [
        // Map (top half)
        FlutterMap(
          options: MapOptions(
            initialCenter: driverLoc,
            initialZoom: 14,
          ),
          children: [
            TileLayer(
              urlTemplate: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
              userAgentPackageName: 'com.neardrop.app',
            ),
            MarkerLayer(
              markers: [
                Marker(
                  point: driverLoc,
                  width: 40,
                  height: 40,
                  child: const Icon(
                    Icons.two_wheeler_rounded,
                    color: AppColors.accent,
                    size: 32,
                  ),
                ),
              ],
            ),
          ],
        ),

        // Bottom card overlay
        DraggableScrollableSheet(
          initialChildSize: 0.52,
          minChildSize: 0.2,
          maxChildSize: 0.85,
          builder: (_, controller) => Container(
            decoration: const BoxDecoration(
              color: AppColors.background,
              borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
            ),
            child: ListView(
              controller: controller,
              padding: const EdgeInsets.fromLTRB(16, 8, 16, 24),
              children: [
                Center(
                  child: Container(
                    width: 40,
                    height: 4,
                    margin: const EdgeInsets.only(bottom: 16),
                    decoration: BoxDecoration(
                      color: AppColors.divider,
                      borderRadius: BorderRadius.circular(2),
                    ),
                  ),
                ),
                DeliveryStatusCard(
                  delivery: delivery,
                  onStatusChange: (status) {
                    if (status == 'delivered') {
                      context.read<DeliveryBloc>().add(
                            DeliveryCompleteRequested(delivery.id),
                          );
                    } else if (status == 'failed') {
                      final loc = _currentLocation ?? _defaultLocation;
                      context.read<DeliveryBloc>().add(DeliveryFailRequested(
                            deliveryId: delivery.id,
                            lat: loc.latitude,
                            lng: loc.longitude,
                          ));
                    }
                  },
                ),
                const SizedBox(height: 24),

                // Voice control
                BlocBuilder<VoiceBloc, VoiceState>(
                  builder: (context, voiceState) {
                    return Center(
                      child: VoiceMicButton(
                        state: voiceState,
                        onTap: () {
                          if (voiceState is VoiceListening) {
                            context
                                .read<VoiceBloc>()
                                .add(const VoiceStopListening());
                          } else if (voiceState is VoiceIdle ||
                              voiceState is VoiceCommandRecognized) {
                            context
                                .read<VoiceBloc>()
                                .add(const VoiceStartListening());
                          }
                        },
                      ),
                    );
                  },
                ),
              ],
            ),
          ),
        ),
      ],
    );
  }
}

class _SuccessView extends StatelessWidget {
  final VoidCallback onRefresh;
  const _SuccessView({required this.onRefresh});

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Container(
            width: 96,
            height: 96,
            decoration: BoxDecoration(
              shape: BoxShape.circle,
              color: AppColors.success.withOpacity(0.15),
            ),
            child: const Icon(
              Icons.check_circle_rounded,
              color: AppColors.success,
              size: 56,
            ),
          ),
          const SizedBox(height: 20),
          Text(
            AppStrings.deliveryComplete,
            style: Theme.of(context)
                .textTheme
                .titleLarge
                ?.copyWith(color: AppColors.success),
          ),
          const SizedBox(height: 32),
          TextButton.icon(
            onPressed: onRefresh,
            icon: const Icon(Icons.refresh_rounded),
            label: Text(AppStrings.refreshDelivery),
          ),
        ],
      ),
    );
  }
}

class _NoDeliveryView extends StatelessWidget {
  final VoidCallback onRefresh;
  const _NoDeliveryView({required this.onRefresh});

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          const Icon(
            Icons.inbox_rounded,
            color: AppColors.textSecondary,
            size: 64,
          ),
          const SizedBox(height: 16),
          Text(
            AppStrings.noActiveDelivery,
            style: Theme.of(context).textTheme.titleMedium,
          ),
          const SizedBox(height: 24),
          ElevatedButton.icon(
            onPressed: onRefresh,
            icon: const Icon(Icons.refresh_rounded, size: 18),
            label: Text(AppStrings.refreshDelivery),
            style: ElevatedButton.styleFrom(
              minimumSize: const Size(160, 44),
            ),
          ),
        ],
      ),
    );
  }
}

class _ErrorView extends StatelessWidget {
  final String message;
  final VoidCallback onRetry;
  const _ErrorView({required this.message, required this.onRetry});

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Icon(Icons.error_outline_rounded,
                color: AppColors.error, size: 48),
            const SizedBox(height: 16),
            Text(message,
                textAlign: TextAlign.center,
                style: Theme.of(context).textTheme.bodyMedium),
            const SizedBox(height: 24),
            ElevatedButton(
              onPressed: onRetry,
              child: Text(AppStrings.retry),
            ),
          ],
        ),
      ),
    );
  }
}
