import request from "@/utils/request";

/**
 * 创建文字生图任务。
 * @param {Object} params 生图参数。
 * @returns {Promise<Object>} 创建结果。
 */
export const createImageGeneration = (params = {}) => {
  return request({ 
    url: "/text-to-image/tasks", 
    method: "POST", 
    params
  });
};



/**
 * 查询文字生图任务状态。
 * @param {Object} params 查询参数，包含 taskId。
 * @returns {Promise<Object>} 任务状态。
 */
export const getImageTaskStatus = (params = {}) => {
  return request({ 
    url: `/text-to-image/tasks/${encodeURIComponent(params.taskId || "")}`,
    method: "GET", 
    params: { ...params },
  });
};
