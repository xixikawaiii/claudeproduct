"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Cosmos, { type CosmosHandle } from "./Cosmos";

const GIFT_SECONDS = 5;

type Stage = "intro" | "gift" | "leaving" | "opening" | "entered";

/**
 * 开场 → 礼盒（5 秒内点开）→ 主页
 * 没点开：礼盒化作星尘，开场重新播放，如此循环
 */
export default function Experience({ children }: { children: React.ReactNode }) {
  const cosmos = useRef<CosmosHandle>(null);
  const [stage, setStage] = useState<Stage>("intro");
  const [cycle, setCycle] = useState(0);
  const timers = useRef<number[]>([]);

  const later = (fn: () => void, ms: number) => timers.current.push(window.setTimeout(fn, ms));
  const clearTimers = () => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
  };

  const playIntro = useCallback(() => {
    setCycle((c) => c + 1);
    setStage("intro");
    cosmos.current?.playIntro();
  }, []);

  useEffect(() => {
    playIntro();
    return clearTimers;
  }, [playIntro]);

  const onIntroEnd = useCallback(() => {
    setStage("gift");
    later(() => {
      setStage("leaving");
      later(playIntro, 900);
    }, GIFT_SECONDS * 1000);
  }, [playIntro]);

  const openGift = () => {
    if (stage !== "gift") return;
    clearTimers();
    setStage("opening");
    later(() => cosmos.current?.enter(), 900);
    later(() => setStage("entered"), 1700);
  };

  const showGift = stage === "gift" || stage === "leaving" || stage === "opening";

  return (
    <>
      <Cosmos ref={cosmos} onIntroEnd={onIntroEnd} />

      {stage === "intro" && (
        <div className="verse" key={cycle} aria-hidden>
          <p>穿过亿万光年的星海</p>
          <p>有一份心意，正向你靠近</p>
        </div>
      )}

      {showGift && (
        <div className={`gift-stage is-${stage}`} key={`g${cycle}`}>
          <button className="gift" onClick={openGift} aria-label="打开礼物">
            <span className="rays" />
            <svg className="ring" viewBox="0 0 220 220" aria-hidden>
              <circle cx="110" cy="110" r="104" className="ring-track" />
              <circle
                cx="110" cy="110" r="104" className="ring-bar"
                style={{ animationDuration: `${GIFT_SECONDS}s` }}
              />
            </svg>
            <span className="orbit" aria-hidden>
              <i /><i /><i /><i /><i />
            </span>
            <svg className="box" viewBox="0 0 160 170" aria-hidden>
              <defs>
                <linearGradient id="gBody" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0" stopColor="#5b2a8f" />
                  <stop offset="1" stopColor="#2a1450" />
                </linearGradient>
                <linearGradient id="gLid" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0" stopColor="#7d3fb8" />
                  <stop offset="1" stopColor="#43207a" />
                </linearGradient>
                <linearGradient id="gRib" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0" stopColor="#ffe2b8" />
                  <stop offset="1" stopColor="#e7a97f" />
                </linearGradient>
                <radialGradient id="gLight" cx="0.5" cy="1" r="0.8">
                  <stop offset="0" stopColor="#fff6e8" />
                  <stop offset="1" stopColor="#ffb6d9" stopOpacity="0" />
                </radialGradient>
              </defs>
              <ellipse className="inner-light" cx="80" cy="82" rx="60" ry="22" fill="url(#gLight)" />
              <g className="body">
                <rect x="22" y="78" width="116" height="84" rx="8" fill="url(#gBody)" />
                <rect x="72" y="78" width="16" height="84" fill="url(#gRib)" />
                <circle cx="44" cy="110" r="1.6" fill="#ffd9ec" opacity=".8" />
                <circle cx="116" cy="132" r="1.2" fill="#ffd9ec" opacity=".7" />
                <circle cx="50" cy="146" r="1" fill="#cfe9ff" opacity=".7" />
              </g>
              <g className="lid">
                <rect x="14" y="58" width="132" height="26" rx="7" fill="url(#gLid)" />
                <rect x="72" y="58" width="16" height="26" fill="url(#gRib)" />
                <path d="M80 58c-8-22-38-30-40-14-2 12 22 15 40 14z" fill="url(#gRib)" />
                <path d="M80 58c8-22 38-30 40-14 2 12-22 15-40 14z" fill="url(#gRib)" />
                <circle cx="80" cy="57" r="7" fill="#ffd2a6" />
              </g>
            </svg>
            <span className="hint">轻触打开礼物</span>
          </button>
          <div className="flash" />
        </div>
      )}

      <div className={stage === "entered" ? "home show" : "home"} aria-hidden={stage !== "entered"}>
        {children}
      </div>
    </>
  );
}
