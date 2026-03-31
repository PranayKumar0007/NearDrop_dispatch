# NearDrop Mobile

Flutter mobile application for the NearDrop intelligent last-mile delivery recovery platform.

Targets **Android** (primary) and iOS. Communicates with the NearDrop FastAPI backend over REST and WebSocket.

---

## Prerequisites

| Tool | Minimum version |
|---|---|
| Flutter | 3.19.0 |
| Dart | 3.3.0 |
| Android Studio | Hedgehog (2023.1) or later |
| Android SDK | API 21+ (minSdk), API 34 (targetSdk) |
| Java | 17 (bundled with Android Studio) |
| VS Code (optional) | with Flutter & Dart extensions |

---

## Step-by-step Setup

### 1. Install dependencies
```bash
cd mobile
flutter pub get
```

### 2. Configure backend URL
Open `lib/core/config/app_config.dart` and verify the `baseUrl`:

```dart
// Android emulator → local backend
static const String baseUrl = 'http://10.0.2.2:8000';

// Physical device on same Wi-Fi → use your machine's local IP
static const String baseUrl = 'http://192.168.1.x:8000';

// Azure-hosted backend
static const String baseUrl = 'https://your-app.azurewebsites.net';
```

The `wsUrl` follows the same pattern replacing `http` with `ws` (or `https` with `wss`).

### 3. Add Firebase configuration
1. Create a Firebase project at https://console.firebase.google.com
2. Add an Android app with package name `com.neardrop.app`
3. Download `google-services.json`
4. Place it at `mobile/android/app/google-services.json`

> Without `google-services.json` the app will still run — Firebase init is wrapped in a try/catch and push notifications will simply be disabled.

### 4. Run the app
```bash
# List available devices
flutter devices

# Run on Android emulator
flutter run

# Run on a specific device
flutter run -d <device-id>

# Run with custom backend URL (avoids editing app_config.dart)
flutter run --dart-define=API_BASE_URL=http://10.0.2.2:8000 \
            --dart-define=WS_BASE_URL=ws://10.0.2.2:8000
```

---

## Local Backend vs Azure-Hosted

| Target | `baseUrl` | `wsUrl` |
|---|---|---|
| Android emulator → local | `http://10.0.2.2:8000` | `ws://10.0.2.2:8000` |
| Physical device → local | `http://<your-LAN-IP>:8000` | `ws://<your-LAN-IP>:8000` |
| Azure App Service | `https://<app>.azurewebsites.net` | `wss://<app>.azurewebsites.net` |

Start the local backend from the project root:
```bash
# Windows
venv\Scripts\activate && uvicorn backend.main:app --reload --port 8000

# Linux / macOS
source venv/bin/activate && uvicorn backend.main:app --reload --port 8000
```

---

## Test Credentials (seeded by `python -m backend.seed`)

| Role | Phone | Password |
|---|---|---|
| Driver | 9000000001 | driver123 |
| Driver | 9000000002 | driver123 |
| Driver | 9000000003 | driver123 |
| Hub Owner | 9000000004 | hub123 |
| Hub Owner | 9000000005 | hub123 |
| Hub Owner | 9000000006 | hub123 |

---

## Architecture Overview

### State management — BLoC
All features use the `flutter_bloc` package exclusively. No `setState`, `Provider`, or `Riverpod`.

```
UI (Screen/Widget)
    │  dispatches Events
    ▼
  Bloc
    │  calls
    ▼
Repository
    │  calls
    ▼
ApiClient (Dio)  ←→  FastAPI backend
```

### Feature-first folder structure
```
lib/
├── core/
│   ├── config/        # AppConfig (base URL, Azure keys)
│   ├── constants/     # AppStrings (all UI strings)
│   ├── di/            # get_it service locator
│   ├── network/       # ApiClient (Dio + JWT interceptor), WebSocketService
│   ├── storage/       # SecureStorageService (JWT, user info)
│   └── theme/         # AppTheme + AppColors
├── features/
│   ├── auth/          # LoginScreen, AuthBloc, AuthRepository
│   ├── driver/        # DriverHomeScreen, ActiveDeliveryScreen, HistoryScreen
│   │                  # DeliveryBloc, DriverBloc, VoiceBloc
│   └── hub/           # HubHomeScreen, ActivePackagesScreen, EarningsScreen
│                      # HubBloc
└── shared/
    ├── models/        # ApiResponse<T>
    └── widgets/       # OfflineBanner, LoadingOverlay
```

### Dependency injection — get_it
Services are registered in `lib/core/di/service_locator.dart` and accessed via `sl<T>()`:
- `SecureStorageService` — singleton
- `ApiClient` — singleton (depends on SecureStorageService)
- `WebSocketService` — singleton
- `AuthRepository`, `DriverRepository`, `HubRepository` — singletons

### Network
- All HTTP via `ApiClient` (Dio). JWT injected on every request via interceptor.
- 401 responses clear secure storage (token expired flow).
- WebSocket via `WebSocketService` — auto-reconnects with exponential backoff (1s→2s→4s→…→30s), keepalive ping every 20s.

---

## Azure Services Configuration

The backend reads these from environment variables. Set them in `backend/.env` or in Azure App Service Application Settings:

| Variable | Purpose |
|---|---|
| `AZURE_SPEECH_KEY` | Azure Cognitive Services Speech key (for STT token vending) |
| `AZURE_SPEECH_REGION` | e.g. `eastus` |
| `AZURE_MAPS_SUBSCRIPTION_KEY` | Azure Maps (geocoding) |
| `AZURE_COMMUNICATION_CONNECTION_STRING` | Azure Communication Services (SMS) |
| `FIREBASE_SERVICE_ACCOUNT_JSON` | Firebase Admin SDK service account JSON (as single-line string) |

---

## Building a Release APK

```bash
cd mobile
flutter build apk --release \
  --dart-define=API_BASE_URL=https://your-app.azurewebsites.net \
  --dart-define=WS_BASE_URL=wss://your-app.azurewebsites.net
```

Output: `build/app/outputs/flutter-apk/app-release.apk`
