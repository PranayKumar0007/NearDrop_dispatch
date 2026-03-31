class AppConfig {
  AppConfig._();

  static const String baseUrl = String.fromEnvironment(
    'API_BASE_URL',
    defaultValue: 'http://10.0.2.2:8000',
  );

  static const String wsUrl = String.fromEnvironment(
    'WS_BASE_URL',
    defaultValue: 'ws://10.0.2.2:8000',
  );

  static const String azureMapsKey = String.fromEnvironment(
    'AZURE_MAPS_KEY',
    defaultValue: '',
  );

  static const String azureSpeechRegion = String.fromEnvironment(
    'AZURE_SPEECH_REGION',
    defaultValue: 'eastus',
  );
}
