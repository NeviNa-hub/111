<template>
  <view class="canvas-page">
    <app-page-header title="文字生图" />
    <view class="step-bar">
      <view class="step done"><i>1</i><text>落墨构想</text></view>
      <view class="step-connector"></view>
      <view class="step done"><i>2</i><text>甄选画风</text></view>
      <view class="step-connector"></view>
      <view class="step active"><i>3</i><text>设定画幅</text></view>
    </view>
    <view class="scroll-window">
      <scroll-view scroll-y :show-scrollbar="false" class="content">
        <view class="creation-body">
          <text class="step-count">步骤 3 / 3</text>
          <text class="page-title">第三步：设定画幅并落墨</text>
          <text class="page-desc">厘定画幅比例，即将落笔成卷</text>
          <view>
            <view class="summary-card">
              <view class="summary-title">
                创作回溯 <text @click="editPrompt">修改内容</text>
              </view>
              <view class="summary-row">构想意境　{{ options.prompt }}</view>
              <view class="summary-row">甄选画风　{{ options.style }}</view>
            </view>
            <view class="section-title"> 画幅比例 <text>影响构图与空间意象</text> </view>
            <view class="ratio-grid">
              <view
                v-for="ratio in options.ratios"
                :key="ratio.value"
                class="ratio-card"
                :class="{ selected: selectedRatio === ratio.value }"
                @click="selectedRatio = ratio.value"
              >
                <view class="ratio-icon"></view>
                <text class="ratio-name">{{ ratio.name }}</text>
                <text class="ratio-desc">{{ ratio.description }}</text>
                <text v-if="selectedRatio === ratio.value" class="chosen"> 已选 </text>
              </view>
            </view>
            <view class="cost-card">
              当前剩余灵感点 <b>{{ pointsText }}</b>
              <text>
                本次需量扣除 <b>{{ selectedCost }} 点</b>
              </text>
            </view>
            <text>提交后扣除积分，生成失败暂不退回；图片链接约 1 小时后失效。</text>
          </view>
        </view>
      </scroll-view>
    </view>
    <view class="bottom-actions">
      <button class="previous" @click="goBack">修改画风</button>
      <button class="generate" :disabled="isSubmitting" @click="generate">
        研墨成画（扣除 {{ selectedCost }} 点）
      </button>
    </view>
  </view>
</template>

<script setup>
import { computed, ref } from "vue";
import { onShow } from "@dcloudio/uni-app";

import { getPointsInfo } from "@/apis/points";
import { submitImageGeneration } from "@/utils/image-generation";
import AppPageHeader from "@/components/AppPageHeader/index.vue";
import { DRAFT_KEYS, readCreationDraft, saveCreationDraft } from "@/utils/creation-draft";
import { getErrorMessage, isApiError } from "@/utils/request";

const options = ref({
  prompt: "",
  style: "",
  ratios: [
    { name: "1:1 方形", description: "适合朋友圈 / 头像", value: "1:1" },
    { name: "16:9 横卷", description: "电脑宽幅长卷", value: "16:9" },
    { name: "9:16 立轴", description: "移动壁纸画轴", value: "9:16" },
    { name: "4:3 经典", description: "雅致画册典藏", value: "4:3" },
  ],
});
const selectedRatio = ref("1:1");
const pointsBalance = ref(null);
const isSubmitting = ref(false);

const pointsText = computed(() =>
  pointsBalance.value === null ? "—" : pointsBalance.value
);

const selectedCost = 2;

// 返回上一页修改画风
const goBack = () => {
  uni.navigateBack();
};

// 回退两页到构思页修改创作内容
const editPrompt = () => {
  uni.navigateBack({ delta: 2 });
};

// 校验画幅选择并创建生图任务，成功后保存草稿并跳转生成页
const generate = async () => {
  if (isSubmitting.value) {
    return;
  }

  if (!selectedRatio.value) {
    uni.showToast({ title: "请选择画幅比例", icon: "none" });
    return;
  }

  const draft = readCreationDraft(DRAFT_KEYS.image) || {};
  const requestData = {
    prompt: draft.prompt,
    style: draft.style,
    ratio: selectedRatio.value,
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

    saveCreationDraft(DRAFT_KEYS.image, requestData);
    uni.navigateTo({
      url: `/pages/image-generation/index?mode=creation&taskId=${encodeURIComponent(
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

onShow(async () => {
  const draft = readCreationDraft(DRAFT_KEYS.image);

  if (!draft?.prompt || !draft?.style) {
    uni.showToast({ title: "请按顺序完成构思和画风选择", icon: "none" });
    uni.redirectTo({ url: "/pages/image-creation/index" });
    return;
  }
  try {
    const result = await getPointsInfo({ page: 1, page_size: 1 });
    pointsBalance.value = result.points_balance;
  } catch {
    pointsBalance.value = null;
  }
});
</script>

<style scoped lang="scss">
.creation-body {
  padding: 34rpx 0 48rpx;
}

.canvas-page {
  display: flex;
  flex-direction: column;
  height: 100vh;
  overflow: hidden;
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

.step-count {
  display: block;
  color: $color-muted;
  font-size: 24rpx;
}

.page-title {
  display: block;
  margin-top: 8rpx;
  color: $color-ink;
  font-size: 38rpx;
  font-weight: 700;
  line-height: 1.3;
}

.page-desc {
  display: block;
  margin-top: 8rpx;
  color: $color-muted;
  font-size: 26rpx;
  line-height: 1.6;
}

.summary-card {
  margin-top: 24rpx;
  padding: 24rpx;
  border: 1rpx solid $color-line;
  border-radius: 24rpx;
  background: $color-surface;
}

.summary-title {
  padding-bottom: 16rpx;
  color: $color-ink;
  font-size: 26rpx;
  font-weight: 700;
}

.summary-title text {
  float: right;
  color: #8a6840;
  font-size: 24rpx;
  font-weight: 400;
}

.summary-row {
  margin-top: 12rpx;
  padding: 20rpx;
  border-radius: 12rpx;
  background: #f8faf7;
  color: #4e665e;
  font-size: 24rpx;
  line-height: 1.6;
  word-break: break-all;
}

.section-title {
  display: flex;
  justify-content: space-between;
  margin-top: 24rpx;
  color: $color-ink;
  font-size: 28rpx;
  font-weight: 700;
}

.section-title text {
  color: $color-muted;
  font-size: 22rpx;
  font-weight: 400;
}

.ratio-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16rpx;
  margin-top: 16rpx;
}

/* ============================================================
 * 桌面 H5 适配：992px 以上画幅比例三列排布
 * ============================================================ */
@media (min-width: 992px) {
  .ratio-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

.ratio-card {
  position: relative;
  min-height: 120rpx;
  padding: 24rpx;
  border: 1rpx solid $color-line;
  border-radius: 24rpx;
  background: $color-surface;
  box-sizing: border-box;
}

.ratio-card.selected {
  border: 2rpx solid $color-primary;
}

.ratio-icon {
  width: 38rpx;
  height: 38rpx;
  margin-bottom: 16rpx;
  color: $color-muted;
  line-height: 38rpx;
}

.ratio-card.selected .ratio-icon {
  color: $color-primary;
}

.ratio-name {
  display: block;
  color: $color-ink;
  font-size: 26rpx;
  font-weight: 700;
}

.ratio-desc {
  display: block;
  margin-top: 8rpx;
  color: $color-muted;
  font-size: 22rpx;
}

.chosen {
  position: absolute;
  top: 14rpx;
  right: 14rpx;
  padding: 8rpx 12rpx;
  border-radius: 12rpx;
  background: $color-primary;
  color: #fff;
  font-size: 22rpx;
}

.cost-card {
  margin-top: 24rpx;
  padding: 24rpx 20rpx;
  border: 1rpx solid #f0e0bd;
  border-radius: 20rpx;
  background: #fdf6e8;
  color: $color-warning;
  font-size: 24rpx;
  line-height: 1.6;
}

.cost-card b {
  color: $color-warning;
  @include numeric;
}

.cost-card text {
  float: right;
  @include numeric;
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

.generate {
  flex: 1;
  border: 0;
  background: $color-primary;
  color: #fff;
  font-weight: 700;
}
</style>
