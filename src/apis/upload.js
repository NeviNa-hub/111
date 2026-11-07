/**
 * 上传与选图
 */
import { API_PATHS } from "@/apis/constants";
import apiRequest from "@/apis/http";

/**
 * 上传单张图片，返回可访问地址。
 * @param {Object} params 上传参数。
 * @param {string} params.filePath 本地文件路径。
 * @param {string} params.name 文件名。
 * @returns {Promise<import("@/apis/types").UploadedImage>} 上传结果。
 */
export const uploadImage = async (params) => {
  const data = await apiRequest({
    url: API_PATHS.UPLOADS,
    method: "POST",
    params: {
      file_path: params.filePath,
      name: params.name,
    },
  });

  return {
    uploadId: data.upload_id,
    url: data.url,
    name: data.name || params.name,
  };
};
