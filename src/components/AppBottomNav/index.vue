<template>
  <view class="app-bottom-nav">
    <view
      v-for="item in NAV_ITEMS"
      :key="item.key"
      class="nav-item"
      :class="{ 'is-active': active === item.key }"
      @tap="navigateTo(item)"
    >
      <text>{{ item.label }}</text>
    </view>
  </view>
</template>

<script setup>
const NAV_ITEMS = [
  { key: "drafts", label: "文稿库", url: "/pages/index/index" },
  { key: "creation", label: "创作台", url: "/pages/workbench/index" },
  { key: "works", label: "作品库", url: "/pages/library/index" },
  {
    key: "workshop",
    label: "工作坊",
    url: "/pages/under-development/index?title=工作坊",
  },
];

/**
 * 当前激活的导航项。
 * @property {"drafts" | "creation" | "works" | "workshop"} active 当前导航标识。
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
  color: $color-muted;
  font-size: $font-size-caption;
  line-height: $line-height-tight;
}

.nav-item.is-active {
  color: $color-primary;
  font-weight: $font-weight-semibold;
}
</style>
