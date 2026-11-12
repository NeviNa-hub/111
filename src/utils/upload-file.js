import { API_BASE_URL, REQUEST_TIMEOUT } from "@/apis/config";
import { clearSession } from "@/stores";
import { getToken } from "@/utils/auth";
import { ApiError } from "@/utils/request";

/**
 * 通过 multipart 上传本地图片并解析统一响应。
 * @param {Object} config 上传请求配置。
 * @returns {Promise<Object>} 上传结果。
 */
export const uploadFile = (config) =>
  new Promise((resolve, reject) => {
    const token = getToken();

    uni.uploadFile({
      url: `${API_BASE_URL}${config.url}`,
      filePath: config.params.file_path,
      name: "file",
      header: token ? { Authorization: `Bearer ${token}` } : {},
      timeout: REQUEST_TIMEOUT,
      success: (response) => {
        let body;

        try {
          body = typeof response.data === "string" ? JSON.parse(response.data) : response.data;
        } catch {
          reject(new ApiError(500, "上传响应格式不正确"));
          return;
        }

        if (response.statusCode < 200 || response.statusCode >= 300 || body?.code !== 200) {
          if (body?.code === 40102 && token) {
            clearSession();
            uni.reLaunch({ url: "/pages/auth/index" });
          }
          reject(new ApiError(body?.code || response.statusCode || 500, body?.message || "上传失败"));
          return;
        }

        resolve(body.data);
      },
      fail: () => reject(new ApiError(90001, "图片上传失败，请检查网络后重试")),
    });
  });
