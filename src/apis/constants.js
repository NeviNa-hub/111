/**
 * 接口常量：路径、错误码、任务状态与分页默认值统一收口。
 * 页面与 API 层不直接书写这些魔法字符串。
 */

export const API_PATHS = {
  AUTH_REGISTER: "/auth/register",
  AUTH_LOGIN: "/auth/login",
  AUTH_LOGOUT: "/auth/logout",
  ACCOUNT_OVERVIEW: "/account/overview",
  POINTS_MY_INFO: "/points/myInfo",
  HOME_OVERVIEW: "/home/overview",
  WORKBENCH: "/workbench",
  LIBRARY: "/library",
  IMAGE_CREATION_OPTIONS: "/text-to-image/options",
  IMAGE_STYLES: "/text-to-image/styles",
  IMAGE_CANVAS_OPTIONS: "/text-to-image/canvas-options",
  IMAGE_TASKS: "/text-to-image/tasks",
  IMAGE_OPTIMIZATION_OPTIONS: "/image-optimization/options",
  IMAGE_OPTIMIZATION_TASKS: "/image-optimization/tasks",
  VIDEO_CREATION_OPTIONS: "/video/creation-options",
  VIDEO_RENDER_OPTIONS: "/video/render-options",
  VIDEO_TASKS: "/video/tasks",
  UPLOADS: "/uploads/images",
};

export const PAGE_PATHS = {
  AUTH: "/pages/auth/index",
  HOME: "/pages/index/index",
};

// 与后端约定保持一致：code 直接使用 HTTP 状态码，90001/90002 为前端本地错误。
export const ERROR_CODES = {
  SUCCESS: 200,
  INVALID_PARAMS: 400,
  UNAUTHORIZED: 401,
  NOT_FOUND: 404,
  INSUFFICIENT_POINTS: 409,
  SERVER_ERROR: 500,
  NETWORK_ERROR: 90001,
  REQUEST_ABORTED: 90002,
};

export const TASK_STATUS = {
  PENDING: "pending",
  PROCESSING: "processing",
  COMPLETED: "completed",
  FAILED: "failed",
};

export const PAGE_DEFAULTS = {
  PAGE: 1,
  PAGE_SIZE: 10,
  MAX_PAGE_SIZE: 50,
};

export const MOCK_SCENARIOS = {
  NORMAL: "normal",
  EMPTY: "empty",
  FAILURE: "failure",
  SLOW: "slow",
};

/** 本地 Mock 场景的存储键，H5 控制台可通过该键切换异常态。 */
export const MOCK_SCENARIO_STORAGE_KEY = "__mock_scenario__";
