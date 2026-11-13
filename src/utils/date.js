/**
 * 把后端时间字符串格式化为“YYYY-MM-DD HH:mm:ss”。
 * 后端返回带时区的 ISO 时间（如 2026-11-13T16:47:16.642972+08:00），
 * 这里直接截取字面时间，不转换为浏览器本地时区。
 * @param {string} value 后端返回的时间字符串。
 * @returns {string} 格式化后的时间；无法识别时原样返回。
 */
export const formatDateTime = (value) => {
  const match = String(value || "").match(
    /^(\d{4})-(\d{2})-(\d{2})[T ](\d{2}):(\d{2})(?::(\d{2}))?/
  );

  if (!match) {
    return value || "";
  }

  const [, year, month, day, hour, minute, second = "00"] = match;

  return `${year}-${month}-${day} ${hour}:${minute}:${second}`;
};
