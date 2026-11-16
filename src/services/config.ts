export const API_CONFIG = {
  javaBaseUrl: process.env.EXPO_PUBLIC_JAVA_API_URL ?? '',
  dotnetBaseUrl: process.env.EXPO_PUBLIC_DOTNET_API_URL ?? '',
  useMock: process.env.EXPO_PUBLIC_USE_MOCK === 'true',
  // As APIs no Render (plano gratuito) podem levar até ~50 s para acordar.
  timeoutMs: 60000,
};
