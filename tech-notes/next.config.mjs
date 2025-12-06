/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  experimental: {
    outputFileTracingIncludes: {
      '/': ['./rust/**/*', './database/**/*', './system-design/**/*', './maintainable-code/**/*'],
    },
  },
};

export default nextConfig;
