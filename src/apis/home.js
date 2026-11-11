import request from "@/apis/http";

/**
 * 获取首页概览数据。
 * @param {Object} params 查询参数。
 * @returns {Promise<Object>} 首页数据。
 */
export const getHomeOverview = (params) => {
  return request({
    url: "/home/overview",
    method: "GET",
    params: { ...params },
  });
};
