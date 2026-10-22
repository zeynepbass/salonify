import { fileURLToPath } from "node:url";
import nextEnv from "@next/env";

const rootDir = fileURLToPath(new URL("..", import.meta.url));
const { combinedEnv } = nextEnv.loadEnvConfig(rootDir, process.env.NODE_ENV !== "production", undefined, true);

const nextConfig = {
  reactStrictMode: true,
  agentRules: false,
  env: {
    NEXT_PUBLIC_API_URL: combinedEnv.NEXT_PUBLIC_API_URL,
  },
};

export default nextConfig;
