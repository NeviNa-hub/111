<template>
  <view class="inspiration-carousel">
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
      class="carousel-state"
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
  </view>
</template>

<script setup>
import { ref } from "vue";

import AppStateHint from "@/components/AppStateHint/index.vue";

const creations = [
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
    title: "视频创作",
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
];
const creationCount = creations.length;
const currentCreation = ref(0);
const touchStartX = ref(0);

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
  if (!creationCount) {
    return "";
  }

  if (index === currentCreation.value) {
    return "active";
  }

  return index === (currentCreation.value + 1) % creationCount ? "right" : "left";
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
  if (!creationCount) {
    return;
  }

  const distance = event.changedTouches[0].clientX - touchStartX.value;

  if (distance > 50) {
    selectCreation((currentCreation.value - 1 + creationCount) % creationCount);
  }

  if (distance < -50) {
    selectCreation((currentCreation.value + 1) % creationCount);
  }
};
</script>

<style scoped lang="scss">
.inspiration-carousel {
  width: 100%;
}

.carousel-state {
  margin-top: 28rpx;
}

/* 灵感工坊轮播 */
.carousel-stage {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 28rpx 0;
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
  padding: 28rpx;
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
  margin-top: 8rpx;
  color: #202022;
  font-size: 30rpx;
  font-weight: 700;
}

.card-label {
  display: block;
  color: rgba(32, 32, 34, 0.38);
  font-size: 24rpx;
  font-weight: 600;
  letter-spacing: 2rpx;
}

.mock-input {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 24rpx;
  padding: 16rpx 20rpx;
  border-top: 1rpx solid rgba(212, 189, 150, 0.3);
  border-bottom: 1rpx solid rgba(212, 189, 150, 0.3);
  background: #faf9f5;
  font-size: 24rpx;
}

.input-prefix {
  flex-shrink: 0;
  color: #9b999f;
}

.input-value {
  flex: 1;
  min-width: 0;
  color: #2d2b30;
  @include text-ellipsis;
}

.input-icon {
  flex-shrink: 0;
  margin-left: 16rpx;
  color: #c84b31;
}

.card-bottom {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16rpx;
  padding-top: 16rpx;
  border-top: 1rpx solid rgba(32, 32, 34, 0.07);
  font-size: 24rpx;
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
  border-radius: 999rpx;
  background: $color-primary;
  color: #fff;
  font-size: 24rpx;
  font-weight: 700;
}

.pagination-dots {
  padding: 8rpx 0 16rpx;
  text-align: center;
}

.pagination-dots text {
  position: relative;
  display: inline-block;
  width: 10rpx;
  height: 10rpx;
  margin: 0 16rpx;
  border-radius: 50%;
  background: #d1d5d4;
}

.pagination-dots text::before {
  position: absolute;
  top: (-16rpx);
  right: (-12rpx);
  bottom: (-16rpx);
  left: (-12rpx);
  content: "";
}

.pagination-dots .active-dot {
  width: 40rpx;
  border-radius: 8rpx;
  background: #8a6840;
}
</style>
