/**
 * 积分状态：余额全端共享一份缓存，登录与创建任务时刷新，页头不重复请求。
 */
import { reactive } from "vue";

import { getPointsInfo } from "@/apis/points";

// 余额由登录与任务创建驱动刷新；页头只读取缓存，会话内首次未加载时兜底拉一次。
export const pointsState = reactive({
  balance: null,
  usedPoints: null,
  loaded: false,
});

// 写入余额快照；带明细的接口响应可直接回填，避免页头再发一次快照请求。
export const setPointsBalance = ({ balance, usedPoints } = {}) => {
  if (balance !== undefined) {
    pointsState.balance = balance;
  }

  if (usedPoints !== undefined) {
    pointsState.usedPoints = usedPoints;
  }

  pointsState.loaded = true;
};

let loadingPromise = null;

/**
 * 读取积分余额；已加载时不重复请求，进行中的请求去重共享。
 * @param {Object} options 读取选项。
 * @param {boolean} options.force 是否强制刷新（登录、创建任务后）。
 * @returns {Promise<void>}
 */
export const loadPointsBalance = ({ force = false } = {}) => {
  if (pointsState.loaded && !force) {
    return Promise.resolve();
  }

  if (loadingPromise && !force) {
    return loadingPromise;
  }

  loadingPromise = (async () => {
    try {
      const data = await getPointsInfo({ page: 1, page_size: 1 });

      setPointsBalance({
        balance: data.points_balance,
        usedPoints: data.used_points,
      });
    } catch {
      // 请求层已统一提示错误，余额保留占位符。
    } finally {
      pointsState.loaded = true;
      loadingPromise = null;
    }
  })();

  return loadingPromise;
};
