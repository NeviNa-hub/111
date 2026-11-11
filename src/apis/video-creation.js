import request from "@/apis/http";

/**
 * 创建视频生成任务。
 * @param {Object} params 视频生成参数。
 * @returns {Promise<Object>} 创建结果。
 */
export const createVideoGeneration = (params = {}) => {
  return request({
    url: "/video/tasks",
    method: "POST",
    params,
  });
};

/**
 * 查询视频任务状态。
 * @param {Object} params 查询参数，包含 taskId。
 * @returns {Promise<Object>} 任务状态。
 */
export const getVideoTaskStatus = (params) => {
  return request({
    url: `/video/tasks/${encodeURIComponent(params.taskId || "")}`,
    method: "GET",
    params: { ...params },
  });
};
