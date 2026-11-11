<template>
  <view class="page">
    <app-page-header title="图片优化" />
    <scroll-view scroll-y :show-scrollbar="false" class="content">
      <view class="config-card">
        <view class="config-title"><em>壹 ·</em> 导入原图</view>
        <view class="file">
          <text v-if="selectedImage">{{ selectedImage.name }}</text>
          <text v-else>请先导入需要优化的图片</text>
          <button @click="chooseImage">
            <!-- #ifdef H5 -->
            <el-icon class="file-icon"><Upload /></el-icon>
            <!-- #endif -->
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
          <view v-else class="empty-tip">
            <!-- #ifdef H5 -->
            <el-icon class="empty-icon"><Plus /></el-icon>
            <!-- #endif -->
            <text>从相册选择或拍摄图片</text>
          </view>
          <text v-if="selectedImage" class="cover">已选封面</text>
          <view v-if="selectedImage" class="zoom">
            <!-- #ifdef H5 -->
            <el-icon><ZoomIn /></el-icon>
            <!-- #endif -->
          </view>
        </view>
        <text class="hint">点击预览可从系统相册重新导入或拍摄</text>
      </view>

      <view class="config-card">
        <view class="config-title prompt-head">
          <view><em>贰 ·</em> 优化提示词</view>
          <text>{{ prompt.length }} / {{ promptLimit }} 字</text>
        </view>
        <textarea
          v-model="prompt"
          :maxlength="promptLimit"
          class="prompt-input"
          placeholder="描述希望优化的效果，例如：提升清晰度，修复噪点，保留原有构图"
        />
        <text class="fixed-tip">重绘强度与面部细节保留由系统统一设定</text>
      </view>
    </scroll-view>
    <view class="actions">
      <button :disabled="!selectedImage || isSubmitting" @click="startOptimization">
        <!-- #ifdef H5 -->
        <el-icon class="action-icon"><MagicStick /></el-icon>
        <!-- #endif -->
        {{ isSubmitting ? "正在提交，请稍候…" : `开始淬炼重绘（耗${costText}点）` }}
      </button>
    </view>
  </view>
</template>

<script setup>
import { computed, ref } from "vue";

// #ifdef H5
import { MagicStick, Plus, Upload, ZoomIn } from "@element-plus/icons-vue";
// #endif

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
  padding: 35rpx $space-7 260rpx;
  box-sizing: border-box;
}

.content-state {
  margin-bottom: $space-5;
}

/* 卡片与区块标题：与创作页统一样式 */
.config-card {
  margin-top: $space-6;
  padding: $space-6;
  border-radius: $radius-xl;
  background: $color-surface;
  box-shadow: 0 10rpx 30rpx rgba(95, 133, 117, 0.04);
}

.config-card:first-child {
  margin-top: 0;
}

.config-title {
  padding-bottom: $space-6;
  color: $color-primary-soft;
  font-size: $font-size-title;
  font-weight: $font-weight-bold;
}

.config-title em {
  color: $color-accent-clay;
}

/* 导入区 */
.file {
  display: flex;
  align-items: center;
  gap: $space-3;
  min-width: 0;
  color: $color-ink;
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
  gap: $space-1;
  margin: 0;
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

.file-icon {
  font-size: $font-size-aux;
}

.preview {
  position: relative;
  height: 320rpx;
  margin-top: $space-4;
  overflow: hidden;
  border-radius: $radius-lg;
  background: $color-surface-muted;
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
}

.empty-tip {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: $space-2;
  color: $color-muted;
  font-size: $font-size-caption;
}

.empty-icon {
  color: $color-faint;
  font-size: $font-size-display-sm;
}

.cover,
.ready,
.zoom {
  position: absolute;
  background: rgba(22, 53, 47, 0.82);
  color: #fff;
}

.cover,
.ready {
  padding: $space-1 $space-3;
  border-radius: $radius-pill;
  font-size: $font-size-caption;
}

.cover {
  top: $space-3;
  left: $space-3;
}

.ready {
  bottom: $space-3;
  left: $space-3;
  max-width: calc(100% - 110rpx);
  @include text-ellipsis;
}

.zoom {
  @include tap-area(56rpx);
  right: $space-3;
  bottom: $space-3;
  width: 56rpx;
  height: 56rpx;
  border-radius: 50%;
  font-size: $font-size-body;
  line-height: 1;
}

.hint {
  display: block;
  margin-top: $space-3;
  color: $color-muted;
  font-size: $font-size-badge;
  text-align: center;
}

/* 提示词区 */
.prompt-head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: $space-3;
}

.prompt-head text {
  color: $color-muted;
  font-size: $font-size-caption;
  font-weight: $font-weight-regular;
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

/* 底部操作 */
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
  gap: $space-2;
  width: 100%;
  height: $tap-size;
  padding: 0;
  border: 0;
  border-radius: $radius-xl;
  background: linear-gradient(135deg, $color-primary-soft 0%, $color-primary-dark 100%);
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

.action-icon {
  font-size: $font-size-aux;
}

.actions > text {
  display: block;
  margin-top: $space-3;
  color: $color-muted;
  font-size: $font-size-badge;
}
</style>
