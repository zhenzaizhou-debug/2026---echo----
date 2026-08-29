'use client';

import { Canvas } from '@react-three/fiber';
import Image from 'next/image';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { BeachScene } from './scene/BeachScene';
import { LoadingRipples } from './LoadingRain';
import { useAmbientAudio } from '@/hooks/useAmbientAudio';
import { canWriteNow, containsBlockedContact, ensureAnonymousId, recordLocalWrite } from '@/lib/anonymous';

function pointerLockCanvas(container: HTMLDivElement | null) {
  const canvas = container?.querySelector('canvas');
  if (canvas?.requestPointerLock) void canvas.requestPointerLock().catch(() => undefined);
}

export default function EchoExperience() {
  const [entered, setEntered] = useState(false);
  const [writing, setWriting] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [content, setContent] = useState('');
  const [writingError, setWritingError] = useState('');
  const [released, setReleased] = useState(false);
  const [, setSplatProgress] = useState(0);
  const [splatReady, setSplatReady] = useState(false);
  const [splatFailed, setSplatFailed] = useState(false);
  const [posterComplete, setPosterComplete] = useState(false);
  const [readyHoldComplete, setReadyHoldComplete] = useState(false);
  const worldRef = useRef<HTMLDivElement>(null);
  const presenceCount = useMemo(() => 73 + (new Date().getMinutes() % 29), []);

  useAmbientAudio(entered && soundEnabled, false);

  useEffect(() => {
    if (!entered) return;
    const timer = window.setTimeout(() => setPosterComplete(true), 2_600);
    return () => window.clearTimeout(timer);
  }, [entered]);

  useEffect(() => {
    if (!splatReady) return;
    const timer = window.setTimeout(() => setReadyHoldComplete(true), 750);
    return () => window.clearTimeout(timer);
  }, [splatReady]);

  const handleSplatReady = useCallback(() => {
    setSplatProgress(1);
    setSplatFailed(false);
    setSplatReady(true);
  }, []);

  const handleSplatError = useCallback(() => {
    setSplatFailed(true);
  }, []);

  const openWriting = () => {
    if (!canWriteNow()) {
      setWritingError('潮水还没有退去。过一会儿再写。');
      setWriting(true);
      document.exitPointerLock?.();
      return;
    }
    setWritingError('');
    setWriting(true);
    document.exitPointerLock?.();
  };

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      const isTyping = target?.tagName === 'TEXTAREA' || target?.tagName === 'INPUT';
      if (event.code === 'KeyE' && entered && !writing && !settingsOpen && !isTyping && !event.repeat) {
        openWriting();
      }
      if (event.code === 'Escape' && entered && !isTyping) {
        if (writing) {
          setWriting(false);
          setContent('');
          setWritingError('');
        } else {
          setSettingsOpen((value) => !value);
        }
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [entered, settingsOpen, writing]);

  const enter = () => {
    ensureAnonymousId();
    setEntered(true);
  };

  const standUp = () => {
    const value = content.trim();
    if (!value) {
      setWritingError('沙滩上还没有留下什么。');
      return;
    }
    if (containsBlockedContact(value)) {
      setWritingError('请不要留下网址或联系方式。');
      return;
    }
    if (!canWriteNow()) {
      setWritingError('潮水还没有退去。过一会儿再写。');
      return;
    }

    // V0.1 local slice deliberately does not add this Echo back into the
    // author's scene. A later spatial adapter will send it only to strangers.
    recordLocalWrite();
    setContent('');
    setWritingError('');
    setWriting(false);
    setReleased(true);
    window.setTimeout(() => setReleased(false), 4300);
    pointerLockCanvas(worldRef.current);
  };

  const closeSettings = () => {
    setSettingsOpen(false);
    pointerLockCanvas(worldRef.current);
  };

  return (
    <main className={`echo-shell ${entered ? 'is-entered' : ''} ${writing ? 'is-writing' : ''} ${splatReady && posterComplete && readyHoldComplete ? 'is-splat-ready' : ''} ${splatFailed ? 'is-splat-failed' : ''}`}>
      <div className="echo-world" ref={worldRef} aria-hidden={!entered}>
        <Canvas
          dpr={[1, 1.35]}
          camera={{ position: [-16, 3.2, -20], fov: 54, near: 0.05, far: 520 }}
          gl={{ antialias: false, powerPreference: 'high-performance' }}
        >
          <BeachScene
            entered={entered && !settingsOpen}
            explorationEnabled={entered && posterComplete && (splatFailed || (splatReady && readyHoldComplete)) && !settingsOpen}
            writing={writing}
            splatReady={splatReady}
            onSplatProgress={setSplatProgress}
            onSplatReady={handleSplatReady}
            onSplatError={handleSplatError}
          />
        </Canvas>
      </div>

      <div className="film-grain" aria-hidden="true" />
      <div className="light-leak" aria-hidden="true" />
      <div className="letterbox letterbox-top" aria-hidden="true" />
      <div className="letterbox letterbox-bottom" aria-hidden="true" />

      <section className="threshold" aria-label="进入回声">
        <Image
          className="threshold-logo"
          src="/brand/echo-handwritten-logo.jpg"
          alt="ECHO 回声"
          width={1275}
          height={958}
          priority
        />
        <div className="threshold-actions">
          <button type="button" onClick={enter}><span>ENTER</span><small>进入</small></button>
          <a
            className="threshold-about"
            href="https://echo-journey-29951.bronyad.chatgpt.site"
            target="_blank"
            rel="noreferrer"
          >
            <span>作品简介</span><small>ABOUT THE WORK</small>
          </a>
        </div>
        <p className="sound-note">HEADPHONES RECOMMENDED <span>/ 建议佩戴耳机</span></p>
      </section>

      <div className="brand-mark">ECHO. <span>回声 / 01</span></div>
      <button
        className="settings-trigger"
        type="button"
        aria-label="打开设置"
        onClick={() => { document.exitPointerLock?.(); setSettingsOpen(true); }}
      >
        · · ·
      </button>

      <div className="walk-hint"><span>CLICK</span> LOOK　·　<span>WASD</span> FLY　·　<span>SPACE / CTRL</span> HEIGHT　·　<span>SHIFT</span> BOOST <small>/ 观察 · 自由移动 · 升降 · 加速</small></div>
      <div className="presence-note" aria-live="polite"><strong>{presenceCount} OTHERS</strong> ARE FACING THIS SEA. <small>此刻也在看海</small></div>
      <div className={`released-note ${released ? 'is-visible' : ''}`} aria-live="polite">THESE WORDS HAVE LEFT YOU. <small>这句话已经离开你了。</small></div>
      <section
        className={`scene-loading ${entered && !splatFailed && (!splatReady || !posterComplete || !readyHoldComplete) ? 'is-visible' : ''}`}
        role="status"
        aria-label="场景加载中"
        aria-live="polite"
      >
        <LoadingRipples visible={entered && !splatFailed && (!splatReady || !posterComplete || !readyHoldComplete)} />
      </section>

      <div className={`scene-fallback-note ${splatFailed ? 'is-visible' : ''}`} role="status">
        A LIGHTER SHORELINE IS OPEN. <small>海岸以轻量模式显现</small>
      </div>

      <section className={`writing-layer ${writing ? 'is-visible' : ''}`} aria-hidden={!writing}>
        <div className="writing-prompt">
          <p className="writing-label"><b>LEAVE A TRACE.</b><small>写点什么。</small></p>
          <textarea
            value={content}
            onChange={(event) => { setContent(event.target.value); setWritingError(''); }}
            maxLength={150}
            autoFocus={writing}
            aria-label="写下留在沙滩上的话"
            placeholder="THE THINGS YOU COULD NOT SAY…"
          />
          <div className="writing-meta">
            <span className={writingError ? 'writing-error' : ''}>{writingError || `${content.length} / 150`}</span>
            <button type="button" onClick={standUp}>RELEASE <small>/ 起身</small></button>
          </div>
          <p className="writing-afterword">ONCE RELEASED, YOU WILL NOT SEE IT AGAIN. <small>起身以后，你不会再看见它。</small></p>
        </div>
      </section>

      <section className={`settings-layer ${settingsOpen ? 'is-visible' : ''}`} aria-hidden={!settingsOpen}>
        <div className="settings-panel">
          <p className="settings-eyebrow">SHORELINE SETTINGS <span>/ 海边设置</span></p>
          <h2>KEEP THIS PLACE QUIET.<small>让这里保持安静。</small></h2>
          <button className="sound-toggle" type="button" onClick={() => setSoundEnabled((value) => !value)}>
            <span>WAVES & WIND <small>海浪与风声</small></span><b>{soundEnabled ? 'ON / 开启' : 'OFF / 关闭'}</b>
          </button>
          <div className="control-list">
            <p><span>W A S D</span> FLY <small>在场景中移动</small></p>
            <p><span>SPACE / CTRL</span> HEIGHT <small>上升与下降</small></p>
            <p><span>SHIFT</span> BOOST <small>加速穿行</small></p>
            <p><span>MOUSE</span> LOOK <small>自由观察</small></p>
            <p><span>E</span> PAUSE <small>停下来写字</small></p>
            <p><span>ESC</span> RETURN <small>回到这里</small></p>
          </div>
          <button className="return-button" type="button" onClick={closeSettings}>RETURN TO THE SHORE <small>/ 返回海边</small></button>
        </div>
      </section>
    </main>
  );
}
