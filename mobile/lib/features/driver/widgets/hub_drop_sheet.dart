import 'package:flutter/material.dart';
import 'package:neardrop/core/constants/strings.dart';
import 'package:neardrop/core/theme/app_theme.dart';
import 'package:neardrop/features/driver/models/delivery_model.dart';

class HubDropSheet extends StatelessWidget {
  final List<NearbyHubModel> hubs;
  final bool isLoading;

  const HubDropSheet({
    super.key,
    required this.hubs,
    this.isLoading = false,
  });

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Container(
      decoration: const BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      padding: const EdgeInsets.fromLTRB(20, 12, 20, 32),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          // Handle
          Center(
            child: Container(
              width: 40,
              height: 4,
              decoration: BoxDecoration(
                color: AppColors.divider,
                borderRadius: BorderRadius.circular(2),
              ),
            ),
          ),
          const SizedBox(height: 20),

          if (isLoading || hubs.isEmpty) ...[
            const SizedBox(height: 16),
            const CircularProgressIndicator(color: AppColors.accent),
            const SizedBox(height: 16),
            Text(
              AppStrings.broadcastingHubs,
              style: theme.textTheme.titleMedium?.copyWith(
                color: AppColors.accent,
              ),
            ),
            const _AnimatedDots(),
            const SizedBox(height: 32),
          ] else ...[
            Row(
              children: [
                const Icon(
                  Icons.hub_rounded,
                  color: AppColors.accent,
                  size: 20,
                ),
                const SizedBox(width: 8),
                Text(
                  AppStrings.hubFound,
                  style: theme.textTheme.titleMedium,
                ),
                const Spacer(),
                Text(
                  '${hubs.length} nearby',
                  style: theme.textTheme.bodyMedium,
                ),
              ],
            ),
            const SizedBox(height: 16),
            ...hubs.map((hub) => _HubCard(hub: hub)),
          ],
        ],
      ),
    );
  }
}

class _HubCard extends StatelessWidget {
  final NearbyHubModel hub;

  const _HubCard({required this.hub});

  IconData get _hubIcon {
    switch (hub.hubType) {
      case 'pharmacy':
        return Icons.local_pharmacy_rounded;
      case 'apartment':
        return Icons.apartment_rounded;
      default:
        return Icons.storefront_rounded;
    }
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: AppColors.primary,
          borderRadius: BorderRadius.circular(14),
          border: Border.all(color: AppColors.divider),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Container(
                  width: 36,
                  height: 36,
                  decoration: BoxDecoration(
                    color: AppColors.accent.withOpacity(0.15),
                    borderRadius: BorderRadius.circular(10),
                  ),
                  child: Icon(_hubIcon, color: AppColors.accent, size: 18),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(hub.name, style: theme.textTheme.titleSmall?.copyWith(color: AppColors.textPrimary)),
                      const SizedBox(height: 2),
                      Text(
                        '${hub.formattedDistance} · ${hub.etaMinutes} min away',
                        style: theme.textTheme.bodySmall,
                      ),
                    ],
                  ),
                ),
                _TrustBadge(score: hub.trustScore),
              ],
            ),
            const SizedBox(height: 12),
            SizedBox(
              width: double.infinity,
              child: ElevatedButton.icon(
                onPressed: () {
                  final url =
                      'https://www.google.com/maps/dir/?api=1&destination=${hub.lat},${hub.lng}&travelmode=driving';
                  // In production: launch(url) via url_launcher
                  ScaffoldMessenger.of(context).showSnackBar(
                    SnackBar(
                      content: Text('Navigating to ${hub.name}'),
                      backgroundColor: AppColors.accent,
                    ),
                  );
                },
                icon: const Icon(Icons.navigation_rounded, size: 18),
                label: Text(AppStrings.navigateToHub),
                style: ElevatedButton.styleFrom(
                  padding: const EdgeInsets.symmetric(vertical: 12),
                  minimumSize: Size.zero,
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _TrustBadge extends StatelessWidget {
  final int score;
  const _TrustBadge({required this.score});

  @override
  Widget build(BuildContext context) {
    final color = score >= 80
        ? AppColors.success
        : score >= 50
            ? AppColors.warning
            : AppColors.error;
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      decoration: BoxDecoration(
        color: color.withOpacity(0.15),
        borderRadius: BorderRadius.circular(8),
      ),
      child: Text(
        '$score',
        style: TextStyle(
          color: color,
          fontSize: 12,
          fontWeight: FontWeight.bold,
        ),
      ),
    );
  }
}

class _AnimatedDots extends StatefulWidget {
  const _AnimatedDots();

  @override
  State<_AnimatedDots> createState() => _AnimatedDotsState();
}

class _AnimatedDotsState extends State<_AnimatedDots>
    with SingleTickerProviderStateMixin {
  late AnimationController _ctrl;
  int _dots = 0;

  @override
  void initState() {
    super.initState();
    _ctrl = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 500),
    )..addStatusListener((status) {
        if (status == AnimationStatus.completed) {
          setState(() => _dots = (_dots + 1) % 4);
          _ctrl.forward(from: 0);
        }
      });
    _ctrl.forward();
  }

  @override
  void dispose() {
    _ctrl.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Text(
      '.' * _dots,
      style: const TextStyle(color: AppColors.accent, fontSize: 20),
    );
  }
}
