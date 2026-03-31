import 'package:flutter_secure_storage/flutter_secure_storage.dart';

class SecureStorageService {
  static const FlutterSecureStorage _storage = FlutterSecureStorage(
    aOptions: AndroidOptions(encryptedSharedPreferences: true),
  );

  static const String _tokenKey = 'jwt_token';
  static const String _userIdKey = 'user_id';
  static const String _roleKey = 'user_role';
  static const String _nameKey = 'user_name';

  Future<void> saveToken(String token) =>
      _storage.write(key: _tokenKey, value: token);

  Future<String?> getToken() => _storage.read(key: _tokenKey);

  Future<void> saveUserInfo({
    required int userId,
    required String role,
    required String name,
  }) async {
    await Future.wait([
      _storage.write(key: _userIdKey, value: userId.toString()),
      _storage.write(key: _roleKey, value: role),
      _storage.write(key: _nameKey, value: name),
    ]);
  }

  Future<Map<String, String?>> getUserInfo() async {
    final results = await Future.wait([
      _storage.read(key: _userIdKey),
      _storage.read(key: _roleKey),
      _storage.read(key: _nameKey),
    ]);
    return {
      'userId': results[0],
      'role': results[1],
      'name': results[2],
    };
  }

  Future<void> clearAll() => _storage.deleteAll();
}
