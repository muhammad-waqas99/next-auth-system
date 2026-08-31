import type { NextConfig } from "next";
import dns from 'dns';
dns.setServers(['8.8.8.8', '1.1.1.1']);
const nextConfig: NextConfig = {
  /* config options here */
};

export default nextConfig;
