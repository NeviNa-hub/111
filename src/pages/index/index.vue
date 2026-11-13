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
            <app-image
              class="hero-image"
              src="/static/home/home.jpg"
              mode="aspectFill"
            />
            <view class="hero-label">今日推荐</view>
            <view class="hero-caption">AI 大模型</view>
            <view class="hero-hint"
              >提示词：温馨治愈，青绿设色，微风拂动 ...</view
            >
          </view>
          <view class="hero-actions">
            <button class="action-primary" @click="goWorkbench">
              开始创作
            </button>
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
              <text class="workshop-subtitle">换一种方式打开灵感</text>
            </view>
            <view class="mode-grid">
              <view
                v-for="mode in creationModes"
                :key="mode.key"
                class="mode-card"
                :class="`is-${mode.key}`"
                @click="openMode(mode.url)"
              >
                <view class="mode-copy">
                  <text class="mode-name">{{ mode.name }}</text>
                  <text class="mode-desc">{{ mode.desc }}</text>
                </view>
                <view class="mode-icon">
                  <!-- #ifdef H5 -->
                  <el-icon><component :is="mode.icon" /></el-icon>
                  <!-- #endif -->
                </view>
                <!-- 功能模块装饰元素 -->
                <view class="mode-deco">
                  <view class="deco-item deco-a"></view>
                  <view class="deco-item deco-b"></view>
                  <view class="deco-item deco-c"></view>
                </view>
              </view>
            </view>
          </view>
        </view>

        <!-- 创作想法入口：仅展示，不提供点击交互 -->
        <view class="prompt-bar">
          <text class="prompt-placeholder">
            {{ typedPrompt }}
            <text class="prompt-caret"></text>
          </text>
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
import { computed, onUnmounted, ref } from "vue";

// #ifdef H5
import {
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
  quote: "造法自然 · 意致千里",
};
const creationModes = [
  {
    key: "image",
    name: "文字生图",
    desc: "落笔成画",
    icon: Brush,
    url: "/pages/image-creation/index",
  },
  {
    key: "video",
    name: "视频创作",
    desc: "让画面动起来",
    icon: VideoPlay,
    url: "/pages/video-creation/index",
  },
  {
    key: "optimization",
    name: "图片优化",
    desc: "焕新细节",
    icon: MagicStick,
    url: "/pages/image-optimization/index",
  },
];
const scrollIntoId = ref("");

/* 打字机循环展示的创作想法 */
const PROMPT_IDEAS = [
  "我想创作出一幅青绿山水…",
  "帮我画一只慵懒的橘猫…",
  "创作一段治愈的画面…",
];
const TYPE_SPEED = 140;
const ERASE_SPEED = 60;
const HOLD_FULL = 1800;
const HOLD_EMPTY = 500;

const typedPrompt = ref("");
let typeTimer = null;

const quote = computed(() => homeData.quote);

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
 * 打字机效果：逐字敲出创作想法，停留后删除并切换下一条，循环播放。
 *
 * @param {number} ideaIndex 当前展示的想法下标。
 * @param {number} charIndex 已处理的字符数。
 * @param {boolean} isErasing 是否处于删除阶段。
 * @returns {void}
 */
const runTypewriter = (ideaIndex = 0, charIndex = 0, isErasing = false) => {
  const idea = PROMPT_IDEAS[ideaIndex];

  if (!isErasing) {
    typedPrompt.value = idea.slice(0, charIndex + 1);

    if (charIndex + 1 >= idea.length) {
      typeTimer = setTimeout(
        () => runTypewriter(ideaIndex, charIndex, true),
        HOLD_FULL,
      );
      return;
    }

    typeTimer = setTimeout(
      () => runTypewriter(ideaIndex, charIndex + 1, false),
      TYPE_SPEED,
    );
    return;
  }

  typedPrompt.value = idea.slice(0, charIndex);

  if (charIndex <= 0) {
    const nextIndex = (ideaIndex + 1) % PROMPT_IDEAS.length;
    typeTimer = setTimeout(
      () => runTypewriter(nextIndex, 0, false),
      HOLD_EMPTY,
    );
    return;
  }

  typeTimer = setTimeout(
    () => runTypewriter(ideaIndex, charIndex - 1, true),
    ERASE_SPEED,
  );
};

// 页面进入即开始打字机动画
runTypewriter();

onUnmounted(() => {
  clearTimeout(typeTimer);
});

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
  background: linear-gradient(180deg, #ffecd2 0%, #fff8ec 48%, #fffdfb 100%);
  color: $color-ink;
}

.main-scroll {
  height: calc(100vh - 210rpx - var(--status-bar-height, 0px));
  overflow-x: hidden;
  padding: 12rpx 32rpx;
  padding-bottom: calc(#{20rpx} + env(safe-area-inset-bottom));
  box-sizing: border-box;
}

.page-body {
  padding-top: 12rpx;
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
  font-weight: 700;
  letter-spacing: 4rpx;
}

.hero-subtitle {
  color: #9e7239;
  font-size: 24rpx;
}

.hero-art {
  position: relative;
  width: 90%;
  height: 300rpx;
  margin-top: 24rpx;
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
  background: linear-gradient(
    180deg,
    transparent 40%,
    rgba(45, 53, 50, 0.55) 100%
  );
}

.hero-label,
.hero-caption,
.hero-hint {
  position: absolute;
  z-index: 1;
  left: 28rpx;
  right: 28rpx;
  color: #fff;
}

.hero-label {
  top: 24rpx;
  right: auto;
  padding: 8rpx 16rpx;
  border-radius: 999rpx;
  background: rgba(255, 255, 255, 0.84);
  color: #8a6840;
  font-size: 24rpx;
}

.hero-caption {
  bottom: 58rpx;
  font-size: 28rpx;
  font-weight: 700;
  @include text-ellipsis;
}

.hero-hint {
  bottom: 24rpx;
  font-size: 24rpx;
  opacity: 0.86;
  @include text-ellipsis;
}

.hero-actions {
  display: flex;
  align-items: center;
  gap: 40rpx;
  margin-top: 20rpx;
}

.action-primary {
  @include tap-area(80rpx);
  margin: 0;
  padding: 0 40rpx;
  border: 0;
  border-radius: 999rpx;
  background: linear-gradient(135deg, #f3a851 0%, #e07f23 100%);
  color: #fff;
  font-size: 28rpx;
  font-weight: 700;
  line-height: 1;
}

.action-primary:after {
  border: 0;
}

.action-secondary {
  @include tap-area(80rpx);
  display: flex;
  align-items: center;
  gap: 8rpx;
  margin: 0;
  padding: 0 24rpx;
  border: 1rpx solid #ecd9bd;
  border-radius: 999rpx;
  background: #fffdf8;
  color: #9a6b34;
  font-size: 28rpx;
  line-height: 1;
}

.action-secondary:after {
  border: 0;
}

.action-star {
  color: #e8a24a;
  font-size: 26rpx;
}

/* 灵感工坊 */
.workshop {
  margin-top: 32rpx;
}

/* 白色整体底卡：衬托在页面渐变背景上 */
.workshop-card {
  padding: 24rpx;
  border: 1rpx solid rgba(255, 255, 255, 0.9);
  border-radius: 32rpx;
  background: #fff;
  box-shadow:
    0 16rpx 40rpx rgba(190, 140, 70, 0.1),
    inset 0 1rpx 0 rgba(255, 255, 255, 0.9);
}

.workshop-head {
  display: flex;
  flex-direction: column;
  gap: 8rpx;
  margin-bottom: 20rpx;
}

.workshop-title {
  color: #6b4423;
  font-size: 34rpx;
  font-weight: 700;
}

.workshop-subtitle {
  color: #b3a08a;
  font-size: 24rpx;
}

/* 功能宫格：前两张半宽并排，第三张通栏 */
.mode-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 20rpx;
}

.mode-card {
  position: relative;
  display: flex;
  align-items: center;
  width: calc(50% - 10rpx);
  min-height: 190rpx;
  padding: 24rpx;
  border-radius: 24rpx;
  box-sizing: border-box;
  overflow: hidden;
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;
}

/* 一道高光从左上角扫到右下角，循环播放 */
.mode-card::after {
  content: "";
  position: absolute;
  top: -60%;
  left: -80%;
  width: 60%;
  height: 220%;
  background: linear-gradient(
    105deg,
    transparent 0%,
    rgba(255, 255, 255, 0.34) 45%,
    rgba(255, 255, 255, 0.5) 50%,
    rgba(255, 255, 255, 0.34) 55%,
    transparent 100%
  );
  transform: rotate(8deg);
  animation: card-shine 3.6s ease-in-out infinite;
  pointer-events: none;
}

/* 错开三张卡的扫光时机，避免同步闪烁 */
.is-video::after {
  animation-delay: 0.6s;
}

.is-optimization::after {
  animation-delay: 1.2s;
}

@keyframes card-shine {
  0% {
    left: -80%;
  }

  55%,
  100% {
    left: 130%;
  }
}

/* H5 鼠标悬停：轻微上浮加深阴影 */
@media (hover: hover) {
  .mode-card:hover {
    transform: translateY(-6rpx);
    box-shadow: 0 18rpx 36rpx rgba(150, 100, 40, 0.28);
  }
}

.mode-card:active {
  transform: scale(0.97);
}

.is-optimization {
  width: 100%;
}

/* ============================================================
 * 桌面 H5 适配：1200px 以上功能宫格三张等宽并列
 * ============================================================ */
@media (min-width: $breakpoint-desktop) {
  .main-scroll {
    height: calc(100vh - 100rpx - var(--status-bar-height, 0px));
  }

  .page-body {
    width: 100%;
  }

  .hero-art {
    width: 100%;
    max-width: 1000px;
    height: 260px;
  }

  .hero-actions {
    margin-top: 20px;
  }

  .mode-card,
  .is-optimization {
    width: calc((100% - 40rpx) / 3);
  }
}

/* 文字生图 · 暖黄 */
.is-image {
  background: linear-gradient(150deg, #f8e7c3 0%, #f2d59b 100%);
  box-shadow: 0 10rpx 24rpx rgba(200, 150, 60, 0.22);
}

/* 视频创作 · 青绿 */
.is-video {
  background: linear-gradient(150deg, #d9eee6 0%, #b9ddcf 100%);
  box-shadow: 0 10rpx 24rpx rgba(90, 150, 125, 0.22);
}

/* 图片优化 · 暖橙 */
.is-optimization {
  background: linear-gradient(150deg, #fdeeda 0%, #f8ddba 100%);
  box-shadow: 0 10rpx 24rpx rgba(210, 150, 80, 0.22);
}

.mode-copy {
  display: flex;
  flex-direction: column;
  gap: 8rpx;
}

.mode-name {
  color: #6b4423;
  font-size: 32rpx;
  font-weight: 700;
  line-height: 1.3;
}

.mode-desc {
  color: #a9803f;
  font-size: 24rpx;
  line-height: 1.4;
}

.is-video .mode-name {
  color: #2f5d50;
}

.is-video .mode-desc {
  color: #5d8879;
}

/* 右上角图标 */
.mode-icon {
  position: absolute;
  top: 24rpx;
  right: 24rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 80rpx;
}

.is-image .mode-icon {
  color: #c08a2e;
}

.is-video .mode-icon {
  color: #4e8f7b;
}

.is-optimization .mode-icon {
  color: #d98a3e;
}

/* 卡片角落装饰：默认隐藏，按模块覆写 */
.mode-deco {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.deco-item {
  position: absolute;
  opacity: 0.5;
}

/* 文字生图 · 右下墨竹枝：细枝 + 三片竹叶 */
.is-image .deco-a {
  right: 40rpx;
  bottom: 30rpx;
  width: 3rpx;
  height: 70rpx;
  border-radius: 3rpx;
  background: #9a7434;
  transform: rotate(38deg);
  transform-origin: bottom center;
}

.is-image .deco-b {
  right: 58rpx;
  bottom: 72rpx;
  width: 26rpx;
  height: 8rpx;
  border-radius: 8rpx 100% 100% 8rpx;
  background: #9a7434;
  transform: rotate(-24deg);
}

.is-image .deco-c {
  right: 44rpx;
  bottom: 96rpx;
  width: 22rpx;
  height: 7rpx;
  border-radius: 7rpx 100% 100% 7rpx;
  background: #9a7434;
  transform: rotate(30deg);
}

/* 视频创作 · 左下胶片条：带齿孔的小段胶片 */
.is-video .deco-a {
  left: 20rpx;
  bottom: 22rpx;
  width: 84rpx;
  height: 26rpx;
  border: 3rpx solid #4e8f7b;
  border-radius: 6rpx;
  background: repeating-linear-gradient(
    90deg,
    transparent 0,
    transparent 8rpx,
    rgba(78, 143, 123, 0.55) 8rpx,
    rgba(78, 143, 123, 0.55) 16rpx
  );
  transform: rotate(-12deg);
}

.is-video .deco-b {
  right: 36rpx;
  bottom: 30rpx;
  width: 22rpx;
  height: 22rpx;
  border: 3rpx solid #4e8f7b;
  border-radius: 50%;
}

.is-video .deco-c {
  right: 110rpx;
  bottom: 20rpx;
  width: 12rpx;
  height: 12rpx;
  border-radius: 50%;
  background: #4e8f7b;
}

/* 图片优化 · 右下放大镜：镜框 + 手柄 + 高光点 */
.is-optimization .deco-a {
  right: 120rpx;
  bottom: 34rpx;
  width: 44rpx;
  height: 44rpx;
  border: 4rpx solid #d98a3e;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.35);
}

.is-optimization .deco-b {
  right: 106rpx;
  bottom: 24rpx;
  width: 30rpx;
  height: 6rpx;
  border-radius: 6rpx;
  background: #d98a3e;
  transform: rotate(45deg);
  transform-origin: right center;
}

.is-optimization .deco-c {
  right: 190rpx;
  bottom: 60rpx;
  width: 10rpx;
  height: 10rpx;
  border-radius: 50%;
  background: #d98a3e;
}

/* 创作想法入口 */
.prompt-bar {
  display: flex;
  align-items: center;
  gap: 16rpx;
  margin-top: 28rpx;
  padding: 12rpx 12rpx 12rpx 20rpx;
  border: 1rpx solid #f0e2c8;
  border-radius: 999rpx;
  background: #fffdf8;
  box-shadow: 0 8rpx 24rpx rgba(190, 140, 70, 0.08);
}

.prompt-placeholder {
  flex: 1;
  min-width: 0;
  color: #c4ad8d;
  font-size: 24rpx;
}

/* 打字机光标：跟随文案闪烁 */
.prompt-caret {
  display: inline-block;
  width: 2rpx;
  height: 24rpx;
  margin-left: 4rpx;
  background: #e07f23;
  vertical-align: -2rpx;
  animation: caret-blink 0.9s steps(1) infinite;
}

@keyframes caret-blink {
  0%,
  60% {
    opacity: 1;
  }

  61%,
  100% {
    opacity: 0;
  }
}

.prompt-button {
  @include tap-area(64rpx);
  display: flex;
  flex-shrink: 0;
  align-items: center;
  gap: 6rpx;
  padding: 0 20rpx;
  border-radius: 999rpx;
  background: linear-gradient(135deg, #f3a851 0%, #e07f23 100%);
  color: #fff;
  font-size: 24rpx;
  font-weight: 700;
}

.prompt-edit {
  font-size: 22rpx;
}

/* 底部卷尾语 */
.quote {
  padding: 24rpx 0;
  color: $color-muted;
  font-size: 24rpx;
  text-align: center;
}
</style>
