/**
 * 图片优化 Demo 数据
 */
import { TASK_STATUS } from "../apis/constants.js";

export const IMAGE_OPTIMIZATION_OPTIONS = {
  directions: [
    {
      direction_id: 1,
      icon_name: "grid",
      title: "无损超清",
      description: "4K超分重塑",
    },
    {
      direction_id: 2,
      icon_name: "spark",
      title: "旧画去噪",
      description: "质感抚平",
    },
    {
      direction_id: 3,
      icon_name: "spark",
      title: "意境重绘",
      description: "笔触唤醒",
    },
  ],
  intensities: ["微调修润", "均衡重构", "深度淬炼"],
  default_direction: "无损超清",
  default_intensity: "均衡重构",
  cost: 3,
  estimated_time: "约 8 秒",
};

/**
 * 生成图片优化任务状态数据。
 * @param {Object} record 模拟任务记录。
 * @returns {Object} 任务状态数据。
 */
export const buildOptimizationTaskStatus = (record) => {
  const payload = record.payload || {};
  const isCompleted = record.status === TASK_STATUS.COMPLETED;

  return {
    task_id: record.taskId,
    status: record.status,
    progress: record.progress,
    progress_title: "淬炼重绘",
    stage_label: isCompleted ? "高清图像 · 已完成" : "高清图像 · 重绘中",
    type_label: "无损超清",
    work_name: "图片优化任务",
    detail: "云端蒸馏 · 高清重绘",
    tags: ["4K重绘", "高清写意"],
    cost: IMAGE_OPTIMIZATION_OPTIONS.cost,
    estimated_time: IMAGE_OPTIMIZATION_OPTIONS.estimated_time,
    description: "云端蒸馏级处理，完成后自动保存至作品库",
    tip: isCompleted
      ? "高清图像已完成并归档至作品库"
      : "已投入云端淬炼池，离开页面不影响任务进度",
    status_text: isCompleted ? "已完成 · 已归档作品库" : "第二阶段 · 细节重塑",
    progress_label: "气韵流转",
    result_urls: isCompleted ? [payload.image_path || ""].filter(Boolean) : [],
  };
};
