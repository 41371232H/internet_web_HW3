import { GoogleGenAI } from '@google/genai';
import { AnimatePresence, motion } from 'framer-motion';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import RecipeSearch from './RecipeSearch';
import CatAPI from './CatAPI';

export default function LearningAI() {
  const [page, setPage] = useState('home');
  const [model, setModel] = useState('gemini-2.5-flash');
  const [apiKey, setApiKey] = useState('');
  const [rememberKey, setRememberKey] = useState(true);
  const [tab, setTab] = useState('chat'); // 'chat' 或 'recipe'

  const [history, setHistory] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [replyText, setReplyText] = useState('');
  const listRef = useRef(null);

  // 讀取 API key
  useEffect(() => {
    const saved = localStorage.getItem('gemini_api_key');
    if (saved) setApiKey(saved);
  }, []);

  // 自動捲動到底
  useEffect(() => {
    const el = listRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [history, loading, replyText]);

  const ai = useMemo(() => {
    try {
      return apiKey ? new GoogleGenAI({ apiKey }) : null;
    } catch {
      return null;
    }
  }, [apiKey]);

  // 發送訊息
  async function sendMessage(message) {
    const content = (message ?? input).trim();
    if (!content || loading || !ai) return;

    setLoading(true);
    setReplyText('');
    setHistory(h => [...h, { role: 'user', parts: [{ text: content }] }]);
    setInput('');

    try {

      const systemPrompt = {
        role: 'user',
        parts: [{ text: '你是一個健康飲食小助手，請用簡短、清晰的方式回答，盡量不超過200字。' }],
      };

      const resp = await ai.models.generateContent({
        model,
        contents: [systemPrompt, ...history, { role: 'user', parts: [{ text: content }] }],
      });

      const reply = resp.text || '（沒有回覆內容）';
      // 打字動畫
      let idx = 0;
      const chars = reply.split('');
      const typeEffect = () => {
        if (idx < chars.length) {
          setReplyText(prev => prev + chars[idx]);
          idx++;
          setTimeout(typeEffect, 15);
        } else {
          setHistory(h => [...h, { role: 'model', parts: [{ text: reply }] }]);
          setReplyText('');
          setLoading(false);
        }
      };
      typeEffect();
    } catch (err) {
      console.error(err);
      setHistory(h => [...h, { role: 'model', parts: [{ text: '⚠ 出錯了，請確認 API Key 或網路連線。' }] }]);
      setLoading(false);
    }
  }

  const quickExamples = [
    '我現在在師大，附近有沒有健康飲食的店？',
    '幫我安排一餐健康的菜餚。',
    '午餐吃了咖哩飯，晚餐該吃什麼才能均衡？',
  ];

  // 🟢 進入聊天時，自動出現歡迎訊息
  useEffect(() => {
    if (page === 'chat') {
      setHistory([
        {
          role: 'model',
          parts: [{ text: '👋 哈囉，我是健康飲食小助手！有關健康飲食的問題都可以問我喔～' }],
        },
      ]);
    }
  }, [page]);

  return (
    <div style={styles.wrap}>
      <AnimatePresence mode="wait">
        {page === 'home' && (
          <motion.div
            key="home"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -40 }}
            transition={{ duration: 0.6 }}
            style={styles.home}
          >
            <h1 style={styles.title}>🥗 健康飲食 AI 助手</h1>
            <p style={styles.subtitle}>你的智慧健康夥伴，幫你安排均衡的一天</p>

            {/* 輸入區 */}
            <div style={styles.form}>
              <label style={styles.label}>
                模型：
                <input
                  value={model}
                  onChange={e => setModel(e.target.value)}
                  placeholder="例如 gemini-2.5-flash"
                  style={styles.input}
                />
              </label>

              <label style={styles.label}>
                Gemini API Key：
                <input
                  type="password"
                  value={apiKey}
                  onChange={e => {
                    const v = e.target.value;
                    setApiKey(v);
                    if (rememberKey) localStorage.setItem('gemini_api_key', v);
                  }}
                  placeholder="貼上你的 API Key"
                  style={styles.input}
                />
              </label>

              <label style={styles.checkbox}>
                <input
                  type="checkbox"
                  checked={rememberKey}
                  onChange={e => {
                    setRememberKey(e.target.checked);
                    if (!e.target.checked) localStorage.removeItem('gemini_api_key');
                    else if (apiKey) localStorage.setItem('gemini_api_key', apiKey);
                  }}
                />
                記住在本機
              </label>
            </div>

            <motion.button
              whileHover={{ scale: 1.05, background: '#34d399' }}
              whileTap={{ scale: 0.95 }}
              style={styles.startBtn}
              onClick={() => {
                if (!apiKey) {
                  alert('請先輸入有效的 Gemini API Key');
                  return;
                }
                setPage('chat');
              }}
            >
              開始聊天 🍏
            </motion.button>
          </motion.div>
        )}

        {page === 'chat' && (
          <motion.div
            key="chat"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -40 }}
            transition={{ duration: 0.6 }}
            style={styles.card}
          >
            <div style={styles.header}>
              <button onClick={() => setPage('home')} style={styles.backBtn}>
                ← 返回
              </button>
              <h2>健康飲食小助手</h2>
              <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
                <button
                  onClick={() => setTab('chat')}
                  style={{ padding: 6, borderRadius: 8, background: tab === 'chat' ? '#059669' : 'transparent', color: tab === 'chat' ? '#fff' : undefined }}
                >
                  AI聊天
                </button>
                <button
                  onClick={() => setTab('recipe')}
                  style={{ padding: 6, borderRadius: 8, background: tab === 'recipe' ? '#059669' : 'transparent', color: tab === 'recipe' ? '#fff' : undefined }}
                >
                  食譜查詢
                </button>
                <button onClick={() => setTab('cat')}
                  style={{ padding: 6, borderRadius: 8, background: tab === 'cat' ? '#059669' : 'transparent', color: tab === 'cat' ? '#fff' : undefined }}
                >
                  貓咪圖片
                </button>
              </div>
            </div>
            {tab === 'chat' ? (
              <>
                <div ref={listRef} style={styles.messages}>
                  {history.map((m, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      style={{
                        ...styles.msg,
                        ...(m.role === 'user' ? styles.user : styles.assistant),
                      }}
                    >
                      <strong>{m.role === 'user' ? '你' : 'AI'}：</strong>{' '}
                      {m.parts.map(p => p.text).join('')}
                    </motion.div>
                  ))}

                  {replyText && (
                    <div style={{ ...styles.msg, ...styles.assistant }}>
                      <strong>AI：</strong> {replyText}
                    </div>
                  )}

                  {loading && !replyText && (
                    <div style={{ ...styles.msg, ...styles.assistant, opacity: 0.7 }}>
                      💭 AI 思考中…
                    </div>
                  )}
                </div>

                <form
                  onSubmit={e => {
                    e.preventDefault();
                    sendMessage();
                  }}
                  style={styles.composer}
                >
                  <input
                    placeholder="輸入問題，例如：幫我設計一個健康便當"
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    style={styles.textInput}
                  />
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    type="submit"
                    disabled={loading || !input.trim()}
                    style={styles.sendBtn}
                  >
                    送出
                  </motion.button>
                </form>

                <div style={styles.examples}>
                  {quickExamples.map(q => (
                    <motion.button
                      key={q}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      style={styles.suggestion}
                      onClick={() => setInput(q)}
                    >
                      {q}
                    </motion.button>
                  ))}
                </div>
              </>
            ) : tab === 'recipe' ? (
              <RecipeSearch />
            ) : (
              <CatAPI />
            )}


            {/* 🔹 提示詞改成填入輸入框，不直接送出 */}

          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// 🎨 美化樣式
const styles = {
  wrap: {
    minHeight: '100vh',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'flex-start',
    background: 'linear-gradient(135deg, #86efac, #22c55e)',
    fontFamily: '"Noto Sans TC", sans-serif',
    paddingTop: 10,
    paddingBottom: 80,
  },
  home: {
    color: '#fff',
    textAlign: 'center',
    width: 'min(600px, 90%)',
    background: 'rgba(255,255,255,0.1)',
    backdropFilter: 'blur(10px)',
    borderRadius: 20,
    padding: 32,
  },
  title: { fontSize: '2.2rem', marginBottom: 8 },
  subtitle: { fontSize: '1.1rem', opacity: 0.9, marginBottom: 24 },
  form: { display: 'grid', gap: 12, textAlign: 'left', marginBottom: 20 },
  label: { display: 'grid', gap: 4, fontSize: 14 },
  input: { padding: '8px 12px', borderRadius: 8, border: 'none', fontSize: 14 },
  checkbox: { fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 },
  startBtn: {
    background: '#10b981',
    border: 'none',
    borderRadius: 999,
    padding: '12px 24px',
    color: '#fff',
    fontSize: '1.1rem',
    cursor: 'pointer',
    boxShadow: '0 4px 10px rgba(0,0,0,0.2)',
  },
  card: {
    background: '#fff',
    borderRadius: 16,
    width: 'min(800px, 95%)',
    overflow: 'hidden',
    boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
  },
  header: {
    background: '#10b981',
    color: '#fff',
    padding: '10px 16px',
    display: 'flex',
    alignItems: 'center',
    gap: 10,
  },
  backBtn: {
    background: 'rgba(255,255,255,0.2)',
    border: 'none',
    borderRadius: 8,
    color: '#fff',
    cursor: 'pointer',
    padding: '4px 10px',
  },
  messages: { padding: 16, maxHeight: 420, overflow: 'auto', display: 'grid', gap: 10 },
  msg: { borderRadius: 10, padding: 10 },
  user: { background: '#dcfce7', justifySelf: 'end' },
  assistant: { background: '#f3f4f6', justifySelf: 'start' },
  composer: {
    display: 'grid',
    gridTemplateColumns: '1fr auto',
    gap: 8,
    padding: 16,
    borderTop: '1px solid #e5e7eb',
  },
  textInput: { padding: '10px 12px', borderRadius: 10, border: '1px solid #e5e7eb' },
  sendBtn: {
    background: '#10b981',
    color: '#fff',
    border: 'none',
    borderRadius: 999,
    padding: '10px 18px',
    cursor: 'pointer',
  },
  examples: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 8,
    padding: '12px 16px 20px',
    borderTop: '1px solid #e5e7eb',
  },
  suggestion: {
    padding: '6px 10px',
    borderRadius: 999,
    border: '1px solid #e5e7eb',
    background: '#f9fafb',
    cursor: 'pointer',
    fontSize: 12,
  },
};
