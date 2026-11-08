import request from "@/utils/request";

/**
 * 获取创作台数据。
 * @param {Object} params 查询参数。
 * @returns {Promise<Object>} 创作台数据。
 */
export const getWorkbenchData = (params) => {
  return request({
    url: "/workbench",
    method: "GET",
    params: { ...params },
  });
};

/**
 * 获取作品库列表。
 * @param {Object} params 查询参数。
 * @returns {Promise<Object>} 作品库数据。
 */
export const getLibraryData = (params = {}) => {
  return request({
    url: "/library",
    method: "GET",
    params: { ...params },
  });
};
