import request from "@/apis/http";

/**
 * 创建文字生图任务。
 * @param {Object} params 生图参数。
 * @returns {Promise<Object>} 创建结果。
 */
export const createImageGeneration = (params = {}) => {
  return request({
    url: "/text-to-image/tasks",
    method: "POST",
    params,
  });
};

/**
 * 查询文字生图任务状态。
 * @param {Object} params 查询参数。
 * @param {string} params.taskId 创建接口返回的任务标识。
 * @returns {Promise<Object>} 任务状态，`message` 为任务失败原因。
 */
export const getImageTaskStatus = (params = {}) =>
  request({
    url: `/text-to-image/tasks/${encodeURIComponent(params.taskId || "")}`,
    method: "GET",
    includeMessage: true,
  });
