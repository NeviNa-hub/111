/**
 * 文字生图 Demo 数据
 */
import { TASK_STATUS } from "../apis/constants.js";

export const IMAGE_STYLES = [
  {
    style_id: 1,
    name: "宋式水墨",
    description: "写意淡墨，温润留白，淡雅韵味。",
    class_name: "ink-style",
  },
  {
    style_id: 2,
    name: "真实摄影",
    description: "微质感，柔和光影，细腻真实。",
    class_name: "photo-style",
  },
  {
    style_id: 3,
    name: "宋瓷青釉",
    description: "手工釉色肌理，低饱和大地色。",
    class_name: "ceramic-style",
  },
  {
    style_id: 4,
    name: "温润插画",
    description: "轻笔与木刻手绘感，质朴温暖。",
    class_name: "illustration-style",
  },
];

export const IMAGE_STYLE_OPTIONS = {
  default_style_id: 1,
  lists: IMAGE_STYLES,
};

export const IMAGE_CREATION_OPTIONS = {
  suggestions: ["江南烟雨", "宋代山水", "青绿设色", "晨曦微光", "枯墨留白"],
  polish_suffix: "画面空灵雅致，留白自然，笔触细腻",
  random_prompt: "薄雾晨光里的青绿山水，远处层峦叠嶂，近处一叶轻舟掠过溪面",
  prompt_limit: 500,
};

export const IMAGE_CANVAS_OPTIONS = {
  ratios: [
    {
      ratio_id: 1,
      name: "1:1 方形",
      description: "适合朋友圈 / 头像",
      value: "1:1",
    },
    {
      ratio_id: 2,
      name: "16:9 横卷",
      description: "电脑宽幅长卷",
      value: "16:9",
    },
    {
      ratio_id: 3,
      name: "9:16 立轴",
      description: "移动壁纸画轴",
      value: "9:16",
    },
    {
      ratio_id: 4,
      name: "4:3 经典",
      description: "雅致画册典藏",
      value: "4:3",
    },
  ],
  counts: [
    { count_id: 1, name: "单张", value: 1, cost: 2 },
    { count_id: 2, name: "双张", value: 2, cost: 4 },
    { count_id: 3, name: "四张", value: 4, cost: 8 },
  ],
  default_ratio: "1:1",
  default_count: "双张",
  estimated_time: "约 6~8 秒",
};

// 截断过长的意境文案，生成作品名称
const buildWorkName = (prompt = "") => {
  if (!prompt) {
    return "《未命名画卷》";
  }

  return `《${prompt.length > 12 ? `${prompt.slice(0, 12)}…` : prompt}》`;
};

// 根据张数名称计算消耗的灵感点
const resolveCost = (countName = "") => {
  const matched = IMAGE_CANVAS_OPTIONS.counts.find((item) => item.name === countName);

  return matched?.cost || IMAGE_CANVAS_OPTIONS.counts[1].cost;
};

/**
 * 生成文字生图任务状态数据。
 * @param {Object} record 模拟任务记录。
 * @returns {Object} 任务状态数据。
 */
export const buildImageTaskStatus = (record) => {
  const payload = record.payload || {};
  const isCompleted = record.status === TASK_STATUS.COMPLETED;
  const tags = [payload.style || "宋式水墨", payload.ratio || "1:1"].filter(Boolean);

  if (payload.count) {
    tags.push(payload.count);
  }

  return {
    task_id: record.taskId,
    status: record.status,
    progress: record.progress,
    progress_title: "研墨成画",
    stage_label: isCompleted ? "画卷已完成 · 可入作品库" : "立轴画心 · 析出中",
    type_label: "天工化育",
    work_name: buildWorkName(payload.prompt),
    detail: `${payload.style || "宋式水墨"} · ${payload.ratio || "1:1"}`,
    tags,
    cost: resolveCost(payload.count),
    estimated_time: IMAGE_CANVAS_OPTIONS.estimated_time,
    description: "研墨调色，点染山石梧桐与溪桥花茂",
    tip: isCompleted
      ? "画卷已完成并归档至作品库"
      : "已投入云端渲染池，离开页面不影响任务进度",
    status_text: isCompleted ? "已完成 · 已归档作品库" : "第二阶段 · 丹青晕染",
    progress_label: "气韵流转",
    result_urls: isCompleted ? ["/static/home/home-1.jpg"] : [],
  };
};
