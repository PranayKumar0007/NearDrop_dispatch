import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:intl/intl.dart';
import 'package:neardrop/core/constants/strings.dart';
import 'package:neardrop/core/theme/app_theme.dart';
import 'package:neardrop/features/driver/bloc/driver_bloc.dart';
import 'package:neardrop/features/driver/bloc/driver_event.dart';
import 'package:neardrop/features/driver/bloc/driver_state.dart';

class HistoryScreen extends StatelessWidget {
  final int driverId;

  const HistoryScreen({super.key, required this.driverId});

  @override
  Widget build(BuildContext context) {
    return BlocBuilder<DriverBloc, DriverState>(
      builder: (context, state) {
        if (state is DriverLoading) {
          return const Center(
            child: CircularProgressIndicator(color: AppColors.accent),
          );
        }
        if (state is DriverError) {
          return Center(
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                const Icon(Icons.error_outline_rounded,
                    color: AppColors.error, size: 40),
                const SizedBox(height: 12),
                Text(state.message,
                    style: Theme.of(context).textTheme.bodyMedium),
                const SizedBox(height: 16),
                TextButton(
                  onPressed: () => context
                      .read<DriverBloc>()
                      .add(DriverProfileLoadRequested(driverId)),
                  child: Text(AppStrings.retry),
                ),
              ],
            ),
          );
        }
        if (state is DriverProfileLoaded) {
          final deliveries = state.recentDeliveries;
          if (deliveries.isEmpty) {
            return Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  const Icon(Icons.history_rounded,
                      color: AppColors.textSecondary, size: 56),
                  const SizedBox(height: 16),
                  Text(AppStrings.noHistory,
                      style: Theme.of(context).textTheme.titleMedium),
                ],
              ),
            );
          }
          return RefreshIndicator(
            color: AppColors.accent,
            backgroundColor: AppColors.surface,
            onRefresh: () async {
              context
                  .read<DriverBloc>()
                  .add(DriverProfileLoadRequested(driverId));
            },
            child: ListView.separated(
              padding: const EdgeInsets.all(16),
              itemCount: deliveries.length,
              separatorBuilder: (_, __) => const SizedBox(height: 10),
              itemBuilder: (context, i) {
                final d = deliveries[i];
                return _HistoryCard(delivery: d);
              },
            ),
          );
        }
        return const SizedBox.shrink();
      },
    );
  }
}

class _HistoryCard extends StatelessWidget {
  final Map<String, dynamic> delivery;

  const _HistoryCard({required this.delivery});

  Color _statusColor(String status) {
    switch (status) {
      case 'delivered':
        return AppColors.success;
      case 'failed':
        return AppColors.error;
      case 'arrived':
        return AppColors.warning;
      default:
        return AppColors.info;
    }
  }

  String _statusLabel(String status) {
    switch (status) {
      case 'delivered':
        return AppStrings.statusDelivered;
      case 'failed':
        return AppStrings.statusFailed;
      case 'arrived':
        return AppStrings.statusArrived;
      default:
        return AppStrings.statusEnRoute;
    }
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final status = delivery['status'] as String? ?? 'en_route';
    final color = _statusColor(status);
    DateTime? createdAt;
    try {
      createdAt = DateTime.parse(delivery['created_at'] as String);
    } catch (_) {}

    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Row(
          children: [
            Container(
              width: 40,
              height: 40,
              decoration: BoxDecoration(
                color: color.withOpacity(0.15),
                borderRadius: BorderRadius.circular(10),
              ),
              child: Icon(
                status == 'delivered'
                    ? Icons.check_circle_outline_rounded
                    : status == 'failed'
                        ? Icons.cancel_outlined
                        : Icons.local_shipping_outlined,
                color: color,
                size: 20,
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(
                        delivery['order_id'] as String? ?? '—',
                        style: theme.textTheme.labelLarge
                            ?.copyWith(color: AppColors.accent),
                      ),
                      Container(
                        padding: const EdgeInsets.symmetric(
                            horizontal: 8, vertical: 3),
                        decoration: BoxDecoration(
                          color: color.withOpacity(0.15),
                          borderRadius: BorderRadius.circular(6),
                        ),
                        child: Text(
                          _statusLabel(status),
                          style: TextStyle(
                            color: color,
                            fontSize: 10,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 4),
                  Text(
                    (delivery['address'] as String? ?? '').length > 55
                        ? '${(delivery['address'] as String).substring(0, 55)}…'
                        : delivery['address'] as String? ?? '',
                    style: theme.textTheme.bodyMedium,
                  ),
                  if (createdAt != null) ...[
                    const SizedBox(height: 4),
                    Text(
                      DateFormat('MMM d, h:mm a').format(createdAt.toLocal()),
                      style: theme.textTheme.bodySmall,
                    ),
                  ],
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
