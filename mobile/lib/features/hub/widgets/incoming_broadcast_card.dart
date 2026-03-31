import 'package:flutter/material.dart';
import 'package:neardrop/core/constants/strings.dart';
import 'package:neardrop/core/theme/app_theme.dart';
import 'package:neardrop/features/hub/models/hub_model.dart';

class IncomingBroadcastCard extends StatelessWidget {
  final BroadcastModel broadcast;
  final VoidCallback onAccept;
  final VoidCallback onDecline;

  const IncomingBroadcastCard({
    super.key,
    required this.broadcast,
    required this.onAccept,
    required this.onDecline,
  });

  IconData get _sizeIcon {
    switch (broadcast.packageSize) {
      case 'large':
        return Icons.inventory_2_rounded;
      case 'small':
        return Icons.inventory_outlined;
      default:
        return Icons.inventory_rounded;
    }
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Header
            Row(
              children: [
                Container(
                  width: 40,
                  height: 40,
                  decoration: BoxDecoration(
                    color: AppColors.accent.withOpacity(0.15),
                    borderRadius: BorderRadius.circular(10),
                  ),
                  child: Icon(_sizeIcon, color: AppColors.accent, size: 20),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        broadcast.orderId,
                        style: theme.textTheme.labelLarge
                            ?.copyWith(color: AppColors.accent),
                      ),
                      Text(
                        broadcast.packageSize.toUpperCase(),
                        style: theme.textTheme.bodySmall,
                      ),
                    ],
                  ),
                ),
                Container(
                  padding: const EdgeInsets.symmetric(
                      horizontal: 10, vertical: 6),
                  decoration: BoxDecoration(
                    color: AppColors.success.withOpacity(0.15),
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: Text(
                    '₹${broadcast.reward.toStringAsFixed(0)}',
                    style: const TextStyle(
                      color: AppColors.success,
                      fontWeight: FontWeight.bold,
                      fontSize: 14,
                    ),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 12),

            // Address
            Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Icon(Icons.location_on_rounded,
                    color: AppColors.textSecondary, size: 16),
                const SizedBox(width: 6),
                Expanded(
                  child: Text(
                    broadcast.address,
                    style: theme.textTheme.bodyMedium,
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 6),

            // Distance & weight
            Row(
              children: [
                const Icon(Icons.straighten_rounded,
                    color: AppColors.textSecondary, size: 14),
                const SizedBox(width: 4),
                Text(
                  broadcast.formattedDistance,
                  style: theme.textTheme.bodySmall,
                ),
                const SizedBox(width: 16),
                const Icon(Icons.monitor_weight_outlined,
                    color: AppColors.textSecondary, size: 14),
                const SizedBox(width: 4),
                Text(
                  '${broadcast.weightKg} kg',
                  style: theme.textTheme.bodySmall,
                ),
              ],
            ),
            const SizedBox(height: 16),

            // Action buttons
            Row(
              children: [
                Expanded(
                  child: OutlinedButton(
                    onPressed: onDecline,
                    child: Text(AppStrings.declineDelivery),
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  flex: 2,
                  child: ElevatedButton.icon(
                    onPressed: onAccept,
                    icon: const Icon(Icons.check_rounded, size: 18),
                    label: Text(AppStrings.acceptDelivery),
                    style: ElevatedButton.styleFrom(
                      minimumSize: const Size(0, 44),
                    ),
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}
