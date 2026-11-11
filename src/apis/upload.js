import request from "@/apis/http";

/**
 * 上传图片。
 * @param {Object} params 上传参数。
 * @returns {Promise<Object>} 上传结果。
 */
export const uploadImage = (params = {}) => {
  return request({
    url: "/uploads/images",
    method: "POST",
    params,
  });
};
