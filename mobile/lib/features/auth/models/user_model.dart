import 'package:equatable/equatable.dart';

class UserModel extends Equatable {
  final int userId;
  final String role;
  final String name;
  final String? phone;

  const UserModel({
    required this.userId,
    required this.role,
    required this.name,
    this.phone,
  });

  factory UserModel.fromJson(Map<String, dynamic> json) => UserModel(
        userId: json['user_id'] as int,
        role: json['role'] as String,
        name: json['name'] as String,
        phone: json['phone'] as String?,
      );

  bool get isDriver => role == 'driver';
  bool get isHubOwner => role == 'hub_owner';

  @override
  List<Object?> get props => [userId, role, name, phone];
}
