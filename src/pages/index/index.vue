<template>
  <view class="home-page">
    <app-page-header title="妙笔生花" />

    <scroll-view
      scroll-y
      :show-scrollbar="false"
      class="main-scroll"
      :scroll-into-view="scrollIntoId"
      scroll-with-animation
    >
      <view class="page-body">
        <!-- 主视觉 -->
        <view class="hero">
          <text class="hero-title">妙笔生花 一念成画</text>
          <text class="hero-subtitle">AI 帮你把灵感变成作品</text>
          <view class="hero-art">
            <app-image class="hero-image" src="/static/home/home.jpg" mode="aspectFill" />
            <view class="hero-label">今日推荐</view>
            <view class="hero-caption">AI 大模型</view>
            <view class="hero-hint">提示词：温馨治愈，青绿设色，微风拂动 ...</view>
          </view>
          <view class="hero-meta"> </view>
          <view class="hero-actions">
            <button class="action-primary" @click="goWorkbench">开始创作</button>
            <button class="action-secondary" @click="browseIdeas">
              <!-- #ifdef H5 -->
              <el-icon class="action-star"><Star /></el-icon>
              <!-- #endif -->
              浏览灵感
            </button>
          </view>
        </view>

        <!-- 灵感工坊 -->
        <view id="workshop-anchor" class="workshop">
          <view class="workshop-card">
            <view class="workshop-head">
              <text class="workshop-title">灵感工坊</text>
              <text class="workshop-subtitle">选择一种创作方式，把想法变成作品</text>
            </view>
            <view
              v-for="(mode, index) in creationModes"
              :key="mode.key"
              class="mode-row"
              :class="`mode-row-${index + 1}`"
              @click="openMode(mode.url)"
            >
              <view class="mode-icon">
                <!-- #ifdef H5 -->
                <el-icon><component :is="mode.icon" /></el-icon>
                <!-- #endif -->
              </view>
              <view class="mode-copy">
                <text class="mode-name">{{ mode.name }}</text>
                <text class="mode-note">{{ mode.note }}</text>
              </view>
              <!-- #ifdef H5 -->
              <el-icon class="mode-arrow"><ArrowRight /></el-icon>
              <!-- #endif -->
            </view>
          </view>
        </view>

        <!-- 创作想法入口：仅展示，不提供点击交互 -->
        <view class="prompt-bar">
          <text class="prompt-placeholder">输入你的创作想法</text>
          <view class="prompt-button">
            <!-- #ifdef H5 -->
            <el-icon class="prompt-edit"><EditPen /></el-icon>
            <!-- #endif -->
            <text>去探索</text>
          </view>
        </view>

        <view class="quote">— {{ quote }} —</view>
      </view>
    </scroll-view>

    <app-bottom-nav active="drafts" />
  </view>
</template>

<script setup>
import { computed, ref } from "vue";

// #ifdef H5
import {
  ArrowRight,
  Brush,
  EditPen,
  MagicStick,
  Star,
  VideoPlay,
} from "@element-plus/icons-vue";
// #endif

import AppBottomNav from "@/components/AppBottomNav/index.vue";
import AppImage from "@/components/AppImage/index.vue";
import AppPageHeader from "@/components/AppPageHeader/index.vue";

const homeData = {
  weather_text: "今日谷雨",
  quote: "造法自然 · 意致千里",
  generated_count: 1280,
};
const creationModes = [
  {
    key: "image",
    name: "文字生图",
    note: "字句勾勒意境",
    icon: Brush,
    url: "/pages/image-creation/index",
  },
  {
    key: "video",
    name: "视频创作",
    note: "融汇静止为流动",
    icon: VideoPlay,
    url: "/pages/video-creation/index",
  },
  {
    key: "optimization",
    name: "图片优化",
    note: "一键唤醒纤毫纹理",
    icon: MagicStick,
    url: "/pages/image-optimization/index",
  },
];
const scrollIntoId = ref("");

const weatherText = computed(() => homeData.weather_text);
const quote = computed(() => homeData.quote);
const generatedCountText = computed(() =>
  String(homeData.generated_count).replace(/\B(?=(\d{3})+(?!\d))/g, ",")
);

// 进入创作台开始创作
const goWorkbench = () => {
  uni.navigateTo({ url: "/pages/workbench/index" });
};

// 滚动到灵感工坊区块
const browseIdeas = () => {
  scrollIntoId.value = "";

  // 先清空再赋值，保证重复点击也能触发滚动
  setTimeout(() => {
    scrollIntoId.value = "workshop-anchor";
  }, 50);
};

/**
 * 打开对应创作方式页面。
 *
 * @param {string} url 创作页面地址。
 * @returns {void}
 */
const openMode = (url) => {
  if (!url) {
    return;
  }

  uni.navigateTo({ url });
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
  align-items: baseline;
  gap: $space-3;
  min-width: 0;
}

.greeting-title {
  flex-shrink: 0;
  color: $color-primary-soft;
  font-size: $font-size-body;
  font-weight: $font-weight-semibold;
}

.greeting-desc {
  flex: 1;
  min-width: 0;
  color: $color-muted;
  font-size: $font-size-caption;
  @include text-ellipsis;
}

.weather {
  flex-shrink: 0;
  color: $color-muted;
  font-size: $font-size-caption;
}

/* 主视觉 */
.hero {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.hero-title {
  color: #ec8302;
  font-size: 56rpx;
  font-weight: $font-weight-bold;
  letter-spacing: 4rpx;
}

.hero-subtitle {
  color: #9e7239;
  font-size: $font-size-caption;
}

.hero-art {
  position: relative;
  width: 90%;
  height: 300rpx;
  margin-top: $space-5;
  padding: 8rpx;
  border-radius: 36rpx;
  background: #fff;
  box-shadow: 0 16rpx 40rpx rgba(190, 140, 70, 0.12);
  box-sizing: border-box;
}

.hero-image {
  width: 100%;
  height: 100%;
  border-radius: 28rpx;
}

/* 图片上的文字靠底部渐变保证可读性 */
.hero-art:after {
  content: "";
  position: absolute;
  inset: 10rpx;
  border-radius: 28rpx;
  background: linear-gradient(180deg, transparent 40%, rgba(45, 53, 50, 0.55) 100%);
}

.hero-label,
.hero-caption,
.hero-hint {
  position: absolute;
  z-index: 1;
  left: $space-6;
  right: $space-6;
  color: #fff;
}

.hero-label {
  top: $space-5;
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
  bottom: $space-5;
  font-size: $font-size-caption;
  opacity: 0.86;
  @include text-ellipsis;
}

.hero-meta {
  display: flex;
  align-items: center;
  gap: $space-2;
  width: 100%;
  margin-top: $space-4;
  padding: 0 $space-1;
  box-sizing: border-box;
}

.meta-title {
  color: #6b4423;
  font-size: $font-size-title;
  font-weight: $font-weight-bold;
}

.meta-subtitle {
  flex: 1;
  min-width: 0;
  color: #b3a08a;
  font-size: $font-size-caption;
  @include numeric;
}

.try-button {
  @include tap-area(64rpx);
  flex-shrink: 0;
  margin: 0;
  padding: 0 $space-4;
  border: 0;
  border-radius: $radius-pill;
  background: $color-primary;
  color: #fff;
  font-size: $font-size-caption;
  line-height: 1;
}

.try-button:after {
  border: 0;
}

.hero-actions {
  display: flex;
  align-items: center;
  gap: $space-8;
}

.action-primary {
  @include tap-area(80rpx);
  margin: 0;
  padding: 0 $space-8;
  border: 0;
  border-radius: $radius-pill;
  background: linear-gradient(135deg, #f3a851 0%, #e07f23 100%);
  color: #fff;
  font-size: $font-size-body;
  font-weight: $font-weight-bold;
  line-height: 1;
}

.action-primary:after {
  border: 0;
}

.action-secondary {
  @include tap-area(80rpx);
  display: flex;
  align-items: center;
  gap: $space-1;
  margin: 0;
  padding: 0 $space-5;
  border: 1rpx solid #ecd9bd;
  border-radius: $radius-pill;
  background: #fffdf8;
  color: #9a6b34;
  font-size: $font-size-body;
  line-height: 1;
}

.action-secondary:after {
  border: 0;
}

.action-star {
  color: #e8a24a;
  font-size: $font-size-aux;
}

/* 灵感工坊 */
.workshop {
  margin-top: $space-7;
}

/* 白色整体底卡：衬托在页面渐变背景上 */
.workshop-card {
  padding: $space-5;
  border: 1rpx solid rgba(255, 255, 255, 0.9);
  border-radius: 32rpx;
  background: #fff;
  box-shadow: 0 16rpx 40rpx rgba(190, 140, 70, 0.1),
    inset 0 1rpx 0 rgba(255, 255, 255, 0.9);
}

.workshop-head {
  display: flex;
  flex-direction: column;
  gap: $space-1;
  margin-bottom: $space-4;
}

.workshop-title {
  color: #6b4423;
  font-size: $font-size-title;
  font-weight: $font-weight-bold;
}

.workshop-subtitle {
  color: #b3a08a;
  font-size: $font-size-caption;
}

/* 功能行通用结构；配色由各行类名区分 */
.mode-row {
  display: flex;
  align-items: center;
  gap: $space-3;
  margin-top: $space-3;
  padding: $space-4;
  border: 1rpx solid transparent;
  border-radius: $radius-lg;
  transition: transform 0.15s ease;
}

.mode-row:active {
  transform: scale(0.98);
}

.mode-row-1 {
  border-color: #fffefc;
  background: linear-gradient(150deg, #ffebeb 0%, #fffefc 100%);
  box-shadow: 0 8rpx 22rpx rgba(226, 158, 66, 0.16);
}

.mode-row-2 {
  border-color: #fffefc;
  background: linear-gradient(150deg, #fbffed 0%, #fffefc 100%);
  box-shadow: 0 8rpx 22rpx rgba(200, 75, 49, 0.14);
}

.mode-row-3 {
  border-color: #f9fffc;
  background: linear-gradient(150deg, #f4fdf8 0%, #f3fff9 100%);
  box-shadow: 0 8rpx 22rpx rgba(5, 96, 76, 0.12);
}

.mode-icon {
  display: flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  width: 72rpx;
  height: 72rpx;
  color: #c26108;
  font-size: 44rpx;
}

.mode-row-2 .mode-icon {
  color: #b8402a;
}

.mode-row-3 .mode-icon {
  color: $color-primary;
}

.mode-copy {
  flex: 1;
  min-width: 0;
}

.mode-name {
  display: block;
  color: #6b4423;
  font-size: $font-size-body;
  font-weight: $font-weight-bold;
}

.mode-desc {
  display: block;
  margin-top: 4rpx;
  color: #8d7657;
  font-size: $font-size-caption;
  @include text-ellipsis;
}

.mode-note {
  display: block;
  margin-top: 2rpx;
  color: #b3a08a;
  font-size: $font-size-badge;
  @include text-ellipsis;
}

/* 各行文字随模块配色 */
.mode-row-1 .mode-name {
  color: #a34a08;
}

.mode-row-1 .mode-desc {
  color: #bc6215;
}

.mode-row-1 .mode-note {
  color: #d68d4a;
}

.mode-row-2 .mode-name {
  color: #b03a20;
}

.mode-row-2 .mode-desc {
  color: #c25136;
}

.mode-row-2 .mode-note {
  color: #d69a86;
}

.mode-row-3 .mode-name {
  color: #0c4f3e;
}

.mode-row-3 .mode-desc {
  color: #3f7263;
}

.mode-row-3 .mode-note {
  color: #6f9789;
}

.mode-arrow {
  flex-shrink: 0;
  color: #d8c3a5;
  font-size: $font-size-aux;
}

/* 创作想法入口 */
.prompt-bar {
  display: flex;
  align-items: center;
  gap: $space-3;
  margin-top: $space-6;
  padding: $space-2 $space-2 $space-2 $space-4;
  border: 1rpx solid #f0e2c8;
  border-radius: $radius-pill;
  background: #fffdf8;
  box-shadow: 0 8rpx 24rpx rgba(190, 140, 70, 0.08);
}

.prompt-placeholder {
  flex: 1;
  min-width: 0;
  color: #c4ad8d;
  font-size: $font-size-caption;
}

.prompt-button {
  @include tap-area(64rpx);
  display: flex;
  flex-shrink: 0;
  align-items: center;
  gap: 6rpx;
  padding: 0 $space-4;
  border-radius: $radius-pill;
  background: linear-gradient(135deg, #f3a851 0%, #e07f23 100%);
  color: #fff;
  font-size: $font-size-caption;
  font-weight: $font-weight-bold;
}

.prompt-edit {
  font-size: $font-size-badge;
}

/* 底部卷尾语 */
.quote {
  padding: $space-5 0;
  color: $color-muted;
  font-size: $font-size-caption;
  text-align: center;
}
</style>
