<template>
  <view class="app-page-header">
    <view v-if="canGoBack" class="header-back" @click="handleBack">‹</view>
    <view class="header-title">{{ title }}</view>
    <view class="header-points">
      <text class="points-icon">✦</text>
      <text class="points-label">灵感点</text>
      <text class="points-value">{{ pointsText }}</text>
      <text class="points-detail">明细</text>
    </view>
  </view>
</template>

<script setup>
import { computed, onMounted, ref } from "vue";

/**
 * @property {string} title 页头标题。
 * @property {number|null} points 灵感点余额；无接口数据时传 null，展示占位符。
 */
const props = defineProps({
  title: { type: String, required: true },
  points: { type: Number, default: null },
});

const canGoBack = ref(false);
const pointsText = computed(() => (props.points === null ? "—" : props.points));

// 根据当前页面栈决定是否显示返回箭头。
const updateBackState = () => {
  canGoBack.value = getCurrentPages().length > 1;
};

// 返回上一页。
const handleBack = () => {
  uni.navigateBack();
};

onMounted(() => {
  updateBackState();
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
