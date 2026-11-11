<template>
  <view class="app-bottom-nav">
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
  height: $nav-height;
  padding-bottom: constant(safe-area-inset-bottom);
  padding-bottom: env(safe-area-inset-bottom);
  display: flex;
  border-top: 1rpx solid $color-line;
  background: rgba(255, 255, 255, 0.98);
  box-shadow: 0 -4rpx 16rpx rgba(32, 66, 75, 0.05);

  /* 宽屏 H5 下与内容区同宽并居中 */
  @media (min-width: 768px) {
    right: auto;
    left: 50%;
    width: $desktop-content-width;
    transform: translateX(-50%);
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
  font-size: $font-size-caption;
  line-height: $line-height-tight;
}

.nav-icon {
  font-size: 40rpx;
}

.nav-item.is-active {
  color: #ec8302;
  font-weight: $font-weight-semibold;
  text-shadow: 0 0 14rpx rgba(236, 131, 2, 0.45);
}

.nav-item.is-active .nav-icon {
  filter: drop-shadow(0 0 8rpx rgba(236, 131, 2, 0.5));
}
</style>
