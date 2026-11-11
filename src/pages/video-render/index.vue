<template>
  <!-- #ifdef H5 -->
  <view class="video-render-page">
    <app-page-header title="视频创作" />
    <view class="step-bar">
      <view class="step done" @click="goPreviousStep">
        <i>1</i><text>规制与意境</text>
      </view>
      <view class="step-connector"></view>
      <view class="step active"><i>2</i><text>画质与渲染</text></view>
    </view>
    <scroll-view scroll-y :show-scrollbar="false" class="content">
      <el-form
        ref="formRef"
        :model="formData"
        :rules="formRules"
        label-position="top"
        class="render-form"
      >
        <view class="config-card">
          <view class="config-title"><em>壹 ·</em> 动卷预览</view>
          <view class="preview-body">
            <view class="preview-thumb">
              <app-image class="preview-image" :src="previewSource" mode="aspectFill" />
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
        </view>

        <view class="config-card">
          <view class="config-title"><em>贰 ·</em> 帧率与渲染画质</view>
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
        </view>

        <view class="config-card">
          <view class="config-title resource-title">
            <view><em>叁 ·</em> 渲染资源结算</view>
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
        </view>
      </el-form>
    </scroll-view>

    <view class="bottom-bar">
      <el-button class="previous-button" :disabled="isSubmitting" @click="goPreviousStep">
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
        挥毫渲染动卷
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
    <app-page-header title="视频创作" />
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
  VideoPlay,
} from "@element-plus/icons-vue";
// #endif

import { TASK_STATUS } from "@/apis/constants";
import { createVideoGeneration, getVideoTaskStatus } from "@/apis/video-creation";
import previewFallback from "@/assets/theme/theme-videos-1.jpg";
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
  {
    fpsId: 1,
    value: 30,
    name: "30 FPS · 典雅",
    tag: "节律省电",
    description: "传统水墨电影韵味，起承转合自然含蓄",
  },
  {
    fpsId: 2,
    value: 60,
    name: "60 FPS · 丝滑 4K 超清",
    tag: "首推",
    description: "雪浪微澜，丝缕毕现，水汽流动如真如幻",
  },
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

const taskStage = computed(() => taskStatusData.value?.stageLabel || "云端逐帧重绘");

const taskNote = computed(
  () =>
    taskStatusData.value?.note ||
    "动卷已进入云端渲染池，退出或锁屏均不影响进度，完成后自动归档至作品库。"
);

const { start: startPolling } = useTaskPolling({
  fetchTask: () => getVideoTaskStatus({ taskId: taskId.value }),
  interval: 3000,
  maxAttempts: 60,
  isCompleted: (data) => data.status === TASK_STATUS.COMPLETED,
  onProgress: (data) => {
    taskProgress.value = data.progress;
    taskStatusData.value = {
      stageLabel: "云端逐帧渲染中",
      note: "已进入云端渲染，离开页面不影响任务进度。",
    };
  },
  onCompleted: (data) => {
    taskProgress.value = data.progress;
    taskStatusData.value = {
      stageLabel: "动卷已完成",
      note: "任务已完成并归档，可前往作品库查看。",
    };
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
  background: linear-gradient(180deg, #ffecd2 0%, #fff8ec 48%, #fffdfb 100%);
  color: $color-ink;

  --el-color-primary: #{$color-primary};
  --el-color-primary-light-3: #c89a63;
  --el-color-primary-light-5: #d6b689;
  --el-color-primary-light-7: #e4d0ad;
  --el-color-primary-light-9: #f7edde;
  --el-border-radius-base: #{12rpx};
  --el-font-family: #{$font-family-base};
  --el-font-size-base: #{28rpx};
}

.content {
  height: calc(100vh - 350rpx - var(--status-bar-height, 0px));
  overflow-x: hidden;
  padding: 35rpx 32rpx 48rpx;
  box-sizing: border-box;
}

.render-state {
  margin: 16rpx 0;
}

.render-form {
  width: 100%;
}

/* 步骤条：与文字生图页统一样式 */
.step-bar {
  height: 82rpx;
  margin: 16rpx 32rpx 0;
  padding: 8rpx;
  display: flex;
  align-items: center;
  border: 1rpx solid rgba(63, 102, 86, 0.12);
  border-radius: 28rpx;
  background: rgba(255, 255, 255, 0.86);
  box-shadow: 0 8rpx 22rpx rgba(19, 76, 68, 0.06);
}

.step {
  flex: 1;
  padding: 12rpx 0;
  border-radius: 16rpx;
  color: $color-muted;
  text-align: center;
  font-size: 24rpx;
  white-space: nowrap;
}

.step i {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 40rpx;
  height: 40rpx;
  margin-right: 8rpx;
  border-radius: 50%;
  background: #dfdfd5;
  color: $color-muted;
  font-style: normal;
  font-size: 22rpx;
}

.step-connector {
  flex: 1;
  height: 2rpx;
  margin: 0 16rpx;
  background: linear-gradient(90deg, #8a6840, #dfdfd5);
}

.step.done {
  color: #8a6840;

  i {
    background: #f7edde;
    color: $color-primary;
  }
}

.step.active {
  background: $color-primary;
  color: #fff;
  font-weight: 700;

  i {
    /* 徽章底色与步骤底色一致时改为半透明白底，避免圆形徽章融进背景 */
    background: rgba(255, 255, 255, 0.24);
    color: #fff;
  }
}

/* 卡片与区块标题：与文字生图页统一样式 */
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

/* 动卷预览 */
.preview-body {
  display: flex;
  gap: 20rpx;
}

.preview-thumb {
  position: relative;
  flex-shrink: 0;
  width: 180rpx;
  height: 140rpx;
  overflow: hidden;
  border-radius: 12rpx;
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
  padding: 4rpx 8rpx;
  border-radius: 6rpx;
  background: rgba(20, 45, 38, 0.72);
  color: #fff;
  font-size: 22rpx;
}

.preview-info {
  flex: 1;
  min-width: 0;
}

.preview-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12rpx;
}

.preview-title {
  flex: 1;
  min-width: 0;
  color: $color-ink;
  font-size: 26rpx;
  font-weight: 700;
  line-height: 1.3;
  @include line-clamp(2);
}

.preview-state {
  flex-shrink: 0;
  color: #8a6840;
  font-size: 22rpx;
}

.preview-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8rpx;
  margin-top: 12rpx;
}

.preview-tag {
  padding: 4rpx 12rpx;
  border-radius: 12rpx;
  background: #f8faf7;
  color: #4e665e;
  font-size: 22rpx;

  &.is-accent {
    background: #f3e4cd;
    color: $color-primary;
  }
}

.preview-desc {
  margin-top: 12rpx;
  color: $color-muted;
  font-size: 22rpx;
  line-height: 1.6;
  @include line-clamp(2);
}

/* 帧率画质 */
.fps-form-item {
  margin-bottom: 0;

  :deep(.el-form-item__content) {
    display: block;
  }

  :deep(.el-form-item__error) {
    position: static;
    padding-top: 12rpx;
  }
}

.fps-list {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
  width: 100%;
}

.fps-card {
  position: relative;
  width: 100%;
  height: auto;
  min-height: 100rpx;
  margin: 0;
  padding: 20rpx 76rpx 20rpx 24rpx;
  border: 2rpx solid $color-line;
  border-radius: 24rpx;
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
  gap: 8rpx;
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
  color: #4e665e;
  font-size: 26rpx;
  font-weight: 700;
}

.fps-card.is-selected .fps-name {
  color: $color-primary;
}

.fps-tag {
  padding: 4rpx 12rpx;
  border-radius: 8rpx;
  background: #f8faf7;
  color: $color-muted;
  font-size: 22rpx;
  font-weight: 400;
}

.fps-card.is-selected .fps-tag {
  background: #f3e4cd;
  color: $color-primary;
}

.fps-desc {
  display: block;
  margin-top: 8rpx;
  color: $color-muted;
  font-size: 22rpx;
  line-height: 1.6;
}

.fps-radio {
  position: absolute;
  top: 50%;
  right: 24rpx;
  width: 32rpx;
  height: 32rpx;
  margin-top: -16rpx;
  border: 2rpx solid #cde0d8;
  border-radius: 50%;
}

.fps-check {
  position: absolute;
  top: 50%;
  right: 24rpx;
  width: 36rpx;
  height: 36rpx;
  margin-top: -18rpx;
  border-radius: 50%;
  background: $color-primary;
  color: #fff;
  font-size: 22rpx;
}

/* 资源结算 */
.resource-title {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16rpx;
}

.boost-button {
  @include tap-area(64rpx);
  flex-shrink: 0;
  height: 64rpx;
  margin: 0;
  padding: 0 16rpx;
  border: 1rpx solid #bfe0d1;
  border-radius: 12rpx;
  background: $color-surface;
  color: #8a6840;
  font-size: 22rpx;

  &:hover {
    border-color: $color-primary;
    background: #f7edde;
    color: $color-primary;
  }

  :deep(.el-icon) {
    margin-right: 6rpx;
    font-size: 22rpx;
  }
}

.resource-grid {
  display: flex;
  margin-top: 20rpx;
  padding: 20rpx 12rpx;
  border-radius: 16rpx;
  background: #f8faf7;
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
  font-size: 22rpx;
}

.resource-value {
  margin-top: 12rpx;
  color: #8a6840;
  font-size: 28rpx;
  font-weight: 700;
  @include numeric;
}

.resource-unit {
  margin-left: 4rpx;
  color: #4e665e;
  font-size: 22rpx;
  font-weight: 400;
}

.resource-tip {
  display: flex;
  gap: 12rpx;
  margin-top: 16rpx;
  color: $color-muted;
  font-size: 22rpx;
  line-height: 1.6;
}

.tip-icon {
  flex-shrink: 0;
  color: #8a6840;
  font-size: 22rpx;
}

/* 底部操作 */
.bottom-bar {
  @include action-bar;
  display: flex;
  gap: 16rpx;
}

.previous-button {
  width: 150rpx;
  flex-shrink: 0;
  height: $tap-size;
  margin: 0;
  border: 1rpx solid $color-line;
  border-radius: 16rpx;
  background: $color-surface;
  color: #4e665e;
  font-size: 28rpx;

  &:hover {
    border-color: #bfd8ce;
    background: #f8faf7;
    color: $color-primary;
  }

  :deep(.el-icon) {
    margin-right: 4rpx;
    font-size: 22rpx;
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
  padding: 0 16rpx;
  border: 0;
  border-radius: 24rpx;
  background: $color-primary;
  color: #fff;
  font-size: 24rpx;
  font-weight: 700;

  &:hover {
    background: #9c6e38;
    color: #fff;
  }

  :deep(.el-icon) {
    margin-right: 6rpx;
    font-size: 22rpx;
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
  background: linear-gradient(180deg, #ffecd2 0%, #fff8ec 48%, #fffdfb 100%);
}

.platform-tip {
  display: block;
  padding: 80rpx 48rpx;
  color: #4e665e;
  font-size: 28rpx;
  line-height: 1.8;
  text-align: center;
}
</style>
