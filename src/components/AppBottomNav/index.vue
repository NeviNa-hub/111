<template>
  <view class="app-bottom-nav">
    <view class="nav-brand">妙笔生花</view>
    <view
      v-for="item in NAV_ITEMS"
      :key="item.key"
      class="nav-item"
      :class="{ 'is-active': active === item.key }"
      @tap="navigateTo(item)"
    >
      <!-- #ifdef H5 -->
      <el-icon class="nav-icon">
        <component :is="item.icon" />
      </el-icon>
      <!-- #endif -->
      <text>{{ item.label }}</text>
    </view>
  </view>
</template>

<script setup>
// #ifdef H5
import { Brush, Document, Grid, PictureFilled, User } from "@element-plus/icons-vue";
// #endif

const NAV_ITEMS = [
  { key: "drafts", label: "文稿库", icon: Document, url: "/pages/index/index" },
  {
    key: "creation",
    label: "创作台",
    icon: Brush,
    url: "/pages/workbench/index",
  },
  {
    key: "works",
    label: "作品库",
    icon: PictureFilled,
    url: "/pages/library/index",
  },
  {
    key: "workshop",
    label: "工作坊",
    icon: Grid,
    url: "/pages/under-development/index?title=工作坊",
  },
  { key: "profile", label: "我的", icon: User, url: "/pages/profile/index" },
];

/**
 * 当前激活的导航项。
 * @property {"drafts" | "creation" | "works" | "workshop" | "profile"} active 当前导航标识。
 */
const props = defineProps({ active: { type: String, required: true } });

/**
 * 切换主导航页面。
 * @param {{label: string, url: string}} item 导航配置。
 * @returns {void}
 */
const navigateTo = (item) => {
  if (props.active === item.key) {
    return;
  }

  uni.reLaunch({ url: item.url });
};
</script>

<style scoped lang="scss">
.app-bottom-nav {
  position: fixed;
  z-index: 20;
  right: 0;
  bottom: 0;
  left: 0;
  height: 102rpx;
  padding-bottom: constant(safe-area-inset-bottom);
  padding-bottom: env(safe-area-inset-bottom);
  display: flex;
  border-top: 1rpx solid $color-line;
  background: rgba(255, 255, 255, 0.98);
  box-shadow: 0 -4rpx 16rpx rgba(32, 66, 75, 0.05);

  /* 窄屏 H5 下与内容区同宽并居中 */
  @media (min-width: $breakpoint-tablet) and (max-width: 1199px) {
    right: auto;
    left: 50%;
    width: 750px;
    transform: translateX(-50%);
  }

  /* 桌面端改为容器左缘的纵向侧边导航 */
  @media (min-width: $breakpoint-desktop) {
    top: 0;
    right: auto;
    bottom: 0;
    left: 0;
    width: $desktop-sidebar;
    box-sizing: border-box;
    height: auto;
    padding: 40rpx 20rpx;
    flex-direction: column;
    gap: 12rpx;
    border-top: 0;
    border-right: 1rpx solid $color-line;
    box-shadow: none;
  }
}

/* 侧边导航顶部的品牌区，仅桌面端显示 */
.nav-brand {
  display: none;

  @media (min-width: $breakpoint-desktop) {
    display: block;
    margin-bottom: 32rpx;
    padding: 0 28rpx 32rpx;
    border-bottom: 1rpx solid $color-line;
    color: #ec8302;
    font-size: 40rpx;
    font-weight: 700;
    letter-spacing: 2rpx;
    white-space: nowrap;
  }
}

.nav-item {
  flex: 1;
  display: flex;
  align-items: center;
  flex-direction: column;
  justify-content: center;
  gap: 4rpx;
  color: $color-muted;
  font-size: 24rpx;
  line-height: 1.3;

  /* 桌面端为图标在左、文字在右的横向行项 */
  @media (min-width: $breakpoint-desktop) {
    flex: none;
    flex-direction: row;
    justify-content: flex-start;
    gap: 20rpx;
    padding: 26rpx 28rpx;
    border-radius: 20rpx;
    font-size: 28rpx;
    white-space: nowrap;
  }
}

.nav-icon {
  font-size: 40rpx;
}

.nav-item.is-active {
  color: #ec8302;
  font-weight: 600;
  text-shadow: 0 0 14rpx rgba(236, 131, 2, 0.45);

  @media (min-width: $breakpoint-desktop) {
    background: $color-primary-light;
    text-shadow: none;
  }
}

.nav-item.is-active .nav-icon {
  filter: drop-shadow(0 0 8rpx rgba(236, 131, 2, 0.5));

  @media (min-width: $breakpoint-desktop) {
    filter: none;
  }
}
</style>
