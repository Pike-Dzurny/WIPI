/** @type {import('next').NextConfig} */
const nextConfig = {}

module.exports = {
  images: {
    domains: ['localhost', 'profilepictures123334221.s3.amazonaws.com', 'api', 'api:8000'],
  },
  webpack: (config, options) => {
    config.watchOptions = {
      poll: 1000,
      aggregateTimeout: 300,
    };

    return config;
  },
}