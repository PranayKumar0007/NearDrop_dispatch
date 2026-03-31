import 'package:flutter/material.dart';
import 'package:neardrop/core/constants/strings.dart';
import 'package:neardrop/core/theme/app_theme.dart';

class TrustScoreBadge extends StatelessWidget {
  final int score;

  const TrustScoreBadge({super.key, required this.score});

  Color get _ringColor {
    if (score >= 80) return AppColors.success;
    if (score >= 50) return AppColors.warning;
    return AppColors.error;
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      width: 48,
      height: 48,
      decoration: BoxDecoration(
        shape: BoxShape.circle,
        border: Border.all(color: _ringColor, width: 2.5),
        color: AppColors.surface,
      ),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Text(
            score.toString(),
            style: TextStyle(
              color: _ringColor,
              fontSize: 14,
              fontWeight: FontWeight.bold,
              height: 1,
            ),
          ),
          const SizedBox(height: 1),
          Text(
            AppStrings.trustScore.split(' ').first,
            style: const TextStyle(
              color: AppColors.textSecondary,
              fontSize: 7,
              height: 1,
            ),
          ),
        ],
      ),
    );
  }
}
