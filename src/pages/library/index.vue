<template>
  <view class="library-page">
    <app-page-header title="作品库" />
    <scroll-view
      scroll-y
      :show-scrollbar="false"
      class="content"
      @scrolltolower="loadMore"
    >
      <view class="summary-row">
        <text class="summary">{{ librarySummary }}</text>
      </view>
      <view class="tabs">
        <text
          v-for="tab in tabs"
          :key="tab.name"
          :class="{ active: activeStatus === tab.status }"
          @click="handleTabChange(tab.status)"
        >
          {{ tab.name }}　{{ tabCount(tab.status) }}
        </text>
      </view>
      <app-state-hint
        v-if="isLoading"
        class="library-state"
        type="loading"
        title="正在载入作品库"
      />
      <app-state-hint
        v-else-if="loadError"
        class="library-state"
        type="error"
        title="作品库加载失败"
        description="请检查网络后重试"
        action-text="重新加载"
        @action="loadLibraryData(true)"
      />
      <view v-else class="library-body">
        <view class="section-title">历史画卷 <text>长按可批量导出</text></view>
        <view class="work-grid">
          <view v-for="work in works" :key="work.workId" class="work-card">
            <view class="art">
              <text>逸才意境</text>
            </view>
            <text class="more">•••</text>
            <text class="work-title">{{ work.title }}</text>
          </view>
        </view>
        <app-state-hint
          v-if="!works.length"
          class="library-state"
          type="empty"
          title="暂无画卷"
          description="完成一次生图任务后，作品会自动归档到这里"
        />
        <view v-else-if="isLoadingMore" class="load-more">正在载入更多作品…</view>
      </view>
    </scroll-view>
    <app-bottom-nav active="works" />
  </view>
</template>

<script setup>
import { computed, onMounted, ref } from "vue";

import { getLibraryData } from "@/apis/creation";
import AppBottomNav from "@/components/AppBottomNav/index.vue";
import AppPageHeader from "@/components/AppPageHeader/index.vue";
import AppStateHint from "@/components/AppStateHint/index.vue";
import { getErrorMessage } from "@/utils/request";

const PAGE_SIZE = 10;

const activeStatus = ref("all");
const works = ref([]);
const tabs = [
  { status: "all", name: "全部" },
  { status: "completed", name: "已完成" },
  { status: "creating", name: "创作中" },
  { status: "draft", name: "草稿" },
];
const librarySummary = computed(() => `共 ${pageInfo.value.total} 幅典藏`);
const pageInfo = ref({ page: 1, pageSize: PAGE_SIZE, total: 0 });
const isLoading = ref(true);
const isLoadingMore = ref(false);
const loadError = ref(false);

let requestToken = 0;

const hasMore = computed(() => works.value.length < pageInfo.value.total);

const tabCount = (status) => {
  if (status === activeStatus.value) {
    return pageInfo.value.total;
  }

  return "";
};

/**
 * 加载作品库数据，并丢弃过期响应避免切换筛选时旧数据覆盖新状态。
 * @param {boolean} [reset] 是否重置为第一页。
 * @returns {Promise<void>}
 */
const loadLibraryData = async (reset = false) => {
  const token = ++requestToken;
  const page = reset ? 1 : pageInfo.value.page + 1;

  if (reset) {
    isLoading.value = true;
    loadError.value = false;
  } else {
    isLoadingMore.value = true;
  }

  try {
    const data = await getLibraryData({
      page,
      page_size: PAGE_SIZE,
      status: activeStatus.value,
    });

    if (token !== requestToken) {
      return;
    }

    pageInfo.value = {
      page: Number(data.page_info?.page) || page,
      pageSize: Number(data.page_info?.page_size) || PAGE_SIZE,
      total: Number(data.page_info?.total) || 0,
    };
    const pageWorks = Array.isArray(data.lists)
      ? data.lists.map((item) => ({
          workId: item.work_id,
          title: item.title || "",
        }))
      : [];
    works.value = reset ? pageWorks : works.value.concat(pageWorks);
  } catch (error) {
    if (token !== requestToken) {
      return;
    }

    if (reset) {
      loadError.value = true;
      works.value = [];
    } else {
      uni.showToast({
        title: getErrorMessage(error, "加载更多作品失败"),
        icon: "none",
      });
    }
  } finally {
    if (token === requestToken) {
      isLoading.value = false;
      isLoadingMore.value = false;
    }
  }
};

/**
 * 切换作品状态筛选并重新加载列表。
 * @param {string} status 作品状态。
 * @returns {Promise<void>}
 */
const handleTabChange = async (status) => {
  if (status === activeStatus.value) {
    return;
  }

  activeStatus.value = status;
  await loadLibraryData(true);
};

// 滚动到底部时加载下一页
const loadMore = () => {
  if (isLoading.value || isLoadingMore.value || !hasMore.value) {
    return;
  }

  loadLibraryData();
};

onMounted(() => {
  loadLibraryData(true);
});
</script>

<style scoped lang="scss">
.library-page {
  height: 100vh;
  overflow: hidden;
  background: linear-gradient(180deg, #ffecd2 0%, #fff8ec 48%, #fffdfb 100%);
  color: $color-ink;
}

.content {
  height: calc(100vh - 214rpx - var(--status-bar-height, 0px));
  overflow-x: hidden;
  padding: 28rpx 32rpx;
  padding-bottom: calc(#{24rpx} + env(safe-area-inset-bottom));
  box-sizing: border-box;
}

.summary-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.summary {
  padding: 8rpx 16rpx;
  border-radius: 999rpx;
  background: #f7edde;
  color: #4e665e;
  font-size: 24rpx;
  @include numeric;
}

.summary:first-letter {
  color: $color-primary;
}

.tabs {
  display: flex;
  flex-wrap: wrap;
  gap: 12rpx;
  margin-top: 24rpx;
}

.tabs text {
  @include tap-area(64rpx);
  padding: 0 24rpx;
  border-radius: 20rpx;
  background: $color-surface;
  color: #4e665e;
  font-size: 24rpx;
  line-height: 1;
  box-shadow: 0 3rpx 10rpx rgba(38, 70, 88, 0.04);
  @include numeric;
}

.tabs text.active {
  background: $color-primary;
  color: #fff;
  font-weight: 600;
}

.library-state {
  margin-top: 28rpx;
}

.load-more {
  margin-top: 24rpx;
  color: $color-muted;
  font-size: 24rpx;
  text-align: center;
}

.generating {
  position: relative;
  display: flex;
  align-items: center;
  min-height: 120rpx;
  margin-top: 28rpx;
  padding: 20rpx 24rpx 20rpx 16rpx;
  border: 1rpx solid $color-line;
  border-radius: 20rpx;
  background: $color-surface;
  box-shadow: 0 5rpx 14rpx rgba(39, 76, 96, 0.08);
}

.generating-label {
  flex-shrink: 0;
  width: 64rpx;
  padding: 8rpx 4rpx;
  border-radius: 8rpx;
  background: #fdf0ef;
  color: #c84b31;
  font-size: 22rpx;
  font-weight: 700;
  line-height: 1.2;
  text-align: center;
}

.generating-body {
  flex: 1;
  min-width: 0;
  margin-left: 16rpx;
}

.generating-body > text {
  display: block;
  font-size: 26rpx;
  font-weight: 700;
  @include text-ellipsis;
}

.generating-body > text:first-child {
  color: $color-ink;
  font-size: 26rpx;
}

.generating-body .status {
  margin-top: 12rpx;
  color: $color-primary;
  font-size: 24rpx;
  font-weight: 600;
}

.close {
  position: absolute;
  top: 0;
  right: 0;
  @include tap-area(64rpx);
  color: $color-muted;
  font-size: 34rpx;
  line-height: 1;
}

.section-title {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16rpx;
  margin: 32rpx 0 16rpx;
  color: $color-ink;
  font-size: 34rpx;
  font-weight: 700;
}

.section-title text {
  color: $color-muted;
  font-size: 24rpx;
  font-weight: 400;
}

.work-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16rpx;
}

.work-card {
  position: relative;
  overflow: hidden;
  border-radius: 20rpx;
  background: $color-surface;
  box-shadow: 0 2rpx 8rpx rgba(30, 55, 70, 0.06);
}

.art {
  height: 300rpx;
  padding: 16rpx;
  box-sizing: border-box;
  color: #435e61;
  font-size: 24rpx;
}

.river-work {
  background: linear-gradient(145deg, #e7e5d8 5%, #aebbb2 55%, #657c7b);
}

.bamboo-work {
  background: linear-gradient(145deg, #f2eee1 15%, #b1cdbb 55%, #6c947b);
}

.tea-work {
  background: linear-gradient(145deg, #8b684c 0 12%, #f0e7d9 13% 68%, #c5a47b);
}

.mist-work {
  background: linear-gradient(145deg, #f0eee1, #b3c4be 52%, #576f71);
}

.more {
  position: absolute;
  top: 12rpx;
  right: 12rpx;
  width: 46rpx;
  height: 46rpx;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.88);
  color: #425761;
  font-size: 24rpx;
  text-align: center;
  line-height: 40rpx;
}

.work-title {
  display: block;
  padding: 20rpx 16rpx;
  color: $color-ink;
  font-size: 26rpx;
  line-height: 1.6;
  @include text-ellipsis;
}
</style>
