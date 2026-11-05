/**
 * 视频创作
 */
import { API_PATHS } from "@/apis/constants";
import apiRequest from "@/apis/http";
import { mapTaskStatus } from "@/apis/mappers";

// 映射画幅
const mapRatio = (item = {}) => ({
  ratioId: item.ratio_id,
  value: item.value || "",
  name: item.name || "",
  description: item.description || "",
  recommended: Boolean(item.recommended),
});

// 映射创作模式
const mapMode = (item = {}) => ({
  modeId: item.mode_id || "",
  name: item.name || "",
  icon: item.icon || "",
});

// 映射帧率
const mapFps = (item = {}) => ({
  fpsId: item.fps_id,
  value: Number(item.value) || 0,
  name: item.name || "",
  tag: item.tag || "",
  description: item.description || "",
});

/**
 * 获取视频创作规制与意境配置。
 * @returns {Promise<import("@/apis/types").VideoCreationOptions>} 创作配置。
 */
export const getVideoCreationOptions = async () => {
  const data = await apiRequest({ url: API_PATHS.VIDEO_CREATION_OPTIONS });

  return {
    ratios: Array.isArray(data.ratios) ? data.ratios.map(mapRatio) : [],
    modes: Array.isArray(data.modes) ? data.modes.map(mapMode) : [],
    suggestions: Array.isArray(data.suggestions) ? data.suggestions : [],
    promptLimit: Number(data.prompt_limit) || 0,
    defaultRatio: data.default_ratio || "",
    defaultMode: data.default_mode || "",
    defaultPrompt: data.default_prompt || "",
    polishSuffix: data.polish_suffix || "",
    power: Number(data.power) || 0,
  };
};

/**
 * 获取视频渲染配置。
 * @returns {Promise<import("@/apis/types").VideoRenderOptions>} 渲染配置。
 */
export const getVideoRenderOptions = async () => {
  const data = await apiRequest({ url: API_PATHS.VIDEO_RENDER_OPTIONS });

  return {
    fpsOptions: Array.isArray(data.fps_options) ? data.fps_options.map(mapFps) : [],
    defaultFps: Number(data.default_fps) || 0,
    cost: Number(data.cost) || 0,
    estimatedTime: data.estimated_time || "",
    previewTitle: data.preview_title || "",
    cameraMove: data.camera_move || "",
    power: Number(data.power) || 0,
  };
};

/**
 * 创建视频生成任务。
 * @param {Object} params 生成参数。
 * @param {string} params.mode 创作模式。
 * @param {string} params.ratio 画幅比例。
 * @param {string} params.ratioName 画幅名称。
 * @param {string} params.prompt 意境文案。
 * @param {string} params.imagePath 图卷地址。
 * @param {number} params.fps 帧率。
 * @returns {Promise<import("@/apis/types").TaskState>} 创建结果。
 */
export const createVideoGeneration = async (params) => {
  const data = await apiRequest({
    url: API_PATHS.VIDEO_TASKS,
    method: "POST",
    params: {
      mode: params.mode,
      ratio: params.ratio,
      ratio_name: params.ratioName,
      prompt: params.prompt,
      image_path: params.imagePath,
      fps: params.fps,
    },
  });

  return {
    taskId: data.task_id,
    status: data.status,
  };
};

/**
 * 查询视频任务状态。
 * @param {string} taskId 任务标识。
 * @returns {Promise<Object>} 任务状态。
 */
export const getVideoTaskStatus = async (taskId) => {
  const data = await apiRequest({
    url: `${API_PATHS.VIDEO_TASKS}/${encodeURIComponent(taskId)}`,
  });

  return mapTaskStatus(data);
};
