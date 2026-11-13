<template>
  <view class="profile-page">
    <app-page-header title="我的" />

    <scroll-view scroll-y :show-scrollbar="false" class="content">
      <view class="profile-layout">
        <!-- 用户信息卡 -->
        <view class="profile-card">
          <view class="identity">
            <view class="avatar">
              <!-- #ifdef H5 -->
              <el-icon><User /></el-icon>
              <!-- #endif -->
            </view>
            <view class="identity-copy">
              <view class="identity-name">
                <text class="username">{{ usernameText }}</text>
                <text class="identity-tag">灵感创作者</text>
              </view>
              <text class="account">账号 {{ accountText }}</text>
            </view>
          </view>

          <view class="points-entry" @tap="openPointsDialog">
            <view class="points-badge">
              <!-- #ifdef H5 -->
              <el-icon><Coin /></el-icon>
              <!-- #endif -->
            </view>
            <view class="points-copy">
              <text class="points-label">灵感点</text>
              <text class="points-value">{{ pointsText }}</text>
            </view>
            <view class="points-action">
              <text>积分流水</text>
              <!-- #ifdef H5 -->
              <el-icon class="points-action-icon"><ArrowRight /></el-icon>
              <!-- #endif -->
            </view>
          </view>
        </view>

        <!-- 常用功能 -->
        <view class="menu-card">
          <view class="menu-title">常用功能</view>
          <view
            v-for="item in menuItems"
            :key="item.key"
            class="menu-row"
            @tap="openMenu(item)"
          >
            <view class="menu-icon" :class="`is-${item.key}`">
              <!-- #ifdef H5 -->
              <el-icon><component :is="item.icon" /></el-icon>
              <!-- #endif -->
            </view>
            <text class="menu-label">{{ item.label }}</text>
            <!-- #ifdef H5 -->
            <el-icon class="menu-arrow"><ArrowRight /></el-icon>
            <!-- #endif -->
          </view>
        </view>
      </view>
    </scroll-view>

    <view class="logout-bar">
      <button
        class="logout-button"
        :disabled="isLoggingOut"
        @tap="handleLogout"
      >
        退出登录
      </button>
    </view>

    <view
      v-if="isPointsDialogVisible"
      class="points-mask"
      @tap="closePointsDialog"
    >
      <view class="points-sheet" @tap.stop>
        <view class="points-header">
          <text class="points-title">积分使用流水</text>
          <text class="points-close" @tap="closePointsDialog">×</text>
        </view>

        <view class="points-summary">
          <view class="summary-item">
            <text class="summary-label">当前余额</text>
            <text class="summary-value">{{ pointsText }}</text>
          </view>
          <view class="summary-item">
            <text class="summary-label">已使用</text>
            <text class="summary-value">{{ usedPointsText }}</text>
          </view>
        </view>

        <app-state-hint
          v-if="isPointsLoading"
          class="points-state"
          type="loading"
          title="正在载入积分流水"
        />
        <app-state-hint
          v-else-if="pointsLoadError"
          class="points-state"
          type="error"
          title="积分流水加载失败"
          description="请检查网络后重试"
          action-text="重新加载"
          @action="loadPointsInfo"
        />
        <scroll-view
          v-else-if="pointsItems.length"
          scroll-y
          :show-scrollbar="false"
          class="points-list"
        >
          <view
            v-for="item in pointsItems"
            :key="item.ledger_id"
            class="points-item"
          >
            <text class="points-item-time">
              {{ formatDateTime(item.created_at) }}
            </text>
            <text
              class="points-item-value"
              :class="{ 'is-used': item.delta < 0 }"
            >
              {{ item.delta }}
            </text>
          </view>
        </scroll-view>
        <app-state-hint
          v-else
          class="points-state"
          type="empty"
          title="暂无积分流水"
          description="完成创作或消耗灵感点后会记录在这里"
        />
      </view>
    </view>

    <app-bottom-nav active="profile" />
  </view>
</template>

<script setup>
import { computed, onMounted, ref } from "vue";

// #ifdef H5
import {
  ArrowRight,
  Brush,
  Coin,
  Grid,
  PictureFilled,
  Setting,
  User,
} from "@element-plus/icons-vue";
// #endif

import { logoutUser } from "@/apis/auth";
import { PAGE_PATHS } from "@/apis/constants";
import { getPointsInfo } from "@/apis/points";
import AppBottomNav from "@/components/AppBottomNav/index.vue";
import AppPageHeader from "@/components/AppPageHeader/index.vue";
import AppStateHint from "@/components/AppStateHint/index.vue";
import {
  clearSession,
  loadPointsBalance,
  pointsState,
  sessionState,
  setPointsBalance,
} from "@/stores";
import { formatDateTime } from "@/utils/date";

const POINTS_PAGE_SIZE = 20;

const menuItems = [
  {
    key: "creation",
    label: "创作台",
    icon: Brush,
    url: "/pages/workbench/index",
    relaunch: true,
  },
  {
    key: "works",
    label: "作品库",
    icon: PictureFilled,
    url: "/pages/library/index",
    relaunch: true,
  },
  {
    key: "workshop",
    label: "工作坊",
    icon: Grid,
    url: "/pages/under-development/index?title=工作坊",
    relaunch: false,
  },
  {
    key: "setting",
    label: "设置",
    icon: Setting,
    url: "/pages/under-development/index?title=设置",
    relaunch: false,
  },
];

const pointsItems = ref([]);
const isPointsDialogVisible = ref(false);
const isPointsLoading = ref(false);
const pointsLoadError = ref(false);
const isLoggingOut = ref(false);

const usernameText = computed(() => sessionState.user?.username || "—");
const accountText = computed(() => sessionState.user?.account || "—");
const pointsText = computed(() =>
  pointsState.balance === null ? "—" : pointsState.balance,
);
const usedPointsText = computed(() =>
  pointsState.usedPoints === null ? "—" : pointsState.usedPoints,
);

/**
 * 加载灵感点流水，并顺带回填共享的余额缓存。
 * @returns {Promise<void>}
 */
const loadPointsInfo = async () => {
  isPointsLoading.value = true;
  pointsLoadError.value = false;

  try {
    const data = await getPointsInfo({ page: 1, page_size: POINTS_PAGE_SIZE });

    setPointsBalance({
      balance: data.points_balance,
      usedPoints: data.used_points,
    });
    pointsItems.value = data.items;
  } catch (error) {
    pointsLoadError.value = true;
  } finally {
    isPointsLoading.value = false;
  }
};

// 打开灵感点流水弹窗并刷新数据。
const openPointsDialog = () => {
  isPointsDialogVisible.value = true;
  loadPointsInfo();
};

// 关闭灵感点流水弹窗。
const closePointsDialog = () => {
  isPointsDialogVisible.value = false;
};

/**
 * 打开常用功能页面；主页面与底部导航一致用 reLaunch，次级页保留返回路径。
 *
 * @param {{url: string, relaunch: boolean}} item 菜单配置。
 * @returns {void}
 */
const openMenu = (item) => {
  if (item.relaunch) {
    uni.reLaunch({ url: item.url });

    return;
  }

  uni.navigateTo({ url: item.url });
};

/**
 * 退出登录：调用登出接口并清理本地会话。
 * @returns {Promise<void>}
 */
const handleLogout = async () => {
  if (isLoggingOut.value) {
    return;
  }

  isLoggingOut.value = true;

  try {
    await logoutUser();
  } catch (error) {
    // 登出接口失败不阻塞本地会话清理。
  } finally {
    clearSession();
    uni.reLaunch({ url: PAGE_PATHS.AUTH });
  }
};

onMounted(() => {
  // 余额走共享缓存（登录时已拉取），本页不再额外请求积分接口。
  loadPointsBalance();
});
</script>

<style scoped lang="scss">
.profile-page {
  height: 100vh;
  overflow: hidden;
  background: linear-gradient(180deg, #ffecd2 0%, #fff8ec 48%, #fffdfb 100%);
  color: $color-ink;
}

.content {
  height: calc(
    100vh - #{100rpx} - #{102rpx} - 120rpx - var(--status-bar-height, 0px)
  );
  overflow-x: hidden;
  padding: 28rpx 32rpx;
  box-sizing: border-box;
}

.profile-card {
  @include card-surface(24rpx, 28rpx);
}

.identity {
  display: flex;
  align-items: center;
  gap: 24rpx;
}

.avatar {
  display: flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  width: 96rpx;
  height: 96rpx;
  border-radius: 50%;
  background: linear-gradient(135deg, #d9a86b 0%, #b8864e 100%);
  color: #fff;
  font-size: 44rpx;
  box-shadow: 0 8rpx 20rpx rgba(184, 134, 78, 0.3);
}

.identity-copy {
  flex: 1;
  min-width: 0;
}

.identity-name {
  display: flex;
  align-items: center;
  gap: 12rpx;
}

.username {
  color: $color-ink;
  font-size: 34rpx;
  font-weight: 700;
  line-height: 1.3;
}

.identity-tag {
  padding: 4rpx 12rpx;
  border-radius: 999rpx;
  background: $color-primary-light;
  color: $color-primary;
  font-size: 20rpx;
}

.account {
  display: block;
  margin-top: 8rpx;
  color: $color-muted;
  font-size: 24rpx;
}

.points-entry {
  display: flex;
  align-items: center;
  gap: 20rpx;
  margin-top: 28rpx;
  padding: 24rpx;
  border: 1rpx solid #efdfc2;
  border-radius: 20rpx;
  background: linear-gradient(135deg, #faf0df 0%, #f5e6cd 100%);
}

.points-badge {
  display: flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  width: 64rpx;
  height: 64rpx;
  border-radius: 50%;
  background: $color-primary;
  color: #fff;
  font-size: 32rpx;
  box-shadow: 0 6rpx 16rpx rgba(184, 134, 78, 0.32);
}

.points-copy {
  display: flex;
  flex-direction: column;
}

.points-label {
  color: #8a6840;
  font-size: 24rpx;
}

.points-value {
  color: $color-primary;
  font-size: 40rpx;
  font-weight: 700;
  line-height: 1.2;
  @include numeric;
}

.points-action {
  display: flex;
  align-items: center;
  gap: 4rpx;
  margin-left: auto;
  color: #8a6840;
  font-size: 24rpx;
}

.points-action-icon {
  font-size: 24rpx;
}

/* 常用功能 */
.menu-card {
  @include card-surface(24rpx, 16rpx 28rpx);
  margin-top: 24rpx;
}

.menu-title {
  padding: 8rpx 0 4rpx;
  color: $color-ink;
  font-size: 28rpx;
  font-weight: 700;
}

.menu-row {
  display: flex;
  align-items: center;
  gap: 20rpx;
  padding: 24rpx 0;
}

.menu-row + .menu-row {
  border-top: 1rpx solid #f0e9df;
}

.menu-icon {
  display: flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  width: 64rpx;
  height: 64rpx;
  border-radius: 16rpx;
  background: $color-primary-light;
  color: $color-primary;
  font-size: 32rpx;
}

.menu-icon.is-works {
  background: #f1f0fd;
  color: #595bdc;
}

.menu-icon.is-workshop {
  background: #fdf6e8;
  color: $color-warning;
}

.menu-icon.is-setting {
  background: #f8faf7;
  color: $color-muted;
}

.menu-label {
  flex: 1;
  color: $color-ink;
  font-size: 28rpx;
}

.menu-arrow {
  color: #c9b79b;
  font-size: 26rpx;
}

/* ============================================================
 * 桌面 H5 适配：1200px 以上用户卡与功能菜单左右分栏，菜单双列
 * ============================================================ */
@media (min-width: $breakpoint-desktop) {
  .content {
    height: calc(100vh - 50px - 100px);
    padding: 32px;
  }

  .profile-layout {
    display: grid;
    grid-template-columns: minmax(300px, 400px) minmax(0, 600px);
    justify-content: center;
    gap: 24px;
    align-items: start;
  }

  .profile-card,
  .menu-card {
    box-sizing: border-box;
    padding: 24px;
  }

  .identity-tag,
  .menu-label,
  .points-action {
    white-space: nowrap;
  }

  .menu-card {
    display: grid;
    grid-template-columns: 1fr 1fr;
    column-gap: 24rpx;
    margin-top: 0;
  }

  .menu-title {
    grid-column: 1 / -1;
  }

  .menu-row + .menu-row {
    border-top: 0;
  }

  .menu-row {
    padding: 16px 12px;
  }
}

.logout-bar {
  position: fixed;
  z-index: 10;
  right: 0;
  bottom: calc(#{102rpx} + constant(safe-area-inset-bottom));
  bottom: calc(#{102rpx} + env(safe-area-inset-bottom));
  left: 0;
  padding: 16rpx 32rpx;

  /* 窄屏过渡：750px 居中 */
  @media (min-width: $breakpoint-tablet) and (max-width: 1199px) {
    right: auto;
    left: 50%;
    width: 750px;
    transform: translateX(-50%);
  }

  /* 桌面端对齐侧栏右侧的内容区，且底部不再有导航占用 */
  @media (min-width: $breakpoint-desktop) {
    right: 0;
    bottom: 0;
    left: $desktop-sidebar;
    width: auto;
    box-sizing: border-box;
    transform: none;
  }
}

.logout-button {
  @include tap-area($tap-size);
  margin: 0;
  padding: 0;
  border: 1rpx solid #d2ddd6;
  border-radius: 20rpx;
  background: $color-surface;
  color: $color-danger;
  font-size: 28rpx;
  line-height: 1;

  &::after {
    border: 0;
  }

  @media (min-width: $breakpoint-desktop) {
    width: min(100%, 1024px);
    margin: 0 auto;
  }
}

.points-mask {
  position: fixed;
  z-index: 30;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 48rpx;
  background: rgba(20, 28, 27, 0.52);
  box-sizing: border-box;
}

.points-sheet {
  display: flex;
  flex-direction: column;
  width: 100%;
  max-height: 72vh;
  padding: 32rpx 28rpx;
  border-radius: 32rpx;
  background: $color-surface;
  box-sizing: border-box;

  @media (min-width: 768px) {
    max-width: 640px;
  }
}

.points-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-bottom: 20rpx;
  border-bottom: 1rpx solid $color-line;
}

.points-title {
  color: $color-ink;
  font-size: 34rpx;
  font-weight: 700;
  line-height: 1.3;
}

.points-close {
  @include tap-area(72rpx);
  color: $color-muted;
  font-size: 34rpx;
  line-height: 1;
}

.points-summary {
  display: flex;
  gap: 16rpx;
  margin-top: 24rpx;
}

.summary-item {
  flex: 1;
  padding: 20rpx;
  border-radius: 20rpx;
  background: #f8faf7;
}

.summary-label {
  display: block;
  color: $color-muted;
  font-size: 24rpx;
}

.summary-value {
  display: block;
  margin-top: 12rpx;
  color: $color-primary;
  font-size: 30rpx;
  font-weight: 700;
  @include numeric;
}

.points-state {
  margin-top: 24rpx;
}

/* 列表占满弹窗剩余高度，仅在内容超过弹窗最大高度时滚动 */
.points-list {
  flex: 1;
  min-height: 0;
  margin-top: 16rpx;
}

.points-item {
  display: flex;
  align-items: center;
  padding: 20rpx 0;
  border-bottom: 1rpx solid $color-line;
}

.points-item-time {
  flex: 1;
  min-width: 0;
  color: #4e665e;
  font-size: 28rpx;
  line-height: 1.6;
  @include text-ellipsis;
}

.points-item-value {
  flex-shrink: 0;
  margin-left: 16rpx;
  color: $color-primary;
  font-size: 30rpx;
  font-weight: 700;
  @include numeric;

  &.is-used {
    color: $color-danger;
  }
}
</style>
