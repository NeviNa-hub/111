/**
 * 首页概览
 */
import { API_PATHS } from "@/apis/constants";
import apiRequest from "@/apis/http";

// 映射今日推荐
const mapHero = (hero = {}) => ({
  label: hero.label || "",
  caption: hero.caption || "",
  prompt: hero.prompt || "",
  imageUrl: hero.image_url || "",
  modelName: hero.model_name || "",
  generatedCount: Number(hero.generated_count) || 0,
});

// 映射灵感工坊入口
const mapCreation = (item = {}) => ({
  creationId: item.creation_id,
  eyebrow: item.eyebrow || "",
  title: item.title || "",
  inputLabel: item.input_label || "",
  inputValue: item.input_value || "",
  icon: item.icon || "",
  note: item.note || "",
  action: item.action || "",
  url: item.url || "",
});

/**
 * 获取首页概览数据。
 * @returns {Promise<import("@/apis/types").HomeOverview>} 首页数据。
 */
export const getHomeOverview = async () => {
  const data = await apiRequest({ url: API_PATHS.HOME_OVERVIEW });

  return {
    weatherText: data.weather_text || "",
    quote: data.quote || "",
    hero: mapHero(data.hero),
    creations: Array.isArray(data.creations) ? data.creations.map(mapCreation) : [],
  };
};
