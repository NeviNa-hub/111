/**
 * 接口运行配置：Demo 模拟开关与请求超时。
 */

const ENV = import.meta.env || {};

/** 是否使用本地 Mock，默认开启；设置 VITE_USE_MOCK=false 后走真实后端。 */
export const USE_MOCK = String(ENV.VITE_USE_MOCK ?? "true") !== "false";

/**
 * 真实请求基地址。
 *
 * 默认使用 Vite 同源代理 `/api`，开发期由代理转发到本地后端，避免跨域预检；
 * 需要直连其他网关时用 `VITE_API_BASE_URL` 覆盖完整地址。
 */
export const API_BASE_URL = String(ENV.VITE_API_BASE_URL ?? "/api").replace(
  /\/+$/,
  "",
);

/** 单次请求超时时间，单位毫秒。 */
export const REQUEST_TIMEOUT = 15000;

/** Mock 默认响应延迟，单位毫秒；慢响应分支使用更长延迟。 */
export const MOCK_DELAY = 260;
export const MOCK_SLOW_DELAY = 1200;
