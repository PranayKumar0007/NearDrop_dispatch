import 'package:equatable/equatable.dart';

abstract class HubEvent extends Equatable {
  const HubEvent();

  @override
  List<Object?> get props => [];
}

class HubBroadcastsLoadRequested extends HubEvent {
  final int hubId;

  const HubBroadcastsLoadRequested(this.hubId);

  @override
  List<Object?> get props => [hubId];
}

class HubBroadcastAccepted extends HubEvent {
  final int broadcastId;
  final int hubId;

  const HubBroadcastAccepted({
    required this.broadcastId,
    required this.hubId,
  });

  @override
  List<Object?> get props => [broadcastId, hubId];
}

class HubStatsLoadRequested extends HubEvent {
  final int hubId;

  const HubStatsLoadRequested(this.hubId);

  @override
  List<Object?> get props => [hubId];
}

class HubNewBroadcastReceived extends HubEvent {
  final int hubId;

  const HubNewBroadcastReceived(this.hubId);

  @override
  List<Object?> get props => [hubId];
}
