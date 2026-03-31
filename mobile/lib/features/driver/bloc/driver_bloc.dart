import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:neardrop/features/driver/bloc/driver_event.dart';
import 'package:neardrop/features/driver/bloc/driver_state.dart';
import 'package:neardrop/features/driver/repository/driver_repository.dart';

class DriverBloc extends Bloc<DriverEvent, DriverState> {
  final DriverRepository _repository;

  DriverBloc(this._repository) : super(const DriverInitial()) {
    on<DriverProfileLoadRequested>(_onProfileLoad);
  }

  Future<void> _onProfileLoad(
    DriverProfileLoadRequested event,
    Emitter<DriverState> emit,
  ) async {
    emit(const DriverLoading());
    final result = await _repository.getDriverScore(event.driverId);
    if (result.isSuccess && result.data != null) {
      final data = result.data!;
      emit(DriverProfileLoaded(
        name: data['name'] as String? ?? '',
        trustScore: data['trust_score'] as int? ?? 0,
        recentDeliveries:
            (data['recent_deliveries'] as List? ?? [])
                .cast<Map<String, dynamic>>(),
      ));
    } else {
      emit(DriverError(result.error ?? 'Failed to load profile'));
    }
  }
}
