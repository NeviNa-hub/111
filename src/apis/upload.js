import request from "@/utils/request";

/**
 * 上传图片。
 * @param {Object} params 上传参数。
 * @returns {Promise<Object>} 上传结果。
 */
export const uploadImage = (params = {}) => {
  return request({ 
    url: "/upl  oads/images", 
    method: "POST", 
    params
  });
};
