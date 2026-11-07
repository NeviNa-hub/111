<template>
  <view class="development-page">
    <app-page-header :title="title" />
    <view class="content-area">
      <view class="content-card">
        <view class="icon"></view>
        <text class="title">{{ title }}正在建设中</text>
        <text class="description"
          >该功能暂未开放，我们正在持续完善创作体验。</text
        >
        <button class="primary-button" @tap="goWorkbench">返回创作台</button>
        <button class="secondary-button" @tap="goBack">返回上一页</button>
      </view>
    </view>
    <app-bottom-nav active="workshop" />
  </view>
</template>

<script setup>
import { ref } from "vue";
import { onLoad } from "@dcloudio/uni-app";

import AppBottomNav from "@/components/AppBottomNav/index.vue";
import AppPageHeader from "@/components/AppPageHeader/index.vue";

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
  background: $color-bg-page;
  color: $color-ink;
}

.content-area {
  flex: 1;
  min-height: 0;
  display: flex;
  padding: 0 $space-7 calc(140rpx + env(safe-area-inset-bottom));
  box-sizing: border-box;
}

.content-card {
  width: 100%;
  margin: auto;
  transform: translateY(-$space-6);
  padding: $space-10 $space-8;
  box-sizing: border-box;
  border: 1rpx solid $color-line;
  border-radius: $radius-2xl;
  background: $color-surface;
  box-shadow: $shadow-card;
  text-align: center;
}

.icon {
  width: 112rpx;
  height: 112rpx;
  margin: 0 auto;
  border-radius: 50%;
  background: $color-primary-light;
  color: $color-primary;
  font-size: $font-size-display;
  line-height: 112rpx;
}

.title,
.description {
  display: block;
}

.title {
  margin-top: $space-7;
  color: $color-primary;
  font-size: $font-size-page-title;
  font-weight: $font-weight-bold;
  line-height: $line-height-tight;
}

.description {
  margin: $space-4 0 $space-8;
  color: $color-muted;
  font-size: $font-size-caption;
  line-height: $line-height-relaxed;
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
  border-radius: $radius-lg;
  font-size: $font-size-body;
  line-height: $line-height-tight;
}

.primary-button:after,
.secondary-button:after {
  border: 0;
}

.primary-button {
  border: 0;
  background: $color-primary;
  color: #fff;
  font-weight: $font-weight-semibold;
}

.secondary-button {
  margin-top: $space-3;
  border: 1rpx solid $color-line;
  background: $color-surface;
  color: $color-ink-soft;
}
</style>
