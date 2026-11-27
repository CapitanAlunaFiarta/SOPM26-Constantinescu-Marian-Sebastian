import os from "node:os";
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

function findLanIp() {
  const candidates = [];
  for (const addresses of Object.values(os.networkInterfaces())) {
    for (const addr of addresses || []) {
      if (addr.family === "IPv4" && !addr.internal) candidates.push(addr.address);
    }
  }
  const isPrivate = (ip) =>
    ip.startsWith("192.168.") ||
    ip.startsWith("10.") ||
    /^172\.(1[6-9]|2\d|3[01])\./.test(ip);
  return candidates.find(isPrivate) || candidates[0] || "";
}

export default defineConfig({
  plugins: [react()],
  define: {
    __LAN_IP__: JSON.stringify(findLanIp())
  },
  server: { host: true },
  preview: { host: true },
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: "./src/test/setup.js"
  }
});
