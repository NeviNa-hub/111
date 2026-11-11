/**
 * 统一接口调用入口：按配置在本地 Mock 与真实请求之间切换。
 *
 * USE_MOCK 为 true 时走 src/mock 的本地数据，无需启动后端；
 * 为 false 时走 src/utils/request.js 访问真实后端。页面只依赖各 API 模块，不感知数据来源。
 */
import { USE_MOCK } from "@/apis/config";
import demoRequest from "@/apis/demo/client";
import realRequest from "@/utils/request";

/**
 * 调用接口。
 * @param {Object} config 请求配置，字段与 src/utils/request.js 一致。
 * @returns {Promise<*>} 接口 data。
 */
const request = (config) =>
  USE_MOCK ? demoRequest(config) : realRequest(config);

export default request;
