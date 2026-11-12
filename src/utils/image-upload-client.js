import { USE_MOCK } from "@/apis/config";
import demoRequest from "@/apis/demo/client";
import { uploadFile } from "@/utils/upload-file";

/**
 * 根据环境选择图片上传传输方式。
 * @param {Object} config 请求配置。
 * @returns {Promise<Object>} 上传结果。
 */
export const requestImageUpload = (config) =>
  USE_MOCK ? demoRequest(config) : uploadFile(config);
