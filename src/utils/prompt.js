/**
 * 意境文案拼接
 */

/**
 * 将灵感词追加到现有文案，已有内容时用逗号衔接。
 * @param {string} current 现有文案。
 * @param {string} value 待追加的灵感词。
 * @returns {string} 拼接后的文案。
 */
export const appendPromptText = (current, value) =>
  current ? `${current}，${value}` : value;

/**
 * 在现有文案后追加润色句式，空文案时使用兜底起笔句式。
 * @param {string} current 现有文案。
 * @param {string} suffix 润色后缀。
 * @param {string} fallback 空文案时的起笔句式。
 * @returns {string} 润色后的文案。
 */
export const polishPromptText = (current, suffix, fallback) =>
  current ? `${current}，${suffix}` : fallback;
