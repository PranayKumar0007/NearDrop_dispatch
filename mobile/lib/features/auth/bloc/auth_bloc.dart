import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:neardrop/features/auth/bloc/auth_event.dart';
import 'package:neardrop/features/auth/bloc/auth_state.dart';
import 'package:neardrop/features/auth/repository/auth_repository.dart';

class AuthBloc extends Bloc<AuthEvent, AuthState> {
  final AuthRepository _repository;

  AuthBloc(this._repository) : super(const AuthInitial()) {
    on<TokenChecked>(_onTokenChecked);
    on<LoginRequested>(_onLoginRequested);
    on<LogoutRequested>(_onLogoutRequested);
  }

  Future<void> _onTokenChecked(
    TokenChecked event,
    Emitter<AuthState> emit,
  ) async {
    emit(const AuthLoading());
    final user = await _repository.getStoredUser();
    if (user != null) {
      emit(AuthAuthenticated(user));
    } else {
      emit(const AuthUnauthenticated());
    }
  }

  Future<void> _onLoginRequested(
    LoginRequested event,
    Emitter<AuthState> emit,
  ) async {
    emit(const AuthLoading());
    final result =
        await _repository.login(event.phone, event.password, event.role);
    if (result.isSuccess && result.data != null) {
      emit(AuthAuthenticated(result.data!));
    } else {
      emit(AuthError(result.error ?? 'Login failed'));
    }
  }

  Future<void> _onLogoutRequested(
    LogoutRequested event,
    Emitter<AuthState> emit,
  ) async {
    await _repository.logout();
    emit(const AuthUnauthenticated());
  }
}
