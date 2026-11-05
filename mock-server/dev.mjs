/**
 * 一键启动本地 Mock 服务与 H5 开发服务。
 *
 * 以 VITE_USE_MOCK=false、VITE_API_BASE_URL=本地服务的环境启动，
 * 让页面与“真实后端”一致地走 HTTP；任一进程退出时同步关闭另一个。
 */
import { spawn } from "node:child_process";

const PORT = process.env.MOCK_PORT || "3001";
const BASE_URL = process.env.VITE_API_BASE_URL || `http://127.0.0.1:${PORT}`;
const IS_WINDOWS = process.platform === "win32";
const ENV = {
  ...process.env,
  MOCK_PORT: PORT,
  VITE_USE_MOCK: "false",
  VITE_API_BASE_URL: BASE_URL,
};

const children = [];
let isShuttingDown = false;

const terminate = (child) => {
  if (!child || child.killed) {
    return;
  }

  if (IS_WINDOWS && child.pid) {
    spawn("taskkill", ["/pid", String(child.pid), "/T", "/F"], { stdio: "ignore" });
    return;
  }

  child.kill("SIGTERM");
};

const shutdown = (exitCode = 0) => {
  if (isShuttingDown) {
    return;
  }

  isShuttingDown = true;
  children.forEach(terminate);

  setTimeout(() => process.exit(exitCode), 500).unref();
};

const start = () => {
  const mockServer = spawn(process.execPath, ["--no-warnings", "mock-server/index.mjs"], {
    stdio: "inherit",
    env: ENV,
  });
  const devServer = spawn(IS_WINDOWS ? "npm.cmd" : "npm", ["run", "dev:h5"], {
    stdio: "inherit",
    env: ENV,
    shell: IS_WINDOWS,
  });

  children.push(mockServer, devServer);

  mockServer.on("exit", (code) => shutdown(code || 0));
  devServer.on("exit", (code) => shutdown(code || 0));
};

process.on("SIGINT", () => shutdown(0));
process.on("SIGTERM", () => shutdown(0));

console.log(`[dev:mock] Mock 服务 http://127.0.0.1:${PORT}`);
console.log(`[dev:mock] H5 使用 VITE_USE_MOCK=false，基地址 ${BASE_URL}`);

start();
