/**
 * 账户信息
 */
import { API_PATHS } from "@/apis/constants";
import apiRequest from "@/apis/http";

/**
 * 获取账户概览。
 * @returns {Promise<import("@/apis/types").AccountOverview>} 账户数据。
 */
export const getAccountOverview = async () => {
  const data = await apiRequest({ url: API_PATHS.ACCOUNT_OVERVIEW });
  const points = data?.points_balance;

  return {
    pointsBalance: typeof points === "number" ? points : null,
  };
};
