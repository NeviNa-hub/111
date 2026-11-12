<template>
  <view class="auth-page">
    <app-page-header title="妙笔生花" :show-points="false" />

    <view class="auth-body">
      <view class="auth-brand">
        <view class="brand-seal">笔</view>
        <text class="brand-name">妙笔生花</text>
        <text class="brand-slogan">落墨成画，凝帧为诗</text>
      </view>

      <scroll-view scroll-y class="auth-scroll" :show-scrollbar="false">
        <view class="hero-card">
          <text class="auth-eyebrow"> {{ isRegister ? "请注册" : "请登录" }}</text>
          <text class="brand-subtitle">
            {{
              isRegister
                ? "创建账号，实现你的第一份灵感。"
                : "登录后继续创作，查看你的作品。"
            }}
          </text>
        </view>

        <el-form
          ref="formRef"
          class="form-card"
          :model="formModel"
          :rules="formRules"
          :validate-on-rule-change="false"
          status-icon
        >
          <view class="field-label"> 账号 </view>
          <el-form-item prop="account" class="auth-form-item">
            <el-input
              v-model="formModel.account"
              class="field-input"
              :placeholder="isRegister ? '请输入账号' : '请输入登录账号'"
              maxlength="64"
              autocomplete="username"
            >
              <template #prefix>
                <view class="field-icon"></view>
              </template>
            </el-input>
          </el-form-item>

          <view v-if="isRegister" class="field-label">用户名</view>
          <el-form-item v-if="isRegister" prop="username" class="auth-form-item">
            <el-input
              v-model="formModel.username"
              class="field-input"
              placeholder="请输入用户名"
              maxlength="64"
            >
              <template #prefix>
                <view class="field-icon"></view>
              </template>
            </el-input>
          </el-form-item>

          <view class="label-row">
            <text class="field-label">密码</text>
            <text v-if="!isRegister" class="link-text">忘记密码？</text>
          </view>
          <el-form-item prop="password" class="auth-form-item">
            <el-input
              v-model="formModel.password"
              class="field-input"
              :placeholder="isRegister ? '请设置登录密码' : '请输入登录密码'"
              maxlength="128"
              :type="isPasswordVisible ? 'text' : 'password'"
              autocomplete="current-password"
            >
              <template #prefix>
                <view class="field-icon"></view>
              </template>
              <template #suffix>
                <text class="eye-toggle" @tap="isPasswordVisible = !isPasswordVisible">
                  {{ isPasswordVisible ? "◉" : "◎" }}
                </text>
              </template>
            </el-input>
          </el-form-item>

          <view v-if="isRegister" class="field-label">确认密码</view>
          <el-form-item v-if="isRegister" prop="confirmPassword" class="auth-form-item">
            <el-input
              v-model="formModel.confirmPassword"
              class="field-input"
              placeholder="请再次输入密码"
              maxlength="128"
              :type="isConfirmVisible ? 'text' : 'password'"
              autocomplete="new-password"
            >
              <template #prefix>
                <view class="field-icon"></view>
              </template>
            </el-input>
          </el-form-item>
          <view class="agreement-row" @tap="hasAgreed = !hasAgreed">
            <view class="checkbox" :class="{ 'is-checked': hasAgreed }">
              <text v-if="hasAgreed">✓</text>
            </view>
            <text class="agreement-text">
              {{ isRegister ? "我已阅读并同意" : "已阅读并悉知" }}
              <text class="link-text">《丹青用户服务协议》</text> 与
              <text class="link-text">《行卷隐私保护政策》</text>
            </text>
          </view>
          <button class="submit-button" :disabled="isSubmitting" @tap="handleSubmit">
            {{ isRegister ? "创建账号" : "登录" }} <text>→</text>
          </button>
        </el-form>

        <view class="switch-row">
          <text class="switch-copy" @tap="toggleMode">
            {{ isRegister ? "已有账号？立即登录" : "初来乍到 · 新客注册" }}
            <text>→</text>
          </text>
        </view>
      </scroll-view>
    </view>
  </view>
</template>

<script setup>
import { computed, nextTick, reactive, ref } from "vue";

import { PAGE_PATHS } from "@/apis/constants";
import { loginUser, registerUser } from "@/apis/auth";
import { initializeSession } from "@/stores";
import AppPageHeader from "@/components/AppPageHeader/index.vue";

const formRef = ref(null);
const formModel = reactive({
  account: "",
  password: "",
  username: "",
  confirmPassword: "",
});
const isRegister = ref(false);
const hasAgreed = ref(false);
const isPasswordVisible = ref(false);
const isConfirmVisible = ref(false);
const isSubmitting = ref(false);
const formRules = computed(() => ({
  account: [
    {
      required: true,
      message: "请输入账号",
      trigger: "blur",
    },
    {
      pattern: /^[A-Za-z0-9_]{3,64}$/,
      message: "账号需为 3–64 位英文字母、数字或下划线",
      trigger: "blur",
    },
  ],
  password: [
    {
      required: true,
      message: "请输入密码",
      trigger: "blur",
    },
    {
      min: 8,
      max: 128,
      message: "密码长度需为 8–128 个字符",
      trigger: "blur",
    },
  ],
  username: isRegister.value
    ? [
        {
          required: true,
          whitespace: true,
          message: "请输入用户名",
          trigger: "blur",
        },
      ]
    : [],
  confirmPassword: isRegister.value
    ? [
        {
          required: true,
          message: "请再次输入密码",
          trigger: "blur",
        },
        {
          validator: (rule, value) =>
            value === formModel.password || new Error("两次输入的密码不一致"),
          trigger: "blur",
        },
      ]
    : [],
}));

// 切换登录与注册表单；切换后清空输入，避免把另一侧的填写内容带过来。
const toggleMode = () => {
  isRegister.value = !isRegister.value;
  Object.assign(formModel, {
    account: "",
    password: "",
    username: "",
    confirmPassword: "",
  });
  isPasswordVisible.value = false;
  isConfirmVisible.value = false;
  // 等新模式的表单项渲染完成后再清理校验提示，避免切换后直接显示报错
  nextTick(() => {
    formRef.value?.clearValidate();
  });
};

// 校验表单并提交登录或注册，成功后初始化会话并进入首页。
const handleSubmit = async () => {
  if (isSubmitting.value) {
    return;
  }

  try {
    await formRef.value.validate();
  } catch (error) {
    return;
  }

  if (!hasAgreed.value) {
    uni.showToast({ title: "请先阅读并同意服务协议与隐私政策", icon: "none" });
    return;
  }

  isSubmitting.value = true;

  try {
    const params = { account: formModel.account, password: formModel.password };

    // 注册接口只返回用户资料、不签发令牌，注册成功后切回登录态再获取会话。
    if (isRegister.value) {
      await registerUser({ username: formModel.username, ...params });
      isRegister.value = false;
      formRef.value?.clearValidate();
      uni.showToast({ title: "注册成功，请登录", icon: "none" });
      return;
    }

    const data = await loginUser(params);

    initializeSession(data);
    uni.showToast({ title: "登录成功", icon: "none" });
    uni.reLaunch({ url: PAGE_PATHS.HOME });
  } catch (error) {
    // 请求层已统一提示错误。
  } finally {
    isSubmitting.value = false;
  }
};
</script>

<style scoped lang="scss">
.auth-page {
  height: 100vh;
  overflow: hidden;
  background: linear-gradient(180deg, #ffecd2 0%, #fff8ec 48%, #fffdfb 100%);
  color: $color-ink;
}

.auth-body {
  height: calc(100vh - 100rpx - var(--status-bar-height, 0px));
}

/* 桌面端左侧品牌区，移动端隐藏 */
.auth-brand {
  display: none;
}

.auth-scroll {
  height: 100%;
  padding: 24rpx 24rpx calc(40rpx + env(safe-area-inset-bottom));
  box-sizing: border-box;
}

.hero-card {
  padding: 36rpx 32rpx 32rpx;
  text-align: left;
}

.auth-eyebrow {
  display: block;
  color: #2f2517;
  font-size: 40rpx;
  font-weight: 700;
  letter-spacing: 2rpx;
}

.landscape {
  position: relative;
  height: 300rpx;
  overflow: hidden;
  background: linear-gradient(180deg, #f0f4ee 0%, #fff 100%);
}

.mountain {
  position: absolute;
  right: -6%;
  bottom: 0;
  left: -6%;
  height: 78%;
  border-radius: 50% 50% 0 0;
  background: linear-gradient(
    145deg,
    rgba(187, 211, 198, 0.55),
    rgba(245, 239, 220, 0.35)
  );
  transform: rotate(-8deg);
}

.mountain-back {
  bottom: 48rpx;
  left: 15%;
  opacity: 0.7;
  transform: rotate(11deg);
}

.mountain-front {
  right: -25%;
  left: 35%;
  height: 54%;
  background: linear-gradient(
    120deg,
    rgba(215, 224, 206, 0.58),
    rgba(250, 246, 231, 0.72)
  );
}

.red-seal {
  position: absolute;
  top: 24rpx;
  right: 40rpx;
  padding: 12rpx;
  border-radius: 8rpx;
  background: #c93f39;
  color: #fff;
  font-size: 24rpx;
  line-height: 1.2;
}

.hero-panel {
  position: absolute;
  right: 28%;
  bottom: 0;
  left: 28%;
  height: 220rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  border: 1rpx solid rgba(90, 123, 112, 0.14);
  border-radius: 20rpx 20rpx 0 0;
  background: rgba(255, 255, 255, 0.65);
  box-shadow: 0 8rpx 24rpx rgba(40, 70, 60, 0.08);
}

.seal-mark {
  width: 76rpx;
  height: 76rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 5rpx double #dfe8df;
  border-radius: 50%;
  color: #739587;
  font-size: 40rpx;
}

.brand-title {
  display: block;
  margin-top: 10rpx;
  color: #183830;
  font-size: 46rpx;
  font-weight: 700;
  line-height: 1.35;
}

.brand-subtitle {
  display: block;
  margin-top: 12rpx;
  color: #8a7a5f;
  font-size: 28rpx;
}

.form-heading {
  margin: 40rpx 16rpx 24rpx;
  padding: 20rpx;
  border: 1rpx solid #e5eaf6;
  border-radius: 24rpx;
  background: #eef2ff;
  color: #173148;
  text-align: center;
  font-size: 28rpx;
}

.form-card {
  @include card-surface(24rpx, 32rpx);
}

.auth-form-item {
  margin-bottom: 28rpx;

  :deep(.el-form-item__content) {
    line-height: normal;
  }

  :deep(.el-input__wrapper) {
    min-height: 88rpx;
    padding: 0 24rpx;
    border-radius: 16rpx;
    background: $color-primary-light;
    box-shadow: none;

    &.is-focus {
      box-shadow: 0 0 0 2rpx rgba(184, 134, 78, 0.4);
    }
  }

  :deep(.el-input__inner) {
    color: #3d3021;
    font-size: 28rpx;

    &::placeholder {
      color: #b3a58c;
    }
  }

  :deep(.el-form-item__error) {
    position: static;
    padding-top: 8rpx;
    font-size: 24rpx;
  }
}

.field-icon {
  position: relative;
  width: 32rpx;
  height: 32rpx;
  flex-shrink: 0;
  margin-right: 16rpx;
  color: #c2a06a;

  &::before {
    position: absolute;
    top: 1rpx;
    left: 50%;
    width: 12rpx;
    height: 12rpx;
    border: 2rpx solid currentColor;
    border-radius: 50%;
    transform: translateX(-50%);
    content: "";
  }

  &::after {
    position: absolute;
    bottom: 1rpx;
    left: 50%;
    width: 26rpx;
    height: 13rpx;
    border: 2rpx solid currentColor;
    border-bottom: 0;
    border-radius: 13rpx 13rpx 0 0;
    transform: translateX(-50%);
    content: "";
  }
}

.field-label {
  display: block;
  margin-bottom: 16rpx;
  color: #3d3021;
  font-size: 26rpx;
  font-weight: 600;
}

.label-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16rpx;

  .field-label {
    margin-bottom: 0;
  }
}

.link-text {
  color: #b3712a;
  font-size: 24rpx;
  font-weight: 600;
}

.eye-toggle {
  display: flex;
  align-items: center;
  min-width: 48rpx;
  justify-content: center;
  color: #c2a06a;
  font-size: 34rpx;
}

.agreement-row {
  display: flex;
  align-items: flex-start;
  margin: 12rpx 0 32rpx;
}

.checkbox {
  width: 34rpx;
  height: 34rpx;
  flex-shrink: 0;
  margin: 2rpx 16rpx 0 0;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2rpx solid #cbbb96;
  border-radius: 8rpx;
  color: #fff;
  font-size: 26rpx;

  &.is-checked {
    border-color: $color-primary;
    background: $color-primary;
  }
}

.agreement-text {
  flex: 1;
  color: #6b5c44;
  font-size: 24rpx;
  line-height: 1.8;
}

.submit-button {
  width: 100%;
  height: 92rpx;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16rpx;
  border: 0;
  border-radius: 20rpx;
  background: linear-gradient(135deg, #dfb56f 0%, #c29250 52%, #b8864e 100%);
  box-shadow: 0 10rpx 22rpx rgba(184, 134, 78, 0.38);
  color: #fff;
  font-size: 30rpx;
  font-weight: 700;
  letter-spacing: 2rpx;
  line-height: 1;

  &::after {
    border: 0;
  }

  &:disabled {
    opacity: 0.6;
  }
}

.switch-row {
  min-height: 100rpx;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding: 0 16rpx;
}

.switch-copy {
  color: #b3712a;
  font-size: 28rpx;
  font-weight: 600;
}

/* ============================================================
 * 桌面 H5 适配：1200px 以上左侧品牌区 + 右侧居中表单
 * ============================================================ */
@media (min-width: $breakpoint-desktop) {
  .auth-body {
    display: flex;
  }

  .auth-brand {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
    gap: 28rpx;
    padding: 48rpx;
    border-right: 1rpx solid rgba(190, 140, 70, 0.16);
  }

  .brand-seal {
    width: 140rpx;
    height: 140rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 6rpx double #d9be9b;
    border-radius: 50%;
    color: $color-primary;
    font-size: 64rpx;
    font-weight: 700;
  }

  .brand-name {
    color: #2f2517;
    font-size: 64rpx;
    font-weight: 700;
    letter-spacing: 8rpx;
  }

  .brand-slogan {
    color: #8a7a5f;
    font-size: 28rpx;
    letter-spacing: 6rpx;
  }

  .auth-scroll {
    flex: none;
    width: 520px;
    height: auto;
    display: flex;
    flex-direction: column;
    justify-content: center;
    padding: 48rpx 56rpx;
  }

  .hero-card {
    padding: 0 0 32rpx;
    text-align: center;
  }

  .form-card {
    max-width: 440px;
    margin: 0 auto;
  }

  .switch-row {
    justify-content: center;
  }
}
</style>
