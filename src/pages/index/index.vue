<template>
  <view class="home-page">
    <app-page-header title="妙笔生花" />

    <scroll-view scroll-y :show-scrollbar="false" class="main-scroll">
      <view class="page-body">
        <!-- 问候语 -->
        <view class="greeting-row">
          <view class="greeting-left">
            <text class="greeting-title">东方意象美学</text>
            <view class="greeting-marquee">
              <view class="marquee-track"> 以笔为引，以意生花 · 极简智能多模态创作 </view>
            </view>
          </view>
          <text class="weather">{{ weatherText }}</text>
        </view>

        <!-- 今日推荐 -->
        <view class="config-title"><em>壹 ·</em> 今日推荐</view>
        <view class="hero-card">
          <view class="hero-art">
            <app-image class="hero-image" :src="hero.image_url" mode="aspectFill" />
            <view class="hero-label">{{ hero.label }}</view>
            <view class="hero-caption">{{ hero.caption }}</view>
            <view class="hero-hint">提示词：{{ hero.prompt }}</view>
          </view>
          <view class="hero-footer">
            <view class="hero-meta">
              <text class="meta-title">{{ hero.model_name }}</text>
              <text class="meta-subtitle">已生成 {{ generatedCountText }} 次</text>
            </view>
            <button class="try-button" @click="handleTryCreation">同款创作</button>
          </view>
        </view>

        <!-- 灵感工坊，展示推荐的创作模式 -->
        <view class="config-title workshop-title"><em>贰 ·</em> 灵感工坊</view>
        <view
          v-if="creations.length"
          class="carousel-stage"
          @touchstart="handleTouchStart"
          @touchend="handleTouchEnd"
        >
          <view class="carousel-container">
            <view
              v-for="(creation, index) in creations"
              :key="creation.creation_id"
              class="creation-card"
              :class="[getCardPosition(index), `creation-card-${index + 1}`]"
              @click="openCreation(creation.url)"
            >
              <view>
                <text class="card-label">{{ creation.eyebrow }}</text>
                <text class="creation-title">{{ creation.title }}</text>
                <view class="mock-input">
                  <text class="input-prefix">{{ creation.input_label }}</text>
                  <text class="input-value">{{ creation.input_value }}</text>
                  <text class="input-icon">{{ creation.icon }}</text>
                </view>
              </view>

              <!-- 创作模式卡片底部 -->
              <view class="card-bottom">
                <text class="footer-note">{{ creation.note }}</text>
                <view class="action-button">
                  <text>{{ creation.action }}</text>
                </view>
              </view>
            </view>
          </view>
        </view>
        <app-state-hint
          v-else
          class="home-state"
          type="empty"
          title="暂无灵感推荐"
          description="稍后刷新即可查看新的创作模式"
        />
        <view v-if="creations.length" class="pagination-dots">
          <text
            v-for="index in creationCount"
            :key="index"
            :class="{ 'active-dot': index - 1 === currentCreation }"
            @click="selectCreation(index - 1)"
          ></text>
        </view>

        <view class="quote">{{ quote }}</view>
      </view>
    </scroll-view>

    <app-bottom-nav active="drafts" />
  </view>
</template>

<script setup>
import { computed, ref } from "vue";

import AppBottomNav from "@/components/AppBottomNav/index.vue";
import AppImage from "@/components/AppImage/index.vue";
import AppPageHeader from "@/components/AppPageHeader/index.vue";

const homeData = {
  weather_text: "今日谷雨",
  quote: "造法自然 · 意致千里",
  hero: {
    label: "今日推荐 · 烟岚登翠",
    caption: "青绿水墨江南",
    prompt: "水墨淋漓，宋式青绿设色，微风拂动湖面 ...",
    image_url: "/static/home/home-1.jpg",
    model_name: "国产大模型",
    generated_count: 1280,
  },
  creations: [
    {
      creation_id: 1,
      eyebrow: "IMAGE INK",
      title: "文字生图",
      input_label: "意境：",
      input_value: "宋式青绿水墨...",
      icon: "✦",
      note: "字句勾勒意境",
      action: "去探索",
      url: "/pages/image-creation/index",
    },
    {
      creation_id: 2,
      eyebrow: "MOTION INK",
      title: "生成视频",
      input_label: "镜头：",
      input_value: "微风荡起波澜...",
      icon: "▣",
      note: "融汇静止为流动",
      action: "去创作",
      url: "/pages/video-creation/index",
    },
    {
      creation_id: 3,
      eyebrow: "IMAGE REFINE",
      title: "图片优化",
      input_label: "优化：",
      input_value: "超高清晰画质",
      icon: "✨",
      note: "一键唤醒纤毫纹理",
      action: "还原",
      url: "/pages/image-optimization/index",
    },
  ],
};
const currentCreation = ref(0);
const touchStartX = ref(0);

const creations = computed(() => homeData.creations);
const creationCount = computed(() => creations.value.length);
const weatherText = computed(() => homeData.weather_text);
const quote = computed(() => homeData.quote);
const hero = computed(() => homeData.hero);
const generatedCountText = computed(() =>
  String(hero.value.generated_count).replace(/\B(?=(\d{3})+(?!\d))/g, ",")
);

// 开始同款创作
const handleTryCreation = () => {
  uni.navigateTo({ url: "/pages/image-creation/index" });
};

/**
 * 打开灵感工坊卡片对应的创作页面。
 *
 * @param {string} url 创作页面地址
 * @returns {void}
 */
const openCreation = (url) => {
  if (!url) {
    return;
  }

  uni.navigateTo({ url });
};

/**
 * 切换到指定索引的灵感工坊卡片。
 *
 * @param {number} index 目标卡片索引
 * @returns {void}
 */
const selectCreation = (index) => {
  currentCreation.value = index;
};

/**
 * 获取卡片在轮播舞台中的位置类名。
 *
 * @param {number} index 卡片索引
 * @returns {string} 卡片位置类名
 */
const getCardPosition = (index) => {
  if (!creationCount.value) {
    return "";
  }

  if (index === currentCreation.value) {
    return "active";
  }

  return index === (currentCreation.value + 1) % creationCount.value ? "right" : "left";
};

/**
 * 记录滑动开始时的横向坐标。
 *
 * @param {object} event 触摸开始事件
 * @returns {void}
 */
const handleTouchStart = (event) => {
  touchStartX.value = event.changedTouches[0].clientX;
};

/**
 * 根据横向滑动距离切换灵感工坊卡片。
 *
 * @param {object} event 触摸结束事件
 * @returns {void}
 */
const handleTouchEnd = (event) => {
  if (!creationCount.value) {
    return;
  }

  const distance = event.changedTouches[0].clientX - touchStartX.value;

  if (distance > 50) {
    selectCreation(
      (currentCreation.value - 1 + creationCount.value) % creationCount.value
    );
  }

  if (distance < -50) {
    selectCreation((currentCreation.value + 1) % creationCount.value);
  }
};
</script>

<style scoped lang="scss">
.home-page {
  height: 100vh;
  overflow: hidden;
  background: $color-bg-page;
  color: $color-ink;
}

.main-scroll {
  height: calc(100vh - 210rpx - var(--status-bar-height, 0px));
  overflow-x: hidden;
  padding: $space-2 $space-7;
  padding-bottom: calc(#{$space-4} + env(safe-area-inset-bottom));
  box-sizing: border-box;
}

.page-body {
  padding-top: $space-2;
}

.home-state {
  margin-top: $space-6;

  &.is-loading {
    min-height: calc(
      100vh - 210rpx - var(--status-bar-height, 0px) - #{$space-2} - #{$space-4}
    );
    margin-top: 0;
    border: 0;
    background: transparent;
  }
}

/* 问候语 */
.greeting-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: $space-3;
  margin-bottom: $space-2;
}

.greeting-left {
  display: flex;
  flex: 1;
  align-items: center;
  min-width: 0;
}

.greeting-title {
  flex-shrink: 0;
  color: $color-primary-soft;
  font-size: $font-size-body;
  font-weight: $font-weight-semibold;
  animation: title-pulse 5s ease-in-out infinite;
}

@keyframes title-pulse {
  0%,
  100% {
    transform: scale(1);
  }

  50% {
    transform: scale(1.05);
  }
}

.greeting-marquee {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  margin-left: $space-3;
}

.marquee-track {
  display: inline-flex;
  color: $color-muted;
  font-size: $font-size-caption;
  white-space: nowrap;
  animation: marquee-scroll 8s linear infinite;
}

@keyframes marquee-scroll {
  0% {
    transform: translateX(0);
  }

  100% {
    transform: translateX(-50%);
  }
}

.weather {
  flex-shrink: 0;
  color: $color-muted;
  font-size: $font-size-caption;
}

/* 区块标题：与创作页“壹 ·/贰 ·”序号样式统一 */
.config-title {
  padding-bottom: $space-5;
  color: $color-primary-soft;
  font-size: $font-size-title;
  font-weight: $font-weight-bold;
}

.config-title em {
  color: $color-accent-clay;
}

.workshop-title {
  margin-top: $space-7;
}

/* 今日推荐 */
.hero-card {
  padding: $space-6;
  overflow: hidden;
  border: 1rpx solid rgba(0, 0, 0, 0.02);
  border-radius: 34rpx;
  background: $color-surface;
  box-shadow: $shadow-card;
}

.hero-art {
  position: relative;
  height: 280rpx;
  overflow: hidden;
  border-radius: 80rpx 30rpx 100rpx 30rpx;
}

.hero-image {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
}

.hero-art:after {
  content: "";
  position: absolute;
  inset: 0;
  background: linear-gradient(
    180deg,
    rgba(255, 255, 255, 0.28),
    transparent 45%,
    rgba(45, 53, 50, 0.58)
  );
}

.hero-label,
.hero-caption,
.hero-hint {
  position: absolute;
  z-index: 1;
  left: $space-6;
  right: $space-6;
  color: white;
}

.hero-label {
  top: $space-3;
  right: auto;
  padding: $space-1 $space-3;
  border-radius: $radius-pill;
  background: rgba(255, 255, 255, 0.84);
  color: $color-primary-soft;
  font-size: $font-size-caption;
}

.hero-caption {
  bottom: 58rpx;
  font-size: $font-size-body;
  font-weight: $font-weight-bold;
  @include text-ellipsis;
}

.hero-hint {
  bottom: $space-4;
  font-size: $font-size-caption;
  opacity: 0.86;
  @include text-ellipsis;
}

.hero-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: $space-3;
  padding-top: $space-6;
}

.hero-meta,
.card-bottom {
  display: flex;
  align-items: center;
}

.meta-title,
.meta-subtitle {
  display: block;
}

.meta-title {
  color: $color-ink;
  font-size: $font-size-title;
  font-weight: $font-weight-bold;
}

.meta-subtitle {
  margin-left: $space-2;
  color: $color-muted;
  font-size: $font-size-caption;
  @include numeric;
}

.try-button {
  @include tap-area(64rpx);
  flex-shrink: 0;
  margin: 0;
  padding: 0 $space-4;
  border-radius: $radius-pill;
  background: $color-primary;
  color: white;
  font-size: $font-size-caption;
  line-height: 1;
}

.try-button:after {
  border: 0;
}

/* 灵感工坊轮播 */
.carousel-stage {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: $space-6 0;
  overflow: hidden;
  perspective: 1200px;
}

.carousel-container {
  position: relative;
  width: 480rpx;
  height: 400rpx;
  transform-style: preserve-3d;
}

.creation-card {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: $space-6;
  box-sizing: border-box;
  border: 1rpx solid rgba(255, 255, 255, 0.9);
  border-radius: 48rpx;
  transition: transform 0.6s ease, opacity 0.6s ease, filter 0.6s ease;
  pointer-events: none;
}

.creation-card-1 {
  background: linear-gradient(135deg, #ffffff 30%, #e8f1ec 100%);
}

.creation-card-2 {
  background: linear-gradient(135deg, #ffffff 30%, #faf0e4 100%);
}

.creation-card-3 {
  background: linear-gradient(135deg, #ffffff 30%, #ece8f1 100%);
}

.creation-card.active {
  z-index: 3;
  transform: translate3d(0, 0, 0) scale(1);
  opacity: 1;
  filter: blur(0);
  pointer-events: auto;
  box-shadow: 0 28rpx 60rpx rgba(95, 133, 117, 0.15);
}

.creation-card.left {
  z-index: 1;
  transform: translate3d(-150rpx, 0, -120rpx) scale(0.85) rotateY(40deg);
  opacity: 0.55;
  filter: blur(1rpx);
}

.creation-card.right {
  z-index: 1;
  transform: translate3d(150rpx, 0, -120rpx) scale(0.85) rotateY(-40deg);
  opacity: 0.55;
  filter: blur(1rpx);
}

.creation-title {
  display: block;
  margin-top: $space-1;
  color: $color-art-ink;
  font-size: $font-size-body-lg;
  font-weight: $font-weight-bold;
}

.card-label {
  display: block;
  color: rgba(32, 32, 34, 0.38);
  font-size: $font-size-caption;
  font-weight: $font-weight-semibold;
  letter-spacing: 2rpx;
}

.mock-input {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: $space-5;
  padding: $space-3 $space-4;
  border-top: 1rpx solid rgba(212, 189, 150, 0.3);
  border-bottom: 1rpx solid rgba(212, 189, 150, 0.3);
  background: #faf9f5;
  font-size: $font-size-caption;
}

.input-prefix {
  flex-shrink: 0;
  color: $color-art-muted;
}

.input-value {
  flex: 1;
  min-width: 0;
  color: #2d2b30;
  @include text-ellipsis;
}

.input-icon {
  flex-shrink: 0;
  margin-left: $space-3;
  color: $color-accent-cinnabar;
}

.card-bottom {
  justify-content: space-between;
  gap: $space-3;
  padding-top: $space-3;
  border-top: 1rpx solid rgba(32, 32, 34, 0.07);
  font-size: $font-size-caption;
}

.footer-note {
  min-width: 0;
  color: #aaa7ae;
  @include text-ellipsis;
}

.action-button {
  @include tap-area(72rpx);
  flex-shrink: 0;
  width: 132rpx;
  border-radius: $radius-pill;
  background: $color-primary;
  color: #fff;
  font-size: $font-size-caption;
  font-weight: $font-weight-bold;
}

.pagination-dots {
  padding: $space-1 0 $space-3;
  text-align: center;
}

.pagination-dots text {
  position: relative;
  display: inline-block;
  width: 10rpx;
  height: 10rpx;
  margin: 0 $space-3;
  border-radius: 50%;
  background: #d1d5d4;
}

.pagination-dots text::before {
  position: absolute;
  top: (-$space-3);
  right: (-$space-2);
  bottom: (-$space-3);
  left: (-$space-2);
  content: "";
}

.pagination-dots .active-dot {
  width: 40rpx;
  border-radius: $radius-xs;
  background: $color-primary-soft;
}

/* 底部卷尾语 */
.quote {
  padding: $space-5 0;
  color: $color-muted;
  font-size: $font-size-caption;
  text-align: center;

  &::before,
  &::after {
    margin: 0 $space-2;
    color: $color-accent-clay;
    content: "—";
  }
}
</style>
