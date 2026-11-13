<template>
  <view class="creation-page">
    <app-page-header title="文字生图" />
    <view class="step-bar">
      <view class="step active"><i>1</i><text>落墨构想</text></view>
      <view class="step-connector"></view>
      <view class="step inactive"><i>2</i><text>甄选画风</text></view>
    </view>
    <view class="scroll-window">
      <scroll-view scroll-y :show-scrollbar="false" class="content">
        <view class="creation-body">
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
        </view>
      </scroll-view>
    </view>
    <view class="next-card">
      <button @click="goNext">
        下一步：构想意象
        <!-- #ifdef H5 -->
        <el-icon class="next-icon"><ArrowRight /></el-icon>
        <!-- #endif -->
      </button>
    </view>
    <app-bottom-nav active="creation" desktop-only />
  </view>
</template>

<script setup>
import { computed, ref } from "vue";

// #ifdef H5
import {
  ArrowRight,
  Brush,
  Camera,
  MagicStick,
  Sunny,
} from "@element-plus/icons-vue";
// #endif

import AppBottomNav from "@/components/AppBottomNav/index.vue";
import AppPageHeader from "@/components/AppPageHeader/index.vue";
import { DRAFT_KEYS, saveCreationDraft } from "@/utils/creation-draft";

const styleOptions = [
  { styleId: 1, name: "宋式水墨", icon: Brush },
  { styleId: 2, name: "真实摄影", icon: Camera },
  { styleId: 3, name: "卡通风格", icon: Sunny },
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
  padding: 0 35rpx;
  box-sizing: border-box;
}

.creation-body {
  padding: 35rpx 0 48rpx;
}

.content-state {
  margin-top: 28rpx;
}

.config-card {
  margin: 0 6rpx 28rpx;
  padding: 28rpx;
  border-radius: 24rpx;
  background: $color-surface;
  box-shadow: 0 6rpx 20rpx rgba(150, 100, 40, 0.14);
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

.option-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20rpx;
}

.option-grid.four {
  grid-template-columns: repeat(4, 1fr);
}

/* ============================================================
 * 桌面 H5 适配：1200px 以上风格选项四列一行，比例区保持四列
 * ============================================================ */
@media (min-width: $breakpoint-desktop) {
  .option-grid {
    grid-template-columns: repeat(4, 1fr);
  }

  .option-grid.four {
    grid-template-columns: repeat(4, 1fr);
  }
}

.option-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12rpx;
  min-height: 150rpx;
  padding: 20rpx;
  border: 1rpx solid rgba(0, 0, 0, 0.08);
  border-radius: 16rpx;
  background: linear-gradient(135deg, #fcfcfa 0%, #fafbf9 100%);
  color: $color-ink;
  font-size: 30rpx;
  transition:
    background 0.2s ease,
    border-color 0.2s ease,
    box-shadow 0.2s ease;
}

.option-icon {
  display: flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  width: 64rpx;
  height: 64rpx;
  border-radius: 12rpx;
  background: #f7edde;
  color: $color-primary;
  font-size: 30rpx;
  transition:
    background 0.2s ease,
    color 0.2s ease;
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
  background: #fff3d6;
  color: #f08c1e;
}

.option-card.is-style-4 .option-icon {
  background: #eceaf6;
  color: #595bdc;
}

.option-name {
  font-weight: 700;
}

.option-card.selected {
  /* 用阴影描边替代加粗边框，避免选中时卡片抖动 */
  border-color: $color-primary;
  background: linear-gradient(135deg, #f7edde 0%, #f7faf8 100%);
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
  padding: 16rpx 8rpx 12rpx;
  gap: 8rpx;
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
  font-weight: 700;
}

.ratio-label {
  color: $color-muted;
  font-size: 22rpx;
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
  border-radius: 24rpx;
  background: linear-gradient(135deg, #8a6840 0%, #9c6e38 100%);
  color: #fff;
  font-size: 28rpx;
  font-weight: 700;
}

.next-card button[disabled] {
  opacity: 0.55;
}

.next-card button:after {
  border: 0;
}

.next-icon {
  margin-left: 8rpx;
  font-size: 26rpx;
}
</style>
