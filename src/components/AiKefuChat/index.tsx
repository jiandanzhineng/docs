import React, {useEffect, useRef, useState, type ReactNode} from 'react';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import useBaseUrl from '@docusaurus/useBaseUrl';
import clsx from 'clsx';
import {FaWeixin} from 'react-icons/fa';
import {FiMail, FiSend, FiTrash2} from 'react-icons/fi';
import styles from './styles.module.css';

const EMAIL = 'jiandanzhineng@outlook.com';
const QR_CODE = 'img/新人工.png';
const KEY_SESSION = 'aiKefu.sessionId';
const KEY_HISTORY = 'aiKefu.history.v1';
const MAX_HISTORY = 50;
const MAX_LEN = 500;

const QUICK_QUESTIONS = [
  '怎么连接设备？',
  '寸止玩法怎么选？',
  '客户端在哪里下载？',
];
const WELCOME =
  '你好呀，我是智能客服瑰夏～ 设备连接、玩法教程、客户端下载的问题都可以问我，答不准的地方可以切到右侧标签找人工客服～';
const HANDOFF_TIP = '这个问题瑰夏回答不准，请扫码添加人工客服～';
const FAIL_TIP = '瑰夏刚才走神了，请稍后再试，或者切到「人工客服」联系我们～';

interface Source {
  title: string;
  url: string;
}
interface Msg {
  role: 'user' | 'bot';
  text: string;
  sources?: Source[];
}
function storageGet(key: string): string | null {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}
function storageSet(key: string, value: string) {
  try {
    window.localStorage.setItem(key, value);
  } catch {}
}
function storageDel(key: string) {
  try {
    window.localStorage.removeItem(key);
  } catch {}
}

function makeSessionId(): string {
  const base = 'k' + Date.now().toString(36) + Math.random().toString(36).slice(2, 14);
  return base.slice(0, 64);
}
function loadSessionId(): string {
  const saved = storageGet(KEY_SESSION);
  if (saved && /^[A-Za-z0-9_-]{8,64}$/.test(saved)) return saved;
  const fresh = makeSessionId();
  storageSet(KEY_SESSION, fresh);
  return fresh;
}
function loadHistory(): Msg[] {
  try {
    const parsed = JSON.parse(storageGet(KEY_HISTORY) ?? '[]');
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter((m) => m && (m.role === 'user' || m.role === 'bot') && typeof m.text === 'string')
      .slice(-MAX_HISTORY);
  } catch {
    return [];
  }
}

// 回复里的网址转成可点链接，保留换行
function linkify(text: string): ReactNode {
  const re = /(https?:\/\/[^\s<>"'）】]+)/g;
  const nodes: ReactNode[] = [];
  let last = 0;
  let m: RegExpExecArray | null;
  let i = 0;
  while ((m = re.exec(text))) {
    if (m.index > last) nodes.push(text.slice(last, m.index));
    nodes.push(
      <a key={i++} href={m[1]} target="_blank" rel="noopener noreferrer">
        {m[1].length > 42 ? m[1].slice(0, 42) + '…' : m[1]}
      </a>,
    );
    last = m.index + m[1].length;
  }
  if (last < text.length) nodes.push(text.slice(last));
  return nodes;
}
export default function AiKefuChat(): ReactNode {
  const {siteConfig} = useDocusaurusContext();
  const apiBase =
    (siteConfig.customFields?.kefuApiBase as string | undefined) ??
    'https://wxapi.undersilicon.cn';
  const qrSrc = useBaseUrl(QR_CODE);

  const [mounted, setMounted] = useState(false);
  const [tab, setTab] = useState<'chat' | 'human'>('chat');
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const sessionRef = useRef('');
  const listRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const handoffTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    sessionRef.current = loadSessionId();
    setMessages(loadHistory());
    setMounted(true);
    return () => {
      if (handoffTimer.current) clearTimeout(handoffTimer.current);
    };
  }, []);

  useEffect(() => {
    listRef.current?.scrollTo({top: listRef.current.scrollHeight});
    if (mounted) storageSet(KEY_HISTORY, JSON.stringify(messages.slice(-MAX_HISTORY)));
  }, [messages, mounted, sending]);
  const send = async (raw?: string) => {
    const text = (raw ?? input).trim().slice(0, MAX_LEN);
    if (!text || sending) return;
    setInput('');
    setSending(true);
    setMessages((m) => [...m, {role: 'user', text}]);
    try {
      const res = await fetch(`${apiBase}/api/web/chat`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
          sessionId: sessionRef.current,
          message: text,
          locale: document.documentElement.lang || 'zh-Hans',
          page: window.location.pathname,
        }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        reply?: string;
        handoff?: boolean;
        sources?: Source[];
        error?: string;
        message?: string;
      };
      if (res.ok && data.reply) {
        setMessages((m) => [
          ...m,
          {role: 'bot', text: data.reply!, sources: data.sources},
        ]);
        if (data.handoff) {
          if (!data.reply!.includes('人工')) {
            setMessages((m) => [...m, {role: 'bot', text: HANDOFF_TIP}]);
          }
          handoffTimer.current = setTimeout(() => setTab('human'), 1600);
        }
      } else {
        setMessages((m) => [
          ...m,
          {role: 'bot', text: data.message || FAIL_TIP},
        ]);
      }
    } catch {
      setMessages((m) => [...m, {role: 'bot', text: FAIL_TIP}]);
    } finally {
      setSending(false);
    }
  };

  const clearHistory = () => {
    setMessages([]);
    storageDel(KEY_HISTORY);
    inputRef.current?.focus();
  };
  const showWelcome = messages.length === 0;
  return (
    <div className={styles.chat}>
      <div className={styles.tabBar}>
        <button
          type="button"
          className={clsx(styles.tab, tab === 'chat' && styles.tabActive)}
          onClick={() => setTab('chat')}>
          智能客服
        </button>
        <button
          type="button"
          className={clsx(styles.tab, tab === 'human' && styles.tabActive)}
          onClick={() => setTab('human')}>
          人工客服
        </button>
        {tab === 'chat' && (
          <button
            type="button"
            className={styles.clearBtn}
            title="清空聊天记录"
            aria-label="清空聊天记录"
            onClick={clearHistory}>
            <FiTrash2 aria-hidden="true" />
          </button>
        )}
      </div>

      {tab === 'human' ? (
        <div className={styles.human}>
          <div className={styles.wechatLabel}>
            <FaWeixin aria-hidden="true" />
            <span>微信扫码联系人工客服</span>
          </div>
          <img className={styles.qr} src={qrSrc} alt="微信客服二维码" />
          <a className={styles.email} href={`mailto:${EMAIL}`}>
            <FiMail aria-hidden="true" />
            <span>{EMAIL}</span>
          </a>
        </div>
      ) : (
        <>
          <div className={styles.msgList} ref={listRef}>
            {showWelcome && (
              <div className={styles.rowBot}>
                <div className={styles.bubbleBot}>
                  {linkify(WELCOME)}
                  <div className={styles.quick}>
                    {QUICK_QUESTIONS.map((q) => (
                      <button
                        key={q}
                        type="button"
                        className={styles.quickBtn}
                        onClick={() => void send(q)}>
                        {q}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
            {messages.map((m, i) =>
              m.role === 'user' ? (
                <div key={i} className={styles.rowUser}>
                  <div className={styles.bubbleUser}>{m.text}</div>
                </div>
              ) : (
                <div key={i} className={styles.rowBot}>
                  <div className={styles.bubbleBot}>
                    {linkify(m.text)}
                    {!!m.sources?.length && (
                      <div className={styles.sources}>
                        {m.sources.map((s, j) => (
                          <a
                            key={j}
                            href={s.url}
                            target="_blank"
                            rel="noopener noreferrer">
                            {s.title || s.url}
                          </a>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ),
            )}
            {sending && (
              <div className={styles.rowBot}>
                <div className={clsx(styles.bubbleBot, styles.thinking)}>
                  瑰夏正在查文档…
                </div>
              </div>
            )}
          </div>

          <form
            className={styles.inputBar}
            onSubmit={(e) => {
              e.preventDefault();
              void send();
            }}>
            <textarea
              ref={inputRef}
              className={styles.input}
              value={input}
              rows={1}
              maxLength={MAX_LEN}
              placeholder="问点什么…"
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  void send();
                }
              }}
            />
            <button
              type="submit"
              className={styles.sendBtn}
              disabled={sending || !input.trim()}
              aria-label="发送"
              title="发送">
              <FiSend aria-hidden="true" />
            </button>
          </form>
        </>
      )}
    </div>
  );
}

