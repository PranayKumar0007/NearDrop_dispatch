import 'package:equatable/equatable.dart';

abstract class VoiceState extends Equatable {
  const VoiceState();

  @override
  List<Object?> get props => [];
}

class VoiceIdle extends VoiceState {
  const VoiceIdle();
}

class VoiceListening extends VoiceState {
  const VoiceListening();
}

class VoiceProcessing extends VoiceState {
  const VoiceProcessing();
}

class VoiceCommandRecognized extends VoiceState {
  /// Possible values: 'delivered' | 'failed' | 'arrived' | 'navigate' | 'unknown'
  final String intent;
  final String transcript;

  const VoiceCommandRecognized({
    required this.intent,
    required this.transcript,
  });

  @override
  List<Object?> get props => [intent, transcript];
}

class VoiceError extends VoiceState {
  final String message;

  const VoiceError(this.message);

  @override
  List<Object?> get props => [message];
}
