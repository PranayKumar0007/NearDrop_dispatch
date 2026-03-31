import 'package:equatable/equatable.dart';

abstract class AuthEvent extends Equatable {
  const AuthEvent();

  @override
  List<Object?> get props => [];
}

class TokenChecked extends AuthEvent {
  const TokenChecked();
}

class LoginRequested extends AuthEvent {
  final String phone;
  final String password;
  final String role;

  const LoginRequested({
    required this.phone,
    required this.password,
    required this.role,
  });

  @override
  List<Object?> get props => [phone, password, role];
}

class LogoutRequested extends AuthEvent {
  const LogoutRequested();
}
