import { requestImageUpload } from "@/utils/image-upload-client";

/**
 * 上传图片。
 * @param {Object} params 上传参数，包含本地文件路径。
 * @returns {Promise<Object>} 上传结果。
 */
export const uploadImage = (params = {}) =>
  requestImageUpload({
    url: "/uploads/images",
    method: "POST",
    params,
  });
