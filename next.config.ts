import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    resolveAlias: {
      fs: "./src/lib/empty-module.ts",
    },
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
      };
    }
    config.experiments = {
      ...config.experiments,
      asyncWebAssembly: true,
    };
    config.output = {
      ...config.output,
      webassemblyModuleFilename: "static/wasm/[modulehash].wasm",
    };
    return config;
  },
};

export default nextConfig;
