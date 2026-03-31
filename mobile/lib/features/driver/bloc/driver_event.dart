import 'package:equatable/equatable.dart';

abstract class DriverEvent extends Equatable {
  const DriverEvent();

  @override
  List<Object?> get props => [];
}

class DriverProfileLoadRequested extends DriverEvent {
  final int driverId;

  const DriverProfileLoadRequested(this.driverId);

  @override
  List<Object?> get props => [driverId];
}
