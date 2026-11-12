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
      <view class="progress-card">
        <text class="progress-heading">{{ data.progressTitle }}</text>
        <text class="progress-label">{{ data.stageLabel }}</text>
        <text class="progress-type">{{ data.typeLabel }}</text>
        <view class="progress-ring">
          <text>{{ data.progress }}<small>%</small></text>
          <label>{{ data.progressLabel }}</label>
        </view>
        <view class="progress-status">
          {{ data.statusText }} <text>{{ data.progress }}% / 100%</text>
        </view>
        <view class="progress-track"
          ><view :style="{ width: `${data.progress}%` }"></view
        ></view>
      </view>
      <view v-if="data.resultUrl" class="result-card">
        <image
          class="result-image"
          :src="data.resultUrl"
          mode="aspectFit"
          @tap="previewResult"
        />
        <text class="result-hint"
          >轻触图片放大查看；图片链接约 1 小时后失效，请及时保存</text
        >
      </view>
      <view class="task-card">
        <view class="task-title">
          <text class="task-mark">印</text>
          <strong>{{ data.workName }}</strong>
          <small>{{ data.detail }}</small>
        </view>
        <view class="task-tags">
          <text v-for="tag in data.tags" :key="tag">{{ tag }}</text>
          <text class="task-cost">
            {{ data.cost === null ? "—" : data.cost }} 灵感点
          </text>
        </view>
        <view class="task-footer">
          {{ data.description }}
          <text>{{ data.estimatedTime }} </text>
        </view>
      </view>
      <view class="cloud-tip">{{ data.tip }}</view>
    </scroll-view>
    <view class="generation-actions">
      <button class="primary-action" @tap="goLibrary">前往作品库查看进度</button>
      <button class="secondary-action" @tap="goWorkbench">返回工作台</button>
    </view>
  </view>
</template>

<script setup>
import AppPageHeader from "@/components/AppPageHeader/index.vue";
import GenerationDialog from "@/components/GenerationDialog/index.vue";

const props = defineProps({
  /** 任务进度页面展示数据。 */
  data: { type: Object, required: true },
});

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
  overflow-x: hidden;
  padding: 28rpx 32rpx calc(250rpx + constant(safe-area-inset-bottom));
  padding-bottom: calc(250rpx + env(safe-area-inset-bottom));
  box-sizing: border-box;
}

.progress-card {
  position: relative;
  height: 500rpx;
  overflow: hidden;
  border: 1rpx solid #e4dccb;
  border-radius: 42rpx;
  background: linear-gradient(145deg, #e4f1ee, #f3f0e6 48%, #e0e9e2);
}

.progress-card::after {
  position: absolute;
  inset: 42rpx 26rpx 26rpx;
  border: 4rpx solid rgba(255, 255, 255, 0.78);
  border-radius: 38rpx;
  content: "";
}

.progress-heading {
  position: absolute;
  z-index: 2;
  top: 36rpx;
  right: 200rpx;
  left: 200rpx;
  overflow: hidden;
  color: $color-ink;
  font-size: 34rpx;
  font-weight: 700;
  text-align: center;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.progress-label,
.progress-type,
.progress-status,
.progress-track {
  position: absolute;
  z-index: 2;
}

.progress-label {
  top: 40rpx;
  left: 48rpx;
  padding: 12rpx 16rpx;
  border-radius: 20rpx;
  background: rgba(255, 255, 255, 0.82);
  color: #4e665e;
  font-size: 24rpx;
}

.progress-type {
  top: 48rpx;
  right: 48rpx;
  color: $color-muted;
  font-size: 24rpx;
}

.progress-ring {
  position: absolute;
  z-index: 2;
  top: 150rpx;
  left: 50%;
  width: 220rpx;
  height: 220rpx;
  transform: translateX(-50%);
  border: 2rpx dashed #abd9d5;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.72);
  text-align: center;
}

.progress-ring text {
  display: block;
  margin-top: 62rpx;
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

.progress-status {
  right: 44rpx;
  bottom: 70rpx;
  left: 44rpx;
  display: flex;
  justify-content: space-between;
  gap: 16rpx;
  color: #8a6840;
  font-size: 24rpx;
  @include numeric;
}

.progress-track {
  right: 44rpx;
  bottom: 40rpx;
  left: 44rpx;
  height: 10rpx;
  overflow: hidden;
  border-radius: 8rpx;
  background: rgba(255, 255, 255, 0.5);
}

.progress-track view {
  height: 100%;
  border-radius: inherit;
  background: $color-primary;
}

.result-card {
  margin-top: 24rpx;
  padding: 20rpx;
  border-radius: 24rpx;
  background: $color-surface;
  text-align: center;
}

.result-image {
  width: 100%;
  height: 420rpx;
}

.result-hint {
  display: block;
  margin-top: 12rpx;
  color: $color-muted;
  font-size: 22rpx;
}

.task-card {
  margin-top: 24rpx;
  padding: 24rpx 28rpx;
  border-radius: 24rpx;
  background: $color-surface;
  box-shadow: 0 6rpx 18rpx rgba(47, 75, 90, 0.06);
}

.task-title,
.task-tags {
  display: flex;
  align-items: center;
}

.task-mark {
  flex-shrink: 0;
  width: 36rpx;
  height: 36rpx;
  margin-right: 16rpx;
  background: #c84b31;
  color: #fff;
  font-size: 22rpx;
  text-align: center;
  line-height: 36rpx;
}

.task-title strong {
  flex: 1;
  min-width: 0;
  font-size: 26rpx;
  @include text-ellipsis;
}

.task-title small {
  flex-shrink: 0;
  margin-left: auto;
  color: #a3b1ab;
  font-size: 22rpx;
}

.task-tags {
  flex-wrap: wrap;
  gap: 12rpx;
  margin-top: 20rpx;
}

.task-tags text {
  padding: 8rpx 12rpx;
  border: 1rpx solid $color-line;
  border-radius: 20rpx;
  color: #4e665e;
  font-size: 22rpx;
}

.task-tags .task-cost {
  margin-left: auto;
  border-color: #86e5dc;
  color: $color-primary;
  @include numeric;
}

.task-footer {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16rpx;
  margin-top: 20rpx;
  padding-top: 16rpx;
  border-top: 1rpx solid #edf0f0;
  color: $color-muted;
  font-size: 24rpx;
  line-height: 1.6;
}

.task-footer text {
  flex-shrink: 0;
  color: #a3b1ab;
  @include numeric;
}

.cloud-tip {
  margin-top: 20rpx;
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
 * 桌面 H5 适配：1200px 以上进度卡与结果图左右分栏，任务详情通栏
 * ============================================================ */
@media (min-width: $breakpoint-desktop) {
  .generation-content {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 20rpx;
    align-content: start;
  }

  .progress-card {
    height: 440rpx;
    margin-top: 0;
  }

  .result-card {
    margin-top: 0;
  }

  .task-card,
  .cloud-tip {
    grid-column: 1 / -1;
  }

  .task-card,
  .cloud-tip {
    margin-top: 0;
  }
}

.generation-actions {
  @include action-bar;
}

.generation-actions button {
  width: 100%;
  height: $tap-size;
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
