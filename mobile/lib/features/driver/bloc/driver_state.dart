import 'package:equatable/equatable.dart';

abstract class DriverState extends Equatable {
  const DriverState();

  @override
  List<Object?> get props => [];
}

class DriverInitial extends DriverState {
  const DriverInitial();
}

class DriverLoading extends DriverState {
  const DriverLoading();
}

class DriverProfileLoaded extends DriverState {
  final String name;
  final int trustScore;
  final List<Map<String, dynamic>> recentDeliveries;

  const DriverProfileLoaded({
    required this.name,
    required this.trustScore,
    required this.recentDeliveries,
  });

  @override
  List<Object?> get props => [name, trustScore, recentDeliveries];
}

class DriverError extends DriverState {
  final String message;

  const DriverError(this.message);

  @override
  List<Object?> get props => [message];
}
