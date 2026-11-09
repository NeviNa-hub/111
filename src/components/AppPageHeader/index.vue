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

// 根据当前页面栈决定是否显示返回箭头。
const updateBackState = () => {
  canGoBack.value = getCurrentPages().length > 1;
};

// 返回上一页。
const handleBack = () => {
  uni.navigateBack();
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
  border-bottom: 1rpx solid $color-line;
  background: $color-surface;
  color: $color-ink;
}

.header-title {
  flex: 1;
  min-width: 0;
  color: $color-primary;
  font-size: $font-size-page-title;
  font-weight: $font-weight-bold;
  line-height: $line-height-tight;
  @include text-ellipsis;
}

.header-back {
  @include tap-area(72rpx);
  flex-shrink: 0;
  margin: 0 $space-1 0 (-$space-4);
  color: $color-ink;
  font-size: $font-size-display-sm;
  line-height: 1;
}

.header-points {
  display: flex;
  flex-shrink: 0;
  align-items: center;
  margin-left: $space-3;
  padding: $space-1 $space-3;
  border: 1rpx solid rgba(95, 133, 117, 0.16);
  border-radius: $radius-pill;
  background: $color-primary-light;
  color: $color-primary-soft;
  font-size: $font-size-caption;
  white-space: nowrap;
}

.points-icon {
  margin-right: $space-1;
  color: $color-accent-clay;
  font-size: $font-size-badge;
}

.points-label {
  letter-spacing: 1rpx;
}

.points-value {
  margin-left: $space-1;
  color: $color-primary;
  font-size: $font-size-aux;
  font-weight: $font-weight-bold;
  @include numeric;
}

.points-detail {
  margin-left: $space-2;
  padding-left: $space-2;
  border-left: 1rpx solid rgba(95, 133, 117, 0.22);
  color: $color-primary-soft;
  font-size: $font-size-badge;
}
</style>
