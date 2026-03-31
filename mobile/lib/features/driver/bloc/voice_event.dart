import 'package:equatable/equatable.dart';

abstract class VoiceEvent extends Equatable {
  const VoiceEvent();

  @override
  List<Object?> get props => [];
}

class VoiceStartListening extends VoiceEvent {
  const VoiceStartListening();
}

class VoiceStopListening extends VoiceEvent {
  const VoiceStopListening();
}

class VoiceTranscriptReceived extends VoiceEvent {
  final String transcript;

  const VoiceTranscriptReceived(this.transcript);

  @override
  List<Object?> get props => [transcript];
}

class VoiceReset extends VoiceEvent {
  const VoiceReset();
}
