/**
 * 本地 Mock HTTP 服务。
 *
 * 用 Node 原生 http 模拟真实后端，复用 src/mock 的同一份 fixture 与路由，
 * 返回统一响应体 `{ code, message, data }`，支持 CORS、场景切换与可配置延迟。
 */
import http from "node:http";

import { ERROR_CODES, MOCK_SCENARIOS } from "../src/apis/constants.js";
import { resolveMock } from "../src/mock/index.js";

const PORT = Number(process.env.MOCK_PORT || 3001);
const HOST = process.env.MOCK_HOST || "127.0.0.1";
const MOCK_DELAY = Number(process.env.MOCK_DELAY_MS || 260);
const MOCK_SLOW_DELAY = Number(process.env.MOCK_SLOW_DELAY_MS || 1200);
const MAX_BODY_SIZE = 1024 * 1024;

const SCENARIOS = Object.values(MOCK_SCENARIOS);

/** 业务错误码与 HTTP 状态的映射，便于后端联调时直接观察状态。 */
const HTTP_STATUS_BY_CODE = {
  [ERROR_CODES.UNAUTHORIZED]: 401,
  [ERROR_CODES.NOT_FOUND]: 404,
  [ERROR_CODES.TASK_NOT_FOUND]: 404,
  [ERROR_CODES.INSUFFICIENT_POINTS]: 409,
  [ERROR_CODES.INVALID_PARAMS]: 422,
  [ERROR_CODES.SERVER_ERROR]: 500,
};

/** 强制错误场景的默认文案，与契约文档保持一致。 */
const ERROR_MESSAGES = {
  [ERROR_CODES.UNAUTHORIZED]: "未登录或会话已过期",
  [ERROR_CODES.NOT_FOUND]: "资源不存在",
  [ERROR_CODES.TASK_NOT_FOUND]: "任务不存在或已过期",
  [ERROR_CODES.INSUFFICIENT_POINTS]: "灵感点不足，请先充值",
  [ERROR_CODES.INVALID_PARAMS]: "参数校验失败",
  [ERROR_CODES.SERVER_ERROR]: "模拟服务异常，请稍后重试",
};

/** 服务支持的端点，启动时打印便于联调。 */
const ENDPOINTS = [
  "GET  /health",
  "POST /auth/register",
  "POST /auth/login",
  "POST /auth/logout",
  "GET  /account/overview",
  "GET  /points/myInfo",
  "GET  /home/overview",
  "GET  /workbench",
  "GET  /library",
  "GET  /text-to-image/options",
  "GET  /text-to-image/styles",
  "GET  /text-to-image/canvas-options",
  "POST /text-to-image/tasks",
  "GET  /text-to-image/tasks/:task_id",
  "GET  /image-optimization/options",
  "POST /image-optimization/tasks",
  "GET  /image-optimization/tasks/:task_id",
  "GET  /video/creation-options",
  "GET  /video/render-options",
  "POST /video/tasks",
  "GET  /video/tasks/:task_id",
  "POST /uploads/images",
];

const wait = (duration) =>
  new Promise((resolve) => setTimeout(resolve, duration));

// 读取 JSON 请求体，空请求体按 {} 处理
const readJsonBody = (request) =>
  new Promise((resolve, reject) => {
    let raw = "";

    request.setEncoding("utf8");
    request.on("data", (chunk) => {
      raw += chunk;

      if (raw.length > MAX_BODY_SIZE) {
        reject(new Error("BODY_TOO_LARGE"));
        request.destroy();
      }
    });
    request.on("end", () => {
      if (!raw.trim()) {
        resolve({});
        return;
      }

      try {
        const parsed = JSON.parse(raw);

        resolve(parsed && typeof parsed === "object" ? parsed : {});
      } catch (error) {
        reject(new Error("INVALID_JSON"));
      }
    });
    request.on("error", reject);
  });

// 从 header、query 中读取控制参数
const readControl = (request, searchParams, headerName, queryName) => {
  const headerValue = request.headers[headerName];
  const queryValue = searchParams.get(queryName);
  const value = headerValue || queryValue;

  return typeof value === "string" ? value.trim() : "";
};

// 读取场景，非法值退回 normal
const readScenario = (request, searchParams) => {
  const scenario = readControl(
    request,
    searchParams,
    "x-mock-scenario",
    "__mock_scenario__",
  );

  return SCENARIOS.includes(scenario) ? scenario : MOCK_SCENARIOS.NORMAL;
};

// 读取调试用强制错误码，非法值忽略
const readForceErrorCode = (request, searchParams) => {
  const raw = readControl(
    request,
    searchParams,
    "x-mock-error",
    "__mock_error__",
  );
  const code = Number(raw);

  return ERROR_MESSAGES[code] ? code : 0;
};

// 计算本次响应延迟，支持慢场景与单次覆盖
const readDelay = (searchParams, scenario) => {
  const raw = searchParams.get("__mock_delay__");
  const override = Number(raw);

  if (raw !== null && Number.isFinite(override) && override >= 0) {
    return Math.min(override, 10000);
  }

  return scenario === MOCK_SCENARIOS.SLOW ? MOCK_SLOW_DELAY : MOCK_DELAY;
};

// 收集查询参数，排除控制字段
const readQueryParams = (searchParams) =>
  Array.from(searchParams.entries()).reduce((result, [key, value]) => {
    if (!key.startsWith("__mock_")) {
      result[key] = value;
    }

    return result;
  }, {});

const buildCorsHeaders = (request) => ({
  "Access-Control-Allow-Origin": request.headers.origin || "*",
  "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, X-Mock-Scenario, X-Mock-Error",
  "Access-Control-Max-Age": "600",
  Vary: "Origin",
});

const sendJson = (request, response, status, payload) => {
  const body = JSON.stringify(payload);

  response.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Content-Length": Buffer.byteLength(body),
    ...buildCorsHeaders(request),
  });
  response.end(body);
};

const sendEnvelope = (request, response, payload) => {
  const status = HTTP_STATUS_BY_CODE[payload.code] || 200;

  sendJson(request, response, status, payload);
};

const buildErrorPayload = (code, message) => ({
  code,
  message: message || ERROR_MESSAGES[code] || "请求失败",
  data: null,
});

const handleRequest = async (request, response) => {
  const startedAt = Date.now();
  const method = (request.method || "GET").toUpperCase();
  const url = new URL(request.url || "/", `http://${HOST}:${PORT}`);
  const pathname =
    url.pathname !== "/" && url.pathname.endsWith("/")
      ? url.pathname.slice(0, -1)
      : url.pathname;

  if (method === "OPTIONS") {
    response.writeHead(204, buildCorsHeaders(request));
    response.end();
    return;
  }

  if (method === "GET" && pathname === "/health") {
    sendJson(request, response, 200, {
      code: ERROR_CODES.SUCCESS,
      message: "操作成功",
      data: { status: "ok", scenario: readScenario(request, url.searchParams) },
    });
    return;
  }

  const scenario = readScenario(request, url.searchParams);
  const delay = readDelay(url.searchParams, scenario);
  const forceErrorCode = readForceErrorCode(request, url.searchParams);

  await wait(delay);

  let payload;

  if (forceErrorCode) {
    payload = buildErrorPayload(forceErrorCode);
  } else if (scenario === MOCK_SCENARIOS.FAILURE) {
    payload = buildErrorPayload(
      ERROR_CODES.SERVER_ERROR,
      "模拟服务异常，请稍后重试",
    );
  } else {
    const params =
      method === "GET"
        ? readQueryParams(url.searchParams)
        : await readJsonBody(request);

    payload = resolveMock(method, pathname, params, scenario);
  }

  const status = HTTP_STATUS_BY_CODE[payload.code] || 200;
  sendJson(request, response, status, payload);

  const duration = Date.now() - startedAt;

  console.log(
    `[mock-server] ${method} ${pathname} → ${status} ${payload.code} (${duration}ms, ${scenario})`,
  );
};

const server = http.createServer((request, response) => {
  handleRequest(request, response).catch((error) => {
    if (error.message === "BODY_TOO_LARGE") {
      sendEnvelope(
        request,
        response,
        buildErrorPayload(ERROR_CODES.INVALID_PARAMS, "请求体过大"),
      );
      return;
    }

    if (error.message === "INVALID_JSON") {
      sendEnvelope(
        request,
        response,
        buildErrorPayload(ERROR_CODES.INVALID_PARAMS, "请求体不是合法 JSON"),
      );
      return;
    }

    console.error("[mock-server] 处理请求失败", error);
    sendEnvelope(
      request,
      response,
      buildErrorPayload(ERROR_CODES.SERVER_ERROR, "模拟服务处理请求失败"),
    );
  });
});

server.on("error", (error) => {
  if (error.code === "EADDRINUSE") {
    console.error(
      `[mock-server] 端口 ${PORT} 已被占用，请设置 MOCK_PORT 后重试`,
    );
  } else {
    console.error("[mock-server] 启动失败", error);
  }

  process.exit(1);
});

server.listen(PORT, HOST, () => {
  console.log(`[mock-server] listening on http://${HOST}:${PORT}`);
  console.log(
    `[mock-server] 默认延迟 ${MOCK_DELAY}ms，慢场景 ${MOCK_SLOW_DELAY}ms`,
  );
  console.log("[mock-server] endpoints:");
  ENDPOINTS.forEach((endpoint) => console.log(`  ${endpoint}`));
});

const shutdown = (signal) => {
  console.log(`[mock-server] 收到 ${signal}，正在关闭`);
  server.close(() => {
    console.log("[mock-server] 已关闭");
    process.exit(0);
  });

  setTimeout(() => process.exit(0), 2000).unref();
};

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));
