<template>
  <!-- #ifdef H5 -->
  <view class="video-creation-page">
    <app-page-header title="视频创作" />
    <view class="step-bar">
      <view class="step active"> <i>1</i><text>规制与意境</text> </view>
      <view class="step-connector"></view>
      <view class="step inactive"><i>2</i><text>画质与渲染</text></view>
    </view>
    <view class="scroll-window">
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
          <view class="config-card">
            <view class="config-title"><em>壹 ·</em> 规制画幅</view>
            <el-form-item prop="ratio" class="ratio-form-item">
              <el-radio-group v-model="formData.ratio" class="ratio-list">
                <el-radio
                  v-for="(ratio, index) in ratios"
                  :key="ratio.ratioId"
                  :value="ratio.value"
                  class="ratio-card"
                  :class="[
                    `is-ratio-${index + 1}`,
                    { 'is-selected': formData.ratio === ratio.value },
                  ]"
                >
                  <text class="ratio-badge">{{ ratio.value }}</text>
                  <text class="ratio-name">{{ ratio.name }}</text>
                  <text class="ratio-desc">{{ ratio.description }}</text>
                  <text v-if="ratio.recommended" class="recommend">推荐</text>
                </el-radio>
              </el-radio-group>
            </el-form-item>
          </view>

          <view class="config-card">
            <view class="config-title"><em>贰 ·</em> 创作模式</view>
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
          </view>

          <view class="config-card">
            <view class="config-title prompt-title">
              <view><em>叁 ·</em> 意境构想</view>
              <el-button link class="prompt-clear" @click="clearPrompt">
                <el-icon><RefreshLeft /></el-icon>
                清空辞藻
              </el-button>
            </view>
            <el-form-item prop="prompt" class="prompt-form-item">
              <el-input
                v-model="formData.prompt"
                type="textarea"
                :maxlength="promptLimit"
                :rows="4"
                resize="none"
                class="prompt-input"
                placeholder="写下动卷意境，点染光影与运镜"
              />
            </el-form-item>
            <view class="prompt-foot">
              <text class="prompt-count">
                {{ formData.prompt.length }} / {{ promptLimit }}字
              </text>
              <el-button class="polish-button" @click="polishPrompt">
                <el-icon><MagicStick /></el-icon>
                润色辞藻
              </el-button>
            </view>

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
          </view>
        </el-form>
      </scroll-view>
    </view>

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
    <app-page-header title="视频创作" />
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
import useKeyboardInset from "@/hooks/useKeyboardInset";
import { DRAFT_KEYS, saveCreationDraft } from "@/utils/creation-draft";
import { chooseSingleImage } from "@/utils/image-picker";
import { appendPromptText, polishPromptText } from "@/utils/prompt";
import { getErrorMessage } from "@/utils/request";

const ratios = [
  {
    ratioId: 1,
    value: "16:9",
    name: "横屏画卷",
    description: "磅礴画卷",
    recommended: true,
  },
  {
    ratioId: 2,
    value: "9:16",
    name: "竖屏立轴",
    description: "适宜移轴",
  },
  {
    ratioId: 3,
    value: "1:1",
    name: "方正镜心",
    description: "斗方小品",
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
    keyboardInset.value > 0 ? `${keyboardInset.value}px` : undefined,
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
    : "从相册选择或拍摄，作为动卷起点",
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
    `寒江孤舟，雪意朦胧，水波缓缓流动，${suffix}`,
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

  const selectedRatioItem = ratios.find(
    (ratio) => ratio.value === formData.ratio,
  );

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
</script>

<style scoped lang="scss">
.video-creation-page {
  display: flex;
  flex-direction: column;
  height: 100vh;
  overflow: hidden;
  /* 为固定底栏预留高度，避免滚动窗下缘被底栏遮挡 */
  padding-bottom: calc(132rpx + constant(safe-area-inset-bottom));
  padding-bottom: calc(132rpx + env(safe-area-inset-bottom));
  box-sizing: border-box;
  background: linear-gradient(180deg, #ffecd2 0%, #fff8ec 48%, #fffdfb 100%);
  color: $color-ink;

  --el-color-primary: #{$color-primary};
  --el-color-primary-light-3: #c89a63;
  --el-color-primary-light-5: #d6b689;
  --el-color-primary-light-7: #e4d0ad;
  --el-color-primary-light-9: #f7edde;
  --el-border-radius-base: #{12rpx};
  --el-font-family: #{$font-family-base};
  --el-font-size-base: #{28rpx};
}

.app-page-header,
.step-bar {
  flex: none;
}

/* 滚动窗：占据页头与底栏之间的全部剩余高度，边缘渐隐弱化切割感 */
.scroll-window {
  position: relative;
  flex: 1;
  min-height: 0;

  &::before,
  &::after {
    content: "";
    position: absolute;
    right: 0;
    left: 0;
    z-index: 2;
    height: 28rpx;
    pointer-events: none;
  }

  &::before {
    top: 0;
    background: linear-gradient(180deg, #fff3e0, rgba(255, 243, 224, 0));
  }

  &::after {
    bottom: 0;
    background: linear-gradient(0deg, #fffdfb, rgba(255, 253, 251, 0));
  }
}

.content {
  height: 100%;
  overflow-x: hidden;
  padding: 0 32rpx;
  box-sizing: border-box;
}

.creation-form {
  width: 100%;
  /* 呼吸边距放在滚动内容内部，滚动到顶/底时卡片不被贴边硬切 */
  padding: 35rpx 0 48rpx;
}

/* 卡片与区块标题：与文字生图页统一样式 */
.config-card {
  margin: 0 6rpx 28rpx;
  padding: 28rpx;
  border-radius: 24rpx;
  background: $color-surface;
  box-shadow: 0 6rpx 20rpx rgba(150, 100, 40, 0.14);
}

.config-card:first-child {
  margin-top: 0;
}

.config-title {
  padding-bottom: 28rpx;
  color: #8a6840;
  font-size: 34rpx;
  font-weight: 700;
}

.config-title em {
  color: #d9be9b;
}

/* 步骤条：与文字生图页统一样式 */
.step-bar {
  height: 82rpx;
  margin: 16rpx 32rpx 0;
  padding: 8rpx;
  display: flex;
  align-items: center;
  border: 1rpx solid rgba(63, 102, 86, 0.12);
  border-radius: 28rpx;
  background: rgba(255, 255, 255, 0.86);
  box-shadow: 0 8rpx 22rpx rgba(19, 76, 68, 0.06);
}

.step {
  flex: 1;
  padding: 12rpx 0;
  border-radius: 16rpx;
  color: $color-muted;
  text-align: center;
  font-size: 24rpx;
  white-space: nowrap;
}

.step i {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 40rpx;
  height: 40rpx;
  margin-right: 8rpx;
  border-radius: 50%;
  background: #dfdfd5;
  color: $color-muted;
  font-style: normal;
  font-size: 22rpx;
}

.step-connector {
  flex: 1;
  height: 2rpx;
  margin: 0 16rpx;
  background: linear-gradient(90deg, #8a6840, #dfdfd5);
}

.step.active {
  background: $color-primary;
  color: #fff;
  font-weight: 700;

  i {
    /* 徽章底色与步骤底色一致时改为半透明白底，避免圆形徽章融进背景 */
    background: rgba(255, 255, 255, 0.24);
    color: #fff;
  }
}

/* 画幅规制 */
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
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16rpx;
  width: 100%;
}

/* ============================================================
 * 桌面 H5 适配：992px 以上画幅比例四列排布
 * ============================================================ */
@media (min-width: 992px) {
  .ratio-list {
    grid-template-columns: repeat(4, 1fr);
  }
}

.ratio-card {
  position: relative;
  width: 100%;
  height: auto;
  min-height: 0;
  margin: 0;
  padding: 24rpx 12rpx 16rpx;
  border: 2rpx solid transparent;
  border-radius: 20rpx;
  background: #f8faf7;
  box-sizing: border-box;

  :deep(.el-radio__input) {
    display: none;
  }

  :deep(.el-radio__label) {
    display: flex;
    flex-direction: column;
    flex: 1;
    align-items: center;
    gap: 12rpx;
    width: 100%;
    padding: 0;
    color: inherit;
    font-size: inherit;
    white-space: normal;
  }

  &.is-selected {
    border-color: $color-primary;
    background: linear-gradient(135deg, #f7edde 0%, #f7faf8 100%);
    box-shadow: 0 0 0 1rpx $color-primary inset;
  }
}

.ratio-badge {
  display: flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  width: 88rpx;
  height: 52rpx;
  border-radius: 12rpx;
  font-size: 22rpx;
  font-weight: 700;
}

/* 各画幅徽章的识别色，选中时统一归为主色 */
.ratio-card.is-ratio-1 .ratio-badge {
  background: #e6f2ee;
  color: $color-primary;
}

.ratio-card.is-ratio-2 .ratio-badge {
  background: #f7efdd;
  color: $color-warning;
}

.ratio-card.is-ratio-3 .ratio-badge {
  background: #eceaf6;
  color: #595bdc;
}

.ratio-card.is-selected .ratio-badge {
  background: $color-primary;
  color: #fff;
}

.ratio-name {
  color: $color-ink;
  font-size: 24rpx;
  font-weight: 700;
}

.ratio-card.is-selected .ratio-name {
  color: $color-primary;
}

.ratio-desc {
  color: $color-muted;
  font-size: 22rpx;
  line-height: 1.3;
  @include text-ellipsis;
}

.recommend {
  position: absolute;
  top: 8rpx;
  right: 8rpx;
  padding: 2rpx 10rpx;
  border-radius: 8rpx;
  background: #9dff3d;
  color: #1c5e09;
  font-size: 18rpx;
  line-height: 1.5;
}

/* 创作模式 */
.mode-switch {
  display: flex;
  gap: 8rpx;
  width: 100%;
  margin-top: 0;
  padding: 8rpx;
  border-radius: 20rpx;
  background: #f7edde;

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
    border-radius: 16rpx;
    background: transparent;
    box-shadow: none;
    color: #4e665e;
    font-size: 24rpx;
  }

  :deep(.el-radio-button__original-radio:checked + .el-radio-button__inner) {
    background: $color-surface;
    color: $color-primary;
    font-weight: 700;
    box-shadow: 0 4rpx 12rpx rgba(5, 96, 76, 0.08);
  }

  :deep(.el-icon) {
    font-size: 22rpx;
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
  gap: 16rpx;
  padding: 20rpx 24rpx;
  border: 2rpx dashed #bfd8ce;
  border-radius: 20rpx;
  background: $color-surface;
}

.image-thumb {
  flex-shrink: 0;
  width: 104rpx;
  height: 78rpx;
  border-radius: 8rpx;
}

.image-copy {
  flex: 1;
  min-width: 0;
}

.image-title {
  display: block;
  overflow: hidden;
  color: $color-ink;
  font-size: 26rpx;
  font-weight: 700;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.image-hint {
  display: block;
  margin-top: 8rpx;
  color: $color-muted;
  font-size: 22rpx;
  line-height: 1.6;
}

.image-pick-button {
  @include tap-area(72rpx);
  flex-shrink: 0;
  height: 72rpx;
  margin: 0;
  padding: 0 16rpx;
  border: 1rpx solid #bfd8ce;
  border-radius: 12rpx;
  background: #f8faf7;
  color: #8a6840;
  font-size: 22rpx;

  :deep(.el-icon) {
    margin-right: 6rpx;
    font-size: 22rpx;
  }

  &:hover {
    border-color: $color-primary;
    background: #f7edde;
    color: $color-primary;
  }
}

/* 意境构想 */
.prompt-form-item {
  margin: 0;

  :deep(.el-form-item__content) {
    display: block;
  }

  :deep(.el-form-item__error) {
    position: static;
    padding-top: 10rpx;
  }
}

.prompt-title {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16rpx;
}

.prompt-clear {
  @include tap-area(56rpx);
  height: 56rpx;
  padding: 0 8rpx;
  color: $color-muted;
  font-size: 24rpx;

  &:hover {
    color: $color-primary;
  }

  :deep(.el-icon) {
    margin-right: 4rpx;
    font-size: 22rpx;
  }
}

.prompt-input {
  width: 100%;
  margin-top: 16rpx;

  :deep(.el-textarea__inner) {
    min-height: 210rpx;
    padding: 20rpx;
    border: 0;
    border-radius: 16rpx;
    background: #f8faf7;
    box-shadow: none;
    color: $color-ink;
    font-size: 28rpx;
    line-height: 1.6;
  }
}

.prompt-foot {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 16rpx;
}

.prompt-count {
  color: $color-muted;
  font-size: 22rpx;
  @include numeric;
}

.polish-button {
  @include tap-area(64rpx);
  height: 64rpx;
  margin: 0;
  padding: 0 24rpx;
  border: 0;
  border-radius: 16rpx;
  background: #f3e4cd;
  color: $color-primary;
  font-size: 22rpx;

  &:hover {
    background: #ecd8b8;
    color: $color-primary;
  }

  :deep(.el-icon) {
    margin-right: 6rpx;
    font-size: 22rpx;
  }
}

/* 灵感词枕 */
.suggestion-head {
  display: flex;
  align-items: center;
  gap: 8rpx;
  margin: 24rpx 8rpx 0;
  color: #8a6840;
  font-size: 24rpx;

  :deep(.el-icon) {
    font-size: 22rpx;
  }
}

.suggestions {
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;
  margin-top: 16rpx;
}

.suggestion-chip {
  height: 64rpx;
  margin: 0;
  padding: 0 16rpx;
  border: 1rpx solid $color-line;
  border-radius: 16rpx;
  background: $color-surface;
  color: #4e665e;
  font-size: 22rpx;
  font-weight: 400;

  &:hover {
    border-color: #bfd8ce;
    background: #f8faf7;
    color: #4e665e;
  }

  :deep(.el-icon) {
    margin-right: 6rpx;
    font-size: 22rpx;
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
  border-radius: 24rpx;
  background: $color-primary;
  color: #fff;
  font-size: 28rpx;
  font-weight: 700;

  &:hover {
    background: #9c6e38;
    color: #fff;
  }

  &.is-disabled {
    opacity: 0.55;
  }
}

.next-icon {
  margin-left: 8rpx;
  font-size: 22rpx;
}

.platform-unavailable {
  min-height: 100vh;
  background: linear-gradient(180deg, #ffecd2 0%, #fff8ec 48%, #fffdfb 100%);
}

.platform-tip {
  display: block;
  padding: 80rpx 48rpx;
  color: #4e665e;
  font-size: 28rpx;
  line-height: 1.8;
  text-align: center;
}
</style>
