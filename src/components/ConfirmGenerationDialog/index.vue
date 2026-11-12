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
        <el-button class="cancel-button" :disabled="loading" @click="$emit('cancel')">
          再斟酌下
        </el-button>
        <el-button
          class="confirm-button"
          :loading="loading"
          :disabled="loading"
          @click="$emit('confirm')"
        >
          {{ confirmText }}
          <el-icon class="confirm-icon"><ArrowRight /></el-icon>
        </el-button>
      </view>
      <!-- #endif -->
      <!-- #ifndef H5 -->
      <view class="dialog-actions">
        <button class="cancel-button" :disabled="loading" @click="$emit('cancel')">
          再斟酌下
        </button>
        <button class="confirm-button" :disabled="loading" @click="$emit('confirm')">
          {{ loading ? "任务创建中…" : confirmText }}
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
  /** 是否正在提交任务，提交中禁用操作并展示加载状态。 */
  loading: { type: Boolean, default: false },
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
  padding: 32rpx 28rpx;
  padding-bottom: calc(#{24rpx} + constant(safe-area-inset-bottom));
  padding-bottom: calc(#{24rpx} + env(safe-area-inset-bottom));
  border-radius: 32rpx 32rpx 0 0;
  background: $color-surface;
  box-sizing: border-box;

  /* 宽屏下与页面内容区同宽居中，避免底部弹板横跨整屏 */
  @media (min-width: 768px) {
    max-width: 750px;
    margin: 0 auto;
  }

  --el-color-primary: #{$color-primary};
  --el-border-radius-base: #{20rpx};
  --el-font-family: #{$font-family-base};
}

.dialog-title {
  padding-bottom: 20rpx;
  border-bottom: 1rpx solid $color-line;
  color: $color-ink;
  font-size: 34rpx;
  font-weight: 700;
  line-height: 1.3;
}

.dialog-meta {
  margin-top: 16rpx;
  padding: 16rpx 20rpx;
  border: 1rpx solid #f0e0bd;
  border-radius: 20rpx;
  background: #fdf6e8;

  view {
    display: flex;
    align-items: center;
    min-height: 56rpx;
    color: #746c5b;
    font-size: 24rpx;
  }

  view + view {
    border-top: 1rpx solid #f2e8cf;
  }
}

.meta-icon {
  width: 38rpx;
  color: $color-warning;
  font-size: 24rpx;
}

.meta-value {
  margin-left: auto;
  color: #a65d17;
  font-size: 26rpx;
  font-weight: 700;
  @include numeric;
}

.dialog-note {
  display: block;
  margin: 20rpx 8rpx 24rpx;
  color: $color-muted;
  font-size: 24rpx;
  line-height: 1.6;
}

.dialog-actions {
  display: flex;
  gap: 16rpx;

  :deep(.el-button) {
    flex: 1;
    height: $tap-size;
    margin: 0;
    border-radius: 20rpx;
    font-size: 26rpx;
  }
}

/* #ifndef H5 */
.dialog-actions button {
  flex: 1;
  height: $tap-size;
  margin: 0;
  padding: 0;
  border-radius: 20rpx;
  font-size: 26rpx;
  line-height: $tap-size;

  &::after {
    border: 0;
  }
}

.meta-icon-text {
  color: $color-warning;
  font-size: 22rpx;
  text-align: center;
}
/* #endif */

.cancel-button {
  border: 1rpx solid $color-line;
  background: $color-surface;
  color: #4e665e;

  &:hover {
    border-color: #bfd8ce;
    background: #f8faf7;
    color: $color-primary;
  }
}

.confirm-button {
  border: 0;
  background: $color-primary;
  color: #fff;

  &:hover {
    background: #9c6e38;
    color: #fff;
  }
}

.confirm-icon {
  margin-left: 6rpx;
  font-size: 22rpx;
}
</style>
