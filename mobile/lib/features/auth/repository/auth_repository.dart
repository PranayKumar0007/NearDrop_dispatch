import 'package:jwt_decoder/jwt_decoder.dart';
import 'package:neardrop/core/network/api_client.dart';
import 'package:neardrop/core/storage/secure_storage.dart';
import 'package:neardrop/features/auth/models/user_model.dart';
import 'package:neardrop/shared/models/api_response.dart';

class AuthRepository {
  final ApiClient _api;
  final SecureStorageService _storage;

  AuthRepository(this._api, this._storage);

  Future<ApiResponse<UserModel>> login(
    String phone,
    String password,
    String role,
  ) async {
    try {
      final response = await _api.post('/auth/login', data: {
        'phone': phone,
        'password': password,
        'role': role,
      });
      final data = response.data as Map<String, dynamic>;
      final token = data['access_token'] as String;
      await _storage.saveToken(token);
      await _storage.saveUserInfo(
        userId: data['user_id'] as int,
        role: data['role'] as String,
        name: data['name'] as String,
      );
      return ApiResponse.success(UserModel(
        userId: data['user_id'] as int,
        role: data['role'] as String,
        name: data['name'] as String,
      ));
    } catch (e) {
      return const ApiResponse.failure('Invalid phone or password');
    }
  }

  Future<UserModel?> getStoredUser() async {
    final token = await _storage.getToken();
    if (token == null) return null;
    try {
      if (JwtDecoder.isExpired(token)) {
        await _storage.clearAll();
        return null;
      }
    } catch (_) {
      await _storage.clearAll();
      return null;
    }
    final info = await _storage.getUserInfo();
    final userId = int.tryParse(info['userId'] ?? '');
    if (userId == null) return null;
    return UserModel(
      userId: userId,
      role: info['role'] ?? '',
      name: info['name'] ?? '',
    );
  }

  Future<void> logout() => _storage.clearAll();
}
