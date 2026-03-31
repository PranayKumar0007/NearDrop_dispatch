import 'package:equatable/equatable.dart';
import 'package:neardrop/features/driver/models/delivery_model.dart';

abstract class DeliveryState extends Equatable {
  const DeliveryState();

  @override
  List<Object?> get props => [];
}

class DeliveryInitial extends DeliveryState {
  const DeliveryInitial();
}

class DeliveryLoading extends DeliveryState {
  const DeliveryLoading();
}

class DeliveryLoaded extends DeliveryState {
  final DeliveryModel? delivery;

  const DeliveryLoaded(this.delivery);

  @override
  List<Object?> get props => [delivery];
}

class DeliveryFailed extends DeliveryState {
  final List<NearbyHubModel> nearbyHubs;
  final DeliveryModel delivery;

  const DeliveryFailed({
    required this.nearbyHubs,
    required this.delivery,
  });

  @override
  List<Object?> get props => [nearbyHubs, delivery];
}

class DeliveryCompleted extends DeliveryState {
  final int deliveryId;

  const DeliveryCompleted(this.deliveryId);

  @override
  List<Object?> get props => [deliveryId];
}

class DeliveryError extends DeliveryState {
  final String message;

  const DeliveryError(this.message);

  @override
  List<Object?> get props => [message];
}
