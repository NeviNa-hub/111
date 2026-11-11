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
    <generation-dialog
      v-if="isProgressVisible"
      type="optimization"
      :status="taskStatus"
      :progress="taskProgress"
      :progress-label="taskStageLabel"
      :note="taskNote"
      :result-url="taskResultUrl"
      @back="goWorkbench"
      @library="goLibrary"
    />
  </view>
</template>

<script setup>
import { computed, ref } from "vue";

// #ifdef H5
import { MagicStick, Plus, Upload, ZoomIn } from "@element-plus/icons-vue";
// #endif

import { TASK_STATUS } from "@/apis/constants";
import {
  createImageOptimization,
  getImageOptimizationTaskStatus,
} from "@/apis/image-optimization";
import AppImage from "@/components/AppImage/index.vue";
import AppPageHeader from "@/components/AppPageHeader/index.vue";
import GenerationDialog from "@/components/GenerationDialog/index.vue";
import useTaskPolling from "@/hooks/useTaskPolling";
import { chooseSingleImage } from "@/utils/image-picker";
import { getErrorMessage, isApiError } from "@/utils/request";

const cost = 3;
const promptLimit = 200;
const progressNote = "已投入云端淬炼池，离开页面不影响任务进度。";
const prompt = ref("");
const selectedImage = ref(null);
const isSubmitting = ref(false);
const isProgressVisible = ref(false);
const taskId = ref("");
const taskProgress = ref(0);
const taskStatus = ref(TASK_STATUS.PENDING);
const taskResultUrl = ref("");
const taskNote = ref(progressNote);

const costText = computed(() => cost);

const taskStageLabel = computed(() => {
  if (taskStatus.value === TASK_STATUS.COMPLETED) {
    return "生成完成";
  }

  if (taskStatus.value === TASK_STATUS.FAILED) {
    return "生成失败";
  }

  return "云端淬炼中";
});

const { start: startPolling } = useTaskPolling({
  fetchTask: () => getImageOptimizationTaskStatus({ taskId: taskId.value }),
  interval: 3000,
  maxAttempts: 60,
  isCompleted: (data) => data.status === TASK_STATUS.COMPLETED,
  isFailed: (data) => data.status === TASK_STATUS.FAILED,
  onProgress: (data) => {
    taskStatus.value = data.status || TASK_STATUS.PROCESSING;
    taskProgress.value = Number(data.progress) || 0;

    if (data.result_urls?.[0]) {
      taskResultUrl.value = data.result_urls[0];
    }
  },
  onCompleted: (data) => {
    taskStatus.value = TASK_STATUS.COMPLETED;
    taskProgress.value = 100;
    taskResultUrl.value = data.result_urls?.[0] || "";
    taskNote.value = "任务已完成，可前往作品库查看。";
  },
  onFailed: (error) => {
    const isRequestError = isApiError(error);

    taskStatus.value = TASK_STATUS.FAILED;
    taskNote.value = isRequestError
      ? "任务状态查询失败，请稍后在作品库确认结果。"
      : getErrorMessage(error, "任务进度获取失败，请稍后重试");

    if (!isRequestError) {
      uni.showToast({ title: taskNote.value, icon: "none" });
    }
  },
});

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

    taskId.value = task.task_id;
    taskProgress.value = 0;
    taskStatus.value = TASK_STATUS.PROCESSING;
    taskResultUrl.value = "";
    taskNote.value = progressNote;
    isProgressVisible.value = true;
    startPolling();
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

// 返回创作台
const goWorkbench = () => {
  uni.reLaunch({ url: "/pages/workbench/index" });
};

// 前往作品库查看
const goLibrary = () => {
  uni.navigateTo({ url: "/pages/library/index" });
};
</script>

<style scoped lang="scss">
.page {
  height: 100vh;
  overflow: hidden;
  background: linear-gradient(180deg, #ffecd2 0%, #fff8ec 48%, #fffdfb 100%);
  color: $color-ink;
}

.content {
  height: calc(100vh - 220rpx - var(--status-bar-height, 0px));
  overflow-x: hidden;
  padding: 35rpx 32rpx 260rpx;
  box-sizing: border-box;
}

.content-state {
  margin-bottom: 24rpx;
}

/* 卡片与区块标题：与创作页统一样式 */
.config-card {
  margin-top: 28rpx;
  padding: 28rpx;
  border-radius: 24rpx;
  background: $color-surface;
  box-shadow: 0 10rpx 30rpx rgba(95, 133, 117, 0.04);
}

.config-card:first-child {
  margin-top: 0;
}

.config-title {
  padding-bottom: 28rpx;
  color: #8a6840;
  font-size: 34rpx;
  font-weight: 700;
}

.config-title em {
  color: #d9be9b;
}

/* 导入区 */
.file {
  display: flex;
  align-items: center;
  gap: 16rpx;
  min-width: 0;
  color: $color-ink;
  font-size: 26rpx;
  font-weight: 700;
}

.file text {
  flex: 1;
  min-width: 0;
  @include text-ellipsis;
}

.file button {
  @include tap-area(64rpx);
  flex-shrink: 0;
  gap: 8rpx;
  margin: 0;
  padding: 0 20rpx;
  border: 0;
  border-radius: 999rpx;
  background: #f7edde;
  color: $color-primary;
  font-size: 24rpx;
  line-height: 1;
}

.file button:after {
  border: 0;
}

.file-icon {
  font-size: 26rpx;
}

.preview {
  position: relative;
  height: 320rpx;
  margin-top: 20rpx;
  overflow: hidden;
  border-radius: 20rpx;
  background: #f8faf7;
}

.preview-media {
  width: 100%;
  height: 100%;
}

.preview.empty {
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2rpx dashed #d2ddd6;
}

.empty-tip {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12rpx;
  color: $color-muted;
  font-size: 24rpx;
}

.empty-icon {
  color: #a3b1ab;
  font-size: 44rpx;
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
  padding: 8rpx 16rpx;
  border-radius: 999rpx;
  font-size: 24rpx;
}

.cover {
  top: 16rpx;
  left: 16rpx;
}

.ready {
  bottom: 16rpx;
  left: 16rpx;
  max-width: calc(100% - 110rpx);
  @include text-ellipsis;
}

.zoom {
  @include tap-area(56rpx);
  right: 16rpx;
  bottom: 16rpx;
  width: 56rpx;
  height: 56rpx;
  border-radius: 50%;
  font-size: 28rpx;
  line-height: 1;
}

.hint {
  display: block;
  margin-top: 16rpx;
  color: $color-muted;
  font-size: 22rpx;
  text-align: center;
}

/* 提示词区 */
.prompt-head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 16rpx;
}

.prompt-head text {
  color: $color-muted;
  font-size: 24rpx;
  font-weight: 400;
}

.prompt-input {
  width: 100%;
  height: 200rpx;
  color: $color-ink;
  font-size: 26rpx;
  line-height: 1.6;
  box-sizing: border-box;
}

.fixed-tip {
  display: block;
  margin-top: 16rpx;
  color: $color-muted;
  font-size: 22rpx;
}

/* 底部操作 */
.cost {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin: 0 8rpx 16rpx;
  color: $color-muted;
  font-size: 22rpx;
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
  gap: 12rpx;
  width: 100%;
  height: $tap-size;
  padding: 0;
  border: 0;
  border-radius: 24rpx;
  background: linear-gradient(135deg, #8a6840 0%, #9c6e38 100%);
  color: #fff;
  font-size: 28rpx;
  font-weight: 700;
}

.actions button:after {
  border: 0;
}

.actions button[disabled] {
  background: #d2ddd6;
  color: #f4f6f5;
}

.action-icon {
  font-size: 26rpx;
}

.actions > text {
  display: block;
  margin-top: 16rpx;
  color: $color-muted;
  font-size: 22rpx;
}
</style>
