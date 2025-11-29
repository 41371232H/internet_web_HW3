import React, { useState } from "react";

export default function CatAPI() {
  const [imgUrl, setImgUrl] = useState(null);
  const [loading, setLoading] = useState(false);

  async function getCat() {
    setLoading(true);
    try {
      const res = await fetch("https://api.thecatapi.com/v1/images/search");
      const data = await res.json();
      setImgUrl(data[0].url);
    } catch (err) {
      alert("取得貓咪圖片失敗");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ padding: 16 }}>
      <h3>🐱 貓咪圖片 API</h3>
      <button onClick={getCat} disabled={loading} style={{ padding: "8px 12px" }}>
        {loading ? "載入中..." : "取得貓咪圖片"}
      </button>

      {imgUrl && (
        <div style={{ marginTop: 20 }}>
          <img
            src={imgUrl}
            alt="Random Cat"
            style={{ width: "300px", borderRadius: "12px" }}
          />
        </div>
      )}
    </div>
  );
}
