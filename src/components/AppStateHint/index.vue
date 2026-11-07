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
  padding: $space-9 $space-7;
  border: 1rpx dashed $color-line-strong;
  border-radius: $radius-xl;
  background: $color-surface-muted;
  text-align: center;
}

.state-hint.is-error {
  border-color: rgba(185, 58, 47, 0.24);
  background: $color-danger-bg;
}

.state-spinner {
  width: 40rpx;
  height: 40rpx;
  margin-bottom: $space-3;
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
  color: $color-ink-soft;
  font-size: $font-size-body;
  font-weight: $font-weight-semibold;
  line-height: $line-height-normal;
}

.state-desc {
  margin-top: $space-2;
  color: $color-muted;
  font-size: $font-size-caption;
  line-height: $line-height-normal;
}

.state-action {
  @include tap-area(72rpx);
  margin: $space-5 0 0;
  padding: 0 $space-7;
  border: 1rpx solid $color-primary;
  border-radius: $radius-pill;
  background: $color-surface;
  color: $color-primary;
  font-size: $font-size-caption;
  line-height: 1;
}

.state-action::after {
  border: 0;
}
</style>
