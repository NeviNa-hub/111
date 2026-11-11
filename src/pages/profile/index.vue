<template>
  <view class="profile-page">
    <app-page-header title="我的" />

    <scroll-view scroll-y :show-scrollbar="false" class="content">
      <view class="profile-card">
        <view class="identity">
          <text class="username">用户名：{{ usernameText }}</text>
          <text class="account">账号：{{ accountText }}</text>
        </view>

        <view class="points-entry" @tap="openPointsDialog">
          <text class="points-label">可用积分</text>
          <text class="points-value">{{ pointsText }}</text>
          <text class="points-action">积分流水 ›</text>
        </view>
      </view>
    </scroll-view>

    <view class="logout-bar">
      <button class="logout-button" :disabled="isLoggingOut" @tap="handleLogout">
        退出登录
      </button>
    </view>

    <view v-if="isPointsDialogVisible" class="points-mask" @tap="closePointsDialog">
      <view class="points-sheet" @tap.stop>
        <view class="points-header">
          <text class="points-title">灵感点流水</text>
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
          <view class="summary-item">
            <text class="summary-label">流水条数</text>
            <text class="summary-value">{{ totalText }}</text>
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
          <view v-for="item in pointsItems" :key="item.ledger_id" class="points-item">
            <text class="points-item-time">{{ item.created_at }}</text>
            <text class="points-item-value" :class="{ 'is-used': item.delta < 0 }">
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

import { logoutUser } from "@/apis/auth";
import { PAGE_PATHS } from "@/apis/constants";
import { getPointsInfo } from "@/apis/points";
import AppBottomNav from "@/components/AppBottomNav/index.vue";
import AppPageHeader from "@/components/AppPageHeader/index.vue";
import AppStateHint from "@/components/AppStateHint/index.vue";
import { clearSession, sessionState } from "@/stores";

const POINTS_PAGE_SIZE = 20;

const pointsBalance = ref(null);
const usedPoints = ref(null);
const total = ref(null);
const pointsItems = ref([]);
const isPointsDialogVisible = ref(false);
const isPointsLoading = ref(false);
const pointsLoadError = ref(false);
const isLoggingOut = ref(false);

const usernameText = computed(() => sessionState.user?.username || "—");
const accountText = computed(() => sessionState.user?.account || "—");
const pointsText = computed(() =>
  pointsBalance.value === null ? "—" : pointsBalance.value
);
const usedPointsText = computed(() =>
  usedPoints.value === null ? "—" : usedPoints.value
);
const totalText = computed(() => (total.value === null ? "—" : total.value));

/**
 * 加载灵感点余额与流水。
 * @returns {Promise<void>}
 */
const loadPointsInfo = async () => {
  isPointsLoading.value = true;
  pointsLoadError.value = false;

  try {
    const data = await getPointsInfo({ page: 1, page_size: POINTS_PAGE_SIZE });

    pointsBalance.value = data.points_balance;
    usedPoints.value = data.used_points;
    total.value = data.total;
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
  loadPointsInfo();
});
</script>

<style scoped lang="scss">
.profile-page {
  height: 100vh;
  overflow: hidden;
  background: $color-bg-page;
  color: $color-ink;
}

.content {
  height: calc(
    100vh - #{$header-height} - #{$nav-height} - 120rpx - var(--status-bar-height, 0px)
  );
  overflow-x: hidden;
  padding: $space-6 $space-7;
  box-sizing: border-box;
}

.profile-card {
  @include card-surface($radius-xl, $space-6);
}

.identity {
  padding-bottom: $space-5;
  border-bottom: 1rpx solid $color-line;
}

.username {
  display: block;
  color: $color-ink;
  font-size: $font-size-title;
  font-weight: $font-weight-bold;
  line-height: $line-height-tight;
}

.account {
  display: block;
  margin-top: $space-2;
  color: $color-muted;
  font-size: $font-size-caption;
}

.points-entry {
  display: flex;
  align-items: center;
  gap: $space-2;
  margin-top: $space-5;
  padding: $space-5;
  border-radius: $radius-lg;
  background: $color-primary-light;
}

.points-label {
  color: $color-primary-soft;
  font-size: $font-size-caption;
}

.points-value {
  color: $color-primary;
  font-size: $font-size-display-sm;
  font-weight: $font-weight-bold;
  @include numeric;
}

.points-action {
  margin-left: auto;
  color: $color-primary-soft;
  font-size: $font-size-caption;
}

.logout-bar {
  position: fixed;
  z-index: 10;
  right: 0;
  bottom: calc(#{$nav-height} + constant(safe-area-inset-bottom));
  bottom: calc(#{$nav-height} + env(safe-area-inset-bottom));
  left: 0;
  padding: $space-3 $space-7;

  @media (min-width: 768px) {
    right: auto;
    left: 50%;
    width: $desktop-content-width;
    transform: translateX(-50%);
  }
}

.logout-button {
  @include tap-area($tap-size);
  margin: 0;
  padding: 0;
  border: 1rpx solid $color-line-strong;
  border-radius: $radius-lg;
  background: $color-surface;
  color: $color-danger;
  font-size: $font-size-body;
  line-height: 1;

  &::after {
    border: 0;
  }
}

.points-mask {
  position: fixed;
  z-index: 30;
  inset: 0;
  display: flex;
  align-items: flex-end;
  background: rgba(20, 28, 27, 0.52);
}

.points-sheet {
  width: 100%;
  max-height: 80vh;
  padding: $space-7 $space-6;
  padding-bottom: calc(#{$space-5} + env(safe-area-inset-bottom));
  border-radius: $radius-3xl $radius-3xl 0 0;
  background: $color-surface;
  box-sizing: border-box;
}

.points-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-bottom: $space-4;
  border-bottom: 1rpx solid $color-line;
}

.points-title {
  color: $color-ink;
  font-size: $font-size-title;
  font-weight: $font-weight-bold;
  line-height: $line-height-tight;
}

.points-close {
  @include tap-area(72rpx);
  color: $color-muted;
  font-size: $font-size-title;
  line-height: 1;
}

.points-summary {
  display: flex;
  gap: $space-3;
  margin-top: $space-5;
}

.summary-item {
  flex: 1;
  padding: $space-4;
  border-radius: $radius-lg;
  background: $color-surface-muted;
}

.summary-label {
  display: block;
  color: $color-muted;
  font-size: $font-size-caption;
}

.summary-value {
  display: block;
  margin-top: $space-2;
  color: $color-primary;
  font-size: $font-size-body-lg;
  font-weight: $font-weight-bold;
  @include numeric;
}

.points-state {
  margin-top: $space-5;
}

.points-list {
  height: 46vh;
  margin-top: $space-3;
}

.points-item {
  display: flex;
  align-items: center;
  padding: $space-4 0;
  border-bottom: 1rpx solid $color-line;
}

.points-item-time {
  flex: 1;
  min-width: 0;
  color: $color-ink-soft;
  font-size: $font-size-body;
  line-height: $line-height-normal;
  @include text-ellipsis;
}

.points-item-value {
  flex-shrink: 0;
  margin-left: $space-3;
  color: $color-primary;
  font-size: $font-size-body-lg;
  font-weight: $font-weight-bold;
  @include numeric;

  &.is-used {
    color: $color-danger;
  }
}
</style>
