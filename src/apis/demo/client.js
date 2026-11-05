/**
 * Demo 接口客户端。
 *
 * 从本地 Mock 路由取数，并模拟与真实请求一致的异常、延迟与响应结构。
 * 页面只依赖封装后的 API 方法，不感知 Mock 与真实请求的差异。
 */
import { MOCK_DELAY, MOCK_SLOW_DELAY } from "@/apis/config";
import { ERROR_CODES, MOCK_SCENARIOS, MOCK_SCENARIO_STORAGE_KEY } from "@/apis/constants";
import { resolveMock } from "@/mock";
import { ApiError } from "@/utils/request";

const delay = (duration) => new Promise((resolve) => setTimeout(resolve, duration));

// 读取本地 Mock 场景，未设置时走正常分支
const readScenario = () => {
  const stored = uni.getStorageSync(MOCK_SCENARIO_STORAGE_KEY);

  return Object.values(MOCK_SCENARIOS).includes(stored) ? stored : MOCK_SCENARIOS.NORMAL;
};

/**
 * 发起一次模拟接口请求。
 * @param {Object} config 请求配置。
 * @param {string} config.url 接口路径。
 * @param {string} [config.method] 请求方法，默认 GET。
 * @param {Object} [config.params] 请求参数。
 * @returns {Promise<*>} 接口 data。
 */
export default async function demoRequest(config) {
  const method = (config.method || "GET").toUpperCase();
  const params = config.params || {};
  const scenario = readScenario();

  await delay(scenario === MOCK_SCENARIOS.SLOW ? MOCK_SLOW_DELAY : MOCK_DELAY);

  if (scenario === MOCK_SCENARIOS.FAILURE) {
    throw new ApiError(ERROR_CODES.SERVER_ERROR, "模拟服务异常，请稍后重试");
  }

  const response = resolveMock(method, config.url, params, scenario);

  if (response.code !== ERROR_CODES.SUCCESS) {
    throw new ApiError(response.code, response.message, response.data);
  }

  return response.data;
}
