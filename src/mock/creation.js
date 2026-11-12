/**
 * 首页、创作台与作品库 Demo 数据
 */

export const HOME_OVERVIEW = {
  weather_text: "今日谷雨",
  quote: "造法自然 · 意致千里",
  hero: {
    label: "今日推荐",
    caption: "妙笔生花，一念成画",
    prompt: "水墨淋漓，=，微风拂动湖面 ...",
    image_url: "/static/home/home.jpg",
    model_name: "AI 大模型",
    generated_count: 1280,
  },
  creations: [
    {
      creation_id: 1,
      eyebrow: "IMAGE INK",
      title: "文字生图",
      input_label: "意境：",
      input_value: "宋式青绿水墨...",
      icon: "✦",
      note: "字句勾勒意境",
      action: "去探索",
      url: "/pages/image-creation/index",
    },
    {
      creation_id: 2,
      eyebrow: "MOTION INK",
      title: "视频创作",
      input_label: "镜头：",
      input_value: "微风荡起波澜...",
      icon: "▣",
      note: "融汇静止为流动",
      action: "去创作",
      url: "/pages/video-creation/index",
    },
    {
      creation_id: 3,
      eyebrow: "IMAGE REFINE",
      title: "图片优化",
      input_label: "优化：",
      input_value: "超高清晰画质",
      icon: "✨",
      note: "一键唤醒纤毫纹理",
      action: "还原",
      url: "/pages/image-optimization/index",
    },
  ],
};

export const WORKBENCH_OVERVIEW = {
  film_chips: ["四开画幅", "轨迹平滑", "60FPS 帧率"],
  frames: [
    { frame_id: 1, name: "起势·淡雾" },
    { frame_id: 2, name: "承转·远山" },
    { frame_id: 3, name: "流光·松石" },
    { frame_id: 4, name: "收敛·留白" },
  ],
  drafts: [
    {
      draft_id: 1,
      title: "《松山夜笛》插图构思",
      time: "2小时前",
      status: "待生成",
    },
    {
      draft_id: 2,
      title: "茶室空间运镜脚本设计",
      time: "昨日",
      status: "已分镜",
    },
    {
      draft_id: 3,
      title: "老照片人物去污处理",
      time: "3日前",
      status: "已完成",
    },
  ],
};

const LIBRARY_WORKS = [
  {
    work_id: 1,
    title: "《水墨画：寒江独钓图》",
    status: "completed",
    class_name: "river-work",
    type_name: "文字生图",
    created_at: "2026-06-06 14:32",
  },
  {
    work_id: 2,
    title: "《空山新雨》运镜短片",
    status: "creating",
    class_name: "bamboo-work",
    type_name: "视频创作",
    created_at: "2026-11-11 09:05",
  },
  {
    work_id: 3,
    title: "《茶室听雪》高清修复",
    status: "draft",
    class_name: "tea-work",
    type_name: "图片优化",
    created_at: "2026-11-12 20:18",
  },
];

const buildTabs = (works) => [
  { status: "all", name: "全部", count: works.length },
  {
    status: "completed",
    name: "已完成",
    count: works.filter((item) => item.status === "completed").length,
  },
  {
    status: "creating",
    name: "创作中",
    count: works.filter((item) => item.status === "creating").length,
  },
  {
    status: "draft",
    name: "草稿",
    count: works.filter((item) => item.status === "draft").length,
  },
];

/**
 * 按状态与分页规则生成作品库数据。
 * @param {Object} params 查询参数。
 * @param {number} params.page 页码。
 * @param {number} params.page_size 每页条数。
 * @param {string} params.status 作品状态。
 * @param {boolean} [isEmpty] 是否返回空列表，用于验证空态。
 * @returns {Object} 作品库数据。
 */
export const buildLibraryData = (params = {}, isEmpty = false) => {
  const status = params.status || "all";
  const page = Math.max(1, Number(params.page) || 1);
  const pageSize = Math.max(1, Number(params.page_size) || 10);

  if (isEmpty) {
    return {
      summary: "暂无典藏 · 完成一次生图后自动归档",
      tabs: buildTabs(LIBRARY_WORKS).map((tab) => ({ ...tab, count: 0 })),
      page_info: { page, page_size: pageSize, total: 0 },
      lists: [],
      generating: null,
    };
  }

  const filteredWorks = LIBRARY_WORKS.filter(
    (item) => status === "all" || item.status === status,
  );
  const start = (page - 1) * pageSize;
  const creatingWork = LIBRARY_WORKS.find((item) => item.status === "creating");

  return {
    summary: `共 ${LIBRARY_WORKS.length} 幅典藏 · 1 幅研墨中`,
    tabs: buildTabs(LIBRARY_WORKS),
    page_info: {
      page,
      page_size: pageSize,
      total: filteredWorks.length,
    },
    lists: filteredWorks.slice(start, start + pageSize),
    generating: creatingWork
      ? {
          work_id: creatingWork.work_id,
          title: creatingWork.title,
          status_text: "生成中 · 墨骨勾勒",
        }
      : null,
  };
};
