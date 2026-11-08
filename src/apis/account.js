import request from "@/utils/request";

/**
 * 获取账户概览。
 * @param {Object} params 查询参数。
 * @returns {Promise<Object>} 账户数据。
 */
export const getAccountOverview = (params) => {
  return request({
    url: "/account/overview",
    method: "GET",
    params: { ...params },
  });
};
