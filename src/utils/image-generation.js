import { createImageGeneration } from "@/apis/text-to-image";

let pendingRequest = null;

/**
 * 创建文字生图任务；同一参数的失败请求重试沿用幂等标识。
 * @param {Object} params 生图参数。
 * @returns {Promise<Object>} 创建结果。
 */
export const submitImageGeneration = async (params) => {
  const signature = JSON.stringify(params);

  if (!pendingRequest || pendingRequest.signature !== signature) {
    pendingRequest = {
      signature,
      key: `${Date.now()}-${Math.random().toString(36).slice(2)}-${Math.random().toString(36).slice(2)}`,
    };
  }

  const result = await createImageGeneration(params, pendingRequest.key);
  pendingRequest = null;
  return result;
};
