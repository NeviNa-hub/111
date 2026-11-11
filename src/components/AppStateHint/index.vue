<template>
  <view class="state-hint" :class="`is-${type}`">
    <view v-if="type === 'loading'" class="state-spinner"></view>
    <text class="state-title">{{ title }}</text>
    <text v-if="description" class="state-desc">{{ description }}</text>
    <button v-if="actionText" class="state-action" @tap="handleAction">
      {{ actionText }}
    </button>
  </view>
</template>

<script setup>
defineProps({
  /** 状态类型：loading / empty / error。 */
  type: { type: String, default: "empty" },
  /** 主提示文案。 */
  title: { type: String, required: true },
  /** 补充说明。 */
  description: { type: String, default: "" },
  /** 操作按钮文案，为空时不显示按钮。 */
  actionText: { type: String, default: "" },
});

const emit = defineEmits(["action"]);

// 触发状态区的重试或其他操作。
const handleAction = () => {
  emit("action");
};
</script>

<style scoped lang="scss">
.state-hint {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 48rpx 32rpx;
  border: 1rpx dashed #d2ddd6;
  border-radius: 24rpx;
  background: #f8faf7;
  text-align: center;
}

.state-hint.is-error {
  border-color: rgba(185, 58, 47, 0.24);
  background: #fdf3f1;
}

.state-spinner {
  width: 40rpx;
  height: 40rpx;
  margin-bottom: 16rpx;
  border: 4rpx solid rgba(5, 96, 76, 0.16);
  border-top-color: $color-primary;
  border-radius: 50%;
  animation: state-spin 0.9s linear infinite;
}

@keyframes state-spin {
  to {
    transform: rotate(360deg);
  }
}

.state-title {
  color: #4e665e;
  font-size: 28rpx;
  font-weight: 600;
  line-height: 1.6;
}

.state-desc {
  margin-top: 12rpx;
  color: $color-muted;
  font-size: 24rpx;
  line-height: 1.6;
}

.state-action {
  @include tap-area(72rpx);
  margin: 24rpx 0 0;
  padding: 0 32rpx;
  border: 1rpx solid $color-primary;
  border-radius: 999rpx;
  background: $color-surface;
  color: $color-primary;
  font-size: 24rpx;
  line-height: 1;
}

.state-action::after {
  border: 0;
}
</style>
