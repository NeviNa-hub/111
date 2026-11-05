/**
 * 文字生图
 */
import { API_PATHS } from "@/apis/constants";
import apiRequest from "@/apis/http";
import { mapTaskStatus } from "@/apis/mappers";

// 映射画风
const mapStyle = (item = {}) => ({
  styleId: item.style_id,
  name: item.name || "",
  description: item.description || "",
  className: item.class_name || "",
});

// 映射画幅
const mapRatio = (item = {}) => ({
  ratioId: item.ratio_id,
  name: item.name || "",
  description: item.description || "",
  value: item.value || "",
});

// 映射生成张数
const mapCount = (item = {}) => ({
  countId: item.count_id,
  name: item.name || "",
  value: Number(item.value) || 0,
  cost: Number(item.cost) || 0,
});

/**
 * 获取文字生图构思配置。
 * @returns {Promise<import("@/apis/types").ImageCreationOptions>} 构思配置。
 */
export const getImageCreationOptions = async () => {
  const data = await apiRequest({ url: API_PATHS.IMAGE_CREATION_OPTIONS });

  return {
    suggestions: Array.isArray(data.suggestions) ? data.suggestions : [],
    polishSuffix: data.polish_suffix || "",
    randomPrompt: data.random_prompt || "",
    promptLimit: Number(data.prompt_limit) || 0,
  };
};

/**
 * 获取文字生图画风列表。
 * @returns {Promise<import("@/apis/types").ImageStyleOptions>} 画风配置。
 */
export const getImageStyles = async () => {
  const data = await apiRequest({ url: API_PATHS.IMAGE_STYLES });

  return {
    defaultStyleId: data.default_style_id,
    styles: Array.isArray(data.lists) ? data.lists.map(mapStyle) : [],
  };
};

/**
 * 获取文字生图画幅与张数配置。
 * @returns {Promise<import("@/apis/types").ImageCanvasOptions>} 画幅配置。
 */
export const getImageCanvasOptions = async () => {
  const data = await apiRequest({ url: API_PATHS.IMAGE_CANVAS_OPTIONS });

  return {
    ratios: Array.isArray(data.ratios) ? data.ratios.map(mapRatio) : [],
    counts: Array.isArray(data.counts) ? data.counts.map(mapCount) : [],
    defaultRatio: data.default_ratio || "",
    defaultCount: data.default_count || "",
    estimatedTime: data.estimated_time || "",
  };
};

/**
 * 创建文字生图任务。
 * @param {Object} params 生成参数。
 * @param {string} params.prompt 画面主旨意象。
 * @param {string} params.style 画风名称。
 * @param {string} params.ratio 画幅比例。
 * @param {string} params.count 生成张数名称。
 * @returns {Promise<import("@/apis/types").TaskState>} 创建结果。
 */
export const createImageGeneration = async (params) => {
  const data = await apiRequest({
    url: API_PATHS.IMAGE_TASKS,
    method: "POST",
    params: {
      prompt: params.prompt,
      style: params.style,
      ratio: params.ratio,
      count: params.count,
    },
  });

  return {
    taskId: data.task_id,
    status: data.status,
  };
};

/**
 * 查询文字生图任务状态。
 * @param {string} taskId 任务标识。
 * @returns {Promise<import("@/apis/types").ImageTaskStatus>} 任务状态。
 */
export const getImageTaskStatus = async (taskId) => {
  const data = await apiRequest({
    url: `${API_PATHS.IMAGE_TASKS}/${encodeURIComponent(taskId)}`,
  });

  return mapTaskStatus(data);
};
