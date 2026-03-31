import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:neardrop/core/constants/strings.dart';
import 'package:neardrop/core/theme/app_theme.dart';
import 'package:neardrop/features/hub/bloc/hub_bloc.dart';
import 'package:neardrop/features/hub/bloc/hub_event.dart';
import 'package:neardrop/features/hub/bloc/hub_state.dart';
import 'package:neardrop/features/hub/widgets/incoming_broadcast_card.dart';
import 'package:neardrop/features/hub/widgets/pickup_code_dialog.dart';

class ActivePackagesScreen extends StatelessWidget {
  final int hubId;

  const ActivePackagesScreen({super.key, required this.hubId});

  @override
  Widget build(BuildContext context) {
    return BlocConsumer<HubBloc, HubState>(
      listener: (context, state) {
        if (state is HubBroadcastAcceptedState) {
          PickupCodeDialog.show(
            context,
            pickupCode: state.pickupCode,
            hubName: state.hubName,
          ).then((_) {
            // Reload broadcasts after dialog is closed
            context
                .read<HubBloc>()
                .add(HubBroadcastsLoadRequested(hubId));
          });
        } else if (state is HubError) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text(state.message),
              backgroundColor: AppColors.error,
            ),
          );
        }
      },
      builder: (context, state) {
        if (state is HubLoading) {
          return const Center(
            child: CircularProgressIndicator(color: AppColors.accent),
          );
        }

        if (state is HubBroadcastsLoaded) {
          if (state.broadcasts.isEmpty) {
            return RefreshIndicator(
              color: AppColors.accent,
              backgroundColor: AppColors.surface,
              onRefresh: () async {
                context
                    .read<HubBloc>()
                    .add(HubBroadcastsLoadRequested(hubId));
              },
              child: ListView(
                children: [
                  SizedBox(
                    height: MediaQuery.of(context).size.height * 0.6,
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        const Icon(
                          Icons.inbox_rounded,
                          color: AppColors.textSecondary,
                          size: 64,
                        ),
                        const SizedBox(height: 16),
                        Text(
                          AppStrings.noPendingPackages,
                          style: Theme.of(context).textTheme.titleMedium,
                        ),
                        const SizedBox(height: 8),
                        Text(
                          'Pull down to refresh',
                          style: Theme.of(context).textTheme.bodyMedium,
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            );
          }

          return RefreshIndicator(
            color: AppColors.accent,
            backgroundColor: AppColors.surface,
            onRefresh: () async {
              context
                  .read<HubBloc>()
                  .add(HubBroadcastsLoadRequested(hubId));
            },
            child: ListView.separated(
              padding: const EdgeInsets.all(16),
              itemCount: state.broadcasts.length,
              separatorBuilder: (_, __) => const SizedBox(height: 12),
              itemBuilder: (context, i) {
                final broadcast = state.broadcasts[i];
                return IncomingBroadcastCard(
                  broadcast: broadcast,
                  onAccept: () => context.read<HubBloc>().add(
                        HubBroadcastAccepted(
                          broadcastId: broadcast.id,
                          hubId: hubId,
                        ),
                      ),
                  onDecline: () {
                    // Optimistically remove from list by reloading
                    context
                        .read<HubBloc>()
                        .add(HubBroadcastsLoadRequested(hubId));
                  },
                );
              },
            ),
          );
        }

        if (state is HubError) {
          return Center(
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                const Icon(Icons.error_outline_rounded,
                    color: AppColors.error, size: 48),
                const SizedBox(height: 16),
                Text(state.message,
                    style: Theme.of(context).textTheme.bodyMedium),
                const SizedBox(height: 24),
                ElevatedButton(
                  onPressed: () => context
                      .read<HubBloc>()
                      .add(HubBroadcastsLoadRequested(hubId)),
                  child: Text(AppStrings.retry),
                ),
              ],
            ),
          );
        }

        return const SizedBox.shrink();
      },
    );
  }
}
