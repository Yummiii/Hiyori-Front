/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ["api.zuraaa.com", "127.0.0.1", "media.discordapp.net", "192.168.1.100"]
  },
  env: {
    API_URL: "http://192.168.1.100:5000",
  }
}

module.exports = nextConfig
