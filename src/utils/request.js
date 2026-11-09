/**
 * 统一请求层。
 *
 * 职责：拼接地址、超时、取消、相同 GET 请求合并、统一解包 `{ code, message, data }`。
 * 业务层只拿到 `data`；非 200 code 与网络异常统一抛出 ApiError，请求层统一提示错误，
 * 会话失效时清理凭据并返回登录页。
 */
import { API_BASE_URL, REQUEST_TIMEOUT } from "@/apis/config";
import { ERROR_CODES, PAGE_PATHS } from "@/apis/constants";
import { getToken } from "@/utils/auth";
import { clearSession } from "@/stores";

const pendingRequests = new Map();

// 为所有真实请求统一附加 JSON 与会话请求头。
const buildHeaders = (header = {}) => {
  const token = getToken();

  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...header,
  };
};

// 会话失效时清理凭据并返回登录页；未登录请求不触发跳转。
const redirectToAuth = () => {
  if (!getToken()) {
    return false;
  }

  clearSession();
  uni.reLaunch({ url: PAGE_PATHS.AUTH });

  return true;
};

// 登录态缺失、无效或已过期时统一按会话失效处理。
const isUnauthorizedCode = (code) => code === ERROR_CODES.UNAUTHORIZED;

// 请求异常统一通过全局提示展示，取消请求和会话失效不提示。
const showRequestError = (error) => {
  if (error.code === ERROR_CODES.REQUEST_ABORTED) {
    return;
  }

  if (isUnauthorizedCode(error.code) && redirectToAuth()) {
    return;
  }

  uni.showToast({
    title: error.message || "请求失败，请稍后重试",
    icon: "none",
  });
};

// 拼接基地址；绝对地址保持不变，避免重复前缀
const buildUrl = (url) => {
  if (/^https?:\/\//i.test(url)) {
    return url;
  }

  const path = url.startsWith("/") ? url : `/${url}`;

  return `${API_BASE_URL}${path}`;
};

/**
 * 接口业务异常，携带后端错误码与消息。
 */
export class ApiError extends Error {
  /**
   * 创建接口异常。
   * @param {number} code 业务或网络错误码。
   * @param {string} message 可展示的错误信息。
   * @param {*} [details] 原始响应或错误对象，便于排查。
   */
  constructor(code, message, details) {
    super(message);

    this.name = "ApiError";
    this.code = code;
    this.details = details;
  }
}

/**
 * 判断异常是否为统一的接口异常。
 * @param {*} error 待判断的异常。
 * @returns {boolean} 是否为 ApiError。
 */
export const isApiError = (error) => error instanceof ApiError;

/**
 * 从异常中取出可展示文案，避免页面重复兜底。
 * @param {*} error 请求异常。
 * @param {string} [fallback] 兜底文案。
 * @returns {string} 可展示的错误信息。
 */
export const getErrorMessage = (error, fallback = "操作失败，请稍后重试") => {
  if (isApiError(error) && error.message) {
    return error.message;
  }

  return error?.message || fallback;
};

// 清理空参数，避免把 undefined / null / 空串传给后端
const normalizeParams = (params = {}) =>
  Object.entries(params).reduce((result, [key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      result[key] = value;
    }

    return result;
  }, {});

// 生成请求标识，用于合并同时发出的相同 GET 请求
const buildRequestKey = (method, url, params) =>
  `${method}:${buildUrl(url)}:${JSON.stringify(params)}`;

// 后端 code 与 HTTP 状态码一致；响应缺少 code 时直接用状态码兜底
const resolveHttpErrorCode = (statusCode) =>
  statusCode || ERROR_CODES.SERVER_ERROR;

/**
 * 发送一次底层请求并解包响应。
 * @param {Object} config 请求配置。
 * @param {string} config.url 接口路径。
 * @param {string} config.method 请求方法。
 * @param {Object} config.params 已规范化的参数。
 * @param {Object} [config.header] 请求头。
 * @param {number} config.timeout 超时时间。
 * @param {AbortSignal} [config.signal] 取消信号。
 * @param {boolean} [config.includeMessage] 是否在 data 上合并响应顶层 message。
 * @returns {Promise<*>} 解包后的 data；需要 message 时返回合并了顶层 message 的 data 对象。
 */
const sendRequest = (config) =>
  new Promise((resolve, reject) => {
    let isFinished = false;

    // 结束请求，保证 resolve / reject 只执行一次
    const finish = (handler, value) => {
      if (isFinished) {
        return;
      }

      isFinished = true;

      if (config.signal) {
        config.signal.removeEventListener("abort", handleAbort);
      }

      handler(value);
    };

    // 用户主动取消请求
    const handleAbort = () => {
      requestTask?.abort();
      finish(reject, new ApiError(ERROR_CODES.REQUEST_ABORTED, "请求已取消"));
    };

    if (config.signal?.aborted) {
      finish(reject, new ApiError(ERROR_CODES.REQUEST_ABORTED, "请求已取消"));
      return;
    }

    const requestTask = uni.request({
      url: buildUrl(config.url),
      method: config.method,
      data: Object.keys(config.params).length ? config.params : undefined,
      header: buildHeaders(config.header),
      timeout: config.timeout,
      success: (response) => {
        const body = response.data;
        const isHttpSuccess =
          response.statusCode >= 200 && response.statusCode < 300;

        if (!isHttpSuccess) {
          finish(
            reject,
            new ApiError(
              body?.code || resolveHttpErrorCode(response.statusCode),
              body?.message || `请求失败（${response.statusCode}）`,
              body,
            ),
          );
          return;
        }

        if (!body || typeof body !== "object" || !("code" in body)) {
          finish(
            reject,
            new ApiError(ERROR_CODES.SERVER_ERROR, "响应格式不正确", body),
          );
          return;
        }

        if (body.code !== ERROR_CODES.SUCCESS) {
          finish(
            reject,
            new ApiError(body.code, body.message || "请求失败", body.data),
          );
          return;
        }

        finish(
          resolve,
          config.includeMessage
            ? { ...body.data, message: body.message || "" }
            : body.data,
        );
      },
      fail: (error) => {
        const errMsg = String(error?.errMsg || "");

        if (config.signal?.aborted) {
          finish(
            reject,
            new ApiError(ERROR_CODES.REQUEST_ABORTED, "请求已取消"),
          );
          return;
        }

        if (errMsg.includes("timeout")) {
          finish(
            reject,
            new ApiError(
              ERROR_CODES.NETWORK_ERROR,
              "请求超时，请稍后重试",
              error,
            ),
          );
          return;
        }

        finish(
          reject,
          new ApiError(
            ERROR_CODES.NETWORK_ERROR,
            "网络连接不可用，请稍后重试",
            error,
          ),
        );
      },
    });

    config.signal?.addEventListener("abort", handleAbort, { once: true });
  });

/**
 * 发起接口请求。
 * @param {Object} config 请求配置。
 * @param {string} config.url 接口路径，例如 /library。
 * @param {string} [config.method] 请求方法，默认 GET。
 * @param {Object} [config.params] GET 查询参数或请求体。
 * @param {Object} [config.header] 自定义请求头。
 * @param {number} [config.timeout] 覆盖默认超时时间。
 * @param {AbortSignal} [config.signal] 取消信号。
 * @param {boolean} [config.includeMessage] 是否在 data 上合并响应顶层 message，供任务失败原因等场景使用。
 * @returns {Promise<*>} 接口 data；开启 includeMessage 时返回合并了顶层 message 的 data 对象。
 */
export default function request(config) {
  const method = (config.method || "GET").toUpperCase();
  const params = normalizeParams(config.params);
  const timeout = config.timeout || REQUEST_TIMEOUT;

  // 相同 GET 请求在飞行中直接复用，避免重复渲染与竞态覆盖
  if (method === "GET" && !config.signal) {
    const key = buildRequestKey(method, config.url, params);

    if (pendingRequests.has(key)) {
      return pendingRequests.get(key);
    }

    const promise = sendRequest({
      ...config,
      method,
      params,
      timeout,
    })
      .catch((error) => {
        showRequestError(error);
        throw error;
      })
      .finally(() => pendingRequests.delete(key));

    pendingRequests.set(key, promise);

    return promise;
  }

  return sendRequest({
    ...config,
    method,
    params,
    timeout,
  }).catch((error) => {
    showRequestError(error);
    throw error;
  });
}
