// src/RecipeSearch.js
import React, { useState } from "react";
import { searchRecipes, getRecipeDetails } from "./spoonacular";

export default function RecipeSearch() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(false);

  async function handleSearch(e) {
    e && e.preventDefault();
    if (!query.trim()) return alert("請輸入食材或料理名稱");
    setLoading(true);
    setSelected(null);
    try {
      console.log("正在搜尋：", query); // ← 新增這行
      const r = await searchRecipes(query.trim(), 8);
      console.log("搜尋結果：", r); // ← 新增這行
      setResults(r);
    } catch (err) {
      console.error(err);
      alert("搜尋失敗：" + err.message);
    } finally {
      setLoading(false);
    }
  }

  async function showDetails(id) {
    setLoading(true);
    try {
      const detail = await getRecipeDetails(id);
      setSelected(detail);
    } catch (err) {
      console.error(err);
      alert("無法取得食譜詳情");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ padding: 16 }}>
      <h3>🍳 食譜查詢</h3>
      <form onSubmit={handleSearch} style={{ marginBottom: 12 }}>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Enter ingredient or recipe in English, e.g., chicken, pasta, breakfast"
          style={{ padding: 8, width: "60%", marginRight: 8 }}
        />
        <button type="submit" disabled={loading} style={{ padding: "8px 12px" }}>
          {loading ? "搜尋中..." : "搜尋"}
        </button>
      </form>

      {selected ? (
        <div style={{ marginTop: 12 }}>
          <button onClick={() => setSelected(null)} style={{ marginBottom: 8 }}>
            ← 返回列表
          </button>
          <h4>{selected.title}</h4>
          {selected.image && <img src={selected.image} alt={selected.title} style={{ maxWidth: 300 }} />}
          <div dangerouslySetInnerHTML={{ __html: selected.summary }} style={{ marginTop: 8 }} />
          <p>份量：{selected.servings} • 時間：{selected.readyInMinutes} 分鐘</p>
          <a href={selected.sourceUrl} target="_blank" rel="noreferrer">前往原始食譜</a>
        </div>
      ) : (
        <div style={{ marginTop: 12 }}>
          {results.length === 0 ? (
            <p style={{ color: "#666" }}>尚未搜尋，輸入關鍵字開始查詢食譜。</p>
          ) : (
            results.map((r) => (
              <div key={r.id} style={{ display: "flex", gap: 12, padding: 10, borderBottom: "1px solid #eee" }}>
                <img src={r.image} alt={r.title} style={{ width: 120, height: 80, objectFit: "cover", borderRadius: 8 }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600 }}>{r.title}</div>
                  <div style={{ marginTop: 6 }}>
                    <button onClick={() => showDetails(r.id)} style={{ marginRight: 8 }}>查看詳情</button>
                    <a href={`https://spoonacular.com/recipes/${r.title.replace(/\s+/g,"-")}-${r.id}`} target="_blank" rel="noreferrer">
                      開啟連結
                    </a>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}