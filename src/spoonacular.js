// src/spoonacular.js
// 請把 YOUR_API_KEY 換成你的 Spoonacular API Key
// （開發測試可先放，正式上線請改成後端代理）
const SPOONACULAR_API_KEY = "a0e1c189dc584a6f9de4fe378bf10f1b";
const BASE_URL = "https://api.spoonacular.com/recipes";

// 通用 fetch helper
async function requestJson(url) {
  const res = await fetch(url);
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Spoonacular error: ${res.status} ${text}`);
  }
  return res.json();
}

// 搜尋食譜
export async function searchRecipes(query, number = 8) {
  if (!query) return [];
  const url = `${BASE_URL}/complexSearch?query=${encodeURIComponent(
    query
  )}&number=${number}&addRecipeInformation=true&apiKey=${SPOONACULAR_API_KEY}`;
  
  console.log("呼叫 API URL:", url); // ← 新增這行
  
  const data = await requestJson(url);
  return data.results || [];
}

// 取得食譜詳細資訊
export async function getRecipeDetails(id) {
  if (!id) throw new Error("missing recipe id");

  const url = `${BASE_URL}/${id}/information?includeNutrition=true&apiKey=${SPOONACULAR_API_KEY}`;
  return requestJson(url);
}

/* convenience: 用於 LearningAI 自動判定 */
export async function handleFoodQuery(userMessage) {
  const trigger = /(食譜|料理|菜單|煮|做菜|怎麼做|怎麼煮|食材|食譜推薦|食物)/i;
  if (!trigger.test(userMessage)) return null;

  // 嘗試抓出食材或料理關鍵詞（簡單抽取）
  const m = userMessage.match(
    /(雞肉|牛肉|豬肉|魚|蛋|豆腐|蔬菜|義大利麵|飯|早餐|午餐|晚餐|甜點|沙拉|湯|咖哩|麵)/i
  );
  const q = m ? m[1] : userMessage;

  try {
    const results = await searchRecipes(q, 5);
    if (!results || results.length === 0)
      return "抱歉，找不到符合的食譜，請試試其他關鍵字。";

    let text = `🍽 我找到 ${results.length} 道建議：\n\n`;
    results.forEach((r, i) => {
      text += `${i + 1}. ${r.title}\n連結：https://spoonacular.com/recipes/${r.title
        .replace(/\s+/g, "-")
        .toLowerCase()}-${r.id}\n\n`;
    });

    return text;
  } catch (err) {
    console.error(err);
    return "⚠ 查詢食譜時發生錯誤，請稍後再試。";
  }
}