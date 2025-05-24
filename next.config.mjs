/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Rozwiązanie problemu z modułami Node.js w środowisku przeglądarki
      config.resolve.fallback = {
        ...config.resolve.fallback,
        net: false,
        tls: false,
        fs: false,
        dns: false,
        child_process: false,
        timers: false, // Zamiast require.resolve używamy false
      };
    }
    return config;
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  experimental: {
    webpackBuildWorker: true,
    parallelServerBuildTraces: true,
    parallelServerCompiles: true,
  },
}

// Funkcja do łączenia konfiguracji
function mergeConfig(nextConfig, userConfig) {
  if (!userConfig) {
    return
  }

  for (const key in userConfig) {
    if (
      typeof nextConfig[key] === 'object' &&
      !Array.isArray(nextConfig[key])
    ) {
      nextConfig[key] = {
        ...nextConfig[key],
        ...userConfig[key],
      }
    } else {
      nextConfig[key] = userConfig[key]
    }
  }
}

// Próba importu konfiguracji użytkownika
let userConfig = undefined
try {
  const userConfigModule = await import('./v0-user-next.config.js').catch(() => ({}));
  userConfig = userConfigModule.default || {};
} catch (e) {
  // Ignoruj błąd, jeśli plik nie istnieje
  console.log('Nie znaleziono pliku konfiguracyjnego użytkownika');
}

mergeConfig(nextConfig, userConfig);

export default nextConfig;

