<template>
  <view class="page">
    <app-page-header title="图片优化" />
    <scroll-view scroll-y :show-scrollbar="false" class="content">
      <view class="file">
        <text v-if="selectedImage"> {{ selectedImage.name }}</text>
        <text v-else>请先导入需要优化的图片</text>
        <button :disabled="isUploading" @click="chooseImage">
          {{
            isUploading ? "导入中…" : selectedImage ? "更换图片" : "导入图片"
          }}
        </button>
      </view>
      <view
        class="preview"
        :class="{ empty: !selectedImage }"
        @click="chooseImage"
      >
        <app-image
          v-if="selectedImage"
          class="preview-media"
          :src="selectedImage.url || selectedImage.path"
          mode="aspectFit"
        />
        <text v-else class="empty-tip">
          ＋<small>从相册选择或拍摄图片</small>
        </text>
        <text v-if="selectedImage" class="cover"> 已选封面</text>
        <text v-if="selectedImage" class="ready">
          原图解析就绪 · 4K重绘待命</text
        >
        <text v-if="selectedImage" class="zoom">⌕</text>
      </view>
      <view class="hint" @click="chooseImage"
        >　点击重新从系统相册导入或拍摄</view
      >
      <view class="heading"> 优化方向 <small>单选</small> </view>
      <view class="directions">
        <view
          v-for="item in directions"
          :key="item.directionId"
          class="direction"
          :class="{ selected: direction === item.title }"
          @click="direction = item.title"
        >
          <app-icon :name="item.iconName" />
          <strong>{{ item.title }}</strong>
          <small>{{ item.description }}</small>
        </view>
      </view>
      <view class="heading">
        重绘强度 <small class="accent">均衡重构（推荐）</small>
      </view>
      <view class="intensity">
        <text
          v-for="item in intensities"
          :key="item"
          :class="{ selected: intensity === item }"
          @click="intensity = item"
        >
          {{ item }}
        </text>
      </view>
      <view class="switch-row">
        <view>
          <strong>◉　保留原画面部细节</strong>
          <small>避免AI拟合过度导致的五官微变</small>
        </view>
        <switch
          :checked="keepDetail"
          color="#05604c"
          @change="keepDetail = $event.detail.value"
        />
      </view>
    </scroll-view>
    <view class="actions">
      <view class="cost">
        <text>预计消耗 {{ costText }} 灵感点</text>
        <text>账户结余以实际扣减为准</text>
      </view>
      <button
        :disabled="!selectedImage || isSubmitting || isUploading"
        @click="startOptimization"
      >
        {{
          isSubmitting ? "正在提交，请稍候…" : `开始淬炼重绘（耗${costText}点）`
        }}
      </button>
      <text>云端蒸馏级处理 · 支持高清直存至作品库</text>
    </view>
  </view>
</template>

<script setup>
import { computed, ref } from "vue";

import { createImageOptimization } from "@/apis/image-optimization";
import { uploadImage } from "@/apis/upload";
import AppIcon from "@/components/AppIcon/index.vue";
import AppImage from "@/components/AppImage/index.vue";
import AppPageHeader from "@/components/AppPageHeader/index.vue";
import { chooseSingleImage } from "@/utils/image-picker";
import { getErrorMessage } from "@/utils/request";

const directions = [
  {
    directionId: 1,
    iconName: "grid",
    title: "无损超清",
    description: "4K超分重塑",
  },
  {
    directionId: 2,
    iconName: "spark",
    title: "旧画去噪",
    description: "质感抚平",
  },
  {
    directionId: 3,
    iconName: "spark",
    title: "意境重绘",
    description: "笔触唤醒",
  },
];
const intensities = ["微调修润", "均衡重构", "深度淬炼"];
const direction = ref("无损超清");
const intensity = ref("均衡重构");
const keepDetail = ref(true);
const selectedImage = ref(null);
const cost = 3;
const isSubmitting = ref(false);
const isUploading = ref(false);

const costText = computed(() => cost);

// 从系统相册或相机选择图片并上传，失败时保留已有图片
const chooseImage = async () => {
  if (isUploading.value) {
    return;
  }

  try {
    const image = await chooseSingleImage();

    isUploading.value = true;

    selectedImage.value = { ...image, url: image.path };
  } catch (error) {
    if (!String(error?.errMsg || "").includes("cancel")) {
      uni.showToast({
        title: getErrorMessage(error, "选择图片失败"),
        icon: "none",
      });
    }
  } finally {
    isUploading.value = false;
  }
};

// 校验图片后开始优化任务
const startOptimization = async () => {
  if (isSubmitting.value || isUploading.value) {
    return;
  }

  if (!selectedImage.value) {
    uni.showToast({ title: "请先导入需要优化的图片", icon: "none" });
    return;
  }

  isSubmitting.value = true;

  try {
    const task = await createImageOptimization({
      image_path: selectedImage.value.url || selectedImage.value.path,
      direction: direction.value,
      intensity: intensity.value,
      keep_detail: keepDetail.value,
    });

    uni.navigateTo({
      url: `/pages/image-generation/index?mode=optimization&taskId=${encodeURIComponent(
        task.task_id,
      )}`,
    });
  } catch (error) {
    uni.showToast({
      title: getErrorMessage(error, "创建任务失败，请稍后重试"),
      icon: "none",
    });
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

.heading .accent {
  color: $color-primary;
}

.directions {
  display: flex;
  gap: $space-3;
  margin-top: $space-3;
}

.direction {
  flex: 1;
  min-width: 0;
  padding: $space-4 $space-1;
  border: 1rpx solid $color-line;
  border-radius: $radius-md;
  background: $color-surface;
  text-align: center;
}

.direction.selected {
  border-color: $color-primary;
  background: $color-primary;
  color: #fff;
}

.direction text,
.direction strong,
.direction small {
  display: block;
}

.direction strong {
  margin-top: $space-2;
  font-size: $font-size-caption;
}

.direction small {
  margin-top: $space-1;
  color: $color-muted;
  font-size: $font-size-badge;
  line-height: $line-height-tight;
}

.direction.selected small {
  color: rgba(255, 255, 255, 0.82);
}

.intensity {
  display: flex;
  margin-top: $space-3;
  padding: $space-1;
  border-radius: $radius-sm;
  background: $color-primary-light;
}

.intensity text {
  @include tap-area(64rpx);
  flex: 1;
  padding: $space-2 0;
  color: $color-ink-soft;
  text-align: center;
  font-size: $font-size-caption;
}

.intensity .selected {
  border-radius: $radius-xs;
  background: $color-surface;
  color: $color-primary;
  font-weight: $font-weight-bold;
}

.switch-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: $space-4;
  margin-top: $space-5;
  padding: $space-5;
  border: 1rpx solid $color-line;
  border-radius: $radius-md;
  background: $color-surface;
}

.switch-row strong,
.switch-row small {
  display: block;
}

.switch-row strong {
  font-size: $font-size-aux;
}

.switch-row small {
  margin-top: $space-1;
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
  width: 100%;
  height: $tap-size;
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
