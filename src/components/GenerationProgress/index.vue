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
        <text class="result-hint">轻触图片放大查看</text>
      </view>
      <view class="task-card">
        <view class="task-title">
          <text class="task-mark">印</text>
          <strong>{{ data.workName }}</strong>
          <small>{{ data.detail }}</small>
        </view>
        <view class="task-tags">
          <text v-for="tag in data.tags" :key="tag">{{ tag }}</text>
          <text class="task-cost"
            >{{ data.cost === null ? "—" : data.cost }} 灵感点</text
          >
        </view>
        <view class="task-footer"
          >{{ data.description }}<text>{{ data.estimatedTime }}</text></view
        >
      </view>
      <view class="cloud-tip">{{ data.tip }}</view>
    </scroll-view>
    <view class="generation-actions">
      <button class="primary-action" @tap="goLibrary">
        前往作品库查看进度
      </button>
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
  background: $color-bg-page;
  color: $color-ink;
}

.generation-content {
  height: calc(100vh - #{$header-height} - var(--status-bar-height, 0px));
  overflow-x: hidden;
  padding: $space-6 $space-7 calc(250rpx + constant(safe-area-inset-bottom));
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
  font-size: $font-size-title;
  font-weight: $font-weight-bold;
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
  padding: $space-2 $space-3;
  border-radius: $radius-lg;
  background: rgba(255, 255, 255, 0.82);
  color: $color-ink-soft;
  font-size: $font-size-caption;
}

.progress-type {
  top: 48rpx;
  right: 48rpx;
  color: $color-muted;
  font-size: $font-size-caption;
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
  font-size: $font-size-metric;
  font-weight: $font-weight-bold;
  @include numeric;
}

.progress-ring text small {
  color: $color-primary;
  font-size: $font-size-aux;
}

.progress-ring label {
  display: block;
  margin-top: $space-1;
  color: $color-ink-soft;
  font-size: $font-size-caption;
}

.progress-status {
  right: 44rpx;
  bottom: 70rpx;
  left: 44rpx;
  display: flex;
  justify-content: space-between;
  gap: $space-3;
  color: $color-primary-soft;
  font-size: $font-size-caption;
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
  margin-top: $space-5;
  padding: $space-4;
  border-radius: $radius-xl;
  background: $color-surface;
  text-align: center;
}

.result-image {
  width: 100%;
  height: 420rpx;
}

.result-hint {
  display: block;
  margin-top: $space-2;
  color: $color-muted;
  font-size: $font-size-badge;
}

.task-card {
  margin-top: $space-5;
  padding: $space-5 $space-6;
  border-radius: $radius-xl;
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
  margin-right: $space-3;
  background: $color-accent-cinnabar;
  color: #fff;
  font-size: $font-size-badge;
  text-align: center;
  line-height: 36rpx;
}

.task-title strong {
  flex: 1;
  min-width: 0;
  font-size: $font-size-aux;
  @include text-ellipsis;
}

.task-title small {
  flex-shrink: 0;
  margin-left: auto;
  color: $color-faint;
  font-size: $font-size-badge;
}

.task-tags {
  flex-wrap: wrap;
  gap: $space-2;
  margin-top: $space-4;
}

.task-tags text {
  padding: $space-1 $space-2;
  border: 1rpx solid $color-line;
  border-radius: $radius-lg;
  color: $color-ink-soft;
  font-size: $font-size-badge;
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
  gap: $space-3;
  margin-top: $space-4;
  padding-top: $space-3;
  border-top: 1rpx solid #edf0f0;
  color: $color-muted;
  font-size: $font-size-caption;
  line-height: $line-height-normal;
}

.task-footer text {
  flex-shrink: 0;
  color: $color-faint;
  @include numeric;
}

.cloud-tip {
  margin-top: $space-4;
  padding: $space-3;
  border: 1rpx solid #b8e3d7;
  border-radius: $radius-xl;
  background: $color-surface-muted;
  color: $color-primary-soft;
  font-size: $font-size-caption;
  line-height: $line-height-normal;
  text-align: center;
}

.generation-actions {
  @include action-bar;
}

.generation-actions button {
  width: 100%;
  height: $tap-size;
  border: 0;
  border-radius: $radius-3xl;
  font-size: $font-size-body;
  font-weight: $font-weight-bold;
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
  margin-top: $space-3;
  background: $color-surface;
  color: $color-ink-soft;
  box-shadow: 0 2rpx 12rpx rgba(30, 58, 70, 0.06);
}

.is-optimization .generation-content,
.is-optimization .generation-actions {
  display: none;
}
</style>
