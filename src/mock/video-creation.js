// 视频创作 Demo 数据
import { TASK_STATUS } from "../apis/constants.js";

// 视频创作第一步：规制与意境配置
export const VIDEO_CREATION_OPTIONS = {
  power: 800,
  prompt_limit: 300,
  default_ratio: "16:9",
  default_mode: "text",
  ratios: [
    {
      ratio_id: 1,
      value: "16:9",
      name: "16:9 横屏",
      description: "视野宽广 · 磅礴画卷",
      recommended: true,
    },
    {
      ratio_id: 2,
      value: "9:16",
      name: "9:16 竖屏",
      description: "长幅沉浸 · 适宜移轴",
    },
    {
      ratio_id: 3,
      value: "1:1",
      name: "1:1 镜心",
      description: "方正静穆 · 斗方小品",
    },
  ],
  modes: [
    { mode_id: "text", name: "文字生视频", icon: "✦" },
    { mode_id: "image", name: "图卷生动境", icon: "❖" },
  ],
  suggestions: ["清溪泛舟", "浮岚暖翠", "寒江雪霁", "竹影摇曳"],
  polish_suffix: "水波微澜，晨雾轻笼，气韵徐徐流转",
  default_prompt: "孤舟蓑笠，江雪霏霏，水波微澜，远山在晨雾中徐徐隐退",
};

// 视频创作第二步：画质与渲染配置
export const VIDEO_RENDER_OPTIONS = {
  power: 800,
  cost: 8,
  default_fps: 60,
  estimated_time: "约 18 秒",
  preview_title: "《江雪孤舟 · 动态长卷》",
  camera_move: "平缓推镜",
  fps_options: [
    {
      fps_id: 1,
      value: 30,
      name: "30 FPS · 典雅",
      tag: "节律省电",
      description: "传统水墨电影韵味，起承转合自然含蓄",
    },
    {
      fps_id: 2,
      value: 60,
      name: "60 FPS · 丝滑 4K 超清",
      tag: "首推",
      recommended: true,
      description: "雪浪微澜，丝缕毕现，水汽流动如真如幻",
    },
  ],
};

/**
 * 生成视频任务状态数据。
 * @param {Object} record 模拟任务记录。
 * @returns {Object} 任务状态数据。
 */
export const buildVideoTaskStatus = (record) => {
  const isCompleted = record.status === TASK_STATUS.COMPLETED;

  return {
    task_id: record.taskId,
    status: record.status,
    progress: record.progress,
    progress_title: "动卷渲染中",
    stage_label: isCompleted ? "动卷已完成 · 可入作品库" : "云端逐帧重绘",
    estimated_time: VIDEO_RENDER_OPTIONS.estimated_time,
    note: isCompleted
      ? "动卷已完成并归档至作品库"
      : "动卷已进入云端渲染池，退出或锁屏均不影响进度，完成后自动归档至作品库。",
  };
};
