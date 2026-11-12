import { createImageOptimization } from "@/apis/image-optimization";

let pendingRequest = null;

/**
 * 创建优化任务；相同参数的失败请求重试使用原幂等标识。
 * @param {Object} params 图片优化参数。
 * @returns {Promise<Object>} 任务创建结果。
 */
export const submitImageOptimization = async (params) => {
  const signature = JSON.stringify(params);

  if (!pendingRequest || pendingRequest.signature !== signature) {
    pendingRequest = {
      signature,
      key: `${Date.now()}-${Math.random().toString(36).slice(2)}-${Math.random().toString(36).slice(2)}`,
    };
  }

  const result = await createImageOptimization(params, pendingRequest.key);
  if (!result?.task_id) {
    throw new Error("任务创建结果无效，请使用相同参数重试");
  }

  pendingRequest = null;
  return result;
};
