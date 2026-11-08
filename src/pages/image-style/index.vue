<template>
  <view class="style-page">
    <app-page-header title="挑选画风" />
    <view class="step-bar">
      <view class="step done">一构思</view>
      <view class="step active">二甄选画风</view>
      <view class="step">三规划成画</view>
    </view>
    <scroll-view
      scroll-y
      :show-scrollbar="false"
      class="content"
      :style="contentKeyboardStyle"
    >
      <text class="step-count">步骤 2 / 3</text>
      <text class="page-title">第二步：甄选且现风格</text>
      <text class="page-desc">择取最合心意的笔触与气韵，使意境自然成章。</text>

      <view class="prompt-card">
        <view class="prompt-head">
          <text>画面主旨意象</text>
          <text>{{ prompt.length }} / {{ promptLimit }}字</text>
        </view>
        <textarea
          v-model="prompt"
          :maxlength="promptLimit"
          class="prompt-input"
          placeholder="写下你想描绘的意象"
        />
        <view class="prompt-tools"
          ><button @click="polishPrompt">✦ 灵感润色</button
          ><button @click="randomPrompt">⟳ 随机意象</button
          ><text @click="prompt = ''">清空</text></view
        >
      </view>
      <view class="suggestion-head">
        <text>灵感引线（轻触即添）</text><text>点击注入画面要素</text>
      </view>
      <view class="suggestions">
        <button
          v-for="item in suggestions"
          :key="item"
          @click="appendPrompt(item)"
        >
          ＋ {{ item }}
        </button>
      </view>
      <view class="tuning-card">
        <view>● 画境点睛 · 气韵微调</view>
        <text>意境基调　清润淡雅　墨韵沉静</text>
        <text>留白比例　迂阔（60%）　虚实均亭</text>
      </view>

      <view class="detail-card">
        <view class="detail-title">风格特征细调 <text>针对当前画风</text></view>
        <view class="select-row">
          <text>墨色浓淡</text>
          <text>选中</text>
        </view>
        <view class="select-row">
          <text>留白意趣</text>
          <text>三成留白</text>
        </view>
      </view>
    </scroll-view>
    <view class="bottom-actions" :style="barKeyboardStyle">
      <button class="previous" @click="goBack">上一步</button>
      <button class="next" :disabled="isSubmitting" @click="handleSubmit">
        开始研墨成画 →
      </button>
    </view>
    <confirm-generation-dialog
      v-if="confirmVisible"
      title="确认研墨成画"
      :cost="generationCost"
      :estimated-time="estimatedTime || '待定'"
      note="确认后将扣除本次灵感点，并把画卷送入云端研磨，期间离开或切换页面均不影响生成。"
      confirm-text="确认研墨成画"
      @cancel="confirmVisible = false"
      @confirm="confirmGenerate"
    />
    <generation-dialog
      v-if="progressVisible"
      title="研墨成画"
      type="creation"
      :progress="taskProgress"
      :progress-label="taskStage"
      :note="taskNote"
      @back="uni.redirectTo({ url: '/pages/workbench/index' })"
      @library="uni.navigateTo({ url: '/pages/library/index' })"
    />
  </view>
</template>

<script setup>
import { computed, ref } from "vue";
import { onShow } from "@dcloudio/uni-app";

import { TASK_STATUS } from "@/apis/constants";
import {
  createImageGeneration,
  getImageTaskStatus,
} from "@/apis/text-to-image";
import AppPageHeader from "@/components/AppPageHeader/index.vue";
import ConfirmGenerationDialog from "@/components/ConfirmGenerationDialog/index.vue";
import GenerationDialog from "@/components/GenerationDialog/index.vue";
import useKeyboardInset from "@/hooks/useKeyboardInset";
import useTaskPolling from "@/hooks/useTaskPolling";
import {
  DRAFT_KEYS,
  readCreationDraft,
  saveCreationDraft,
} from "@/utils/creation-draft";
import { appendPromptText, polishPromptText } from "@/utils/prompt";
import { getErrorMessage } from "@/utils/request";

const selectedStyle = ref("");
const prompt = ref("");
const promptLimit = 500;
const suggestions = [
  "江南烟雨",
  "宋代山水",
  "青绿设色",
  "晨曦微光",
  "枯墨留白",
];
const polishSuffix = "画面空灵雅致，留白自然，笔触细腻";
const randomPromptText =
  "薄雾晨光里的青绿山水，远处层峦叠嶂，近处一叶轻舟掠过溪面";
const canvasCounts = [
  { name: "单张", value: 1, cost: 2 },
  { name: "双张", value: 2, cost: 4 },
  { name: "四张", value: 4, cost: 8 },
];
const estimatedTime = "约 6~8 秒";
const draft = ref(readCreationDraft(DRAFT_KEYS.image) || {});
const confirmVisible = ref(false);
const progressVisible = ref(false);
const isSubmitting = ref(false);
const taskId = ref("");
const taskProgress = ref(0);
const taskStatusData = ref(null);
const { keyboardInset } = useKeyboardInset();

const contentKeyboardStyle = computed(() => ({
  paddingBottom:
    keyboardInset.value > 0
      ? `calc(var(--content-bottom-pad) + ${keyboardInset.value}px)`
      : undefined,
}));

const barKeyboardStyle = computed(() => ({
  bottom: keyboardInset.value > 0 ? `${keyboardInset.value}px` : undefined,
}));

const generationCost = computed(() => {
  const matched = canvasCounts.find((item) => item.name === draft.value.count);

  return matched ? matched.cost : "—";
});

const taskStage = computed(
  () => taskStatusData.value?.statusText || "气韵流转",
);

const taskNote = computed(
  () =>
    taskStatusData.value?.tip ||
    "已进入云端研磨，期间离开或切换页面不影响生成，可在作品库查看。",
);

const { start: startPolling } = useTaskPolling({
  fetchTask: () => getImageTaskStatus({ taskId: taskId.value }),
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

// 在现有主旨后追加润色意象，空主旨时使用默认起笔句式
const polishPrompt = () => {
  prompt.value = polishPromptText(
    prompt.value,
    polishSuffix,
    `江南烟雨中的远山与归舟，${polishSuffix}`,
  );
};

// 用随机意象覆盖当前主旨
const randomPrompt = () => {
  prompt.value = randomPromptText;
};

/**
 * 将灵感词追加到画面主旨，已有内容时用逗号衔接。
 * @param {string} value 待追加的灵感词。
 * @returns {void}
 */
const appendPrompt = (value) => {
  prompt.value = appendPromptText(prompt.value, value);
};

// 返回上一页重新构思
const goBack = () => {
  uni.navigateBack();
};

// 校验构思内容后弹出生成确认
const handleSubmit = () => {
  if (isSubmitting.value) {
    return;
  }

  if (!selectedStyle.value) {
    uni.showToast({ title: "请先选择一种画风", icon: "none" });
    return;
  }

  if (!prompt.value.trim()) {
    uni.showToast({ title: "请先填写画面主旨意象", icon: "none" });
    return;
  }

  confirmVisible.value = true;
};

// 启动任务轮询，空任务标识时直接给出提示
const startTaskPolling = () => {
  if (!taskId.value) {
    uni.showToast({ title: "任务创建失败，请重试", icon: "none" });
    return;
  }

  taskProgress.value = 0;
  taskStatusData.value = null;
  startPolling();
};

/**
 * 确认生成后创建文字生图任务。
 * @returns {Promise<void>}
 */
const confirmGenerate = async () => {
  if (isSubmitting.value) {
    return;
  }

  const requestData = {
    prompt: prompt.value.trim(),
    style: selectedStyle.value,
    ratio: draft.value.ratio || "1:1",
    count: draft.value.count || "双张",
  };

  isSubmitting.value = true;

  try {
    const task = await createImageGeneration({
      prompt: requestData.prompt,
      style: requestData.style,
      ratio: requestData.ratio,
      count: requestData.count,
    });

    confirmVisible.value = false;
    draft.value = { ...draft.value, ...requestData };
    saveCreationDraft(DRAFT_KEYS.image, draft.value);
    taskId.value = task.task_id;
    progressVisible.value = true;
    startTaskPolling();
  } catch (error) {
    uni.showToast({
      title: getErrorMessage(error, "创建任务失败，请稍后重试"),
      icon: "none",
    });
  } finally {
    isSubmitting.value = false;
  }
};

onShow(() => {
  const currentDraft = readCreationDraft(DRAFT_KEYS.image);

  if (!currentDraft?.style) {
    uni.showToast({ title: "请先完成构思意境", icon: "none" });
    uni.redirectTo({ url: "/pages/image-creation/index" });
    return;
  }

  draft.value = currentDraft;
});
</script>

<style scoped lang="scss">
.style-page {
  height: 100vh;
  overflow: hidden;
  background: $color-bg-page;
  color: $color-ink;
}

.step-bar {
  height: 82rpx;
  margin: 18rpx $space-7 0;
  padding: $space-1;
  display: flex;
  align-items: center;
  border: 1rpx solid $color-line;
  border-radius: $radius-2xl;
  background: $color-surface;
  box-shadow: 0 8rpx 22rpx rgba(19, 76, 68, 0.06);
}

.step {
  flex: 1;
  padding: $space-2 $space-1;
  border-radius: $radius-md;
  color: $color-faint;
  text-align: center;
  font-size: $font-size-caption;
  white-space: nowrap;
}

.step.done {
  color: $color-primary-soft;
}

.step.active {
  background: $color-primary;
  color: #fff;
  font-weight: $font-weight-bold;
}

.step-bar .step:nth-child(3) {
  display: none;
}

.content-state {
  margin-top: $space-6;
}

.content {
  --content-bottom-pad: 160rpx;
  height: calc(100vh - 270rpx - var(--status-bar-height, 0px));
  overflow-x: hidden;
  padding: 34rpx $space-7 var(--content-bottom-pad);
  box-sizing: border-box;
}

.detail-card {
  display: none;
}

.prompt-card,
.tuning-card {
  margin-top: $space-5;
  padding: $space-5;
  border: 1rpx solid $color-line;
  border-radius: $radius-xl;
  background: $color-surface;
  box-shadow: 0 8rpx 22rpx rgba(19, 76, 68, 0.05);
}

.prompt-head,
.prompt-tools,
.suggestion-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: $space-2;
}

.prompt-head text:last-child,
.suggestion-head text:last-child,
.tuning-card text {
  color: $color-muted;
  font-size: $font-size-caption;
}

.prompt-input {
  width: 100%;
  height: 250rpx;
  margin-top: $space-3;
  font-size: $font-size-body;
  line-height: $line-height-normal;
}

.prompt-tools {
  flex-wrap: wrap;
  margin-top: $space-3;
}

.prompt-tools button,
.suggestions button {
  @include tap-area(64rpx);
  margin: 0 $space-2 $space-2 0;
  padding: 0 $space-3;
  border: 1rpx solid $color-line;
  border-radius: $radius-sm;
  background: $color-surface;
  color: $color-primary-soft;
  font-size: $font-size-caption;
  line-height: 1;
}

.prompt-tools button:after,
.suggestions button:after {
  border: 0;
}

.prompt-tools text {
  margin-left: auto;
  color: $color-muted;
  font-size: $font-size-caption;
}

.suggestion-head {
  margin-top: $space-5;
  color: $color-primary;
  font-size: $font-size-aux;
}

.suggestions {
  display: flex;
  flex-wrap: wrap;
  gap: $space-2;
  margin-top: $space-3;
}

.suggestions button {
  color: $color-ink-soft;
}

.tuning-card view {
  margin-bottom: $space-3;
  color: $color-ink;
  font-weight: $font-weight-bold;
}

.tuning-card text {
  display: block;
  padding: $space-3 0;
  border-top: 1rpx solid $color-line;
}

.step-count {
  display: block;
  color: $color-muted;
  font-size: $font-size-caption;
  @include numeric;
}

.page-title {
  display: block;
  margin-top: $space-1;
  color: $color-ink;
  font-size: $font-size-page-title;
  font-weight: $font-weight-bold;
  line-height: $line-height-tight;
}

.page-desc {
  display: block;
  margin-top: $space-1;
  color: $color-muted;
  font-size: $font-size-aux;
  line-height: $line-height-normal;
}

.bottom-actions {
  @include action-bar;
  display: flex;
  gap: $space-3;
}

.bottom-actions button {
  height: $tap-size;
  border-radius: $radius-md;
  font-size: $font-size-body;
  line-height: 1;
}

.bottom-actions button:after {
  border: 0;
}

.previous {
  width: 150rpx;
  flex-shrink: 0;
  border: 1rpx solid $color-line;
  background: $color-surface;
  color: $color-ink-soft;
}

.next {
  flex: 1;
  border: 0;
  background: $color-primary;
  color: #fff;
  font-weight: $font-weight-bold;
}

.bottom-actions button[disabled] {
  opacity: 0.55;
}
</style>
