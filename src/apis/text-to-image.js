import request from "@/apis/http";

/**
 * 创建文字生图任务。
 * @param {Object} params 生图参数。
 * @param {string} idempotencyKey 本次请求的幂等标识。
 * @returns {Promise<Object>} 创建结果。
 */
export const createImageGeneration = (params, idempotencyKey) =>
  request({
    url: "/text-to-image/tasks",
    method: "POST",
    params,
    header: { "Idempotency-Key": idempotencyKey },
  });

/**
 * 查询文字生图任务状态。
 * @param {Object} params 查询参数，包含 taskId。
 * @returns {Promise<Object>} 任务状态。
 */
export const getImageTaskStatus = (params = {}) =>
  request({
    url: `/tasks/${encodeURIComponent(params.taskId || "")}`,
    method: "GET",
  });
