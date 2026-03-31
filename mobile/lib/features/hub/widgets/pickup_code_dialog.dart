import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:neardrop/core/constants/strings.dart';
import 'package:neardrop/core/theme/app_theme.dart';

class PickupCodeDialog extends StatelessWidget {
  final String pickupCode;
  final String hubName;

  const PickupCodeDialog({
    super.key,
    required this.pickupCode,
    required this.hubName,
  });

  static Future<void> show(
    BuildContext context, {
    required String pickupCode,
    required String hubName,
  }) {
    return showDialog<void>(
      context: context,
      barrierDismissible: false,
      builder: (_) => PickupCodeDialog(
        pickupCode: pickupCode,
        hubName: hubName,
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final digits = pickupCode.split('');

    return AlertDialog(
      backgroundColor: AppColors.surface,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
      title: Column(
        children: [
          Container(
            width: 56,
            height: 56,
            decoration: BoxDecoration(
              shape: BoxShape.circle,
              color: AppColors.success.withOpacity(0.15),
            ),
            child: const Icon(
              Icons.check_circle_rounded,
              color: AppColors.success,
              size: 32,
            ),
          ),
          const SizedBox(height: 12),
          Text(
            AppStrings.acceptDelivery,
            style: theme.textTheme.titleLarge,
            textAlign: TextAlign.center,
          ),
          const SizedBox(height: 4),
          Text(
            hubName,
            style: theme.textTheme.bodyMedium,
            textAlign: TextAlign.center,
          ),
        ],
      ),
      content: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Text(
            AppStrings.pickupCode,
            style: theme.textTheme.bodySmall,
          ),
          const SizedBox(height: 16),

          // Code digits
          Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: digits.asMap().entries.map((entry) {
              return Container(
                margin: const EdgeInsets.symmetric(horizontal: 4),
                width: 40,
                height: 52,
                decoration: BoxDecoration(
                  color: AppColors.accent.withOpacity(0.12),
                  borderRadius: BorderRadius.circular(10),
                  border: Border.all(
                    color: AppColors.accent.withOpacity(0.4),
                  ),
                ),
                child: Center(
                  child: Text(
                    entry.value,
                    style: const TextStyle(
                      color: AppColors.accent,
                      fontSize: 24,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ),
              );
            }).toList(),
          ),
          const SizedBox(height: 20),

          // Copy & Share
          Row(
            children: [
              Expanded(
                child: OutlinedButton.icon(
                  onPressed: () {
                    Clipboard.setData(ClipboardData(text: pickupCode));
                    ScaffoldMessenger.of(context).showSnackBar(
                      const SnackBar(
                        content: Text(AppStrings.codeCopied),
                        backgroundColor: AppColors.success,
                      ),
                    );
                  },
                  icon: const Icon(Icons.copy_rounded, size: 16),
                  label: Text(AppStrings.copyCode),
                  style: OutlinedButton.styleFrom(
                    foregroundColor: AppColors.accent,
                    side: const BorderSide(color: AppColors.accent),
                    padding: const EdgeInsets.symmetric(vertical: 12),
                    minimumSize: Size.zero,
                  ),
                ),
              ),
              const SizedBox(width: 8),
              Expanded(
                child: OutlinedButton.icon(
                  onPressed: () {
                    // In production: Share.share('Your pickup code: $pickupCode')
                    ScaffoldMessenger.of(context).showSnackBar(
                      SnackBar(
                        content: Text('Code: $pickupCode'),
                      ),
                    );
                  },
                  icon: const Icon(Icons.share_rounded, size: 16),
                  label: Text(AppStrings.shareCode),
                  style: OutlinedButton.styleFrom(
                    foregroundColor: AppColors.accent,
                    side: const BorderSide(color: AppColors.accent),
                    padding: const EdgeInsets.symmetric(vertical: 12),
                    minimumSize: Size.zero,
                  ),
                ),
              ),
            ],
          ),
        ],
      ),
      actions: [
        SizedBox(
          width: double.infinity,
          child: ElevatedButton(
            onPressed: () => Navigator.of(context).pop(),
            child: Text(AppStrings.close),
          ),
        ),
      ],
    );
  }
}
