import { USE_MOCK } from "@/apis/config";
import request from "@/apis/http";

let pendingRequest = null;

/** 创建文字生图任务；相同请求失败后重试沿用幂等键。 */
export const createImageGeneration = async (params = {}) => {
  const signature = JSON.stringify(params);
  if (!pendingRequest || pendingRequest.signature !== signature) {
    pendingRequest = {
      signature,
      key: `${Date.now()}-${Math.random().toString(36).slice(2)}-${Math.random().toString(36).slice(2)}`,
    };
  }
  const result = await request({
    url: "/text-to-image/tasks",
    method: "POST",
    header: { "Idempotency-Key": pendingRequest.key },
    params,
  });
  pendingRequest = null;
  return result;
};

/** 查询文字生图任务状态。 */
export const getImageTaskStatus = (params = {}) =>
  request({
    url: `${USE_MOCK ? "/text-to-image/tasks" : "/tasks"}/${encodeURIComponent(params.taskId || "")}`,
    method: "GET",
  });
