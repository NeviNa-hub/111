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
            v-for="(style, index) in styleOptions"
            :key="style.styleId"
            class="option-card"
            :class="[
              `is-style-${index + 1}`,
              { selected: selectedStyleId === style.styleId },
            ]"
            @click="selectedStyleId = style.styleId"
          >
            <!-- #ifdef H5 -->
            <el-icon class="option-icon">
              <component :is="style.icon" />
            </el-icon>
            <!-- #endif -->
            <text class="option-name">{{ style.name }}</text>
          </view>
        </view>
      </view>
      <view class="config-card">
        <view class="config-title"><em>贰 ·</em> 画幅比例</view>
        <view class="option-grid four">
          <view
            v-for="(ratio, index) in ratios"
            :key="ratio.ratioId"
            class="option-card compact"
            :class="[
              `is-ratio-${index + 1}`,
              { selected: selectedRatio === ratio.value },
            ]"
            @click="selectedRatio = ratio.value"
          >
            <i class="ratio-glyph"></i>
            <text class="ratio-value">{{ ratio.value }}</text>
            <text class="ratio-label">{{ ratio.label }}</text>
          </view>
        </view>
      </view>
    </scroll-view>
    <view class="next-card">
      <button @click="goNext">
        下一步：构想意象
        <!-- #ifdef H5 -->
        <el-icon class="next-icon"><ArrowRight /></el-icon>
        <!-- #endif -->
      </button>
    </view>
  </view>
</template>

<script setup>
import { computed, ref } from "vue";

// #ifdef H5
import { ArrowRight, Brush, Camera, Dish, MagicStick } from "@element-plus/icons-vue";
// #endif

import AppPageHeader from "@/components/AppPageHeader/index.vue";
import { DRAFT_KEYS, saveCreationDraft } from "@/utils/creation-draft";

const styleOptions = [
  { styleId: 1, name: "宋式水墨", icon: Brush },
  { styleId: 2, name: "真实摄影", icon: Camera },
  { styleId: 3, name: "宋瓷青釉", icon: Dish },
  { styleId: 4, name: "温润插画", icon: MagicStick },
];
const ratios = [
  { ratioId: 1, value: "1:1", label: "方形" },
  { ratioId: 2, value: "16:9", label: "横卷" },
  { ratioId: 3, value: "9:16", label: "立轴" },
  { ratioId: 4, value: "4:3", label: "经典" },
];
const selectedStyleId = ref(1);
const selectedRatio = ref("1:1");

const selectedStyleName = computed(
  () => styleOptions.find((style) => style.styleId === selectedStyleId.value)?.name || ""
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
  background: $color-primary;
  color: #fff;
  font-weight: $font-weight-bold;

  i {
    /* 徽章底色与步骤底色一致时改为半透明白底，避免圆形徽章融进背景 */
    background: rgba(255, 255, 255, 0.24);
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
  gap: $space-4;
}

.option-grid.four {
  grid-template-columns: repeat(4, 1fr);
}

.option-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: $space-2;
  min-height: 150rpx;
  padding: $space-4;
  border: 1rpx solid rgba(0, 0, 0, 0.08);
  border-radius: $radius-md;
  background: linear-gradient(135deg, #fcfcfa 0%, #fafbf9 100%);
  color: $color-ink;
  font-size: $font-size-body-lg;
  transition: background 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease;
}

.option-icon {
  display: flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  width: 64rpx;
  height: 64rpx;
  border-radius: $radius-sm;
  background: $color-primary-light;
  color: $color-primary;
  font-size: $font-size-body-lg;
  transition: background 0.2s ease, color 0.2s ease;
}

/* 各画风图标的识别色，选中时统一归为主色 */
.option-card.is-style-1 .option-icon {
  background: #e6f2ee;
  color: $color-primary;
}

.option-card.is-style-2 .option-icon {
  background: rgba(80, 181, 255, 0.16);
  color: #1e7cc8;
}

.option-card.is-style-3 .option-icon {
  background: #f7efdd;
  color: #8a6a3e;
}

.option-card.is-style-4 .option-icon {
  background: #eceaf6;
  color: $color-accent-violet;
}

.option-name {
  font-weight: $font-weight-bold;
}

.option-card.selected {
  /* 用阴影描边替代加粗边框，避免选中时卡片抖动 */
  border-color: $color-primary;
  background: linear-gradient(135deg, $color-primary-light 0%, #f7faf8 100%);
  color: $color-primary;
  box-shadow: 0 0 0 1rpx $color-primary inset;
}

.option-card.selected .option-icon {
  background: $color-primary;
  color: #fff;
}

/* 画幅磁贴：字形 + 比例值 + 小类目标签 */
.option-card.compact {
  min-height: 150rpx;
  padding: $space-3 $space-1 $space-2;
  gap: $space-1;
  line-height: 1.3;
}

.ratio-glyph {
  display: block;
  border-radius: 6rpx;
  transition: background 0.2s ease;
}

.option-card.is-ratio-1 .ratio-glyph {
  width: 40rpx;
  height: 40rpx;
  background: #e6f2ee;
  box-shadow: inset 0 0 0 1rpx rgba(5, 96, 76, 0.35);
}

.option-card.is-ratio-2 .ratio-glyph {
  width: 54rpx;
  height: 32rpx;
  background: rgba(80, 181, 255, 0.16);
  box-shadow: inset 0 0 0 1rpx rgba(30, 124, 200, 0.35);
}

.option-card.is-ratio-3 .ratio-glyph {
  width: 32rpx;
  height: 54rpx;
  background: #fdf6e8;
  box-shadow: inset 0 0 0 1rpx rgba(169, 118, 28, 0.35);
}

.option-card.is-ratio-4 .ratio-glyph {
  width: 50rpx;
  height: 38rpx;
  background: #eceaf6;
  box-shadow: inset 0 0 0 1rpx rgba(89, 91, 220, 0.35);
}

.ratio-value {
  font-weight: $font-weight-bold;
}

.ratio-label {
  color: $color-muted;
  font-size: $font-size-badge;
}

.next-card {
  @include action-bar;
}

.next-card button {
  /* uni-app button 默认带内边距且文本不居中，改为 flex 居中并清掉内边距 */
  display: flex;
  align-items: center;
  justify-content: center;
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

.next-card button[disabled] {
  opacity: 0.55;
}

.next-card button:after {
  border: 0;
}

.next-icon {
  margin-left: $space-1;
  font-size: $font-size-aux;
}
</style>
