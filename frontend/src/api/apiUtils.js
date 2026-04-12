export function unwrapApiResponse(axiosResponse) {
  // Backend uses ApiResponse: { statusCode, message, data, success }
  const payload = axiosResponse?.data
  return payload?.data
}

export function getErrorMessage(err) {
  const msg =
    err?.response?.data?.message ||
    err?.response?.data?.error ||
    err?.message ||
    'Something went wrong'

  return String(msg)
}
