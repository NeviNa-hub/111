<template>
  <view class="style-page">
    <app-page-header title="文字生图" />
    <view class="step-bar">
      <view class="step done"><i>1</i><text>落墨构想</text></view>
      <view class="step-connector"></view>
      <view class="step active"><i>2</i><text>甄选画风</text></view>
    </view>
    <view class="scroll-window">
      <scroll-view
        scroll-y
        :show-scrollbar="false"
        class="content"
        :style="contentKeyboardStyle"
      >
        <view class="creation-body">
          <view class="config-card">
            <view class="config-title"> <em>壹 ·</em> 画面主旨 </view>
            <view class="prompt-head">
              <text>{{ prompt.length }} / {{ promptLimit }} 字</text>
            </view>
            <textarea
              v-model="prompt"
              :maxlength="promptLimit"
              class="prompt-input"
              placeholder="写下你想描绘的意象"
            />
            <view class="prompt-tools">
              <button @click="polishPrompt">
                <!-- #ifdef H5 -->
                <el-icon class="tool-icon"><MagicStick /></el-icon>
                <!-- #endif -->
                灵感润色
              </button>
              <button @click="randomPrompt">
                <!-- #ifdef H5 -->
                <el-icon class="tool-icon"><RefreshLeft /></el-icon>
                <!-- #endif -->
                随机意象
              </button>
              <text @click="prompt = ''">清空</text>
            </view>
          </view>

          <view class="config-card">
            <view class="config-title"><em>贰 ·</em> 灵感引线</view>
            <view class="suggestions">
              <button v-for="item in suggestions" :key="item" @click="appendPrompt(item)">
                ＋ {{ item }}
              </button>
            </view>
          </view>

          <view class="config-card">
            <view class="config-title"><em>叁 ·</em> 画境点睛</view>
            <view class="tuning-grid">
              <view class="tuning-row">
                <text class="tuning-label">意境基调</text>
                <text class="tuning-value">清润淡雅　墨韵沉静</text>
              </view>
              <view class="tuning-row">
                <text class="tuning-label">留白比例</text>
                <text class="tuning-value">迂阔（60%）　虚实均亭</text>
              </view>
            </view>
          </view>
        </view>
      </scroll-view>
    </view>
    <view class="bottom-actions" :style="barKeyboardStyle">
      <button class="previous" @click="goBack">上一步</button>
      <button class="next" :disabled="isSubmitting" @click="handleSubmit">
        {{ isSubmitting ? "任务创建中…" : "开始研墨成画 →" }}
      </button>
    </view>
    <confirm-generation-dialog
      v-if="confirmVisible"
      title="确认研墨成画"
      :cost="generationCost"
      :estimated-time="estimatedTime || '待定'"
      note="确认后扣除灵感点，生成失败暂不退回；结果链接约 1 小时后失效，请及时保存。"
      confirm-text="确认研墨成画"
      :loading="isSubmitting"
      @cancel="confirmVisible = false"
      @confirm="confirmGenerate"
    />
    <generation-dialog
      v-if="progressVisible"
      title="研墨成画"
      type="creation"
      :status="taskStatus"
      :progress="taskProgress"
      :progress-label="taskStage"
      :note="taskNote"
      :result-url="taskResultUrl"
      @back="uni.redirectTo({ url: '/pages/workbench/index' })"
      @library="uni.navigateTo({ url: '/pages/library/index' })"
    />
  </view>
</template>

<script setup>
import { computed, ref } from "vue";
import { onShow } from "@dcloudio/uni-app";

// #ifdef H5
import { MagicStick, RefreshLeft } from "@element-plus/icons-vue";
// #endif

import { TASK_STATUS } from "@/apis/constants";
import { getImageTaskStatus } from "@/apis/text-to-image";
import { submitImageGeneration } from "@/utils/image-generation";
import AppPageHeader from "@/components/AppPageHeader/index.vue";
import ConfirmGenerationDialog from "@/components/ConfirmGenerationDialog/index.vue";
import GenerationDialog from "@/components/GenerationDialog/index.vue";
import useKeyboardInset from "@/hooks/useKeyboardInset";
import useTaskPolling from "@/hooks/useTaskPolling";
import { loadPointsBalance } from "@/stores";
import { DRAFT_KEYS, readCreationDraft, saveCreationDraft } from "@/utils/creation-draft";
import { appendPromptText, polishPromptText } from "@/utils/prompt";
import { getErrorMessage, isApiError } from "@/utils/request";

const selectedStyle = ref("");
const prompt = ref("");
const promptLimit = 500;
const suggestions = ["江南烟雨", "宋代山水", "青绿设色", "晨曦微光", "枯墨留白"];
const polishSuffix = "画面空灵雅致，留白自然，笔触细腻";
const randomPromptText = "薄雾晨光里的青绿山水，远处层峦叠嶂，近处一叶轻舟掠过溪面";
const estimatedTime = "约 6~8 秒";
const generationCost = 2;
const TASK_STAGE_TEXT = {
  [TASK_STATUS.PENDING]: "排队等待",
  [TASK_STATUS.PROCESSING]: "气韵流转",
  [TASK_STATUS.COMPLETED]: "生成完成",
  [TASK_STATUS.FAILED]: "生成失败",
};
const TASK_NOTE_TEXT = {
  [TASK_STATUS.PENDING]: "任务已创建，正在排队等待云端处理，离开页面不影响生成。",
  [TASK_STATUS.PROCESSING]: "云端研墨中，离开页面或切换画风不影响生成。",
  [TASK_STATUS.COMPLETED]: "画卷已完成，可轻触画卷放大查看或前往作品库。",
};
const draft = ref(readCreationDraft(DRAFT_KEYS.image) || {});
const confirmVisible = ref(false);
const progressVisible = ref(false);
const isSubmitting = ref(false);
const taskId = ref("");
const taskProgress = ref(0);
const taskStatus = ref(TASK_STATUS.PENDING);
const taskMessage = ref("");
const taskResultUrl = ref("");
const { keyboardInset } = useKeyboardInset();

const contentKeyboardStyle = computed(() => ({
  paddingBottom: keyboardInset.value > 0 ? `${keyboardInset.value}px` : undefined,
}));

const barKeyboardStyle = computed(() => ({
  bottom: keyboardInset.value > 0 ? `${keyboardInset.value}px` : undefined,
}));

const taskStage = computed(() => TASK_STAGE_TEXT[taskStatus.value] || "任务已创建");

const taskNote = computed(() => {
  if (taskStatus.value === TASK_STATUS.FAILED) {
    return taskMessage.value || "生成失败，请返回重新尝试。";
  }

  return TASK_NOTE_TEXT[taskStatus.value] || TASK_NOTE_TEXT[TASK_STATUS.PENDING];
});

const { start: startPolling } = useTaskPolling({
  fetchTask: () => getImageTaskStatus({ taskId: taskId.value }),
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
  },
  onFailed: (error) => {
    const isRequestError = isApiError(error);

    taskStatus.value = TASK_STATUS.FAILED;
    taskMessage.value = isRequestError
      ? "任务状态查询失败，请稍后在作品库确认结果。"
      : getErrorMessage(error, "生成失败，请稍后重试。");

    if (!isRequestError) {
      uni.showToast({ title: taskMessage.value, icon: "none" });
    }
  },
});

// 在现有主旨后追加润色意象，空主旨时使用默认起笔句式
const polishPrompt = () => {
  prompt.value = polishPromptText(
    prompt.value,
    polishSuffix,
    `江南烟雨中的远山与归舟，${polishSuffix}`
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

// 启动任务轮询并重置当前任务状态
const startTaskPolling = () => {
  taskProgress.value = 0;
  taskStatus.value = TASK_STATUS.PENDING;
  taskMessage.value = "";
  taskResultUrl.value = "";
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
  };

  isSubmitting.value = true;

  try {
    const task = await submitImageGeneration({
      prompt: requestData.prompt,
      style: requestData.style,
      ratio: requestData.ratio,
    });

    if (!task?.task_id) {
      uni.showToast({ title: "任务创建失败，请重试", icon: "none" });
      return;
    }

    confirmVisible.value = false;
    draft.value = { ...draft.value, ...requestData };
    saveCreationDraft(DRAFT_KEYS.image, draft.value);
    // 创建任务已扣减灵感点，刷新共享缓存供页头展示。
    loadPointsBalance({ force: true });
    taskId.value = task.task_id;
    progressVisible.value = true;
    startTaskPolling();
    taskStatus.value = task.status || TASK_STATUS.PENDING;
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

onShow(() => {
  const currentDraft = readCreationDraft(DRAFT_KEYS.image);

  if (!currentDraft?.style) {
    uni.showToast({ title: "请先完成构思意境", icon: "none" });
    uni.redirectTo({ url: "/pages/image-creation/index" });
    return;
  }

  draft.value = currentDraft;
  selectedStyle.value = currentDraft.style;
  prompt.value = currentDraft.prompt || "";
});
</script>

<style scoped lang="scss">
.style-page {
  display: flex;
  flex-direction: column;
  height: 100vh;
  overflow: hidden;
  /* 为固定底栏预留高度，避免滚动窗下缘被底栏遮挡 */
  padding-bottom: calc(132rpx + constant(safe-area-inset-bottom));
  padding-bottom: calc(132rpx + env(safe-area-inset-bottom));
  box-sizing: border-box;
  background: linear-gradient(180deg, #ffecd2 0%, #fff8ec 48%, #fffdfb 100%);
  color: $color-ink;
}

.app-page-header,
.step-bar {
  flex: none;
}

/* 滚动窗：占据页头与底栏之间的全部剩余高度，边缘渐隐弱化切割感 */
.scroll-window {
  position: relative;
  flex: 1;
  min-height: 0;

  &::before,
  &::after {
    content: "";
    position: absolute;
    right: 0;
    left: 0;
    z-index: 2;
    height: 28rpx;
    pointer-events: none;
  }

  &::before {
    top: 0;
    background: linear-gradient(180deg, #fff3e0, rgba(255, 243, 224, 0));
  }

  &::after {
    bottom: 0;
    background: linear-gradient(0deg, #fffdfb, rgba(255, 253, 251, 0));
  }
}

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

.content {
  height: 100%;
  overflow-x: hidden;
  padding: 0 32rpx;
  box-sizing: border-box;
}

.creation-body {
  /* 呼吸边距放在滚动内容内部，滚动到顶/底时卡片不被贴边硬切 */
  padding: 8rpx 0 48rpx;
}

/* 卡片与区块标题：与构思页统一样式 */
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

.prompt-head {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  color: $color-muted;
  font-size: 24rpx;
}

.prompt-input {
  width: 100%;
  height: 250rpx;
  margin-top: 12rpx;
  font-size: 28rpx;
  line-height: 1.6;
}

.prompt-tools {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 12rpx;
  margin-top: 16rpx;
}

.prompt-tools button,
.suggestions button {
  @include tap-area(64rpx);
  gap: 8rpx;
  margin: 0;
  padding: 0 16rpx;
  border: 1rpx solid $color-line;
  border-radius: 12rpx;
  background: $color-surface;
  color: #8a6840;
  font-size: 24rpx;
  line-height: 1;
}

.prompt-tools button:after,
.suggestions button:after {
  border: 0;
}

.tool-icon {
  font-size: 26rpx;
}

.prompt-tools text {
  margin-left: auto;
  color: $color-muted;
  font-size: 24rpx;
}

.suggestions {
  display: flex;
  flex-wrap: wrap;
  gap: 12rpx;
}

.suggestions button {
  color: #4e665e;
}

.tuning-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16rpx;
  padding: 16rpx 0;
  border-top: 1rpx solid $color-line;
}

.tuning-label {
  flex-shrink: 0;
  color: $color-ink;
  font-size: 28rpx;
  font-weight: 700;
}

.tuning-value {
  color: $color-muted;
  font-size: 24rpx;
}

/* ============================================================
 * 桌面 H5 适配：1200px 以上三张配置卡三列并排、调参行双列
 * ============================================================ */
@media (min-width: $breakpoint-desktop) {
  .creation-body {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 24rpx;
    align-items: start;
  }

  .config-card {
    margin-top: 0;
  }

  .config-card:first-child {
    margin-top: 0;
  }

  .tuning-grid {
    display: grid;
    grid-template-columns: 1fr;
    column-gap: 0;
  }

  .tuning-row {
    border-top: 0;
    flex-wrap: wrap;
  }
}

.bottom-actions {
  @include action-bar;
  display: flex;
  gap: 16rpx;
}

.bottom-actions button {
  /* uni-app button 默认带内边距且文本不居中，改为 flex 居中并清掉内边距 */
  display: flex;
  align-items: center;
  justify-content: center;
  height: $tap-size;
  padding: 0;
  border-radius: 16rpx;
  font-size: 28rpx;
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
  color: #4e665e;
}

.next {
  flex: 1;
  border: 0;
  background: $color-primary;
  color: #fff;
  font-weight: 700;
}

.bottom-actions button[disabled] {
  opacity: 0.55;
}
</style>
