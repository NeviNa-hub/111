import request from "@/apis/http";

/**
 * 创建图片优化任务。
 * @param {Object} params 图片优化参数。
 * @param {string} idempotencyKey 本次请求的幂等标识。
 * @returns {Promise<Object>} 创建结果。
 */
export const createImageOptimization = (params, idempotencyKey) =>
  request({
    url: "/image-optimization/tasks",
    method: "POST",
    params,
    header: { "Idempotency-Key": idempotencyKey },
  });

/**
 * 查询图片优化任务状态。
 * @param {Object} params 查询参数，包含 taskId。
 * @returns {Promise<Object>} 任务状态。
 */
export const getImageOptimizationTaskStatus = (params = {}) =>
  request({
    url: `/tasks/${encodeURIComponent(params.taskId || "")}`,
    method: "GET",
  });
