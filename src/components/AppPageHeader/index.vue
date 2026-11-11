<template>
  <view class="app-page-header">
    <view v-if="canGoBack" class="header-back" @click="handleBack">‹</view>
    <view class="header-title">{{ title }}</view>
    <view class="header-points">
      <text class="points-icon">✦</text>
      <text class="points-label">积分</text>
      <text class="points-value">{{ pointsText }}</text>
      <text v-if="pointsBalance !== null" class="points-detail">明细</text>
    </view>
  </view>
</template>

<script setup>
import { computed, onMounted, ref } from "vue";

import { getPointsInfo } from "@/apis/points";

/**
 * @property {string} title 页头标题。
 */
defineProps({
  title: { type: String, required: true },
});

const pointsBalance = ref(null);
const canGoBack = ref(false);
const pointsText = computed(() =>
  pointsBalance.value === null ? "—" : pointsBalance.value,
);

// 根据当前页面栈与浏览器历史决定是否显示返回箭头。
// H5 刷新后页面栈会重置为 1，但浏览器历史里仍保留上一个路由，此时按历史判断。
const updateBackState = () => {
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

// 读取当前积分余额，与「我的」页共用同一接口。
const loadPointsBalance = async () => {
  try {
    const data = await getPointsInfo({ page: 1, page_size: 1 });

    pointsBalance.value = data.points_balance;
  } catch {
    // 请求层已统一提示错误，这里保留占位符。
  }
};

onMounted(() => {
  updateBackState();
  loadPointsBalance();
});
</script>

<style scoped lang="scss">
.app-page-header {
  height: calc(#{$header-height} + var(--status-bar-height, 0px));
  padding: var(--status-bar-height, 0px) $space-7 0;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  border-bottom: 1rpx solid rgba(190, 140, 70, 0.18);
  background: #ffecd2;
  // background: #ffdaa6f8;
  // color: #b3712a;
  color: #b3712a;
}

.header-title {
  flex: 1;
  min-width: 0;
  color: #ec8302;
  font-size: $font-size-page-title;
  font-weight: $font-weight-bold;
  line-height: $line-height-tight;
  @include text-ellipsis;
}

.header-back {
  @include tap-area(72rpx);
  flex-shrink: 0;
  margin: 0 $space-1 0 (-$space-4);
  color: #ec8302;
  font-size: $font-size-display-sm;
  line-height: 1;
}

.header-points {
  display: flex;
  flex-shrink: 0;
  align-items: center;
  margin-left: $space-3;
  padding: $space-1 $space-3;
  border: 1rpx solid rgba(236, 131, 2, 0.22);
  border-radius: $radius-pill;
  background: #fffaf3;
  color: #b3712a;
  font-size: $font-size-caption;
  white-space: nowrap;
}

.points-icon {
  margin-right: $space-1;
  color: #ff0000;
  font-size: $font-size-badge;
}

.points-label {
  letter-spacing: 1rpx;
}

.points-value {
  margin-left: $space-1;
  color: #ec0202;
  font-size: $font-size-aux;
  font-weight: $font-weight-bold;
  @include numeric;
}

.points-detail {
  margin-left: $space-2;
  padding-left: $space-2;
  border-left: 1rpx solid rgba(236, 131, 2, 0.25);
  color: #b3712a;
  font-size: $font-size-badge;
}
</style>
