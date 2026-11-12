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
          {{ tab.name }}　{{ tab.count }}
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
        <view class="section-title">历史画卷</view>
        <view class="work-list">
          <view
            v-for="work in works"
            :key="work.workId"
            class="work-card"
            @click="openWork(work)"
          >
            <text class="work-type">{{ work.typeName }}</text>
            <view class="work-info">
              <text class="work-title">{{ work.title }}</text>
              <text class="work-time">{{ work.time }}</text>
            </view>
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
import { computed, ref } from "vue";
import { onShow } from "@dcloudio/uni-app";

import { getLibraryData } from "@/apis/creation";
import AppBottomNav from "@/components/AppBottomNav/index.vue";
import AppPageHeader from "@/components/AppPageHeader/index.vue";
import AppStateHint from "@/components/AppStateHint/index.vue";
import { getErrorMessage } from "@/utils/request";

const PAGE_SIZE = 10;

const activeStatus = ref("all");
const works = ref([]);
const tabs = ref([
  { status: "all", name: "全部", count: 0 },
  { status: "completed", name: "已完成", count: 0 },
  { status: "creating", name: "创作中", count: 0 },
  { status: "draft", name: "草稿", count: 0 },
]);
const librarySummary = computed(() => `共 ${pageInfo.value.total} 幅典藏`);
const pageInfo = ref({ page: 1, pageSize: PAGE_SIZE, total: 0 });
const isLoading = ref(true);
const isLoadingMore = ref(false);
const loadError = ref(false);

let requestToken = 0;

const hasMore = computed(() => works.value.length < pageInfo.value.total);

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

    if (Array.isArray(data.tabs)) {
      tabs.value = data.tabs;
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
          typeName: item.type_name || "",
          status: item.status || "",
          taskId: item.task_id || "",
          mediaUrl: item.media_url || "",
          time: item.created_at || "",
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

/**
 * 打开生成中的图片任务或预览已完成的图片。
 * @param {Object} work 作品库记录。
 * @returns {void}
 */
const openWork = (work) => {
  if (work.status === "creating" && work.taskId && work.typeName === "文字生图") {
    uni.navigateTo({
      url: `/pages/image-generation/index?mode=creation&taskId=${encodeURIComponent(
        work.taskId
      )}`,
    });
    return;
  }

  if (work.status === "completed" && work.mediaUrl && work.typeName !== "视频创作") {
    uni.previewImage({ urls: [work.mediaUrl] });
  }
};

onShow(() => {
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

.work-list {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

/* ============================================================
 * 桌面 H5 适配：1200px 以上作品列表三列排布
 * ============================================================ */
@media (min-width: $breakpoint-desktop) {
  .work-list {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
  }
}

.work-card {
  display: flex;
  align-items: center;
  gap: 20rpx;
  padding: 24rpx 28rpx;
  border-radius: 20rpx;
  background: $color-surface;
  box-shadow: 0 2rpx 8rpx rgba(30, 55, 70, 0.06);
}

.work-type {
  flex-shrink: 0;
  padding: 8rpx 16rpx;
  border-radius: 12rpx;
  background: linear-gradient(150deg, #d9a86b 0%, #b8864e 100%);
  color: #fff;
  font-size: 22rpx;
  font-weight: 600;
  line-height: 1.6;
  box-shadow: 0 4rpx 10rpx rgba(184, 134, 78, 0.28);
}

.work-info {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 6rpx;
  min-width: 0;
}

.work-title {
  color: $color-ink;
  font-size: 28rpx;
  font-weight: 600;
  line-height: 1.4;
  @include text-ellipsis;
}

.work-time {
  color: $color-muted;
  font-size: 22rpx;
  line-height: 1.4;
  @include numeric;
}
</style>
