/**
 * 创作台与作品库
 */
import { API_PATHS, PAGE_DEFAULTS } from "@/apis/constants";
import apiRequest from "@/apis/http";
import { mapPageInfo } from "@/apis/mappers";

// 映射分镜
const mapFrame = (item = {}) => ({
  frameId: item.frame_id,
  name: item.name || "",
});

// 映射草稿
const mapDraft = (item = {}) => ({
  draftId: item.draft_id,
  title: item.title || "",
  time: item.time || "",
  status: item.status || "",
});

// 映射作品标签
const mapTab = (item = {}) => ({
  status: item.status,
  name: item.name || "",
  count: Number(item.count) || 0,
});

// 映射作品
const mapWork = (item = {}) => ({
  workId: item.work_id,
  title: item.title || "",
  status: item.status || "",
  className: item.class_name || "",
  imageUrl: item.image_url || "",
});

// 映射生成中提示
const mapGenerating = (item) => {
  if (!item) {
    return null;
  }

  return {
    workId: item.work_id,
    title: item.title || "",
    statusText: item.status_text || "",
  };
};

/**
 * 获取创作台数据。
 * @returns {Promise<import("@/apis/types").WorkbenchOverview>} 创作台数据。
 */
export const getWorkbenchData = async () => {
  const data = await apiRequest({ url: API_PATHS.WORKBENCH });

  return {
    filmChips: Array.isArray(data.film_chips) ? data.film_chips : [],
    frames: Array.isArray(data.frames) ? data.frames.map(mapFrame) : [],
    drafts: Array.isArray(data.drafts) ? data.drafts.map(mapDraft) : [],
  };
};

/**
 * 获取作品库列表。
 * @param {Object} [params] 查询参数。
 * @param {number} [params.page] 页码。
 * @param {number} [params.pageSize] 每页条数。
 * @param {string} [params.status] 作品状态。
 * @returns {Promise<import("@/apis/types").LibraryResult>} 作品库数据。
 */
export const getLibraryData = async (params = {}) => {
  const data = await apiRequest({
    url: API_PATHS.LIBRARY,
    params: {
      page: params.page || PAGE_DEFAULTS.PAGE,
      page_size: params.pageSize || PAGE_DEFAULTS.PAGE_SIZE,
      status: params.status || "all",
    },
  });

  return {
    summary: data.summary || "",
    tabs: Array.isArray(data.tabs) ? data.tabs.map(mapTab) : [],
    pageInfo: mapPageInfo(data.page_info),
    works: Array.isArray(data.lists) ? data.lists.map(mapWork) : [],
    generating: mapGenerating(data.generating),
  };
};
