/**
 * 统一接口调用入口：按配置在本地 Mock 与真实请求之间切换。
 */
import request from "@/utils/request";

/**
 * 调用接口。
 * @param {Object} config 请求配置。
 * @returns {Promise<*>} 接口 data。
 */
export default request;
