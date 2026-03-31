class ApiResponse<T> {
  final T? data;
  final String? error;
  final bool isSuccess;

  const ApiResponse.success(this.data)
      : error = null,
        isSuccess = true;

  const ApiResponse.failure(this.error)
      : data = null,
        isSuccess = false;
}
