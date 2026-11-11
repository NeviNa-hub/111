<template>
  <view class="development-page">
    <app-page-header :title="title" />
    <scroll-view scroll-y :show-scrollbar="false" class="content-area">
      <view class="content-card">
        <view class="icon"></view>
        <text class="title">{{ title }}正在建设中</text>
        <text class="description">该功能暂未开放，我们正在持续完善创作体验。</text>
        <button class="primary-button" @tap="goWorkbench">返回创作台</button>
        <button class="secondary-button" @tap="goBack">返回上一页</button>
      </view>
      <!-- 灵感工坊：功能未开放时同样提供创作入口 -->
      <inspiration-carousel class="workshop-section" />
    </scroll-view>
    <app-bottom-nav active="workshop" />
  </view>
</template>

<script setup>
import { ref } from "vue";
import { onLoad } from "@dcloudio/uni-app";

import AppBottomNav from "@/components/AppBottomNav/index.vue";
import AppPageHeader from "@/components/AppPageHeader/index.vue";
import InspirationCarousel from "@/components/InspirationCarousel/index.vue";

const title = ref("功能");

/**
 * 读取待开发功能名称。
 * @param {{title?: string}} query 页面查询参数。
 * @returns {void}
 */
onLoad((query) => {
  title.value = query.title ? decodeURIComponent(query.title) : "功能";
  uni.setNavigationBarTitle({ title: `${title.value}建设中` });
});

// 返回创作台。
const goWorkbench = () => {
  uni.reLaunch({ url: "/pages/workbench/index" });
};

// 返回上一页。
const goBack = () => {
  uni.navigateBack();
};
</script>

<style scoped lang="scss">
.development-page {
  display: flex;
  flex-direction: column;
  height: 100vh;
  box-sizing: border-box;
  overflow: hidden;
  background: linear-gradient(180deg, #ffecd2 0%, #fff8ec 48%, #fffdfb 100%);
  color: $color-ink;
}

.content-area {
  height: calc(100vh - 210rpx - var(--status-bar-height, 0px));
  overflow-x: hidden;
  padding: 0 32rpx calc(140rpx + env(safe-area-inset-bottom));
  box-sizing: border-box;
}

.content-card {
  width: 100%;
  margin-top: 28rpx;
  padding: 64rpx 40rpx;
  box-sizing: border-box;
  border: 1rpx solid $color-line;
  border-radius: 28rpx;
  background: $color-surface;
  box-shadow: 0 8rpx 24rpx rgba(22, 53, 47, 0.06);
  text-align: center;
}

.workshop-section {
  margin-bottom: 28rpx;
}

.icon {
  width: 112rpx;
  height: 112rpx;
  margin: 0 auto;
  border-radius: 50%;
  background: #f7edde;
  color: $color-primary;
  font-size: 56rpx;
  line-height: 112rpx;
}

.title,
.description {
  display: block;
}

.title {
  margin-top: 32rpx;
  color: $color-primary;
  font-size: 38rpx;
  font-weight: 700;
  line-height: 1.3;
}

.description {
  margin: 20rpx 0 40rpx;
  color: $color-muted;
  font-size: 24rpx;
  line-height: 1.8;
}

.primary-button,
.secondary-button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: $tap-size;
  padding: 0;
  box-sizing: border-box;
  border-radius: 20rpx;
  font-size: 28rpx;
  line-height: 1.3;
}

.primary-button:after,
.secondary-button:after {
  border: 0;
}

.primary-button {
  border: 0;
  background: $color-primary;
  color: #fff;
  font-weight: 600;
}

.secondary-button {
  margin-top: 16rpx;
  border: 1rpx solid $color-line;
  background: $color-surface;
  color: #4e665e;
}
</style>
