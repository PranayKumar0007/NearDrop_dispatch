import 'package:flutter/material.dart';
import 'package:neardrop/core/constants/strings.dart';
import 'package:neardrop/core/theme/app_theme.dart';
import 'package:neardrop/features/driver/bloc/voice_state.dart';

class VoiceMicButton extends StatefulWidget {
  final VoiceState state;
  final VoidCallback onTap;

  const VoiceMicButton({
    super.key,
    required this.state,
    required this.onTap,
  });

  @override
  State<VoiceMicButton> createState() => _VoiceMicButtonState();
}

class _VoiceMicButtonState extends State<VoiceMicButton>
    with SingleTickerProviderStateMixin {
  late AnimationController _rippleController;
  late Animation<double> _rippleAnim;

  @override
  void initState() {
    super.initState();
    _rippleController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 900),
    )..repeat(reverse: true);
    _rippleAnim = Tween<double>(begin: 0.85, end: 1.15).animate(
      CurvedAnimation(parent: _rippleController, curve: Curves.easeInOut),
    );
  }

  @override
  void dispose() {
    _rippleController.dispose();
    super.dispose();
  }

  String get _label {
    if (widget.state is VoiceListening) return AppStrings.voiceListening;
    if (widget.state is VoiceProcessing) return AppStrings.voiceProcessing;
    return AppStrings.voiceIdle;
  }

  bool get _isListening => widget.state is VoiceListening;
  bool get _isProcessing => widget.state is VoiceProcessing;

  @override
  Widget build(BuildContext context) {
    return Column(
      mainAxisSize: MainAxisSize.min,
      children: [
        GestureDetector(
          onTap: widget.onTap,
          child: _isListening
              ? AnimatedBuilder(
                  animation: _rippleAnim,
                  builder: (context, child) => Transform.scale(
                    scale: _rippleAnim.value,
                    child: child,
                  ),
                  child: _MicCircle(isListening: true, isProcessing: false),
                )
              : _MicCircle(
                  isListening: false,
                  isProcessing: _isProcessing,
                ),
        ),
        const SizedBox(height: 12),
        AnimatedSwitcher(
          duration: const Duration(milliseconds: 200),
          child: Text(
            _label,
            key: ValueKey(_label),
            style: const TextStyle(
              color: AppColors.textSecondary,
              fontSize: 13,
              fontWeight: FontWeight.w500,
            ),
          ),
        ),
      ],
    );
  }
}

class _MicCircle extends StatelessWidget {
  final bool isListening;
  final bool isProcessing;

  const _MicCircle({
    required this.isListening,
    required this.isProcessing,
  });

  @override
  Widget build(BuildContext context) {
    Color bgColor;
    Color iconColor;
    if (isListening) {
      bgColor = AppColors.error;
      iconColor = Colors.white;
    } else if (isProcessing) {
      bgColor = AppColors.warning.withOpacity(0.2);
      iconColor = AppColors.warning;
    } else {
      bgColor = AppColors.accent;
      iconColor = Colors.white;
    }

    return Container(
      width: 80,
      height: 80,
      decoration: BoxDecoration(
        shape: BoxShape.circle,
        color: bgColor,
        boxShadow: [
          BoxShadow(
            color: bgColor.withOpacity(0.4),
            blurRadius: isListening ? 24 : 12,
            spreadRadius: isListening ? 4 : 0,
          ),
        ],
      ),
      child: isProcessing
          ? const Center(
              child: SizedBox(
                width: 28,
                height: 28,
                child: CircularProgressIndicator(
                  color: AppColors.warning,
                  strokeWidth: 2.5,
                ),
              ),
            )
          : Icon(
              isListening ? Icons.mic_rounded : Icons.mic_none_rounded,
              color: iconColor,
              size: 32,
            ),
    );
  }
}
