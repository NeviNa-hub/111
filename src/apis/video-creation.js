import request from "@/apis/http";

/** 创建文字视频任务。 */
export const createVideoGeneration = (params, idempotencyKey) =>
  request({
    url: "/video/tasks",
    method: "POST",
    params,
    header: { "Idempotency-Key": idempotencyKey },
  });

/** 查询视频任务状态。 */
export const getVideoTaskStatus = (params = {}) =>
  request({
    url: `/tasks/${encodeURIComponent(params.taskId || "")}`,
    method: "GET",
  });
