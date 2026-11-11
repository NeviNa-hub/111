<template>
  <!-- #ifdef H5 -->
  <view class="video-creation-page">
    <app-page-header title="生成视频" />
    <view class="step-bar">
      <view class="step active"> <i>1</i><text>规制与意境</text> </view>
      <view class="step-connector"></view>
      <view class="step inactive"><i>2</i><text>画质与渲染</text></view>
    </view>
    <scroll-view
      scroll-y
      :show-scrollbar="false"
      class="content"
      :style="contentKeyboardStyle"
    >
      <el-form
        ref="formRef"
        :model="formData"
        :rules="formRules"
        label-position="top"
        class="creation-form"
      >
        <view class="section-head">
          <view class="section-title">
            <view class="section-bar"></view>
            <text>规制画幅</text>
          </view>
          <text class="section-hint">决定动卷取景视野</text>
        </view>
        <el-form-item prop="ratio" class="ratio-form-item">
          <el-radio-group v-model="formData.ratio" class="ratio-list">
            <el-radio
              v-for="ratio in ratios"
              :key="ratio.ratioId"
              :value="ratio.value"
              class="ratio-card"
              :class="{ 'is-selected': formData.ratio === ratio.value }"
            >
              <view class="ratio-card-main">
                <text class="ratio-badge">{{ ratio.value }}</text>
                <view class="ratio-info">
                  <view class="ratio-name">
                    <text>{{ ratio.name }}</text>
                    <text v-if="ratio.recommended" class="recommend"> 默认推荐 </text>
                  </view>
                  <text class="ratio-desc">{{ ratio.description }}</text>
                </view>
              </view>
              <el-icon v-if="formData.ratio === ratio.value" class="ratio-check">
                <Check />
              </el-icon>
            </el-radio>
          </el-radio-group>
        </el-form-item>

        <el-radio-group
          v-model="formData.mode"
          class="mode-switch"
          @change="handleModeChange"
        >
          <el-radio-button
            v-for="mode in modes"
            :key="mode.modeId"
            :value="mode.modeId"
            class="mode-option"
          >
            <el-icon>
              <VideoCamera v-if="mode.modeId === 'text'" />
              <PictureFilled v-else />
            </el-icon>
            <text>{{ mode.name }}</text>
          </el-radio-button>
        </el-radio-group>

        <el-form-item
          v-if="formData.mode === 'image'"
          prop="imagePath"
          class="image-form-item"
        >
          <view class="image-picker">
            <app-image
              v-if="selectedImage"
              class="image-thumb"
              :src="selectedImage.url || selectedImage.path"
              mode="aspectFill"
            />
            <view class="image-copy">
              <text class="image-title">{{ imageTitle }}</text>
              <text class="image-hint">{{ imageHint }}</text>
            </view>
            <el-button class="image-pick-button" @click="chooseImage">
              <el-icon><Upload /></el-icon>
              {{ selectedImage ? "更换" : "选图" }}
            </el-button>
          </view>
        </el-form-item>

        <el-form-item prop="prompt" class="prompt-form-item">
          <view class="prompt-card">
            <view class="prompt-head">
              <text class="prompt-title">意境构想</text>
              <el-button link class="prompt-clear" @click="clearPrompt">
                <el-icon><RefreshLeft /></el-icon>
                清空辞藻
              </el-button>
            </view>
            <el-input
              v-model="formData.prompt"
              type="textarea"
              :maxlength="promptLimit"
              :rows="4"
              resize="none"
              class="prompt-input"
              placeholder="写下动卷意境，点染光影与运镜"
            />
            <view class="prompt-foot">
              <text class="prompt-count">
                {{ formData.prompt.length }} / {{ promptLimit }}字
              </text>
              <el-button class="polish-button" @click="polishPrompt">
                <el-icon><MagicStick /></el-icon>
                润色辞藻
              </el-button>
            </view>
          </view>
        </el-form-item>

        <view class="suggestion-head">
          <el-icon><EditPen /></el-icon>
          <text>笔墨词枕 · 点击引入灵感</text>
        </view>
        <view class="suggestions">
          <el-button
            v-for="item in suggestions"
            :key="item"
            class="suggestion-chip"
            @click="appendPrompt(item)"
          >
            <el-icon><Plus /></el-icon>
            <text>{{ item }}</text>
          </el-button>
        </view>
      </el-form>
    </scroll-view>

    <view class="bottom-bar" :style="barKeyboardStyle">
      <el-button
        class="next-button"
        :loading="isSubmitting"
        :disabled="isSubmitting"
        @click="goNext"
      >
        下一步：规格画质
        <el-icon v-if="!isSubmitting" class="next-icon"><ArrowRight /></el-icon>
      </el-button>
    </view>
  </view>
  <!-- #endif -->

  <!-- #ifndef H5 -->
  <view class="platform-unavailable">
    <app-page-header title="生成视频" />
    <text class="platform-tip">
      视频创作依赖 Element Plus，请使用 H5 端体验完整交互。
    </text>
  </view>
  <!-- #endif -->
</template>

<script setup>
import { computed, reactive, ref } from "vue";

// #ifdef H5
import {
  ArrowRight,
  Check,
  EditPen,
  MagicStick,
  PictureFilled,
  Plus,
  RefreshLeft,
  Upload,
  VideoCamera,
} from "@element-plus/icons-vue";
// #endif

import AppImage from "@/components/AppImage/index.vue";
import AppPageHeader from "@/components/AppPageHeader/index.vue";
import AppStateHint from "@/components/AppStateHint/index.vue";
import useKeyboardInset from "@/hooks/useKeyboardInset";
import { DRAFT_KEYS, saveCreationDraft } from "@/utils/creation-draft";
import { chooseSingleImage } from "@/utils/image-picker";
import { appendPromptText, polishPromptText } from "@/utils/prompt";
import { getErrorMessage } from "@/utils/request";

const ratios = [
  {
    ratioId: 1,
    value: "16:9",
    name: "16:9 横屏",
    description: "视野宽广 · 磅礴画卷",
    recommended: true,
  },
  {
    ratioId: 2,
    value: "9:16",
    name: "9:16 竖屏",
    description: "长幅沉浸 · 适宜移轴",
  },
  {
    ratioId: 3,
    value: "1:1",
    name: "1:1 镜心",
    description: "方正静穆 · 斗方小品",
  },
];
const modes = [
  { modeId: "text", name: "文字生视频" },
  { modeId: "image", name: "图卷生动境" },
];
const suggestions = ["清溪泛舟", "浮岚暖翠", "寒江雪霁", "竹影摇曳"];
const promptLimit = 300;
const polishSuffix = "水波微澜，晨雾轻笼，气韵徐徐流转";
const selectedImage = ref(null);
const isSubmitting = ref(false);
const formRef = ref(null);
const { keyboardInset } = useKeyboardInset();
const contentKeyboardStyle = computed(() => ({
  paddingBottom:
    keyboardInset.value > 0
      ? `calc(var(--content-bottom-pad) + ${keyboardInset.value}px)`
      : undefined,
}));
const barKeyboardStyle = computed(() => ({
  bottom: keyboardInset.value > 0 ? `${keyboardInset.value}px` : undefined,
}));
const formData = reactive({
  ratio: "16:9",
  mode: "text",
  prompt: "孤舟蓑笠，江雪霏霏，水波微澜，远山在晨雾中徐徐隐退",
  imagePath: "",
});

const imageTitle = computed(() => selectedImage.value?.name || "传入一张图卷");
const imageHint = computed(() =>
  selectedImage.value
    ? "点击更换图卷，将以图卷起点延展运镜"
    : "从相册选择或拍摄，作为动卷起点"
);

/**
 * 校验意境构想，文字生视频模式下必填。
 * @param {Object} rule 校验规则。
 * @param {string} value 当前意境内容。
 * @param {Function} callback 校验回调。
 * @returns {void}
 */
const validatePrompt = (rule, value, callback) => {
  if (formData.mode === "text" && !String(value || "").trim()) {
    callback(new Error("请先填写意境构想"));
    return;
  }

  callback();
};

/**
 * 校验图卷，图卷生动境模式下必选。
 * @param {Object} rule 校验规则。
 * @param {string} value 图卷路径。
 * @param {Function} callback 校验回调。
 * @returns {void}
 */
const validateImage = (rule, value, callback) => {
  if (formData.mode === "image" && !value) {
    callback(new Error("请先传入一张图卷"));
    return;
  }

  callback();
};

const formRules = {
  ratio: [{ required: true, message: "请先选择画幅", trigger: "change" }],
  imagePath: [{ validator: validateImage, trigger: "change" }],
  prompt: [{ validator: validatePrompt, trigger: "blur" }],
};

// 切换创作模式时清除另一模式留下的校验提示
const handleModeChange = () => {
  formRef.value?.clearValidate(["prompt", "imagePath"]);
};

/**
 * 将灵感词追加到意境构想，已有内容时用逗号衔接。
 * @param {string} value 待追加的灵感词。
 * @returns {void}
 */
const appendPrompt = (value) => {
  formData.prompt = appendPromptText(formData.prompt, value);
};

// 清空意境构想并移除对应校验提示
const clearPrompt = () => {
  formData.prompt = "";
  formRef.value?.clearValidate("prompt");
};

// 在现有意境后追加润色句式，空意境时以寒江雪意起笔
const polishPrompt = () => {
  const suffix = polishSuffix || "墨色清润，气韵徐徐流转";

  formData.prompt = polishPromptText(
    formData.prompt.trim(),
    suffix,
    `寒江孤舟，雪意朦胧，水波缓缓流动，${suffix}`
  );
};

// 从系统相册或相机选择图卷并上传，失败时保留已有图卷
const chooseImage = async () => {
  try {
    const image = await chooseSingleImage();
    selectedImage.value = { ...image, url: image.path };
    formData.imagePath = image.path;
    formRef.value?.clearValidate("imagePath");
  } catch (error) {
    if (!String(error?.errMsg || "").includes("cancel")) {
      uni.showToast({
        title: getErrorMessage(error, "选择图卷失败"),
        icon: "none",
      });
    }
  }
};

// 校验规制与意境后保存草稿，进入画质与渲染页
const goNext = async () => {
  if (isSubmitting.value) {
    return;
  }

  try {
    await formRef.value.validate();
  } catch (error) {
    return;
  }

  const selectedRatioItem = ratios.find((ratio) => ratio.value === formData.ratio);

  isSubmitting.value = true;
  saveCreationDraft(DRAFT_KEYS.video, {
    mode: formData.mode,
    ratio: formData.ratio,
    ratioName: selectedRatioItem?.name || formData.ratio,
    prompt: formData.prompt.trim(),
    imagePath: formData.imagePath,
  });
  uni.navigateTo({
    url: "/pages/video-render/index",
    complete: () => {
      isSubmitting.value = false;
    },
  });
};

// 加载规制与意境配置，供首次进入与失败重试复用。
</script>

<style scoped lang="scss">
.video-creation-page {
  height: 100vh;
  overflow: hidden;
  background: $color-bg-page;
  color: $color-ink;

  --el-color-primary: #{$color-primary};
  --el-color-primary-light-3: #3b8873;
  --el-color-primary-light-5: #6fa99a;
  --el-color-primary-light-7: #a8c9bf;
  --el-color-primary-light-9: #e7f2ee;
  --el-border-radius-base: #{$radius-sm};
  --el-font-family: #{$font-family-base};
  --el-font-size-base: #{$font-size-body};
}

.content {
  --content-bottom-pad: #{$space-9};
  height: calc(100vh - 350rpx - var(--status-bar-height, 0px));
  overflow-x: hidden;
  padding: $space-5 $space-7 var(--content-bottom-pad);
  box-sizing: border-box;
}

.options-state {
  margin-top: $space-6;
}

.creation-form {
  width: 100%;
}

/* 步骤条：与文字生图页统一样式 */
.step-bar {
  height: 82rpx;
  margin: $space-3 $space-7 0;
  padding: $space-1;
  display: flex;
  align-items: center;
  border: 1rpx solid rgba(63, 102, 86, 0.12);
  border-radius: $radius-2xl;
  background: rgba(255, 255, 255, 0.86);
  box-shadow: 0 8rpx 22rpx rgba(19, 76, 68, 0.06);
}

.step {
  flex: 1;
  padding: $space-2 0;
  border-radius: $radius-md;
  color: $color-muted;
  text-align: center;
  font-size: $font-size-caption;
  white-space: nowrap;
}

.step i {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 40rpx;
  height: 40rpx;
  margin-right: $space-1;
  border-radius: 50%;
  background: #dfdfd5;
  color: $color-muted;
  font-style: normal;
  font-size: $font-size-badge;
}

.step-connector {
  flex: 1;
  height: 2rpx;
  margin: 0 $space-3;
  background: linear-gradient(90deg, $color-primary-soft, #dfdfd5);
}

.step.active {
  background: $color-primary;
  color: #fff;
  font-weight: $font-weight-bold;

  i {
    /* 徽章底色与步骤底色一致时改为半透明白底，避免圆形徽章融进背景 */
    background: rgba(255, 255, 255, 0.24);
    color: #fff;
  }
}

/* 画幅规制 */
.section-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: $space-3;
  margin: $space-6 $space-1 $space-3;
}

.section-title {
  display: flex;
  align-items: center;
  color: $color-ink;
  font-size: $font-size-title;
  font-weight: $font-weight-bold;
}

.section-bar {
  width: 7rpx;
  height: 30rpx;
  margin-right: $space-2;
  border-radius: 6rpx;
  background: $color-primary;
}

.section-hint {
  flex-shrink: 0;
  color: $color-muted;
  font-size: $font-size-caption;
}

.ratio-form-item {
  margin-bottom: 24rpx;

  :deep(.el-form-item__content) {
    display: block;
  }

  :deep(.el-form-item__error) {
    position: static;
    padding-top: 10rpx;
  }
}

.ratio-list {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
  width: 100%;
}

.ratio-card {
  width: 100%;
  height: auto;
  min-height: 92rpx;
  margin: 0;
  padding: $space-5;
  border: 2rpx solid transparent;
  border-radius: $radius-xl;
  background: $color-surface;
  box-sizing: border-box;

  :deep(.el-radio__input) {
    display: none;
  }

  :deep(.el-radio__label) {
    display: flex;
    flex: 1;
    align-items: center;
    width: 100%;
    padding: 0;
    color: inherit;
    font-size: inherit;
    white-space: normal;
  }

  &.is-selected {
    border-color: $color-primary;
    box-shadow: 0 8rpx 20rpx rgba(5, 96, 76, 0.08);
  }
}

.ratio-card-main {
  display: flex;
  flex: 1;
  align-items: center;
  min-width: 0;
}

.ratio-badge {
  display: flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  width: 100rpx;
  height: 64rpx;
  border-radius: $radius-sm;
  background: $color-primary-light;
  color: $color-primary-soft;
  font-size: $font-size-badge;
  font-weight: $font-weight-bold;
}

.ratio-card.is-selected .ratio-badge {
  background: $color-primary;
  color: #fff;
}

.ratio-info {
  flex: 1;
  min-width: 0;
  margin-left: $space-4;
}

.ratio-name {
  display: flex;
  align-items: center;
  color: $color-ink;
  font-size: $font-size-aux;
  font-weight: $font-weight-bold;
}

.recommend {
  flex-shrink: 0;
  margin-left: $space-2;
  padding: 4rpx $space-1;
  border-radius: $radius-xs;
  background: $color-primary-light;
  color: $color-primary-soft;
  font-size: $font-size-badge;
  font-weight: $font-weight-regular;
}

.ratio-desc {
  display: block;
  margin-top: $space-1;
  color: $color-muted;
  font-size: $font-size-caption;
  line-height: $line-height-normal;
}

.ratio-check {
  flex-shrink: 0;
  width: 38rpx;
  height: 38rpx;
  margin-left: $space-3;
  border-radius: 50%;
  background: $color-primary;
  color: #fff;
  font-size: $font-size-badge;
}

/* 创作模式 */
.mode-switch {
  display: flex;
  gap: 8rpx;
  width: 100%;
  margin-top: 6rpx;
  padding: 8rpx;
  border-radius: $radius-lg;
  background: $color-primary-light;

  :deep(.el-radio-button) {
    flex: 1;
  }

  :deep(.el-radio-button__inner) {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8rpx;
    width: 100%;
    height: 76rpx;
    padding: 0;
    border: 0;
    border-radius: $radius-md;
    background: transparent;
    box-shadow: none;
    color: $color-ink-soft;
    font-size: $font-size-caption;
  }

  :deep(.el-radio-button__original-radio:checked + .el-radio-button__inner) {
    background: $color-surface;
    color: $color-primary;
    font-weight: $font-weight-bold;
    box-shadow: 0 4rpx 12rpx rgba(5, 96, 76, 0.08);
  }

  :deep(.el-icon) {
    font-size: $font-size-badge;
  }
}

/* 图卷选择 */
.image-form-item {
  margin: 20rpx 0 0;

  :deep(.el-form-item__content) {
    display: block;
  }

  :deep(.el-form-item__error) {
    position: static;
    padding-top: 10rpx;
  }
}

.image-picker {
  display: flex;
  align-items: center;
  gap: $space-3;
  padding: $space-4 $space-5;
  border: 2rpx dashed #bfd8ce;
  border-radius: $radius-lg;
  background: $color-surface;
}

.image-thumb {
  flex-shrink: 0;
  width: 104rpx;
  height: 78rpx;
  border-radius: $radius-xs;
}

.image-copy {
  flex: 1;
  min-width: 0;
}

.image-title {
  display: block;
  overflow: hidden;
  color: $color-ink;
  font-size: $font-size-aux;
  font-weight: $font-weight-bold;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.image-hint {
  display: block;
  margin-top: $space-1;
  color: $color-muted;
  font-size: $font-size-badge;
  line-height: $line-height-normal;
}

.image-pick-button {
  @include tap-area(72rpx);
  flex-shrink: 0;
  height: 72rpx;
  margin: 0;
  padding: 0 $space-3;
  border: 1rpx solid #bfd8ce;
  border-radius: $radius-sm;
  background: $color-surface-muted;
  color: $color-primary-soft;
  font-size: $font-size-badge;

  :deep(.el-icon) {
    margin-right: 6rpx;
    font-size: $font-size-badge;
  }

  &:hover {
    border-color: $color-primary;
    background: $color-primary-light;
    color: $color-primary;
  }
}

/* 意境构想 */
.prompt-form-item {
  margin: 22rpx 0 0;

  :deep(.el-form-item__content) {
    display: block;
  }

  :deep(.el-form-item__error) {
    position: static;
    padding-top: 10rpx;
  }
}

.prompt-card {
  padding: $space-6 $space-5;
  border-radius: $radius-xl;
  background: $color-surface;
}

.prompt-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: $space-3;
}

.prompt-title {
  color: $color-ink;
  font-size: $font-size-body;
  font-weight: $font-weight-bold;
}

.prompt-clear {
  @include tap-area(56rpx);
  height: 56rpx;
  padding: 0 $space-1;
  color: $color-muted;
  font-size: $font-size-caption;

  &:hover {
    color: $color-primary;
  }

  :deep(.el-icon) {
    margin-right: 4rpx;
    font-size: $font-size-badge;
  }
}

.prompt-input {
  width: 100%;
  margin-top: $space-3;

  :deep(.el-textarea__inner) {
    min-height: 210rpx;
    padding: $space-4;
    border: 0;
    border-radius: $radius-md;
    background: $color-surface-muted;
    box-shadow: none;
    color: $color-ink;
    font-size: $font-size-body;
    line-height: $line-height-normal;
  }
}

.prompt-foot {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: $space-3;
}

.prompt-count {
  color: $color-muted;
  font-size: $font-size-badge;
  @include numeric;
}

.polish-button {
  @include tap-area(64rpx);
  height: 64rpx;
  margin: 0;
  padding: 0 $space-5;
  border: 0;
  border-radius: $radius-md;
  background: #d9efe6;
  color: $color-primary;
  font-size: $font-size-badge;

  &:hover {
    background: #c7e7db;
    color: $color-primary;
  }

  :deep(.el-icon) {
    margin-right: 6rpx;
    font-size: $font-size-badge;
  }
}

/* 灵感词枕 */
.suggestion-head {
  display: flex;
  align-items: center;
  gap: 8rpx;
  margin: $space-5 $space-1 0;
  color: $color-primary-soft;
  font-size: $font-size-caption;

  :deep(.el-icon) {
    font-size: $font-size-badge;
  }
}

.suggestions {
  display: flex;
  flex-wrap: wrap;
  gap: $space-3;
  margin-top: $space-3;
}

.suggestion-chip {
  height: 64rpx;
  margin: 0;
  padding: 0 $space-3;
  border: 1rpx solid $color-line;
  border-radius: $radius-md;
  background: $color-surface;
  color: $color-ink-soft;
  font-size: $font-size-badge;
  font-weight: $font-weight-regular;

  &:hover {
    border-color: #bfd8ce;
    background: $color-surface-muted;
    color: $color-ink-soft;
  }

  :deep(.el-icon) {
    margin-right: 6rpx;
    font-size: $font-size-badge;
  }
}

/* 底部操作 */
.bottom-bar {
  @include action-bar;
  display: flex;
  align-items: center;
}

.next-button {
  flex: 1;
  width: 100%;
  height: $tap-size;
  min-width: 0;
  margin: 0;
  border: 0;
  border-radius: $radius-xl;
  background: $color-primary;
  color: #fff;
  font-size: $font-size-body;
  font-weight: $font-weight-bold;

  &:hover {
    background: $color-primary-dark;
    color: #fff;
  }

  &.is-disabled {
    opacity: 0.55;
  }
}

.next-icon {
  margin-left: 8rpx;
  font-size: $font-size-badge;
}

.platform-unavailable {
  min-height: 100vh;
  background: $color-bg-page;
}

.platform-tip {
  display: block;
  padding: 80rpx $space-9;
  color: $color-ink-soft;
  font-size: $font-size-body;
  line-height: $line-height-relaxed;
  text-align: center;
}
</style>
