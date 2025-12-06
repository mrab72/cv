/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  basePath: '/tech-notes',
  experimental: {
    outputFileTracingIncludes: {
      '/': ['./rust/**/*', './database/**/*', './system-design/**/*', './maintainable-code/**/*'],
    },
  },
};

export default nextConfig;
