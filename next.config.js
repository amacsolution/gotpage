// process.on('uncaughtException', (err) => {
//   console.error('Uncaught Exception:', err)
// })

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        net: false,
        tls: false,
        fs: false,
        dns: false,
        child_process: false,
        timers: false,
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
    // WYŁĄCZENIE równoległych procesów
    webpackBuildWorker: false,
    parallelServerBuildTraces: false,
    parallelServerCompiles: false,
  },
};

// Funkcja do łączenia konfiguracji
function mergeConfig(nextConfig, userConfig) {
  if (!userConfig || typeof userConfig !== 'object') {
    return;
  }

  for (const key in userConfig) {
    const userVal = userConfig[key];
    const baseVal = nextConfig[key];

    if (
      typeof baseVal === "object" &&
      !Array.isArray(baseVal) &&
      typeof userVal === "object" &&
      !Array.isArray(userVal)
    ) {
      nextConfig[key] = {
        ...baseVal,
        ...userVal,
      };
    } else {
      nextConfig[key] = userVal;
    }
  }
}


// Próba importu konfiguracji użytkownika
let userConfig = undefined;
try {
  userConfig = require("./v0-user-next.config");
} catch (e) {
  console.log("Nie znaleziono pliku konfiguracyjnego użytkownika");
}

mergeConfig(nextConfig, userConfig);

module.exports = nextConfig;

  
  