const nextConfig = {
  // Remove this line ↓↓↓
  // experimental: { appDir: true },
  typescript: {
    ignoreBuildErrors: false,
  },
  eslint: {
    ignoreDuringBuilds: false,
  },
};

export default nextConfig;
