/**
 * 图片优化
 */
import { API_PATHS } from "@/apis/constants";
import apiRequest from "@/apis/http";
import { mapTaskStatus } from "@/apis/mappers";

// 映射优化方向
const mapDirection = (item = {}) => ({
  directionId: item.direction_id,
  iconName: item.icon_name || "",
  title: item.title || "",
  description: item.description || "",
});

/**
 * 获取图片优化配置。
 * @returns {Promise<import("@/apis/types").ImageOptimizationOptions>} 优化配置。
 */
export const getImageOptimizationOptions = async () => {
  const data = await apiRequest({ url: API_PATHS.IMAGE_OPTIMIZATION_OPTIONS });

  return {
    directions: Array.isArray(data.directions) ? data.directions.map(mapDirection) : [],
    intensities: Array.isArray(data.intensities) ? data.intensities : [],
    defaultDirection: data.default_direction || "",
    defaultIntensity: data.default_intensity || "",
    cost: Number(data.cost) || 0,
    estimatedTime: data.estimated_time || "",
  };
};

/**
 * 创建图片优化任务。
 * @param {Object} params 优化参数。
 * @param {string} params.imagePath 原图地址。
 * @param {string} params.direction 优化方向。
 * @param {string} params.intensity 重绘强度。
 * @param {boolean} params.keepDetail 是否保留面部细节。
 * @returns {Promise<import("@/apis/types").TaskState>} 创建结果。
 */
export const createImageOptimization = async (params) => {
  const data = await apiRequest({
    url: API_PATHS.IMAGE_OPTIMIZATION_TASKS,
    method: "POST",
    params: {
      image_path: params.imagePath,
      direction: params.direction,
      intensity: params.intensity,
      keep_detail: params.keepDetail,
    },
  });

  return {
    taskId: data.task_id,
    status: data.status,
  };
};

/**
 * 查询图片优化任务状态。
 * @param {string} taskId 任务标识。
 * @returns {Promise<import("@/apis/types").ImageTaskStatus>} 任务状态。
 */
export const getImageOptimizationTaskStatus = async (taskId) => {
  const data = await apiRequest({
    url: `${API_PATHS.IMAGE_OPTIMIZATION_TASKS}/${encodeURIComponent(taskId)}`,
  });

  return mapTaskStatus(data);
};
