import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:permission_handler/permission_handler.dart';
import 'package:speech_to_text/speech_to_text.dart';
import 'package:neardrop/features/driver/bloc/voice_event.dart';
import 'package:neardrop/features/driver/bloc/voice_state.dart';

class VoiceBloc extends Bloc<VoiceEvent, VoiceState> {
  final SpeechToText _stt = SpeechToText();
  bool _available = false;

  VoiceBloc() : super(const VoiceIdle()) {
    on<VoiceStartListening>(_onStart);
    on<VoiceStopListening>(_onStop);
    on<VoiceTranscriptReceived>(_onTranscript);
    on<VoiceReset>(_onReset);
    _init();
  }

  Future<void> _init() async {
    final status = await Permission.microphone.request();
    if (status.isGranted) {
      _available = await _stt.initialize(
        onStatus: (s) {
          if (s == 'done' || s == 'notListening') {
            if (!isClosed) add(const VoiceStopListening());
          }
        },
      );
    }
  }

  Future<void> _onStart(
    VoiceStartListening event,
    Emitter<VoiceState> emit,
  ) async {
    if (!_available) {
      emit(const VoiceError('Microphone not available'));
      return;
    }
    emit(const VoiceListening());
    await _stt.listen(
      onResult: (result) {
        if (result.finalResult && !isClosed) {
          add(VoiceTranscriptReceived(result.recognizedWords));
        }
      },
      listenFor: const Duration(seconds: 10),
      pauseFor: const Duration(seconds: 3),
      localeId: 'en_IN',
      cancelOnError: true,
    );
  }

  Future<void> _onStop(
    VoiceStopListening event,
    Emitter<VoiceState> emit,
  ) async {
    if (_stt.isListening) await _stt.stop();
    emit(const VoiceIdle());
  }

  void _onTranscript(
    VoiceTranscriptReceived event,
    Emitter<VoiceState> emit,
  ) {
    emit(const VoiceProcessing());
    final intent = _classify(event.transcript.toLowerCase());
    emit(VoiceCommandRecognized(
      intent: intent,
      transcript: event.transcript,
    ));
  }

  void _onReset(VoiceReset event, Emitter<VoiceState> emit) {
    emit(const VoiceIdle());
  }

  String _classify(String text) {
    if (text.contains('deliver') ||
        text.contains('done') ||
        text.contains('complete') ||
        text.contains('ho gaya') ||
        text.contains('दिया')) {
      return 'delivered';
    }
    if (text.contains('fail') ||
        text.contains('unable') ||
        text.contains('nahi') ||
        text.contains('customer nahi') ||
        text.contains('नहीं')) {
      return 'failed';
    }
    if (text.contains('arriv') ||
        text.contains('reached') ||
        text.contains('pahunch') ||
        text.contains('पहुंच')) {
      return 'arrived';
    }
    if (text.contains('navigate') ||
        text.contains('direction') ||
        text.contains('rasta') ||
        text.contains('raasta')) {
      return 'navigate';
    }
    return 'unknown';
  }

  @override
  Future<void> close() {
    _stt.cancel();
    return super.close();
  }
}
