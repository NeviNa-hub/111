/**
 * 通用任务轮询
 */
import { onHide, onShow, onUnload } from "@dcloudio/uni-app";
import { onUnmounted, ref } from "vue";

const DEFAULT_INTERVAL = 3000;
const DEFAULT_MAX_ATTEMPTS = 60;
const DEFAULT_RETRY_LIMIT = 1;

/**
 * 创建任务轮询控制器，统一处理定时器、次数上限、失败重试与页面生命周期清理。
 * @param {Object} defaultOptions 默认轮询配置，可在 start 时覆盖。
 * @param {Function} defaultOptions.fetchTask 拉取任务状态的请求方法。
 * @param {number} defaultOptions.interval 轮询间隔，单位毫秒。
 * @param {number} defaultOptions.maxAttempts 最大轮询次数。
 * @param {number} defaultOptions.retryLimit 单次轮询失败后的重试次数。
 * @param {Function} defaultOptions.isCompleted 判断任务是否完成。
 * @param {Function} defaultOptions.isFailed 判断任务是否失败。
 * @param {Function} defaultOptions.onProgress 每次拉取成功后的回调。
 * @param {Function} defaultOptions.onCompleted 任务完成时的回调。
 * @param {Function} defaultOptions.onFailed 任务失败、超时或重试耗尽时的回调。
 * @returns {{start: Function, stop: Function, isPolling: import("vue").Ref<boolean>}}
 *   轮询控制器。
 */
export default function useTaskPolling(defaultOptions = {}) {
  const isPolling = ref(false);

  let timerId = null;
  let pollingToken = 0;
  let attempts = 0;
  let retryCount = 0;
  let isRequesting = false;
  let isPaused = false;
  let currentOptions = null;

  // 清理定时器，避免重复定时器叠加
  const clearTimer = () => {
    if (timerId) {
      clearInterval(timerId);
      timerId = null;
    }
  };

  // 停止轮询并失效进行中的响应，防止旧响应覆盖新状态
  const stop = () => {
    pollingToken += 1;
    clearTimer();
    isPolling.value = false;
    isRequesting = false;
    isPaused = false;
    currentOptions = null;
  };

  // 补排定时器，用于从页面隐藏恢复后继续轮询
  const schedule = () => {
    if (!timerId && isPolling.value) {
      timerId = setInterval(run, currentOptions.interval);
    }
  };

  // 执行一次任务状态拉取
  const run = async () => {
    if (!isPolling.value || isRequesting || isPaused || !currentOptions) {
      return;
    }

    const token = pollingToken;
    const {
      fetchTask,
      isCompleted,
      isFailed,
      maxAttempts,
      retryLimit,
      onProgress,
      onCompleted,
      onFailed,
    } = currentOptions;

    isRequesting = true;

    try {
      const data = (await fetchTask()) || {};

      if (token !== pollingToken) {
        return;
      }

      retryCount = 0;
      attempts += 1;
      onProgress?.(data);

      if (isCompleted?.(data)) {
        stop();
        onCompleted?.(data);
        return;
      }

      if (isFailed?.(data)) {
        stop();
        onFailed?.(new Error(data.error_message || data.message || "任务生成失败，请稍后重试"));
        return;
      }

      if (attempts >= maxAttempts) {
        stop();
        onFailed?.(new Error("任务仍在处理，请稍后在作品库查看"));
      }
    } catch (error) {
      if (token !== pollingToken) {
        return;
      }

      retryCount += 1;

      if (retryCount > retryLimit) {
        stop();
        onFailed?.(error);
      }
    } finally {
      if (token === pollingToken) {
        isRequesting = false;
      }
    }
  };

  /**
   * 启动任务轮询，重复调用会先停止上一次轮询。
   * @param {Object} options 本次轮询配置，覆盖默认配置。
   * @returns {Function} 停止轮询的方法。
   */
  const start = (options = {}) => {
    stop();

    const config = { ...defaultOptions, ...options };

    if (typeof config.fetchTask !== "function") {
      return stop;
    }

    currentOptions = {
      fetchTask: config.fetchTask,
      interval: config.interval || DEFAULT_INTERVAL,
      maxAttempts: config.maxAttempts || DEFAULT_MAX_ATTEMPTS,
      retryLimit: Number.isFinite(config.retryLimit)
        ? config.retryLimit
        : DEFAULT_RETRY_LIMIT,
      isCompleted: config.isCompleted,
      isFailed: config.isFailed,
      onProgress: config.onProgress,
      onCompleted: config.onCompleted,
      onFailed: config.onFailed,
    };
    attempts = 0;
    retryCount = 0;
    isPaused = false;
    isPolling.value = true;

    run();
    timerId = setInterval(run, currentOptions.interval);

    return stop;
  };

  // 页面隐藏时暂停轮询，避免后台无意义请求
  const pause = () => {
    isPaused = true;
    clearTimer();
  };

  // 页面重新可见时恢复轮询
  const resume = () => {
    if (!isPolling.value) {
      return;
    }

    isPaused = false;
    run();
    schedule();
  };

  onHide(pause);
  onShow(resume);
  onUnload(stop);
  onUnmounted(stop);

  return {
    start,
    stop,
    isPolling,
  };
}
