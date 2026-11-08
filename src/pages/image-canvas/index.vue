<template>
  <view class="canvas-page">
    <app-page-header title="设定画幅" />
    <view class="step-bar">
      <view class="step done">一构思</view>
      <view class="step done">二画风</view>
      <view class="step active">三规划成画</view>
    </view>
    <scroll-view scroll-y :show-scrollbar="false" class="content">
      <text class="step-count">步骤 3 / 3</text>
      <text class="page-title">第三步：设定画幅并落墨</text>
      <text class="page-desc">厘定比例与画幅张数，即将落笔成卷</text>
      <view>
        <view class="summary-card">
          <view class="summary-title">
            创作意念回溯 <text @click="editPrompt">修改内容</text>
          </view>
          <view class="summary-row">构想意境　{{ options.prompt }}</view>
          <view class="summary-row">甄选画风　{{ options.style }}</view>
        </view>
        <view class="section-title">
          画幅比例 <text>影响构图与空间意象</text>
        </view>
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
            <text v-if="selectedRatio === ratio.value" class="chosen">
              已选
            </text>
          </view>
        </view>
        <view class="section-title count-title">
          生成张数 <text>多图可甄选微调意趣</text>
        </view>
        <view class="count-list">
          <view
            v-for="count in options.counts"
            :key="count.name"
            class="count-card"
            :class="{ selected: selectedCount === count.name }"
            @click="selectedCount = count.name"
          >
            <text>{{ count.name }}</text>
            <small>消耗 {{ count.cost }} 灵感点</small>
          </view>
        </view>
        <view class="cost-card">
          当前剩余灵感点 <b>{{ pointsText }}</b>
          <text>
            本次需量扣除 <b>{{ selectedCost }} 点</b>
          </text>
        </view>
      </view>
    </scroll-view>
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

import { createImageGeneration } from "@/apis/text-to-image";
import AppPageHeader from "@/components/AppPageHeader/index.vue";
import {
  DRAFT_KEYS,
  readCreationDraft,
  saveCreationDraft,
} from "@/utils/creation-draft";
import { getErrorMessage } from "@/utils/request";

const options = ref({
  prompt: "",
  style: "",
  ratios: [
    { name: "1:1 方形", description: "适合朋友圈 / 头像", value: "1:1" },
    { name: "16:9 横卷", description: "电脑宽幅长卷", value: "16:9" },
    { name: "9:16 立轴", description: "移动壁纸画轴", value: "9:16" },
    { name: "4:3 经典", description: "雅致画册典藏", value: "4:3" },
  ],
  counts: [
    { name: "单张", value: 1, cost: 2 },
    { name: "双张", value: 2, cost: 4 },
    { name: "四张", value: 4, cost: 8 },
  ],
});
const selectedRatio = ref("1:1");
const selectedCount = ref("双张");
const pointsBalance = ref(800);
const isSubmitting = ref(false);

const pointsText = computed(() =>
  pointsBalance.value === null ? "—" : pointsBalance.value,
);

const selectedCost = computed(() => {
  const matched = options.value.counts.find(
    (item) => item.name === selectedCount.value,
  );

  return matched ? matched.cost : "—";
});

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

  if (!selectedRatio.value || !selectedCount.value) {
    uni.showToast({ title: "请选择画幅比例和生成张数", icon: "none" });
    return;
  }

  const draft = readCreationDraft(DRAFT_KEYS.image) || {};
  const requestData = {
    prompt: draft.prompt,
    style: draft.style,
    ratio: selectedRatio.value,
    count: selectedCount.value,
  };

  isSubmitting.value = true;

  try {
    const task = await createImageGeneration({
      prompt: requestData.prompt,
      style: requestData.style,
      ratio: requestData.ratio,
      count: requestData.count,
    });

    saveCreationDraft(DRAFT_KEYS.image, requestData);
    uni.navigateTo({
      url: `/pages/image-generation/index?mode=creation&taskId=${encodeURIComponent(
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

onShow(() => {
  const draft = readCreationDraft(DRAFT_KEYS.image);

  if (!draft?.prompt || !draft?.style) {
    uni.showToast({ title: "请按顺序完成构思和画风选择", icon: "none" });
    uni.redirectTo({ url: "/pages/image-creation/index" });
  }
});
</script>

<style scoped lang="scss">
.canvas-page {
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

.content {
  height: calc(100vh - 270rpx - var(--status-bar-height, 0px));
  overflow-x: hidden;
  padding: 34rpx $space-7 170rpx;
  box-sizing: border-box;
}

.step-count {
  display: block;
  color: $color-muted;
  font-size: $font-size-caption;
}

.page-title {
  display: block;
  margin-top: $space-1;
  color: $color-ink;
  font-size: $font-size-page-title;
  font-weight: $font-weight-bold;
  line-height: $line-height-tight;
}

.content-state {
  margin-top: $space-6;
}

.page-desc {
  display: block;
  margin-top: $space-1;
  color: $color-muted;
  font-size: $font-size-aux;
  line-height: $line-height-normal;
}

.summary-card {
  margin-top: $space-5;
  padding: $space-5;
  border: 1rpx solid $color-line;
  border-radius: $radius-xl;
  background: $color-surface;
}

.summary-title {
  padding-bottom: $space-3;
  color: $color-ink;
  font-size: $font-size-aux;
  font-weight: $font-weight-bold;
}

.summary-title text {
  float: right;
  color: $color-primary-soft;
  font-size: $font-size-caption;
  font-weight: $font-weight-regular;
}

.summary-row {
  margin-top: $space-2;
  padding: $space-4;
  border-radius: $radius-sm;
  background: $color-surface-muted;
  color: $color-ink-soft;
  font-size: $font-size-caption;
  line-height: $line-height-normal;
  word-break: break-all;
}

.section-title {
  display: flex;
  justify-content: space-between;
  margin-top: $space-5;
  color: $color-ink;
  font-size: $font-size-body;
  font-weight: $font-weight-bold;
}

.section-title text {
  color: $color-muted;
  font-size: $font-size-badge;
  font-weight: $font-weight-regular;
}

.ratio-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: $space-3;
  margin-top: $space-3;
}

.ratio-card {
  position: relative;
  min-height: 120rpx;
  padding: $space-5;
  border: 1rpx solid $color-line;
  border-radius: $radius-xl;
  background: $color-surface;
  box-sizing: border-box;
}

.ratio-card.selected {
  border: 2rpx solid $color-primary;
}

.ratio-icon {
  width: 38rpx;
  height: 38rpx;
  margin-bottom: $space-3;
  color: $color-muted;
  line-height: 38rpx;
}

.ratio-card.selected .ratio-icon {
  color: $color-primary;
}

.ratio-name {
  display: block;
  color: $color-ink;
  font-size: $font-size-aux;
  font-weight: $font-weight-bold;
}

.ratio-desc {
  display: block;
  margin-top: $space-1;
  color: $color-muted;
  font-size: $font-size-badge;
}

.chosen {
  position: absolute;
  top: 14rpx;
  right: 14rpx;
  padding: $space-1 $space-2;
  border-radius: $radius-sm;
  background: $color-primary;
  color: #fff;
  font-size: $font-size-badge;
}

.count-list {
  display: flex;
  gap: $space-2;
  margin-top: $space-3;
}

.count-card {
  flex: 1;
  padding: $space-4 $space-1;
  border: 1rpx solid $color-line;
  border-radius: $radius-lg;
  background: $color-surface;
  text-align: center;
}

.count-card.selected {
  border: 2rpx solid $color-primary;
}

.count-card text,
.count-card small {
  display: block;
}

.count-card text {
  color: $color-ink;
  font-size: $font-size-body;
  font-weight: $font-weight-semibold;
}

.count-card small {
  margin-top: $space-1;
  color: $color-muted;
  font-size: $font-size-badge;
  @include numeric;
}

.cost-card {
  margin-top: $space-5;
  padding: $space-5 $space-4;
  border: 1rpx solid $color-warning-line;
  border-radius: $radius-lg;
  background: $color-warning-bg;
  color: $color-warning;
  font-size: $font-size-caption;
  line-height: $line-height-normal;
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
  width: 160rpx;
  flex-shrink: 0;
  border: 1rpx solid $color-line;
  background: $color-surface;
  color: $color-ink-soft;
}

.generate {
  flex: 1;
  border: 0;
  background: $color-primary;
  color: #fff;
  font-weight: $font-weight-bold;
}
</style>
