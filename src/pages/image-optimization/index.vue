<template>
  <view class="page">
    <app-page-header title="图片优化" />
    <scroll-view scroll-y :show-scrollbar="false" class="content">
      <view class="file">
        <text v-if="selectedImage"> {{ selectedImage.name }}</text>
        <text v-else>请先导入需要优化的图片</text>
        <button @click="chooseImage">
          {{ selectedImage ? "更换图片" : "导入图片" }}
        </button>
      </view>
      <view class="preview" :class="{ empty: !selectedImage }" @click="chooseImage">
        <app-image
          v-if="selectedImage"
          class="preview-media"
          :src="selectedImage.url || selectedImage.path"
          mode="aspectFit"
        />
        <text v-else class="empty-tip"> ＋<small>从相册选择或拍摄图片</small> </text>
        <text v-if="selectedImage" class="cover"> 已选封面</text>
        <text v-if="selectedImage" class="ready"> 原图解析就绪 · 4K重绘待命</text>
        <text v-if="selectedImage" class="zoom">⌕</text>
      </view>
      <view class="hint" @click="chooseImage">　点击重新从系统相册导入或拍摄</view>
      <view class="heading">
        优化提示词 <small>{{ prompt.length }} / {{ promptLimit }} 字</small>
      </view>
      <view class="prompt-card">
        <textarea
          v-model="prompt"
          :maxlength="promptLimit"
          class="prompt-input"
          placeholder="描述希望优化的效果，例如：提升清晰度，修复噪点，保留原有构图"
        />
      </view>
      <text class="fixed-tip">重绘强度与面部细节保留由系统统一设定</text>
    </scroll-view>
    <view class="actions">
      <view class="cost">
        <text>预计消耗 {{ costText }} 灵感点</text>
        <text>账户结余以实际扣减为准</text>
      </view>
      <button :disabled="!selectedImage || isSubmitting" @click="startOptimization">
        {{ isSubmitting ? "正在提交，请稍候…" : `开始淬炼重绘（耗${costText}点）` }}
      </button>
      <text>云端蒸馏级处理 · 支持高清直存至作品库</text>
    </view>
  </view>
</template>

<script setup>
import { computed, ref } from "vue";

import { createImageOptimization } from "@/apis/image-optimization";
import AppImage from "@/components/AppImage/index.vue";
import AppPageHeader from "@/components/AppPageHeader/index.vue";
import { chooseSingleImage } from "@/utils/image-picker";
import { getErrorMessage, isApiError } from "@/utils/request";

const cost = 3;
const promptLimit = 200;
const prompt = ref("");
const selectedImage = ref(null);
const isSubmitting = ref(false);

const costText = computed(() => cost);

// 从系统相册或相机选择图片并上传，失败时保留已有图片
const chooseImage = async () => {
  try {
    const image = await chooseSingleImage();
    selectedImage.value = { ...image, url: image.path };
  } catch (error) {
    if (!String(error?.errMsg || "").includes("cancel")) {
      uni.showToast({
        title: getErrorMessage(error, "选择图片失败"),
        icon: "none",
      });
    }
  }
};

// 校验图片后开始优化任务
const startOptimization = async () => {
  if (isSubmitting.value) {
    return;
  }

  if (!selectedImage.value) {
    uni.showToast({ title: "请先导入需要优化的图片", icon: "none" });
    return;
  }

  if (!prompt.value.trim()) {
    uni.showToast({ title: "请填写优化提示词", icon: "none" });
    return;
  }

  isSubmitting.value = true;

  try {
    const task = await createImageOptimization({
      image_path: selectedImage.value.url || selectedImage.value.path,
      prompt: prompt.value.trim(),
    });

    if (!task?.task_id) {
      uni.showToast({ title: "任务创建失败，请重试", icon: "none" });
      return;
    }

    uni.navigateTo({
      url: `/pages/image-generation/index?mode=optimization&taskId=${encodeURIComponent(
        task.task_id
      )}`,
    });
  } catch (error) {
    if (!isApiError(error)) {
      uni.showToast({
        title: getErrorMessage(error, "创建任务失败，请稍后重试"),
        icon: "none",
      });
    }
  } finally {
    isSubmitting.value = false;
  }
};
</script>

<style scoped lang="scss">
.page {
  height: 100vh;
  overflow: hidden;
  background: $color-bg-page;
  color: $color-ink;
}

.content {
  height: calc(100vh - 220rpx - var(--status-bar-height, 0px));
  overflow-x: hidden;
  padding: 34rpx $space-8 220rpx;
  box-sizing: border-box;
}

.content-state {
  margin-bottom: $space-5;
}

.file {
  display: flex;
  align-items: center;
  gap: $space-3;
  min-width: 0;
  font-size: $font-size-aux;
  font-weight: $font-weight-bold;
}

.file text {
  flex: 1;
  min-width: 0;
  @include text-ellipsis;
}

.file button {
  @include tap-area(64rpx);
  flex-shrink: 0;
  margin: 0 0 0 auto;
  padding: 0 $space-4;
  border: 0;
  border-radius: $radius-pill;
  background: $color-primary-light;
  color: $color-primary;
  font-size: $font-size-caption;
  line-height: 1;
}

.file button:after {
  border: 0;
}

.preview {
  position: relative;
  height: 520rpx;
  margin-top: $space-4;
  overflow: hidden;
  border-radius: $radius-md;
  background: #d8dce4;
}

.preview-media {
  width: 100%;
  height: 100%;
}

.preview.empty {
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2rpx dashed $color-line-strong;
  background: $color-surface-muted;
}

.empty-tip {
  color: $color-muted;
  font-size: $font-size-display;
  text-align: center;
}

.empty-tip small {
  display: block;
  margin-top: $space-3;
  font-size: $font-size-caption;
}

.cover,
.ready,
.zoom {
  position: absolute;
  background: rgba(45, 64, 78, 0.88);
  color: #fff;
}

.cover,
.ready {
  padding: $space-1 $space-3;
  border-radius: $radius-xl;
  font-size: $font-size-caption;
}

.cover {
  top: 18rpx;
  left: 18rpx;
}

.ready {
  bottom: 20rpx;
  left: 18rpx;
  max-width: calc(100% - 100rpx);
  @include text-ellipsis;
}

.zoom {
  @include tap-area(56rpx);
  right: 18rpx;
  bottom: 20rpx;
  width: 56rpx;
  height: 56rpx;
  border-radius: 50%;
  font-size: $font-size-body;
  line-height: 1;
}

.hint {
  margin-top: $space-3;
  padding: $space-4;
  border: 1rpx dashed $color-line-strong;
  border-radius: $radius-md;
  color: $color-muted;
  font-size: $font-size-caption;
  text-align: center;
}

.heading {
  display: flex;
  justify-content: space-between;
  margin-top: $space-6;
  color: $color-ink;
  font-size: $font-size-body;
  font-weight: $font-weight-bold;
}

.heading small {
  color: $color-muted;
  font-size: $font-size-caption;
  font-weight: $font-weight-regular;
}

.prompt-card {
  margin-top: $space-3;
  padding: $space-4;
  border: 1rpx solid $color-line;
  border-radius: $radius-md;
  background: $color-surface;
}

.prompt-input {
  width: 100%;
  height: 200rpx;
  color: $color-ink;
  font-size: $font-size-aux;
  line-height: $line-height-normal;
  box-sizing: border-box;
}

.fixed-tip {
  display: block;
  margin-top: $space-3;
  color: $color-muted;
  font-size: $font-size-badge;
}

.cost {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin: 0 $space-1 $space-3;
  color: $color-muted;
  font-size: $font-size-badge;
}

.actions {
  @include action-bar;
  text-align: center;
}

.actions button {
  /* uni-app button 默认带内边距且文本不居中，改为 flex 居中并清掉内边距 */
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: $tap-size;
  padding: 0;
  border: 0;
  border-radius: $radius-xl;
  background: $color-primary;
  color: #fff;
  font-size: $font-size-body;
  font-weight: $font-weight-bold;
}

.actions button:after {
  border: 0;
}

.actions button[disabled] {
  background: $color-line-strong;
  color: #f4f6f5;
}

.actions text {
  display: block;
  margin-top: $space-3;
  color: $color-muted;
  font-size: $font-size-badge;
}
</style>
