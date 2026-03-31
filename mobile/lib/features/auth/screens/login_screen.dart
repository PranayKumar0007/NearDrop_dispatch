import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:neardrop/core/constants/strings.dart';
import 'package:neardrop/core/di/service_locator.dart';
import 'package:neardrop/core/theme/app_theme.dart';
import 'package:neardrop/features/auth/bloc/auth_bloc.dart';
import 'package:neardrop/features/auth/bloc/auth_event.dart';
import 'package:neardrop/features/auth/bloc/auth_state.dart';

class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key});

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final _formKey = GlobalKey<FormState>();
  final _phoneController = TextEditingController();
  final _passwordController = TextEditingController();
  bool _obscurePassword = true;
  int _selectedRoleIndex = 0; // 0 = driver, 1 = hub_owner

  static const List<String> _roles = ['driver', 'hub_owner'];

  @override
  void dispose() {
    _phoneController.dispose();
    _passwordController.dispose();
    super.dispose();
  }

  void _submit(BuildContext context) {
    if (!_formKey.currentState!.validate()) return;
    context.read<AuthBloc>().add(LoginRequested(
          phone: _phoneController.text.trim(),
          password: _passwordController.text,
          role: _roles[_selectedRoleIndex],
        ));
  }

  @override
  Widget build(BuildContext context) {
    return BlocListener<AuthBloc, AuthState>(
      listener: (context, state) {
        if (state is AuthAuthenticated) {
          final route =
              state.user.isDriver ? '/driver' : '/hub';
          Navigator.of(context).pushReplacementNamed(route);
        } else if (state is AuthError) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text(state.message),
              backgroundColor: AppColors.error,
            ),
          );
        }
      },
      child: Scaffold(
        body: SafeArea(
          child: SingleChildScrollView(
            padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 32),
            child: Form(
              key: _formKey,
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const SizedBox(height: 32),
                  // Logo
                  Center(
                    child: Column(
                      children: [
                        Container(
                          width: 72,
                          height: 72,
                          decoration: BoxDecoration(
                            color: AppColors.accent.withOpacity(0.15),
                            borderRadius: BorderRadius.circular(20),
                            border: Border.all(
                              color: AppColors.accent.withOpacity(0.3),
                            ),
                          ),
                          child: const Icon(
                            Icons.local_shipping_rounded,
                            color: AppColors.accent,
                            size: 36,
                          ),
                        ),
                        const SizedBox(height: 16),
                        Text(
                          AppStrings.appName,
                          style: Theme.of(context)
                              .textTheme
                              .headlineMedium
                              ?.copyWith(color: AppColors.accent),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 48),
                  Text(
                    AppStrings.loginTitle,
                    style: Theme.of(context).textTheme.headlineSmall,
                  ),
                  const SizedBox(height: 4),
                  Text(
                    AppStrings.loginSubtitle,
                    style: Theme.of(context).textTheme.bodyMedium,
                  ),
                  const SizedBox(height: 32),

                  // Role selector
                  Container(
                    decoration: BoxDecoration(
                      color: AppColors.surface,
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: Row(
                      children: List.generate(
                        2,
                        (i) => Expanded(
                          child: GestureDetector(
                            onTap: () =>
                                setState(() => _selectedRoleIndex = i),
                            child: AnimatedContainer(
                              duration: const Duration(milliseconds: 200),
                              padding: const EdgeInsets.symmetric(vertical: 14),
                              decoration: BoxDecoration(
                                color: _selectedRoleIndex == i
                                    ? AppColors.accent
                                    : Colors.transparent,
                                borderRadius: BorderRadius.circular(12),
                              ),
                              child: Text(
                                i == 0
                                    ? AppStrings.roleDriver
                                    : AppStrings.roleHub,
                                textAlign: TextAlign.center,
                                style: TextStyle(
                                  color: _selectedRoleIndex == i
                                      ? Colors.white
                                      : AppColors.textSecondary,
                                  fontWeight: FontWeight.w600,
                                  fontSize: 14,
                                ),
                              ),
                            ),
                          ),
                        ),
                      ),
                    ),
                  ),
                  const SizedBox(height: 24),

                  // Phone field
                  TextFormField(
                    controller: _phoneController,
                    keyboardType: TextInputType.phone,
                    inputFormatters: [FilteringTextInputFormatter.digitsOnly],
                    style: const TextStyle(color: AppColors.textPrimary),
                    decoration: InputDecoration(
                      labelText: AppStrings.phoneLabel,
                      hintText: AppStrings.phoneHint,
                      prefixText: '+91  ',
                      prefixStyle: const TextStyle(
                        color: AppColors.textSecondary,
                        fontSize: 15,
                      ),
                      prefixIcon: const Icon(
                        Icons.phone_android_rounded,
                        color: AppColors.textSecondary,
                        size: 20,
                      ),
                    ),
                    validator: (v) {
                      if (v == null || v.trim().isEmpty) {
                        return 'Phone number is required';
                      }
                      if (v.trim().length < 10) {
                        return 'Enter a valid phone number';
                      }
                      return null;
                    },
                  ),
                  const SizedBox(height: 16),

                  // Password field
                  TextFormField(
                    controller: _passwordController,
                    obscureText: _obscurePassword,
                    style: const TextStyle(color: AppColors.textPrimary),
                    decoration: InputDecoration(
                      labelText: AppStrings.passwordLabel,
                      prefixIcon: const Icon(
                        Icons.lock_outline_rounded,
                        color: AppColors.textSecondary,
                        size: 20,
                      ),
                      suffixIcon: IconButton(
                        icon: Icon(
                          _obscurePassword
                              ? Icons.visibility_off_rounded
                              : Icons.visibility_rounded,
                          color: AppColors.textSecondary,
                          size: 20,
                        ),
                        onPressed: () => setState(
                          () => _obscurePassword = !_obscurePassword,
                        ),
                      ),
                    ),
                    validator: (v) {
                      if (v == null || v.isEmpty) {
                        return 'Password is required';
                      }
                      return null;
                    },
                  ),
                  const SizedBox(height: 32),

                  // Login button
                  BlocBuilder<AuthBloc, AuthState>(
                    builder: (context, state) {
                      final isLoading = state is AuthLoading;
                      return ElevatedButton(
                        onPressed: isLoading ? null : () => _submit(context),
                        child: isLoading
                            ? const SizedBox(
                                height: 20,
                                width: 20,
                                child: CircularProgressIndicator(
                                  color: Colors.white,
                                  strokeWidth: 2,
                                ),
                              )
                            : Text(AppStrings.loginButton),
                      );
                    },
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}
