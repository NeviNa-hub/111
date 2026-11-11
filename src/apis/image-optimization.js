import request from "@/apis/http";

/**
 * 创建图片优化任务。
 * @param {Object} params 图片优化参数。
 * @returns {Promise<Object>} 创建结果。
 */
export const createImageOptimization = (params = {}) => {
  return request({
    url: "/image-optimization/tasks",
    method: "POST",
    params,
  });
};

/**
 * 查询图片优化任务状态。
 * @param {Object} params 查询参数。
 * @param {string} params.taskId 创建接口返回的任务标识。
 * @returns {Promise<Object>} 任务状态，`message` 为任务失败原因。
 */
export const getImageOptimizationTaskStatus = (params = {}) =>
  request({
    url: `/image-optimization/tasks/${encodeURIComponent(params.taskId || "")}`,
    method: "GET",
    includeMessage: true,
  });
