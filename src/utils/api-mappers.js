/**
 * 后端 snake_case 响应到页面 camelCase 模型的通用映射。
 */

/**
 * 映射分页信息。
 * @param {Object} pageInfo 后端分页字段。
 * @returns {import("@/apis/types").PageInfo} 页面分页模型。
 */
export const mapPageInfo = (pageInfo = {}) => ({
  page: Number(pageInfo.page) || 1,
  pageSize: Number(pageInfo.page_size) || 0,
  total: Number(pageInfo.total) || 0,
});

/**
 * 映射生成任务状态。
 * @param {Object} data 后端任务字段。
 * @returns {Object} 页面任务状态模型。
 */
export const mapTaskStatus = (data = {}) => ({
  taskId: data.task_id || "",
  status: data.status || "",
  progress: Number(data.progress) || 0,
  progressTitle: data.progress_title || "",
  stageLabel: data.stage_label || "",
  typeLabel: data.type_label || "",
  workName: data.work_name || "",
  detail: data.detail || "",
  tags: Array.isArray(data.tags) ? data.tags : [],
  cost: typeof data.cost === "number" ? data.cost : null,
  estimatedTime: data.estimated_time || "",
  description: data.description || "",
  tip: data.tip || "",
  statusText: data.status_text || "",
  progressLabel: data.progress_label || "",
  resultUrls: Array.isArray(data.result_urls) ? data.result_urls : [],
});
