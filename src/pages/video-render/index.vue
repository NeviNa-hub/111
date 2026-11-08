<template>
  <!-- #ifdef H5 -->
  <view class="video-render-page">
    <app-page-header title="画质与渲染" />
    <scroll-view scroll-y :show-scrollbar="false" class="content">
      <el-form
        ref="formRef"
        :model="formData"
        :rules="formRules"
        label-position="top"
        class="render-form"
      >
        <view class="compact-steps">
          <view class="compact-step is-done" @click="goPreviousStep">
            <view class="step-check">
              <el-icon><Check /></el-icon>
            </view>
            <text>01 规制与意境</text>
          </view>
          <view class="step-link"></view>
          <view class="compact-step is-active">
            <text class="step-number">02</text>
            <text>画质与渲染</text>
          </view>
          <view class="power-pill">
            <el-icon class="power-icon"><StarFilled /></el-icon>
            <text class="power-value">{{ renderConfig.power }}</text>
            <text>算力</text>
          </view>
        </view>

        <view class="preview-card">
          <view class="preview-thumb">
            <app-image
              class="preview-image"
              :src="previewSource"
              mode="aspectFill"
            />
            <text class="preview-badge">影片</text>
          </view>
          <view class="preview-info">
            <view class="preview-head">
              <text class="preview-title">{{ renderConfig.previewTitle }}</text>
              <text class="preview-state">已立意</text>
            </view>
            <view class="preview-tags">
              <text class="preview-tag">{{ draft.ratioName }}</text>
              <text class="preview-tag is-accent">
                {{ renderConfig.cameraMove }}
              </text>
            </view>
            <text class="preview-desc">“{{ promptText }}”</text>
          </view>
        </view>

        <view class="section-head">
          <view class="section-title">
            <view class="section-bar"></view>
            <text>帧率与渲染画质</text>
          </view>
          <text class="section-hint">逐帧重绘水墨湍流</text>
        </view>
        <el-form-item prop="fps" class="fps-form-item">
          <el-radio-group v-model="formData.fps" class="fps-list">
            <el-radio
              v-for="option in fpsOptions"
              :key="option.fpsId"
              :value="option.value"
              class="fps-card"
              :class="{ 'is-selected': formData.fps === option.value }"
            >
              <view class="fps-content">
                <view class="fps-head">
                  <view
                    class="fps-dot"
                    :class="{ 'is-active': formData.fps === option.value }"
                  ></view>
                  <text class="fps-name">{{ option.name }}</text>
                  <text class="fps-tag">{{ option.tag }}</text>
                </view>
                <text class="fps-desc">{{ option.description }}</text>
              </view>
              <el-icon v-if="formData.fps === option.value" class="fps-check">
                <Check />
              </el-icon>
              <view v-else class="fps-radio"></view>
            </el-radio>
          </el-radio-group>
        </el-form-item>

        <view class="resource-card">
          <view class="resource-head">
            <text class="resource-title">渲染资源结算</text>
            <el-button class="boost-button" @click="showBoostTip">
              <el-icon><Lightning /></el-icon>
              尊享加速通道
            </el-button>
          </view>
          <view class="resource-grid">
            <view class="resource-item">
              <text class="resource-label">本次消耗</text>
              <view class="resource-value">
                {{ renderConfig.cost }}
                <text class="resource-unit">灵感点</text>
              </view>
            </view>
            <view class="resource-item">
              <text class="resource-label">当前可用</text>
              <view class="resource-value">
                {{ renderConfig.power }}
                <text class="resource-unit">点</text>
              </view>
            </view>
            <view class="resource-item">
              <text class="resource-label">渲染预估</text>
              <view class="resource-value">
                {{ renderConfig.estimatedTime }}
              </view>
            </view>
          </view>
          <view class="resource-tip">
            <el-icon class="tip-icon"><InfoFilled /></el-icon>
            <text>
              支持后台云端独立渲染，退出或锁屏均不影响进度，完成后自动归档至作品库。
            </text>
          </view>
        </view>
      </el-form>
    </scroll-view>

    <view class="bottom-bar">
      <el-button
        class="previous-button"
        :disabled="isSubmitting"
        @click="goPreviousStep"
      >
        <el-icon><ArrowLeft /></el-icon>
        上一步
      </el-button>
      <el-button
        class="render-button"
        :loading="isSubmitting"
        :disabled="isSubmitting"
        @click="handleRender"
      >
        <el-icon v-if="!isSubmitting"><VideoPlay /></el-icon>
        挥毫渲染动卷（耗 {{ renderConfig.cost }} 点）
        <el-icon v-if="!isSubmitting" class="render-arrow">
          <ArrowRight />
        </el-icon>
      </el-button>
    </view>

    <confirm-generation-dialog
      v-if="confirmVisible"
      title="确认挥毫渲染动卷"
      :cost="renderConfig.cost"
      :estimated-time="renderConfig.estimatedTime"
      note="确认后将扣除本次灵感点，并把动卷送入云端逐帧渲染，期间可随时离开页面。"
      confirm-text="确认开始渲染"
      @cancel="confirmVisible = false"
      @confirm="confirmRender"
    />
    <generation-dialog
      v-if="progressVisible"
      title="动卷渲染中"
      :progress="taskProgress"
      :progress-label="taskStage"
      :note="taskNote"
      @back="goWorkbench"
      @library="goLibrary"
    />
  </view>
  <!-- #endif -->

  <!-- #ifndef H5 -->
  <view class="platform-unavailable">
    <app-page-header title="画质与渲染" />
    <text class="platform-tip">
      视频创作依赖 Element Plus，请使用 H5 端体验完整交互。
    </text>
  </view>
  <!-- #endif -->
</template>

<script setup>
import { computed, reactive, ref } from "vue";
import { onShow } from "@dcloudio/uni-app";

// #ifdef H5
import {
  ArrowLeft,
  ArrowRight,
  Check,
  InfoFilled,
  Lightning,
  StarFilled,
  VideoPlay,
} from "@element-plus/icons-vue";
// #endif

import { TASK_STATUS } from "@/apis/constants";
import {
  createVideoGeneration,
  getVideoTaskStatus,
} from "@/apis/video-creation";
import previewFallback from "@/assets/theme/theme-videos-1.png";
import AppImage from "@/components/AppImage/index.vue";
import AppPageHeader from "@/components/AppPageHeader/index.vue";
import AppStateHint from "@/components/AppStateHint/index.vue";
import ConfirmGenerationDialog from "@/components/ConfirmGenerationDialog/index.vue";
import GenerationDialog from "@/components/GenerationDialog/index.vue";
import useTaskPolling from "@/hooks/useTaskPolling";
import { DRAFT_KEYS, readCreationDraft } from "@/utils/creation-draft";
import { getErrorMessage } from "@/utils/request";

const draft = ref({ ratioName: "", prompt: "", imagePath: "" });
const fpsOptions = [
  { fpsId: 1, value: 30, name: "30 FPS · 典雅", tag: "节律省电", description: "传统水墨电影韵味，起承转合自然含蓄" },
  { fpsId: 2, value: 60, name: "60 FPS · 丝滑 4K 超清", tag: "首推", description: "雪浪微澜，丝缕毕现，水汽流动如真如幻" },
];
const renderConfig = reactive({
  power: 800,
  cost: 8,
  estimatedTime: "约 18 秒",
  previewTitle: "《江雪孤舟 · 动态长卷》",
  cameraMove: "平缓推镜",
});
const confirmVisible = ref(false);
const progressVisible = ref(false);
const isSubmitting = ref(false);
const formRef = ref(null);
const formData = reactive({ fps: 60 });
const taskId = ref("");
const taskProgress = ref(0);
const taskStatusData = ref(null);

const previewSource = computed(() => draft.value.imagePath || previewFallback);

const taskStage = computed(
  () => taskStatusData.value?.stageLabel || "云端逐帧重绘",
);

const taskNote = computed(
  () =>
    taskStatusData.value?.note ||
    "动卷已进入云端渲染池，退出或锁屏均不影响进度，完成后自动归档至作品库。",
);

const { start: startPolling } = useTaskPolling({
  fetchTask: () => getVideoTaskStatus({ taskId: taskId.value }),
  interval: 3000,
  maxAttempts: 60,
  isCompleted: (data) => data.status === TASK_STATUS.COMPLETED,
  onProgress: (data) => {
    taskProgress.value = data.progress;
    taskStatusData.value = data;
  },
  onCompleted: (data) => {
    taskProgress.value = data.progress;
    taskStatusData.value = data;
  },
  onFailed: (error) => {
    uni.showToast({
      title: getErrorMessage(error, "任务状态查询失败，请稍后重试"),
      icon: "none",
    });
  },
});

const promptText = computed(() => {
  const text = draft.value.prompt;

  if (!text) {
    return "以所选图卷徐徐展开，气韵流动";
  }

  return text.length > 38 ? `${text.slice(0, 38)}…` : text;
});

/**
 * 校验是否选择了帧率画质。
 * @param {Object} rule 校验规则。
 * @param {number} value 当前帧率值。
 * @param {Function} callback 校验回调。
 * @returns {void}
 */
const validateFps = (rule, value, callback) => {
  if (!value) {
    callback(new Error("请先选择帧率画质"));
    return;
  }

  callback();
};

const formRules = {
  fps: [{ validator: validateFps, trigger: "change" }],
};

// 返回第一步，页面栈为空时重新进入规制页
const goPreviousStep = () => {
  if (getCurrentPages().length > 1) {
    uni.navigateBack();
    return;
  }

  uni.redirectTo({ url: "/pages/video-creation/index" });
};

// 提示加速通道尚未开放
const showBoostTip = () => {
  uni.showToast({ title: "尊享加速通道筹备中", icon: "none" });
};

// 校验帧率并打开渲染确认弹窗
const handleRender = async () => {
  if (isSubmitting.value) {
    return;
  }

  try {
    await formRef.value.validate();
  } catch (error) {
    return;
  }

  confirmVisible.value = true;
};

// 确认后创建视频生成任务，并轮询真实任务进度
const confirmRender = async () => {
  if (isSubmitting.value) {
    return;
  }

  isSubmitting.value = true;

  try {
    const task = await createVideoGeneration({
      mode: draft.value.mode,
      ratio: draft.value.ratio,
      ratio_name: draft.value.ratioName,
      prompt: draft.value.prompt,
      image_path: draft.value.imagePath,
      fps: formData.fps,
    });

    confirmVisible.value = false;
    progressVisible.value = true;
    taskId.value = task.task_id;
    taskProgress.value = 0;
    taskStatusData.value = null;
    startPolling();
  } catch (error) {
    uni.showToast({
      title: getErrorMessage(error, "创建任务失败，请稍后重试"),
      icon: "none",
    });
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

onShow(() => {
  const stored = readCreationDraft(DRAFT_KEYS.video);

  if (!stored?.ratio) {
    uni.showToast({ title: "请先完成规制与意境", icon: "none" });
    uni.redirectTo({ url: "/pages/video-creation/index" });
    return;
  }

  draft.value = {
    ...stored,
    ratioName: stored.ratioName || stored.ratio,
    imagePath: stored.imagePath || "",
  };
});
</script>

<style scoped lang="scss">
.video-render-page {
  height: 100vh;
  overflow: hidden;
  background: $color-bg-page;
  color: $color-ink;

  --el-color-primary: #{$color-primary};
  --el-color-primary-light-3: #3b8873;
  --el-color-primary-light-5: #6fa99a;
  --el-color-primary-light-7: #a8c9bf;
  --el-color-primary-light-9: #e7f2ee;
  --el-border-radius-base: #{$radius-sm};
  --el-font-family: #{$font-family-base};
  --el-font-size-base: #{$font-size-body};
}

.content {
  height: calc(100vh - 240rpx - var(--status-bar-height, 0px));
  overflow-x: hidden;
  padding: $space-4 $space-7 $space-9;
  box-sizing: border-box;
}

.render-state {
  margin: $space-3 0;
}

.render-form {
  width: 100%;
}

/* 步骤条 */
.compact-steps {
  display: flex;
  align-items: center;
  gap: $space-2;
  padding: $space-2 $space-1 $space-5;
}

.compact-step {
  display: flex;
  flex-shrink: 0;
  align-items: center;
  gap: $space-1;
  color: $color-muted;
  font-size: $font-size-caption;
}

.compact-step.is-done {
  color: $color-primary-soft;
}

.step-check {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 34rpx;
  height: 34rpx;
  border-radius: 50%;
  background: $color-primary;
  color: #fff;
  font-size: $font-size-badge;
}

.step-link {
  flex: 1;
  height: 2rpx;
  background: #cfe3db;
}

.step-number {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 34rpx;
  height: 34rpx;
  border-radius: 50%;
  background: $color-primary;
  color: #fff;
  font-size: $font-size-badge;
  font-weight: $font-weight-bold;
  @include numeric;
}

.compact-step.is-active {
  color: $color-ink;
  font-weight: $font-weight-bold;
}

.power-pill {
  display: flex;
  flex-shrink: 0;
  align-items: center;
  gap: 6rpx;
  margin-left: auto;
  padding: $space-1 $space-3;
  border-radius: $radius-md;
  background: $color-primary-light;
  color: $color-ink-soft;
  font-size: $font-size-caption;
}

.power-icon {
  color: $color-primary;
  font-size: $font-size-badge;
}

.power-value {
  color: $color-primary;
  font-weight: $font-weight-bold;
  @include numeric;
}

/* 动卷预览 */
.preview-card {
  display: flex;
  gap: $space-4;
  padding: $space-5;
  border-radius: $radius-xl;
  background: $color-surface;
  box-shadow: $shadow-card;
}

.preview-thumb {
  position: relative;
  flex-shrink: 0;
  width: 180rpx;
  height: 140rpx;
  overflow: hidden;
  border-radius: $radius-sm;
  background: #eef2ef;
}

.preview-image {
  width: 100%;
  height: 100%;
}

.preview-badge {
  position: absolute;
  bottom: 8rpx;
  left: 8rpx;
  padding: 4rpx $space-1;
  border-radius: 6rpx;
  background: rgba(20, 45, 38, 0.72);
  color: #fff;
  font-size: $font-size-badge;
}

.preview-info {
  flex: 1;
  min-width: 0;
}

.preview-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: $space-2;
}

.preview-title {
  flex: 1;
  min-width: 0;
  color: $color-ink;
  font-size: $font-size-aux;
  font-weight: $font-weight-bold;
  line-height: $line-height-tight;
  @include line-clamp(2);
}

.preview-state {
  flex-shrink: 0;
  color: $color-primary-soft;
  font-size: $font-size-badge;
}

.preview-tags {
  display: flex;
  flex-wrap: wrap;
  gap: $space-1;
  margin-top: $space-2;
}

.preview-tag {
  padding: 4rpx $space-2;
  border-radius: $radius-sm;
  background: $color-surface-muted;
  color: $color-ink-soft;
  font-size: $font-size-badge;

  &.is-accent {
    background: #def0e7;
    color: $color-primary;
  }
}

.preview-desc {
  margin-top: $space-2;
  color: $color-muted;
  font-size: $font-size-badge;
  line-height: $line-height-normal;
  @include line-clamp(2);
}

/* 帧率画质 */
.section-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: $space-3;
  margin: $space-6 $space-1 $space-3;
}

.section-title {
  display: flex;
  align-items: center;
  color: $color-ink;
  font-size: $font-size-title;
  font-weight: $font-weight-bold;
}

.section-bar {
  width: 7rpx;
  height: 30rpx;
  margin-right: $space-2;
  border-radius: 6rpx;
  background: $color-primary;
}

.section-hint {
  flex-shrink: 0;
  color: $color-muted;
  font-size: $font-size-caption;
}

.fps-form-item {
  margin-bottom: 0;

  :deep(.el-form-item__content) {
    display: block;
  }

  :deep(.el-form-item__error) {
    position: static;
    padding-top: $space-2;
  }
}

.fps-list {
  display: flex;
  flex-direction: column;
  gap: $space-3;
  width: 100%;
}

.fps-card {
  position: relative;
  width: 100%;
  height: auto;
  min-height: 100rpx;
  margin: 0;
  padding: $space-4 76rpx $space-4 $space-5;
  border: 2rpx solid $color-line;
  border-radius: $radius-xl;
  background: $color-surface;
  box-sizing: border-box;

  :deep(.el-radio__input) {
    display: none;
  }

  :deep(.el-radio__label) {
    display: flex;
    flex: 1;
    align-items: center;
    width: 100%;
    padding: 0;
    color: inherit;
    font-size: inherit;
    white-space: normal;
  }

  &.is-selected {
    border-color: $color-primary;
    box-shadow: 0 8rpx 20rpx rgba(5, 96, 76, 0.08);
  }
}

.fps-content {
  flex: 1;
  min-width: 0;
}

.fps-head {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: $space-1;
}

.fps-dot {
  width: 12rpx;
  height: 12rpx;
  border-radius: 50%;
  background: #cbded7;

  &.is-active {
    background: $color-primary;
  }
}

.fps-name {
  color: $color-ink-soft;
  font-size: $font-size-aux;
  font-weight: $font-weight-bold;
}

.fps-card.is-selected .fps-name {
  color: $color-primary;
}

.fps-tag {
  padding: 4rpx $space-2;
  border-radius: $radius-xs;
  background: $color-surface-muted;
  color: $color-muted;
  font-size: $font-size-badge;
  font-weight: $font-weight-regular;
}

.fps-card.is-selected .fps-tag {
  background: #def0e7;
  color: $color-primary;
}

.fps-desc {
  display: block;
  margin-top: $space-1;
  color: $color-muted;
  font-size: $font-size-badge;
  line-height: $line-height-normal;
}

.fps-radio {
  position: absolute;
  top: 50%;
  right: $space-5;
  width: 32rpx;
  height: 32rpx;
  margin-top: -16rpx;
  border: 2rpx solid #cde0d8;
  border-radius: 50%;
}

.fps-check {
  position: absolute;
  top: 50%;
  right: $space-5;
  width: 36rpx;
  height: 36rpx;
  margin-top: -18rpx;
  border-radius: 50%;
  background: $color-primary;
  color: #fff;
  font-size: $font-size-badge;
}

/* 资源结算 */
.resource-card {
  margin-top: $space-6;
  padding: $space-5;
  border-radius: $radius-xl;
  background: linear-gradient(145deg, #eaf5f0, #f2f8f5);
}

.resource-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: $space-3;
}

.resource-title {
  color: $color-ink;
  font-size: $font-size-aux;
  font-weight: $font-weight-bold;
}

.boost-button {
  @include tap-area(64rpx);
  flex-shrink: 0;
  height: 64rpx;
  margin: 0;
  padding: 0 $space-3;
  border: 1rpx solid #bfe0d1;
  border-radius: $radius-sm;
  background: $color-surface;
  color: $color-primary-soft;
  font-size: $font-size-badge;

  &:hover {
    border-color: $color-primary;
    background: $color-primary-light;
    color: $color-primary;
  }

  :deep(.el-icon) {
    margin-right: 6rpx;
    font-size: $font-size-badge;
  }
}

.resource-grid {
  display: flex;
  margin-top: $space-4;
  padding: $space-4 $space-2;
  border-radius: $radius-md;
  background: $color-surface;
}

.resource-item {
  flex: 1;
  min-width: 0;
  text-align: center;

  & + & {
    border-left: 1rpx solid #edf2ef;
  }
}

.resource-label {
  display: block;
  color: $color-muted;
  font-size: $font-size-badge;
}

.resource-value {
  margin-top: $space-2;
  color: $color-primary-soft;
  font-size: $font-size-body;
  font-weight: $font-weight-bold;
  @include numeric;
}

.resource-unit {
  margin-left: 4rpx;
  color: $color-ink-soft;
  font-size: $font-size-badge;
  font-weight: $font-weight-regular;
}

.resource-tip {
  display: flex;
  gap: $space-2;
  margin-top: $space-3;
  color: $color-muted;
  font-size: $font-size-badge;
  line-height: $line-height-normal;
}

.tip-icon {
  flex-shrink: 0;
  color: $color-primary-soft;
  font-size: $font-size-badge;
}

/* 底部操作 */
.bottom-bar {
  @include action-bar;
  display: flex;
  gap: $space-3;
}

.previous-button {
  width: 180rpx;
  flex-shrink: 0;
  height: $tap-size;
  margin: 0;
  border: 1rpx solid $color-line;
  border-radius: $radius-xl;
  background: $color-surface;
  color: $color-ink-soft;
  font-size: $font-size-caption;

  &:hover {
    border-color: #bfd8ce;
    background: $color-surface-muted;
    color: $color-primary;
  }

  :deep(.el-icon) {
    margin-right: 4rpx;
    font-size: $font-size-badge;
  }

  &.is-disabled {
    opacity: 0.55;
  }
}

.render-button {
  flex: 1;
  min-width: 0;
  height: $tap-size;
  margin: 0;
  padding: 0 $space-3;
  border: 0;
  border-radius: $radius-xl;
  background: $color-primary;
  color: #fff;
  font-size: $font-size-caption;
  font-weight: $font-weight-bold;

  &:hover {
    background: $color-primary-dark;
    color: #fff;
  }

  :deep(.el-icon) {
    margin-right: 6rpx;
    font-size: $font-size-badge;
  }

  &.is-disabled {
    opacity: 0.55;
  }
}

.render-arrow {
  margin-right: 0;
  margin-left: 6rpx;
}

.platform-unavailable {
  min-height: 100vh;
  background: $color-bg-page;
}

.platform-tip {
  display: block;
  padding: 80rpx $space-9;
  color: $color-ink-soft;
  font-size: $font-size-body;
  line-height: $line-height-relaxed;
  text-align: center;
}
</style>
