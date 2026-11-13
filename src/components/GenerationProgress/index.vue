<template>
  <view
    class="generation-progress"
    :class="{ 'is-optimization': data.mode === 'optimization' }"
  >
    <app-page-header :title="data.title" />
    <generation-dialog
      v-if="data.mode === 'optimization'"
      type="optimization"
      :status="data.status"
      :progress="data.progress"
      :progress-label="data.stageLabel"
      :note="data.tip"
      :result-url="data.resultUrl"
      @back="goWorkbench"
      @library="goLibrary"
    />
    <scroll-view scroll-y :show-scrollbar="false" class="generation-content">
      <view class="progress-body">
        <view class="detail-card">
          <view class="progress-head">
            <view class="progress-title-group">
              <text class="progress-heading">{{ data.progressTitle }}</text>
              <text class="progress-status" :class="data.statusClass">
                {{ data.statusText }}
              </text>
            </view>
            <text class="progress-cost">
              {{ data.cost === null ? "—" : data.cost }} 灵感点
            </text>
          </view>
          <text v-if="data.workTitle" class="progress-work">
            {{ data.workTitle }}
          </text>
          <template v-if="data.resultUrl">
            <image
              class="result-image"
              :src="data.resultUrl"
              mode="aspectFit"
              @tap="previewResult"
            />
            <text class="result-hint"
              >轻触图片放大查看；图片链接约 1 小时后失效，请及时保存</text
            >
          </template>
          <!-- 进度中展示进度环，任务结束后展示状态标签与提示 -->
          <template v-else-if="!isFinished">
            <view class="progress-ring">
              <text>{{ data.progress }}<small>%</small></text>
              <label>{{ data.progressLabel }}</label>
            </view>
            <view class="progress-track"
              ><view :style="{ width: `${data.progress}%` }"></view
            ></view>
          </template>
          <view v-if="data.tip" class="cloud-tip">{{ data.tip }}</view>
        </view>
      </view>
    </scroll-view>
    <view class="generation-actions">
      <button class="primary-action" @tap="goLibrary">
        前往作品库查看进度
      </button>
      <button class="secondary-action" @tap="goWorkbench">返回工作台</button>
    </view>
    <app-bottom-nav active="works" desktop-only />
  </view>
</template>

<script setup>
import { computed } from "vue";

import { TASK_STATUS } from "@/apis/constants";
import AppBottomNav from "@/components/AppBottomNav/index.vue";
import AppPageHeader from "@/components/AppPageHeader/index.vue";
import GenerationDialog from "@/components/GenerationDialog/index.vue";

const props = defineProps({
  /** 任务进度页面展示数据。 */
  data: { type: Object, required: true },
});

// 任务结束后不再展示进度环，避免与状态标签重复
const isFinished = computed(
  () =>
    props.data.status === TASK_STATUS.COMPLETED ||
    props.data.status === TASK_STATUS.FAILED,
);

// 预览生成结果大图
const previewResult = () => {
  if (!props.data.resultUrl) {
    return;
  }

  uni.previewImage({ urls: [props.data.resultUrl] });
};

// 前往作品库。
const goLibrary = () => {
  uni.navigateTo({ url: "/pages/library/index" });
};

// 返回创作台。
const goWorkbench = () => {
  uni.reLaunch({ url: "/pages/workbench/index" });
};
</script>

<style scoped lang="scss">
.generation-progress {
  height: 100vh;
  overflow: hidden;
  background: linear-gradient(180deg, #ffecd2 0%, #fff8ec 48%, #fffdfb 100%);
  color: $color-ink;
}

.generation-content {
  height: calc(100vh - #{100rpx} - var(--status-bar-height, 0px));
  display: flex;
  flex-direction: column;
  overflow-x: hidden;
  padding: 28rpx 32rpx;
  padding-bottom: calc(250rpx + constant(safe-area-inset-bottom));
  padding-bottom: calc(250rpx + env(safe-area-inset-bottom));
  box-sizing: border-box;
}

/* 进度模块整体垂直居中，内容较矮时不在顶部留出大片空白 */
.progress-body {
  width: 100%;
  margin: auto 0;
}

.detail-card {
  padding: 36rpx 40rpx 40rpx;
  border-radius: 32rpx;
  background: $color-surface;
  box-shadow: 0 10rpx 30rpx rgba(95, 133, 117, 0.06);
  text-align: center;
}

.progress-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16rpx;
}

.progress-title-group {
  display: flex;
  align-items: center;
  gap: 12rpx;
  min-width: 0;
}

.progress-heading {
  overflow: hidden;
  color: $color-ink;
  font-size: 34rpx;
  font-weight: 700;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.progress-status {
  flex-shrink: 0;
  padding: 4rpx 14rpx;
  border-radius: 999rpx;
  font-size: 20rpx;
  line-height: 1.6;

  &.is-processing {
    background: #fdf6e8;
    color: #b8864e;
  }

  &.is-completed {
    background: #e8f6ee;
    color: #2f8f5b;
  }

  &.is-failed {
    background: #fdeeee;
    color: $color-danger;
  }
}

.progress-cost {
  flex-shrink: 0;
  padding: 8rpx 20rpx;
  border: 1rpx solid #86e5dc;
  border-radius: 999rpx;
  color: $color-primary;
  font-size: 22rpx;
  line-height: 1.4;
  @include numeric;
}

.progress-work {
  display: block;
  margin-top: 16rpx;
  color: $color-muted;
  font-size: 24rpx;
  line-height: 1.5;
  text-align: left;
  @include text-ellipsis;
}

.progress-ring {
  margin: 48rpx auto 0;
  width: 240rpx;
  height: 240rpx;
  border: 2rpx dashed #abd9d5;
  border-radius: 50%;
  background: rgba(228, 241, 238, 0.45);
  text-align: center;
}

.progress-ring text {
  display: block;
  margin-top: 68rpx;
  color: $color-ink;
  font-size: 68rpx;
  font-weight: 700;
  @include numeric;
}

.progress-ring text small {
  color: $color-primary;
  font-size: 26rpx;
}

.progress-ring label {
  display: block;
  margin-top: 8rpx;
  color: #4e665e;
  font-size: 24rpx;
}

.progress-track {
  height: 12rpx;
  margin-top: 48rpx;
  overflow: hidden;
  border-radius: 8rpx;
  background: #edf2ef;
}

.progress-track view {
  height: 100%;
  border-radius: inherit;
  background: $color-primary;
}

.result-image {
  width: 100%;
  height: 440rpx;
  margin-top: 32rpx;
  border-radius: 20rpx;
  background: #f8faf7;
}

.result-hint {
  display: block;
  margin-top: 16rpx;
  color: $color-muted;
  font-size: 22rpx;
}

.cloud-tip {
  margin-top: 28rpx;
  padding: 16rpx;
  border: 1rpx solid #b8e3d7;
  border-radius: 24rpx;
  background: #f8faf7;
  color: #8a6840;
  font-size: 24rpx;
  line-height: 1.6;
  text-align: center;
}

/* ============================================================
 * 桌面 H5 适配：页头、卡片与操作栏统一对齐到侧边导航右侧的居中窄栏
 * ============================================================ */
@media (min-width: $breakpoint-desktop) {
  .generation-progress :deep(.app-page-header) {
    padding-right: max(32px, calc(50% - 380px));
    padding-left: max(32px, calc(50% - 380px));
  }

  .generation-content {
    max-width: 760px;
    margin: 0 auto;
    padding: 40px 0;
    padding-bottom: calc(120px + env(safe-area-inset-bottom));
  }

  .detail-card {
    padding: 28px 32px 32px;
    border-radius: 16px;
  }

  .progress-heading {
    font-size: 22px;
  }

  .progress-status {
    padding: 2px 10px;
    font-size: 12px;
  }

  .progress-cost {
    padding: 4px 14px;
    font-size: 13px;
  }

  .progress-work {
    margin-top: 10px;
    font-size: 14px;
  }

  .progress-ring {
    width: 160px;
    height: 160px;
    margin-top: 32px;
  }

  .progress-ring text {
    margin-top: 44px;
    font-size: 40px;
  }

  .progress-ring text small {
    font-size: 16px;
  }

  .progress-ring label {
    margin-top: 4px;
    font-size: 14px;
  }

  .progress-track {
    height: 8px;
    margin-top: 32px;
  }

  /* 结果图按原比例居中留边，容器不再整栏宽高比失衡 */
  .result-image {
    width: min(100%, 560px);
    height: 460px;
    margin: 24px auto 0;
    border-radius: 12px;
  }

  .result-hint {
    margin-top: 12px;
    font-size: 12px;
  }

  .cloud-tip {
    margin-top: 24px;
    padding: 12px;
    font-size: 13px;
  }

  .generation-actions {
    display: flex;
    gap: 12px;
    justify-content: center;
    padding: 16px 32px 28px;
  }

  .generation-actions button {
    max-width: 320px;
    height: 44px;
    border-radius: 12px;
    font-size: 15px;
  }

  .secondary-action {
    margin-top: 0;
  }
}

.generation-actions {
  @include action-bar;
}

.generation-actions button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: $tap-size;
  padding: 0;
  border: 0;
  border-radius: 32rpx;
  font-size: 28rpx;
  font-weight: 700;
  line-height: 1;
}

.generation-actions button::after {
  border: 0;
}

.primary-action {
  background: $color-primary;
  color: #fff;
}

.secondary-action {
  margin-top: 16rpx;
  background: $color-surface;
  color: #4e665e;
  box-shadow: 0 2rpx 12rpx rgba(30, 58, 70, 0.06);
}

.is-optimization .generation-content,
.is-optimization .generation-actions {
  display: none;
}
</style>
