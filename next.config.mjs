import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/** @type {import('next').NextConfig} */
const nextConfig = {
  turbopack: {
    root: __dirname,
  },
  // Jangan bundle package ini — biarkan Node.js resolve natively
  // agar ProxyAgent bisa membuat TCP connection lewat Fixie proxy
  serverExternalPackages: ['undici', 'https-proxy-agent'],
};

export default nextConfig;
