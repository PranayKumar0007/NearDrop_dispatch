import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:neardrop/core/constants/strings.dart';
import 'package:neardrop/core/theme/app_theme.dart';
import 'package:neardrop/features/hub/models/hub_model.dart';

class EarningsSummaryCard extends StatelessWidget {
  final HubStatsModel stats;

  const EarningsSummaryCard({super.key, required this.stats});

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final formatter =
        NumberFormat.currency(locale: 'en_IN', symbol: '₹', decimalDigits: 0);

    return Card(
      child: Padding(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              AppStrings.todayEarnings,
              style: theme.textTheme.bodyMedium,
            ),
            const SizedBox(height: 8),
            Text(
              formatter.format(stats.todayEarnings),
              style: theme.textTheme.headlineMedium
                  ?.copyWith(color: AppColors.accent),
            ),
            const SizedBox(height: 20),
            const Divider(),
            const SizedBox(height: 16),
            Row(
              children: [
                Expanded(
                  child: _StatItem(
                    label: AppStrings.accepted,
                    value: stats.acceptedCount.toString(),
                    icon: Icons.check_circle_outline_rounded,
                    color: AppColors.success,
                  ),
                ),
                Expanded(
                  child: _StatItem(
                    label: AppStrings.trustScore,
                    value: stats.trustScore.toString(),
                    icon: Icons.verified_rounded,
                    color: AppColors.accent,
                  ),
                ),
                Expanded(
                  child: _StatItem(
                    label: AppStrings.perPackage,
                    value: '₹25',
                    icon: Icons.payments_outlined,
                    color: AppColors.warning,
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

class _StatItem extends StatelessWidget {
  final String label;
  final String value;
  final IconData icon;
  final Color color;

  const _StatItem({
    required this.label,
    required this.value,
    required this.icon,
    required this.color,
  });

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Column(
      children: [
        Icon(icon, color: color, size: 20),
        const SizedBox(height: 6),
        Text(
          value,
          style: theme.textTheme.titleLarge?.copyWith(color: color),
        ),
        const SizedBox(height: 2),
        Text(
          label,
          style: theme.textTheme.bodySmall,
          textAlign: TextAlign.center,
        ),
      ],
    );
  }
}
