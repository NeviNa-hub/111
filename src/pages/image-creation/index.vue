<template>
  <view class="creation-page">
    <app-page-header title="文字生图" />
    <view class="step-bar">
      <view class="step active"><i>1</i><text>落墨构想</text></view>
      <view class="step-connector"></view>
      <view class="step inactive"><i>2</i><text>甄选画风</text></view>
    </view>
    <scroll-view scroll-y :show-scrollbar="false" class="content">
      <view class="config-card">
        <view class="config-title"><em>壹 ·</em> 风格定品</view>
        <view class="option-grid">
          <view
            v-for="style in styleOptions"
            :key="style.styleId"
            class="option-card"
            :class="{ selected: selectedStyleId === style.styleId }"
            @click="selectedStyleId = style.styleId"
          >
            <text>{{ style.name }}</text>
            <small>{{ style.description }}</small>
          </view>
        </view>
      </view>
      <view class="config-card">
        <view class="config-title"><em>贰 ·</em> 画幅比例</view>
        <view class="option-grid four">
          <view
            v-for="ratio in ratios"
            :key="ratio.ratioId"
            class="option-card compact"
            :class="{ selected: selectedRatio === ratio.value }"
            @click="selectedRatio = ratio.value"
            >{{ ratio.value }}</view
          >
        </view>
      </view>
    </scroll-view>
    <view class="next-card">
      <button @click="goNext">下一步：构想意象</button>
    </view>
  </view>
</template>

<script setup>
import { computed, ref } from "vue";

import AppPageHeader from "@/components/AppPageHeader/index.vue";
import AppStateHint from "@/components/AppStateHint/index.vue";
import { DRAFT_KEYS, saveCreationDraft } from "@/utils/creation-draft";

const styleOptions = [
  {
    styleId: 1,
    name: "宋式水墨",
    description: "写意淡墨，温润留白，淡雅韵味。",
  },
  { styleId: 2, name: "真实摄影", description: "微质感，柔和光影，细腻真实。" },
  { styleId: 3, name: "宋瓷青釉", description: "手工釉色肌理，低饱和大地色。" },
  { styleId: 4, name: "温润插画", description: "轻笔与木刻手绘感，质朴温暖。" },
];
const ratios = [
  { name: "1:1 方形", description: "适合朋友圈 / 头像", value: "1:1" },
  { name: "16:9 横卷", description: "电脑宽幅长卷", value: "16:9" },
  { name: "9:16 立轴", description: "移动壁纸画轴", value: "9:16" },
  { name: "4:3 经典", description: "雅致画册典藏", value: "4:3" },
];
const selectedStyleId = ref(1);
const selectedRatio = ref("1:1");

const selectedStyleName = computed(
  () =>
    styleOptions.find((style) => style.styleId === selectedStyleId.value)
      ?.name || "",
);

// 校验并保存构思草稿，进入画风挑选页
const goNext = () => {
  if (!selectedStyleName.value) {
    uni.showToast({ title: "请先选择画风", icon: "none" });
    return;
  }

  saveCreationDraft(DRAFT_KEYS.image, {
    style: selectedStyleName.value,
    styleId: selectedStyleId.value,
    ratio: selectedRatio.value,
  });
  uni.navigateTo({ url: "/pages/image-style/index" });
};
</script>

<style scoped lang="scss">
.creation-page {
  height: 100vh;
  overflow: hidden;
  background: $color-bg-page;
  color: $color-ink;
}

.step-bar {
  height: 82rpx;
  margin: $space-3 $space-7 0;
  padding: $space-1;
  display: flex;
  align-items: center;
  border: 1rpx solid rgba(63, 102, 86, 0.12);
  border-radius: $radius-2xl;
  background: rgba(255, 255, 255, 0.86);
  box-shadow: 0 8rpx 22rpx rgba(19, 76, 68, 0.06);
}

.step {
  flex: 1;
  padding: $space-2 0;
  border-radius: $radius-md;
  color: $color-muted;
  text-align: center;
  font-size: $font-size-caption;
  white-space: nowrap;
}

.step i {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 40rpx;
  height: 40rpx;
  margin-right: $space-1;
  border-radius: 50%;
  background: #dfdfd5;
  color: $color-muted;
  font-style: normal;
  font-size: $font-size-badge;
}

.step-connector {
  flex: 1;
  height: 2rpx;
  margin: 0 $space-3;
  background: linear-gradient(90deg, $color-primary-soft, #dfdfd5);
}

.step.active {
  color: #fff;
  font-weight: $font-weight-bold;

  i {
    background: $color-primary;
    color: #fff;
  }
}

.content {
  height: calc(100vh - 270rpx - var(--status-bar-height, 0px));
  overflow-x: hidden;
  padding: 35rpx;
  box-sizing: border-box;
}

.content-state {
  margin-top: $space-6;
}

.config-card {
  margin-top: $space-6;
  padding: $space-6;
  border-radius: $radius-xl;
  background: $color-surface;
  box-shadow: 0 10rpx 30rpx rgba(95, 133, 117, 0.04);
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

.option-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: $space-6;
}

.option-grid.four {
  grid-template-columns: repeat(4, 1fr);
}

.option-card {
  min-height: 96rpx;
  padding: $space-4;
  border: 1rpx solid rgba(0, 0, 0, 0.08);
  border-radius: $radius-md;
  background: linear-gradient(135deg, #fcfcfa 0%, #fafbf9 100%);
  color: $color-ink;
  font-size: $font-size-body-lg;
}

.option-card small {
  display: block;
  margin-top: $space-1;
  color: $color-muted;
  font-size: $font-size-caption;
  line-height: $line-height-tight;
}

.option-card.compact {
  min-height: 88rpx;
  padding: $space-2 $space-1;
  text-align: center;
  line-height: 1.4;
}

.option-grid.four .option-card.compact::before {
  display: block;
  width: 38rpx;
  height: 38rpx;
  margin: 0 auto $space-1;
  border: 1rpx solid $color-muted;
  border-radius: 5rpx;
  content: "";
}

.option-grid.four .option-card:nth-child(2)::before {
  width: 48rpx;
  height: 28rpx;
}

.option-grid.four .option-card:nth-child(3)::before {
  width: 28rpx;
  height: 48rpx;
}

.option-grid.four .option-card:nth-child(4)::before {
  width: 44rpx;
  height: 34rpx;
}

.option-card.selected {
  border: 2rpx solid $color-primary;
  background: linear-gradient(135deg, #e6f0ea 0%, #fafbf9 100%);
  color: $color-primary;
  font-weight: $font-weight-bold;
}

.option-grid.four .option-card.selected::before {
  border-color: $color-primary;
  background: $color-primary;
}

.next-card {
  @include action-bar;
}

.next-card button {
  width: 100%;
  height: $tap-size;
  border: 0;
  border-radius: $radius-xl;
  background: linear-gradient(
    135deg,
    $color-primary-soft 0%,
    $color-primary-dark 100%
  );
  color: #fff;
  font-size: $font-size-body;
  font-weight: $font-weight-bold;
}

.next-card button[disabled] {
  opacity: 0.55;
}

.next-card button:after {
  border: 0;
}
</style>
