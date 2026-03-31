class AppStrings {
  AppStrings._();

  // App
  static const String appName = 'NearDrop';

  // Auth
  static const String loginTitle = 'Welcome Back';
  static const String loginSubtitle = 'Sign in to continue';
  static const String phoneLabel = 'Phone Number';
  static const String phoneHint = '98765 43210';
  static const String passwordLabel = 'Password';
  static const String loginButton = 'Sign In';
  static const String loginError = 'Invalid phone or password';
  static const String sessionExpired = 'Session expired. Please log in again.';
  static const String roleDriver = 'Driver';
  static const String roleHub = 'Hub Owner';

  // Driver
  static const String activeDelivery = 'Active Delivery';
  static const String noActiveDelivery = 'No active delivery';
  static const String refreshDelivery = 'Refresh';
  static const String voicePrompt = 'Bol do...';
  static const String voiceListening = 'Listening...';
  static const String voiceProcessing = 'Processing...';
  static const String voiceIdle = 'Tap mic to speak';
  static const String deliveryComplete = 'Delivery completed!';
  static const String deliveryFailed = 'Delivery marked as failed';
  static const String arrivalConfirmed = 'Arrival confirmed';
  static const String broadcastingHubs = 'Broadcasting to nearby hubs...';
  static const String hubFound = 'Hub found!';
  static const String navigateToHub = 'Navigate to Hub';
  static const String pickupCode = 'Pickup Code';
  static const String deliveryHistory = 'Delivery History';
  static const String trustScore = 'Trust Score';
  static const String profile = 'Profile';
  static const String noHistory = 'No delivery history yet';
  static const String copyCode = 'Copy Code';
  static const String shareCode = 'Share';
  static const String codeCopied = 'Pickup code copied!';
  static const String weight = 'Weight';
  static const String recipient = 'Recipient';
  static const String orderNumber = 'Order';
  static const String packageSize = 'Size';

  // Hub
  static const String activePackages = 'Active Packages';
  static const String earnings = 'Earnings';
  static const String incomingPackage = 'Incoming Package';
  static const String acceptDelivery = 'Accept';
  static const String declineDelivery = 'Decline';
  static const String todayEarnings = "Today's Earnings";
  static const String weeklyEarnings = 'Weekly Earnings';
  static const String noPendingPackages = 'No pending packages';
  static const String perPackage = '₹25 per package';
  static const String distance = 'Distance';
  static const String reward = 'Reward';
  static const String accepted = 'Accepted';

  // Delivery status labels
  static const String statusEnRoute = 'En Route';
  static const String statusArrived = 'Arrived';
  static const String statusDelivered = 'Delivered';
  static const String statusFailed = 'Failed';

  // Actions
  static const String markArrived = 'Arrived';
  static const String markDelivered = 'Delivered';
  static const String markFailed = 'Failed';

  // General
  static const String loading = 'Loading...';
  static const String retry = 'Retry';
  static const String noInternet = 'No internet connection';
  static const String offlineBanner = 'You are offline. Some features may be unavailable.';
  static const String permissionDenied = 'Permission denied. Please enable in Settings.';
  static const String logout = 'Logout';
  static const String logoutConfirm = 'Are you sure you want to logout?';
  static const String cancel = 'Cancel';
  static const String confirm = 'Confirm';
  static const String close = 'Close';
  static const String newPackageIncoming = 'New package incoming!';
  static const String hubAccepted = 'Hub accepted your package!';
  static const String unrecognizedCommand = 'Command not recognized. Try again.';
  static const String locationPermissionRequired =
      'Location permission is required to report delivery failures.';
  static const String micPermissionRequired =
      'Microphone permission is required for voice commands.';
  static const String vehicle = 'Vehicle';
  static const String phone = 'Phone';
  static const String name = 'Name';
  static const String role = 'Role';
}
