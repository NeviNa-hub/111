<template>
  <view class="dialog-mask">
    <view class="dialog-sheet progress-sheet">
      <view class="dialog-title">{{ dialogTitle }}</view>
      <template v-if="status === 'completed' && resultUrl">
        <view class="result-preview">
          <image
            class="result-image"
            :src="resultUrl"
            mode="aspectFit"
            @tap="previewResult"
          />
        </view>
        <text class="result-hint">轻触图片放大查看</text>
      </template>
      <template v-else>
        <view class="progress-circle">{{ progress }}<small>%</small></view>
        <text class="progress-label">{{ progressLabel }}</text>
      </template>
      <text class="progress-note">{{ note }}</text>
      <!-- #ifdef H5 -->
      <view class="dialog-actions">
        <el-button class="back-button" @click="$emit('back')">
          <el-icon><House /></el-icon>
          返回工作台
        </el-button>
        <el-button class="confirm-button" @click="$emit('library')">
          <el-icon><Collection /></el-icon>
          前往作品库查看
        </el-button>
      </view>
      <!-- #endif -->
      <!-- #ifndef H5 -->
      <view class="dialog-actions">
        <button class="back-button" @click="$emit('back')">返回工作台</button>
        <button class="confirm-button" @click="$emit('library')">
          前往作品库查看
        </button>
      </view>
      <!-- #endif -->
    </view>
  </view>
</template>

<script setup>
import { computed } from "vue";

// #ifdef H5
import { Collection, House } from "@element-plus/icons-vue";
// #endif

/**
 * 生成弹窗组件。
 * @param title 弹窗标题，为空时按任务类型使用默认文案。
 * @param progress 当前生成进度。
 * @param progressLabel 进度说明。
 * @param note 弹窗提示。
 * @param status 任务状态，完成时切换为结果展示。
 * @param resultUrl 生成结果地址，任务完成时展示。
 */
const props = defineProps({
  title: { type: String, default: "" },
  type: { type: String, default: "creation" },
  progress: { type: [String, Number], default: 0 },
  progressLabel: { type: String, default: "生成进度" },
  note: {
    type: String,
    default: "已进入云端渲染，期间离开或切换页面不影响生成，可在作品库查看。",
  },
  status: { type: String, default: "" },
  resultUrl: { type: String, default: "" },
});

defineEmits(["back", "library"]);

const dialogTitle = computed(
  () =>
    props.title || (props.type === "optimization" ? "淬炼重绘" : "研墨成画"),
);

// 预览生成结果大图
const previewResult = () => {
  if (!props.resultUrl) {
    return;
  }

  uni.previewImage({ urls: [props.resultUrl] });
};
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

.progress-sheet {
  text-align: center;
}

.progress-circle {
  width: 150rpx;
  height: 150rpx;
  margin: $space-5 auto $space-4;
  border: 6rpx solid $color-primary;
  border-radius: 50%;
  color: $color-ink;
  font-size: $font-size-display;
  font-weight: $font-weight-bold;
  line-height: 150rpx;
  @include numeric;
}

.progress-circle small {
  font-size: $font-size-caption;
  font-weight: $font-weight-regular;
}

.progress-label {
  display: block;
  color: $color-primary;
  font-size: $font-size-caption;
  font-weight: $font-weight-bold;
}

.progress-note {
  display: block;
  margin: $space-5 0;
  color: $color-muted;
  font-size: $font-size-caption;
  line-height: $line-height-normal;
}

.result-preview {
  height: 480rpx;
  margin: $space-5 0 $space-2;
  border-radius: $radius-xl;
  overflow: hidden;
  background: $color-surface-muted;
}

.result-image {
  width: 100%;
  height: 100%;
}

.result-hint {
  display: block;
  color: $color-muted;
  font-size: $font-size-badge;
}

.dialog-actions {
  display: flex;
  gap: $space-3;

  :deep(.el-button) {
    flex: 1;
    height: $tap-size;
    margin: 0;
    border-radius: $radius-lg;
    font-size: $font-size-caption;
  }

  :deep(.el-icon) {
    margin-right: 4rpx;
    font-size: $font-size-badge;
  }
}

/* #ifndef H5 */
.dialog-actions button {
  flex: 1;
  height: $tap-size;
  margin: 0;
  padding: 0;
  border-radius: $radius-lg;
  font-size: $font-size-caption;
  line-height: $tap-size;

  &::after {
    border: 0;
  }
}
/* #endif */

.back-button {
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
</style>
