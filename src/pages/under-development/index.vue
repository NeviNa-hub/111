<template>
  <view class="development-page">
    <app-page-header :title="title" />
    <scroll-view scroll-y :show-scrollbar="false" class="content-area">
      <view class="content-inner">
        <view class="content-card">
          <text class="title">{{ title }}正在建设中</text>
          <text class="description">
            该功能暂未开放，正在持续完善中。去试试其他功能吧！</text
          >

          <!-- 灵感工坊：功能未开放时同样提供创作入口 -->
          <inspiration-carousel class="workshop-carousel" />
          <button class="secondary-button" @tap="goBack">返回上一页</button>
        </view>
      </view>
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
  box-sizing: border-box;
}

/* 内容整体垂直居中；内容超高时随内容增高并可滚动 */
.content-inner {
  display: flex;
  flex-direction: column;
  justify-content: center;
  min-height: calc(100vh - 210rpx - var(--status-bar-height, 0px));
  padding: 0 32rpx calc(140rpx + env(safe-area-inset-bottom));
  box-sizing: border-box;
}

.content-card {
  width: 100%;
  padding: 64rpx 40rpx;
  box-sizing: border-box;
  border: 1rpx solid $color-line;
  border-radius: 28rpx;
  background: $color-surface;
  box-shadow: 0 8rpx 24rpx rgba(22, 53, 47, 0.06);
  text-align: center;
}

/* ============================================================
 * 桌面 H5 适配：1200px 以上内容卡限宽居中
 * ============================================================ */
@media (min-width: $breakpoint-desktop) {
  .content-inner {
    align-items: center;
  }

  .content-card {
    max-width: 640px;
  }
}

.workshop-carousel {
  margin-bottom: 24rpx;
  text-align: left;
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

.secondary-button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: $tap-size;
  margin-top: 16rpx;
  padding: 0;
  box-sizing: border-box;
  border: 1rpx solid $color-line;
  border-radius: 20rpx;
  background: $color-surface;
  color: #4e665e;
  font-size: 28rpx;
  line-height: 1.3;
}

.secondary-button:after {
  border: 0;
}
</style>
