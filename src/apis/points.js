import request from "@/utils/request";

/**
 * 获取灵感点余额与流水。
 * @param {Object} params 分页查询参数。
 * @returns {Promise<Object>} 积分余额与流水数据。
 */
export const getPointsInfo = (params = {}) => {
  return request({ 
    url: "/points/myInfo", 
    method: "GET", 
    params: { ...params },
  });
};
