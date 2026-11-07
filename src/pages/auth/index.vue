<template>
  <view class="auth-page">
    <view class="top-bar">
      <text class="back-icon" @tap="goBack">‹</text>
      <text class="top-title">{{ isRegister ? "请注册" : "请登录" }}</text>
      <view class="profile-icon">♙</view>
    </view>

    <scroll-view scroll-y class="auth-scroll" :show-scrollbar="false">
      <view class="hero-card">
        <view class="landscape">
          <view class="mountain mountain-back"></view>
          <view class="mountain mountain-front"></view>
          <view class="red-seal">落<br />笔</view>
          <view class="hero-panel">
            <view class="seal-mark">墨</view>
            <text class="hero-kicker">丹青引客 · 启卷</text>
          </view>
        </view>
        <text class="brand-title">落笔生花</text>
        <text class="brand-subtitle">墨韵入画，落笔成境</text>
      </view>

      <view class="form-heading">
        {{ isRegister ? "创建账号" : "账号密码登录" }}
      </view>

      <el-form
        ref="formRef"
        class="form-card"
        :model="formModel"
        :rules="formRules"
        status-icon
      >
        <view class="field-label">
          ♙ {{ isRegister ? "账号" : "手机号/邮箱" }}
        </view>
        <el-form-item prop="account" class="auth-form-item">
          <el-input
            v-model="formModel.account"
            class="field-input"
            :placeholder="
              isRegister ? '请输入账号/邮箱' : '请输入账号/邮箱/手机号'
            "
            autocomplete="username"
          />
        </el-form-item>

        <view v-if="isRegister" class="field-label">用户名</view>
        <el-form-item v-if="isRegister" prop="username" class="auth-form-item">
          <el-input
            v-model="formModel.username"
            class="field-input"
            placeholder="请输入用户名"
            maxlength="30"
          />
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
            :type="isPasswordVisible ? 'text' : 'password'"
            autocomplete="current-password"
          >
            <template #suffix>
              <text
                class="eye-toggle"
                @tap="isPasswordVisible = !isPasswordVisible"
              >
                {{ isPasswordVisible ? "◉" : "◎" }}
              </text>
            </template>
          </el-input>
        </el-form-item>

        <view v-if="isRegister" class="field-label">确认密码</view>
        <el-form-item
          v-if="isRegister"
          prop="confirmPassword"
          class="auth-form-item"
        >
          <el-input
            v-model="formModel.confirmPassword"
            class="field-input"
            placeholder="请再次输入密码"
            :type="isConfirmVisible ? 'text' : 'password'"
            autocomplete="new-password"
          />
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
        <button class="submit-button" @tap="handleSubmit">
          {{ isRegister ? "创建丹青画境" : "开启丹青画境" }} <text>→</text>
        </button>
      </el-form>

      <view class="switch-row">
        <text class="help-icon">◉</text>
        <view class="switch-divider"></view>
        <text class="switch-copy" @tap="toggleMode">
          {{ isRegister ? "已有账号？立即登录" : "初来乍到 · 新客注册" }}
          <text>→</text>
        </text>
      </view>
    </scroll-view>
  </view>
</template>

<script setup>
import { computed, reactive, ref } from "vue";
import { loginUser, registerUser } from "@/apis/auth";
import { AUTH_TOKEN_STORAGE_KEY, AUTH_USER_STORAGE_KEY } from "@/utils/request";

const formRef = ref(null);
const formModel = reactive({
  account: "",
  password: "",
  username: "",
  confirmPassword: "",
});
const isRegister = ref(false);
const hasAgreed = ref(true);
const isPasswordVisible = ref(false);
const isConfirmVisible = ref(false);
const formRules = computed(() => ({
  account: [
    {
      required: true,
      message: "请输入账号",
      trigger: "blur",
    },
  ],
  password: [
    {
      required: true,
      message: "请输入密码",
      trigger: "blur",
    },
  ],
  username: isRegister.value
    ? [
        {
          required: true,
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

// 切换登录与注册表单。
const toggleMode = () => {
  isRegister.value = !isRegister.value;
  formRef.value?.clearValidate();
};

// 返回上一页；从应用入口打开时留在登录页。
const goBack = () => {
  if (getCurrentPages().length > 1) {
    uni.navigateBack();
  }
};

// 校验表单并调用登录或注册接口。
const handleSubmit = async () => {
  try {
    await formRef.value.validate();
  } catch (error) {
    return;
  }

  if (!hasAgreed.value) {
    uni.showToast({ title: "请先阅读并同意服务协议与隐私政策", icon: "none" });
    return;
  }
  const params = { account: formModel.account, password: formModel.password };
  const resData = isRegister.value
    ? await registerUser({
        username: formModel.username,
        ...params,
      })
    : await loginUser({
        ...params,
      });

  if (resData.code === 200) {
    uni.setStorageSync(AUTH_TOKEN_STORAGE_KEY, resData.data.access_token);
    uni.setStorageSync(AUTH_USER_STORAGE_KEY, {
      user_id: resData.data.user_id,
      username: resData.data.username,
      account: resData.data.account,
    });
    uni.reLaunch({ url: "/pages/index/index" });
  }
};
</script>

<style scoped lang="scss">
.auth-page {
  height: 100vh;
  overflow: hidden;
  background: #f7f8ff;
  color: $color-ink;
}

.top-bar {
  height: calc(96rpx + var(--status-bar-height, 0px));
  padding: var(--status-bar-height, 0px) $space-7 0;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #fff;
}

.back-icon {
  width: 72rpx;
  color: #122b43;
  font-size: 64rpx;
  line-height: 1;
}

.top-title {
  flex: 1;
  text-align: center;
  color: #142a40;
  font-size: 32rpx;
  font-weight: $font-weight-semibold;
}

.profile-icon {
  width: 60rpx;
  height: 60rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 20rpx;
  background: $color-primary;
  color: #fff;
  font-size: 34rpx;
}

.auth-scroll {
  height: calc(100vh - 96rpx - var(--status-bar-height, 0px));
  padding: $space-5 $space-5 calc($space-8 + env(safe-area-inset-bottom));
  box-sizing: border-box;
}

.hero-card {
  overflow: hidden;
  padding-bottom: $space-8;
  border-radius: $radius-xl;
  background: #fff;
  text-align: center;
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
  top: $space-5;
  right: $space-8;
  padding: $space-2;
  border-radius: $radius-xs;
  background: #c93f39;
  color: #fff;
  font-size: $font-size-caption;
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
  border-radius: $radius-lg $radius-lg 0 0;
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
  margin-top: -$space-1;
  color: #102b43;
  font-size: 48rpx;
  font-weight: $font-weight-bold;
  line-height: 1.35;
}

.brand-subtitle {
  display: block;
  margin-top: $space-1;
  color: #64778a;
  font-size: $font-size-body;
}

.form-heading {
  margin: $space-8 $space-3 $space-5;
  padding: $space-4;
  border: 1rpx solid #e5eaf6;
  border-radius: $radius-xl;
  background: #eef2ff;
  color: #173148;
  text-align: center;
  font-size: $font-size-body;
}

.form-card {
  padding: $space-7;
  border-radius: $radius-xl;
  background: #fff;
}

.auth-form-item {
  margin-bottom: $space-4;
}

.auth-form-item :deep(.el-form-item__content) {
  line-height: normal;
}

.auth-form-item :deep(.el-input__wrapper) {
  min-height: 80rpx;
  padding: 0 $space-5;
  border-radius: $radius-lg;
  background: #eff3ff;
  box-shadow: none;
}

.auth-form-item :deep(.el-input__inner) {
  color: #233d52;
  font-size: $font-size-body;
}

.auth-form-item :deep(.el-input__inner::placeholder) {
  color: #aab9c6;
}

.auth-form-item :deep(.el-form-item__error) {
  position: static;
  padding-top: $space-1;
  font-size: $font-size-caption;
}

.field-label {
  display: block;
  margin-bottom: $space-3;
  color: #203c50;
  font-size: $font-size-caption;
  font-weight: $font-weight-semibold;
}

.label-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: $space-3;
}

.label-row .field-label {
  margin-bottom: 0;
}

.link-text {
  color: #007d7b;
  font-size: $font-size-caption;
  font-weight: $font-weight-semibold;
}

.eye-toggle {
  display: flex;
  align-items: center;
  color: #224056;
  font-size: 36rpx;
}

.agreement-row {
  display: flex;
  align-items: flex-start;
  margin: $space-2 0 $space-7;
}

.checkbox {
  width: 34rpx;
  height: 34rpx;
  flex-shrink: 0;
  margin: 2rpx $space-3 0 0;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2rpx solid #a9bbb5;
  border-radius: 8rpx;
  color: #fff;
  font-size: 26rpx;
}

.checkbox.is-checked {
  border-color: $color-primary;
  background: $color-primary;
}

.agreement-text {
  flex: 1;
  color: #28475a;
  font-size: $font-size-caption;
  line-height: $line-height-relaxed;
}

.submit-button {
  width: 100%;
  height: 88rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: $space-3;
  border: 0;
  border-radius: $radius-lg;
  background: #006b60;
  box-shadow: 0 8rpx 14rpx rgba(0, 86, 75, 0.18);
  color: #fff;
  font-size: $font-size-body-lg;
  font-weight: $font-weight-bold;
  line-height: 1;
}

.submit-button:after {
  border: 0;
}

.switch-row {
  min-height: 100rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 $space-3;
}

.help-icon {
  color: #285268;
  font-size: 30rpx;
}

.switch-divider {
  width: 1rpx;
  height: 40rpx;
  margin-left: auto;
  background: #d6dde7;
}

.switch-copy {
  margin-left: $space-5;
  color: #007d7b;
  font-size: $font-size-body;
  font-weight: $font-weight-semibold;
}
</style>
