import request from "@/apis/http";

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

/**
 * 删除本人作品。
 * @param {Object} params 删除参数，包含 workId。
 * @returns {Promise<Object>} 删除结果。
 */
export const deleteLibraryWork = (params = {}) => {
  return request({
    url: `/library/works/${encodeURIComponent(params.workId)}`,
    method: "DELETE",
  });
};
