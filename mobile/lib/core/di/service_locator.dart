import 'package:get_it/get_it.dart';
import 'package:neardrop/core/network/api_client.dart';
import 'package:neardrop/core/network/websocket_service.dart';
import 'package:neardrop/core/storage/secure_storage.dart';
import 'package:neardrop/features/auth/repository/auth_repository.dart';
import 'package:neardrop/features/driver/repository/driver_repository.dart';
import 'package:neardrop/features/hub/repository/hub_repository.dart';

final GetIt sl = GetIt.instance;

void setupServiceLocator() {
  // Core services
  sl.registerLazySingleton<SecureStorageService>(
    () => SecureStorageService(),
  );
  sl.registerLazySingleton<ApiClient>(
    () => ApiClient(sl<SecureStorageService>()),
  );
  sl.registerLazySingleton<WebSocketService>(
    () => WebSocketService(),
  );

  // Repositories
  sl.registerLazySingleton<AuthRepository>(
    () => AuthRepository(sl<ApiClient>(), sl<SecureStorageService>()),
  );
  sl.registerLazySingleton<DriverRepository>(
    () => DriverRepository(sl<ApiClient>()),
  );
  sl.registerLazySingleton<HubRepository>(
    () => HubRepository(sl<ApiClient>()),
  );
}
