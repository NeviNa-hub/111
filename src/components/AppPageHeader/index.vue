<template>
  <view class="app-page-header">
    <view v-if="canGoBack" class="header-back" @click="handleBack">‹</view>
    <view class="header-title">{{ title }}</view>
    <view v-if="showPoints" class="header-points">
      <text class="points-icon">✦</text>
      <text class="points-label">积分</text>
      <text class="points-value">{{ pointsText }}</text>
      <text v-if="pointsState.balance !== null" class="points-detail">
      明细
      </text>
    </view>
  </view>
</template>

<script setup>
import { computed, onMounted, ref } from "vue";

import { loadPointsBalance, pointsState } from "@/stores";

/**
 * @property {string} title 页头标题。
 * @property {boolean} showPoints 是否显示积分信息，默认显示；登录与注册页关闭。
 */
const props = defineProps({
  title: { type: String, required: true },
  showPoints: { type: Boolean, default: true },
});

// 底部导航主页面没有上级页面，即使 H5 历史里仍有旧记录也不显示返回箭头。
const TOP_LEVEL_ROUTES = [
  "pages/auth/index",
  "pages/index/index",
  "pages/workbench/index",
  "pages/library/index",
  "pages/under-development/index",
  "pages/profile/index",
];

const canGoBack = ref(false);
const pointsText = computed(() =>
  pointsState.balance === null ? "—" : pointsState.balance,
);

// 判断当前页面是否为底部导航主页面。
const isTopLevelPage = () => {
  const pages = getCurrentPages();
  const route = pages[pages.length - 1]?.route || "";

  return TOP_LEVEL_ROUTES.includes(route.replace(/^\//, ""));
};

// 根据当前页面栈与浏览器历史决定是否显示返回箭头。
// H5 刷新后页面栈会重置为 1，但浏览器历史里仍保留上一个路由，此时按历史判断。
const updateBackState = () => {
  if (isTopLevelPage()) {
    canGoBack.value = false;

    return;
  }

  // #ifdef H5
  canGoBack.value =
    getCurrentPages().length > 1 || Boolean(window.history.state?.back);
  // #endif
  // #ifndef H5
  canGoBack.value = getCurrentPages().length > 1;
  // #endif
};

// 返回上一页；页面栈不可回退时（如 H5 刷新后直接打开）退回浏览器历史。
const handleBack = () => {
  if (getCurrentPages().length > 1) {
    uni.navigateBack();

    return;
  }

  // #ifdef H5
  window.history.back();
  // #endif
};

onMounted(() => {
  updateBackState();

  // 积分余额由登录与任务创建驱动刷新，这里只兜底读取会话内未加载时的首次缓存。
  if (props.showPoints) {
    loadPointsBalance();
  }
});
</script>

<style scoped lang="scss">
.app-page-header {
  height: calc(#{100rpx} + var(--status-bar-height, 0px));
  padding: var(--status-bar-height, 0px) 32rpx 0;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  border-bottom: 1rpx solid rgba(190, 140, 70, 0.18);
  background: #ffecd2;
  color: #b3712a;
}

.header-title {
  flex: 1;
  min-width: 0;
  color: #ec8302;
  font-size: 38rpx;
  font-weight: 700;
  line-height: 1.3;
  @include text-ellipsis;
}

.header-back {
  @include tap-area(72rpx);
  flex-shrink: 0;
  margin: 0 8rpx 0 (-20rpx);
  color: #ec8302;
  font-size: 44rpx;
  line-height: 1;
}

.header-points {
  display: flex;
  flex-shrink: 0;
  align-items: center;
  margin-left: 16rpx;
  padding: 8rpx 16rpx;
  border: 1rpx solid rgba(236, 131, 2, 0.22);
  border-radius: 999rpx;
  background: #fffaf3;
  color: #b3712a;
  font-size: 24rpx;
  white-space: nowrap;
}

.points-icon {
  margin-right: 8rpx;
  color: #ff0000;
  font-size: 22rpx;
}

.points-label {
  letter-spacing: 1rpx;
}

.points-value {
  margin-left: 8rpx;
  color: #ec0202;
  font-size: 26rpx;
  font-weight: 700;
  @include numeric;
}

.points-detail {
  margin-left: 12rpx;
  padding-left: 12rpx;
  border-left: 1rpx solid rgba(236, 131, 2, 0.25);
  color: #b3712a;
  font-size: 22rpx;
}
</style>
