/**
 * 统一接口调用入口：按配置在本地 Mock 与真实请求之间切换。
 */
import { USE_MOCK } from "@/apis/config";
import demoRequest from "@/apis/demo/client";
import request from "@/utils/request";

/**
 * 调用接口。
 * @param {Object} config 请求配置。
 * @returns {Promise<*>} 接口 data。
 */
const apiRequest = (config) => (USE_MOCK ? demoRequest(config) : request(config));

export default apiRequest;
