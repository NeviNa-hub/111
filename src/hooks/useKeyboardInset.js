import { onUnmounted, ref } from "vue";

/**
 * 监听软键盘高度，供带输入框与固定底部栏的页面做避让。
 * H5 等不支持该 API 的平台静默降级为 0。
 * @returns {{ keyboardInset: import("vue").Ref<number> }} 键盘占用的像素高度。
 */
const useKeyboardInset = () => {
  const keyboardInset = ref(0);

  /**
   * 同步键盘高度，收起时归零。
   * @param {Object} res 键盘高度变化事件。
   * @returns {void}
   */
  const handleKeyboardHeightChange = (res) => {
    keyboardInset.value = Math.max(0, Number(res?.height) || 0);
  };

  if (typeof uni.onKeyboardHeightChange === "function") {
    uni.onKeyboardHeightChange(handleKeyboardHeightChange);
  }

  onUnmounted(() => {
    if (typeof uni.offKeyboardHeightChange === "function") {
      uni.offKeyboardHeightChange(handleKeyboardHeightChange);
    }
  });

  return { keyboardInset };
};

export default useKeyboardInset;
