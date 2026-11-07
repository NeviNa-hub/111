<template>
  <view class="dialog-mask">
    <view class="dialog-sheet">
      <view class="dialog-title">{{ title }}</view>
      <view class="dialog-meta">
        <view>
          <!-- #ifdef H5 -->
          <el-icon class="meta-icon"><Lightning /></el-icon>
          <!-- #endif -->
          <!-- #ifndef H5 -->
          <text class="meta-icon meta-icon-text">耗</text>
          <!-- #endif -->
          <text>本次消耗灵感点</text>
          <text class="meta-value">-{{ cost }} 点</text>
        </view>
        <view>
          <!-- #ifdef H5 -->
          <el-icon class="meta-icon"><Timer /></el-icon>
          <!-- #endif -->
          <!-- #ifndef H5 -->
          <text class="meta-icon meta-icon-text">时</text>
          <!-- #endif -->
          <text>预计生成耗时</text>
          <text class="meta-value">{{ estimatedTime }}</text>
        </view>
      </view>
      <text class="dialog-note">{{ note }}</text>
      <!-- #ifdef H5 -->
      <view class="dialog-actions">
        <el-button class="cancel-button" @click="$emit('cancel')"> 再斟酌下 </el-button>
        <el-button class="confirm-button" @click="$emit('confirm')">
          {{ confirmText }}
          <el-icon class="confirm-icon"><ArrowRight /></el-icon>
        </el-button>
      </view>
      <!-- #endif -->
      <!-- #ifndef H5 -->
      <view class="dialog-actions">
        <button class="cancel-button" @click="$emit('cancel')">再斟酌下</button>
        <button class="confirm-button" @click="$emit('confirm')">
          {{ confirmText }}
        </button>
      </view>
      <!-- #endif -->
    </view>
  </view>
</template>

<script setup>
// #ifdef H5
import { ArrowRight, Lightning, Timer } from "@element-plus/icons-vue";
// #endif

defineProps({
  /** 弹窗标题。 */
  title: { type: String, default: "确认研墨成画" },
  /** 本次消耗的灵感点。 */
  cost: { type: [String, Number], default: 4 },
  /** 预计生成耗时。 */
  estimatedTime: { type: String, default: "约 6~8 秒" },
  /** 弹窗说明。 */
  note: {
    type: String,
    default: "确认后将送往云端研磨，期间离开或切换页面均不影响生成，可在作品库静候收卷。",
  },
  /** 确认按钮文案。 */
  confirmText: { type: String, default: "确认研墨成画" },
});

defineEmits(["cancel", "confirm"]);
</script>

<style scoped lang="scss">
.dialog-mask {
  position: fixed;
  z-index: 20;
  inset: 0;
  display: flex;
  align-items: flex-end;
  background: rgba(20, 28, 27, 0.52);
}

.dialog-sheet {
  width: 100%;
  padding: $space-7 $space-6;
  padding-bottom: calc(#{$space-5} + constant(safe-area-inset-bottom));
  padding-bottom: calc(#{$space-5} + env(safe-area-inset-bottom));
  border-radius: $radius-3xl $radius-3xl 0 0;
  background: $color-surface;
  box-sizing: border-box;

  --el-color-primary: #{$color-primary};
  --el-border-radius-base: #{$radius-lg};
  --el-font-family: #{$font-family-base};
}

.dialog-title {
  padding-bottom: $space-4;
  border-bottom: 1rpx solid $color-line;
  color: $color-ink;
  font-size: $font-size-title;
  font-weight: $font-weight-bold;
  line-height: $line-height-tight;
}

.dialog-meta {
  margin-top: $space-3;
  padding: $space-3 $space-4;
  border: 1rpx solid $color-warning-line;
  border-radius: $radius-lg;
  background: $color-warning-bg;

  view {
    display: flex;
    align-items: center;
    min-height: 56rpx;
    color: #746c5b;
    font-size: $font-size-caption;
  }

  view + view {
    border-top: 1rpx solid #f2e8cf;
  }
}

.meta-icon {
  width: 38rpx;
  color: $color-warning;
  font-size: $font-size-caption;
}

.meta-value {
  margin-left: auto;
  color: #a65d17;
  font-size: $font-size-aux;
  font-weight: $font-weight-bold;
  @include numeric;
}

.dialog-note {
  display: block;
  margin: $space-4 $space-1 $space-5;
  color: $color-muted;
  font-size: $font-size-caption;
  line-height: $line-height-normal;
}

.dialog-actions {
  display: flex;
  gap: $space-3;

  :deep(.el-button) {
    flex: 1;
    height: $tap-size;
    margin: 0;
    border-radius: $radius-lg;
    font-size: $font-size-aux;
  }
}

/* #ifndef H5 */
.dialog-actions button {
  flex: 1;
  height: $tap-size;
  margin: 0;
  padding: 0;
  border-radius: $radius-lg;
  font-size: $font-size-aux;
  line-height: $tap-size;

  &::after {
    border: 0;
  }
}

.meta-icon-text {
  color: $color-warning;
  font-size: $font-size-badge;
  text-align: center;
}
/* #endif */

.cancel-button {
  border: 1rpx solid $color-line;
  background: $color-surface;
  color: $color-ink-soft;

  &:hover {
    border-color: #bfd8ce;
    background: $color-surface-muted;
    color: $color-primary;
  }
}

.confirm-button {
  border: 0;
  background: $color-primary;
  color: #fff;

  &:hover {
    background: $color-primary-dark;
    color: #fff;
  }
}

.confirm-icon {
  margin-left: 6rpx;
  font-size: $font-size-badge;
}
</style>
