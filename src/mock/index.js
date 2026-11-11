/**
 * Mock 路由：按真实接口路径返回与后端一致的 { code, message, data } 结构。
 */
import { API_PATHS, ERROR_CODES, PAGE_DEFAULTS } from "../apis/constants.js";
import { ACCOUNT_OVERVIEW, MOCK_LOGIN, POINTS_INFO } from "./account.js";
import {
  HOME_OVERVIEW,
  WORKBENCH_OVERVIEW,
  buildLibraryData,
} from "./creation.js";
import {
  IMAGE_OPTIMIZATION_OPTIONS,
  buildOptimizationTaskStatus,
} from "./image-optimization.js";
import { createMockTask, readMockTask } from "./tasks.js";
import {
  IMAGE_CANVAS_OPTIONS,
  IMAGE_CREATION_OPTIONS,
  IMAGE_STYLE_OPTIONS,
  buildImageTaskStatus,
} from "./text-to-image.js";
import {
  VIDEO_CREATION_OPTIONS,
  VIDEO_RENDER_OPTIONS,
  buildVideoTaskStatus,
} from "./video-creation.js";

const ok = (data) => ({ code: ERROR_CODES.SUCCESS, message: "操作成功", data });
const fail = (code, message) => ({ code, message, data: null });

/**
 * 读取任务状态并组装响应。
 * @param {string} taskId 任务标识。
 * @param {Function} buildStatus 对应任务类型的状态组装方法。
 * @param {string} expectedType 期望的任务类型。
 * @returns {Object} 接口响应。
 */
const resolveTaskStatus = (taskId, buildStatus, expectedType) => {
  const record = readMockTask(taskId);

  if (!record || record.type !== expectedType) {
    return fail(ERROR_CODES.NOT_FOUND, "任务不存在或已过期");
  }

  return ok(buildStatus(record));
};

/**
 * 处理创建任务请求。
 * @param {string} type 任务类型。
 * @param {Object} data 请求参数。
 * @param {string[]} requiredFields 必填字段。
 * @returns {Object} 接口响应。
 */
const createTaskResponse = (type, data, requiredFields) => {
  const missingField = requiredFields.find((field) => !data?.[field]);

  if (missingField) {
    return fail(ERROR_CODES.INVALID_PARAMS, `缺少必要参数：${missingField}`);
  }

  return ok({
    task_id: createMockTask(type, data),
    status: "processing",
  });
};

const exactRoutes = {
  [`POST ${API_PATHS.AUTH_REGISTER}`]: (params) => {
    if (!params?.username || !params?.account || !params?.password) {
      return fail(
        ERROR_CODES.INVALID_PARAMS,
        "缺少必要参数：username/account/password",
      );
    }

    // 与真实契约一致：注册只返回用户资料，不签发令牌
    return ok({
      user_id: MOCK_LOGIN.user_id,
      username: params.username,
      account: params.account,
    });
  },
  [`POST ${API_PATHS.AUTH_LOGIN}`]: (params) => {
    if (!params?.account || !params?.password) {
      return fail(ERROR_CODES.INVALID_PARAMS, "缺少必要参数：account/password");
    }

    // 本地 Mock 不校验口令，任意账号密码均可登录，便于离线开发
    return ok({
      ...MOCK_LOGIN,
      username: params.account,
      account: params.account,
    });
  },
  [`POST ${API_PATHS.AUTH_LOGOUT}`]: () => ok(null),
  [`GET ${API_PATHS.ACCOUNT_OVERVIEW}`]: () => ok(ACCOUNT_OVERVIEW),
  [`GET ${API_PATHS.POINTS_MY_INFO}`]: (_params, scenario) => {
    if (scenario === "empty") {
      return ok({ ...POINTS_INFO, items: [] });
    }

    return ok(POINTS_INFO);
  },
  [`GET ${API_PATHS.HOME_OVERVIEW}`]: (_params, scenario) => {
    if (scenario === "empty") {
      return ok({ ...HOME_OVERVIEW, creations: [] });
    }

    return ok(HOME_OVERVIEW);
  },
  [`GET ${API_PATHS.WORKBENCH}`]: (_params, scenario) => {
    if (scenario === "empty") {
      return ok({ ...WORKBENCH_OVERVIEW, frames: [], drafts: [] });
    }

    return ok(WORKBENCH_OVERVIEW);
  },
  [`GET ${API_PATHS.LIBRARY}`]: (params, scenario) => {
    const page = Number(params.page) || PAGE_DEFAULTS.PAGE;
    const pageSize = Math.min(
      Number(params.page_size) || PAGE_DEFAULTS.PAGE_SIZE,
      PAGE_DEFAULTS.MAX_PAGE_SIZE,
    );

    return ok(
      buildLibraryData(
        { ...params, page, page_size: pageSize },
        scenario === "empty",
      ),
    );
  },
  [`GET ${API_PATHS.IMAGE_CREATION_OPTIONS}`]: () => ok(IMAGE_CREATION_OPTIONS),
  [`GET ${API_PATHS.IMAGE_STYLES}`]: () => ok(IMAGE_STYLE_OPTIONS),
  [`GET ${API_PATHS.IMAGE_CANVAS_OPTIONS}`]: () => ok(IMAGE_CANVAS_OPTIONS),
  [`POST ${API_PATHS.IMAGE_TASKS}`]: (params) =>
    createTaskResponse("image", params, ["prompt", "style"]),
  [`GET ${API_PATHS.IMAGE_OPTIMIZATION_OPTIONS}`]: () =>
    ok(IMAGE_OPTIMIZATION_OPTIONS),
  [`POST ${API_PATHS.IMAGE_OPTIMIZATION_TASKS}`]: (params) =>
    createTaskResponse("optimization", params, ["image_path", "prompt"]),
  [`GET ${API_PATHS.VIDEO_CREATION_OPTIONS}`]: () => ok(VIDEO_CREATION_OPTIONS),
  [`GET ${API_PATHS.VIDEO_RENDER_OPTIONS}`]: () => ok(VIDEO_RENDER_OPTIONS),
  [`POST ${API_PATHS.VIDEO_TASKS}`]: (params) => {
    if (params?.mode === "image") {
      return createTaskResponse("video", params, ["ratio", "image_path"]);
    }

    return createTaskResponse("video", params, ["ratio", "prompt"]);
  },
  [`POST ${API_PATHS.UPLOADS}`]: (params) => {
    if (!params?.file_path) {
      return fail(ERROR_CODES.INVALID_PARAMS, "缺少必要参数：file_path");
    }

    return ok({
      upload_id: `upload-${Date.now()}`,
      url: params.file_path,
      name: params.name || "已选图片",
    });
  },
};

const taskRoutes = [
  {
    method: "GET",
    pattern: /^\/text-to-image\/tasks\/([^/]+)$/,
    handler: (taskId) =>
      resolveTaskStatus(taskId, buildImageTaskStatus, "image"),
  },
  {
    method: "GET",
    pattern: /^\/image-optimization\/tasks\/([^/]+)$/,
    handler: (taskId) =>
      resolveTaskStatus(taskId, buildOptimizationTaskStatus, "optimization"),
  },
  {
    method: "GET",
    pattern: /^\/video\/tasks\/([^/]+)$/,
    handler: (taskId) =>
      resolveTaskStatus(taskId, buildVideoTaskStatus, "video"),
  },
];

/**
 * 分发 Mock 请求。
 * @param {string} method 请求方法。
 * @param {string} url 接口路径。
 * @param {Object} params 请求参数。
 * @param {string} scenario Mock 场景。
 * @returns {Object} 接口响应。
 */
export const resolveMock = (method, url, params = {}, scenario = "normal") => {
  const routeKey = `${method} ${url}`;
  const exactHandler = exactRoutes[routeKey];

  if (exactHandler) {
    return exactHandler(params, scenario);
  }

  const dynamicRoute = taskRoutes.find(
    (route) => route.method === method && route.pattern.test(url),
  );

  if (dynamicRoute) {
    const matched = url.match(dynamicRoute.pattern);

    return dynamicRoute.handler(decodeURIComponent(matched[1]));
  }

  return fail(ERROR_CODES.NOT_FOUND, `未实现的 Mock 接口：${routeKey}`);
};
