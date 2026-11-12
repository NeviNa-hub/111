import { createVideoGeneration } from "@/apis/video-creation";

let pending = null;

/** 相同请求重试沿用幂等标识，避免重复扣费。 */
export const submitVideoGeneration = async (params) => {
  const signature = JSON.stringify(params);
  if (!pending || pending.signature !== signature) {
    pending = {
      signature,
      key: `${Date.now()}-${Math.random().toString(36).slice(2)}-${Math.random().toString(36).slice(2)}`,
    };
  }
  const result = await createVideoGeneration(params, pending.key);
  if (!result?.task_id) throw new Error("任务创建结果无效，请使用相同参数重试");
  pending = null;
  return result;
};
