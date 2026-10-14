"use client";

import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";

/**
 * 全屏星空画布：深空星云 + 迎面星流 + 流星 + 粒子星系。
 *
 * 开场序列（INTRO_SECONDS 秒）：
 *   星尘汇聚成旋转星系 → 化作跳动的星之心 → 爆散、星流加速 → 结束回调
 * 进入主页后：星系在背后缓慢旋转（ambient）
 */

export const INTRO_SECONDS = 13;
const T = { gather: 0.8, heart: 8, burst: 11.4 };

export type CosmosHandle = {
  /** 重新播放开场序列 */
  playIntro: () => void;
  /** 进入主页：星系重新聚拢并常驻 */
  enter: () => void;
};

type Props = { onIntroEnd?: () => void };

type Particle = {
  sx: number; sy: number;   // 散落起点（相对屏幕中心，单位为半屏）
  gr: number; ga: number;   // 星系：半径 0..1、旋臂角
  jx: number; jy: number;   // 星系抖动
  ht: number; hs: number;   // 星之心：参数角、缩放
  dx: number; dy: number; bs: number; // 爆散方向、速度
  col: number; size: number; tw: number;
};

type Star = { x: number; y: number; z: number; px: number; py: number };

const PALETTE = [
  [255, 222, 180], // 金
  [255, 150, 185], // 玫瑰
  [226, 104, 214], // 品红
  [158, 120, 255], // 紫罗兰
  [112, 206, 255], // 冰蓝
];

const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

function makeSprite([r, g, b]: number[]) {
  const c = document.createElement("canvas");
  c.width = c.height = 64;
  const x = c.getContext("2d")!;
  const grd = x.createRadialGradient(32, 32, 0, 32, 32, 32);
  grd.addColorStop(0, "rgba(255,255,255,1)");
  grd.addColorStop(0.18, `rgba(${r},${g},${b},0.9)`);
  grd.addColorStop(0.45, `rgba(${r},${g},${b},0.22)`);
  grd.addColorStop(1, `rgba(${r},${g},${b},0)`);
  x.fillStyle = grd;
  x.fillRect(0, 0, 64, 64);
  return c;
}

/** 预渲染一层星云（大块柔光叠加） */
function makeNebula(seed: number) {
  const S = 1024;
  const c = document.createElement("canvas");
  c.width = c.height = S;
  const x = c.getContext("2d")!;
  let s = seed;
  const rnd = () => ((s = (s * 16807) % 2147483647) / 2147483647);
  const tones = [
    [92, 28, 140], [150, 36, 110], [30, 60, 140], [196, 80, 130], [70, 30, 120], [20, 90, 130],
  ];
  x.globalCompositeOperation = "lighter";
  for (let i = 0; i < 26; i++) {
    const cx = S / 2 + (rnd() - 0.5) * S * 0.75;
    const cy = S / 2 + (rnd() - 0.5) * S * 0.6;
    const r = S * (0.08 + rnd() * 0.28);
    const [R, G, B] = tones[Math.floor(rnd() * tones.length)];
    const a = 0.05 + rnd() * 0.16;
    const grd = x.createRadialGradient(cx, cy, 0, cx, cy, r);
    grd.addColorStop(0, `rgba(${R},${G},${B},${a})`);
    grd.addColorStop(0.5, `rgba(${R},${G},${B},${a * 0.4})`);
    grd.addColorStop(1, `rgba(${R},${G},${B},0)`);
    x.fillStyle = grd;
    x.fillRect(0, 0, S, S);
  }
  // 暗尘带，制造深邃的层次
  x.globalCompositeOperation = "destination-out";
  for (let i = 0; i < 10; i++) {
    const cx = S / 2 + (rnd() - 0.5) * S * 0.8;
    const cy = S / 2 + (rnd() - 0.5) * S * 0.6;
    const r = S * (0.05 + rnd() * 0.12);
    const grd = x.createRadialGradient(cx, cy, 0, cx, cy, r);
    grd.addColorStop(0, "rgba(0,0,0,0.55)");
    grd.addColorStop(1, "rgba(0,0,0,0)");
    x.fillStyle = grd;
    x.fillRect(0, 0, S, S);
  }
  return c;
}

const Cosmos = forwardRef<CosmosHandle, Props>(function Cosmos({ onIntroEnd }, ref) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const ctrl = useRef<{ mode: "intro" | "idle" | "ambient"; t0: number; ended: boolean }>({
    mode: "idle", t0: 0, ended: true,
  });
  const scatterRef = useRef<() => void>(() => {});
  const endCb = useRef(onIntroEnd);
  endCb.current = onIntroEnd;

  useImperativeHandle(ref, () => ({
    playIntro() {
      scatterRef.current();
      ctrl.current = { mode: "intro", t0: performance.now(), ended: false };
    },
    enter() {
      scatterRef.current();
      ctrl.current = { mode: "ambient", t0: performance.now(), ended: true };
    },
  }));

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    let w = 0, h = 0, dpr = 1;
    const sprites = PALETTE.map(makeSprite);
    const nebA = makeNebula(7);
    const nebB = makeNebula(1337);

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener("resize", resize);

    // ---------- 粒子 ----------
    const N = w < 640 ? 950 : 1700;
    const ps: Particle[] = Array.from({ length: N }, () => {
      const gr = Math.pow(Math.random(), 0.75);
      const arm = Math.floor(Math.random() * 3);
      const a = Math.random() * Math.PI * 2;
      const col =
        gr < 0.14 ? 0 : gr < 0.38 ? (Math.random() < 0.7 ? 1 : 0)
        : gr < 0.68 ? (Math.random() < 0.5 ? 2 : 3) : (Math.random() < 0.6 ? 4 : 3);
      return {
        sx: 0, sy: 0,
        gr,
        ga: (arm * Math.PI * 2) / 3 + (Math.random() - 0.5) * 0.55,
        jx: (Math.random() - 0.5) * 2, jy: (Math.random() - 0.5) * 2,
        ht: Math.random() * Math.PI * 2,
        hs: Math.random() < 0.72 ? 1 + (Math.random() - 0.5) * 0.06 : Math.sqrt(Math.random()) * 0.95,
        dx: Math.cos(a), dy: Math.sin(a), bs: 0.4 + Math.random() * 1.2,
        col, size: 3 + Math.random() * 7 * (1.1 - gr * 0.5), tw: Math.random() * Math.PI * 2,
      };
    });
    const scatter = () => {
      for (const p of ps) {
        p.sx = (Math.random() - 0.5) * 2.4;
        p.sy = (Math.random() - 0.5) * 2.4;
      }
    };
    scatter();
    scatterRef.current = scatter;

    // ---------- 星流 ----------
    const stars: Star[] = Array.from({ length: w < 640 ? 260 : 480 }, () => ({
      x: (Math.random() - 0.5) * 3, y: (Math.random() - 0.5) * 3, z: Math.random(), px: NaN, py: NaN,
    }));

    // ---------- 流星 ----------
    let meteor: { x: number; y: number; vx: number; vy: number; life: number } | null = null;
    let nextMeteor = performance.now() + 2500;

    let last = performance.now();
    let neb = 0, starA = 0, warp = 0.05;
    let raf = 0;

    const frame = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const time = now / 1000;
      const { mode, t0 } = ctrl.current;
      const tau = (now - t0) / 1000;
      const cx = w / 2, cy = h / 2;
      const R = Math.min(w, h) * 0.42;

      // ---- 时间线参数 ----
      let gather = 0, heart = 0, burst = -1, pAlpha = 0, flash = 0, nebTarget = 0.85, warpTarget = 0.05;
      let galR = R, galCy = cy;
      if (mode === "intro") {
        pAlpha = clamp(tau / 1.6);
        gather = ease(clamp((tau - T.gather) / 4.5));
        heart = ease(clamp((tau - T.heart) / 2.4));
        nebTarget = clamp((tau - 0.5) / 4) * 0.95;
        if (tau > T.burst) {
          burst = tau - T.burst;
          pAlpha *= clamp(1 - burst / 1.4);
          flash = Math.max(0, 1 - Math.abs(burst - 0.12) / 0.7) * 0.55;
          warpTarget = 0.05 + 1.6 * Math.exp(-burst * 1.8);
        }
        if (tau >= INTRO_SECONDS && !ctrl.current.ended) {
          ctrl.current.ended = true;
          ctrl.current.mode = "idle";
          endCb.current?.();
        }
      } else if (mode === "ambient") {
        gather = ease(clamp(tau / 3.5));
        pAlpha = clamp(tau / 2) * 0.6;
        galR = Math.max(w, h) * 0.5;
        galCy = cy - h * 0.05;
      }
      neb = lerp(neb, nebTarget, 1 - Math.exp(-dt * 1.5));
      starA = lerp(starA, 1, 1 - Math.exp(-dt * 0.8));
      warp = lerp(warp, warpTarget, 1 - Math.exp(-dt * 6));

      // ---- 底色 ----
      ctx.globalCompositeOperation = "source-over";
      const bg = ctx.createRadialGradient(cx, cy, 0, cx, cy, Math.max(w, h) * 0.8);
      bg.addColorStop(0, "#120a24");
      bg.addColorStop(0.55, "#07040f");
      bg.addColorStop(1, "#010103");
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, w, h);

      // ---- 星云 ----
      ctx.globalCompositeOperation = "lighter";
      const S = Math.max(w, h) * 1.7;
      ctx.globalAlpha = neb;
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(time * 0.012);
      ctx.scale(1 + Math.sin(time * 0.15) * 0.04, 1 + Math.sin(time * 0.15) * 0.04);
      ctx.drawImage(nebA, -S / 2, -S / 2, S, S);
      ctx.rotate(-time * 0.027 + 1.9);
      ctx.drawImage(nebB, -S / 2, -S / 2, S, S);
      ctx.restore();

      // 心形阶段的玫瑰色晕
      if (heart > 0 && burst < 0) {
        const glow = ctx.createRadialGradient(cx, cy, 0, cx, cy, R * 1.3);
        glow.addColorStop(0, `rgba(255,110,170,${0.22 * heart})`);
        glow.addColorStop(1, "rgba(255,110,170,0)");
        ctx.globalAlpha = 1;
        ctx.fillStyle = glow;
        ctx.fillRect(0, 0, w, h);
      }

      // ---- 星流 ----
      const F = Math.max(w, h) * 0.5;
      ctx.lineCap = "round";
      for (const s of stars) {
        s.z -= warp * dt;
        if (s.z <= 0.02) {
          s.x = (Math.random() - 0.5) * 3; s.y = (Math.random() - 0.5) * 3; s.z = 1; s.px = NaN;
        }
        const x = cx + (s.x / s.z) * F * 0.35;
        const y = cy + (s.y / s.z) * F * 0.35;
        const b = (1 - s.z) * starA;
        if (x < -50 || x > w + 50 || y < -50 || y > h + 50) { s.z = 0; continue; }
        const tw = 0.7 + 0.3 * Math.sin(time * 3 + s.x * 40);
        if (warp > 0.25 && !Number.isNaN(s.px)) {
          ctx.globalAlpha = b;
          ctx.strokeStyle = "rgba(220,215,255,1)";
          ctx.lineWidth = (1 - s.z) * 2;
          ctx.beginPath(); ctx.moveTo(s.px, s.py); ctx.lineTo(x, y); ctx.stroke();
        } else {
          ctx.globalAlpha = b * tw;
          ctx.fillStyle = "#fff";
          const r = (1 - s.z) * 1.5 + 0.2;
          ctx.fillRect(x - r / 2, y - r / 2, r, r);
        }
        s.px = x; s.py = y;
      }

      // ---- 流星 ----
      if (!meteor && now > nextMeteor) {
        const fromLeft = Math.random() < 0.5;
        meteor = {
          x: fromLeft ? Math.random() * w * 0.5 : w * 0.5 + Math.random() * w * 0.5,
          y: Math.random() * h * 0.35,
          vx: (fromLeft ? 1 : -1) * (w * 0.7), vy: h * 0.32, life: 0,
        };
        nextMeteor = now + 3500 + Math.random() * 5000;
      }
      if (meteor) {
        meteor.life += dt;
        const m = meteor;
        const hx = m.x + m.vx * m.life, hy = m.y + m.vy * m.life;
        const tx = hx - m.vx * 0.16, ty = hy - m.vy * 0.16;
        const g = ctx.createLinearGradient(hx, hy, tx, ty);
        g.addColorStop(0, "rgba(255,240,255,0.95)");
        g.addColorStop(1, "rgba(180,140,255,0)");
        ctx.globalAlpha = clamp(1 - m.life / 1.1) * starA;
        ctx.strokeStyle = g; ctx.lineWidth = 1.6;
        ctx.beginPath(); ctx.moveTo(hx, hy); ctx.lineTo(tx, ty); ctx.stroke();
        if (m.life > 1.1) meteor = null;
      }

      // ---- 粒子：散落 → 星系 → 星之心 → 爆散 ----
      if (pAlpha > 0.003) {
        const beat = 1 + 0.07 * Math.pow(Math.max(0, Math.sin(time * Math.PI * 2.2)), 6);
        const hScale = (R / 17) * 0.95 * beat;
        const rotG = time * 0.22;
        const tilt = 0.52, skew = -0.38, cs = Math.cos(skew), sn = Math.sin(skew);
        for (const p of ps) {
          // 散落
          let x = p.sx * w * 0.5 + Math.sin(time * 0.3 + p.tw) * 12;
          let y = p.sy * h * 0.5 + Math.cos(time * 0.27 + p.tw) * 12;
          // 星系
          if (gather > 0) {
            const th = p.ga + p.gr * 4.4 + rotG / (0.35 + p.gr);
            const rr = p.gr * galR;
            const lx = Math.cos(th) * rr + p.jx * galR * 0.045 * (1 - p.gr * 0.4);
            const ly = (Math.sin(th) * rr + p.jy * galR * 0.045) * tilt;
            const gx = lx * cs - ly * sn, gy = lx * sn + ly * cs + (galCy - cy);
            x = lerp(x, gx, gather);
            y = lerp(y, gy, gather);
          }
          // 星之心
          if (heart > 0) {
            const t = p.ht, st = Math.sin(t);
            const hx = 16 * st * st * st * hScale * p.hs;
            const hy = -(13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t)) * hScale * p.hs - R * 0.06;
            x = lerp(x, hx, heart);
            y = lerp(y, hy, heart);
          }
          // 爆散
          if (burst >= 0) {
            const d = (burst * burst * 1.6 + burst * 0.7) * R * p.bs;
            x += p.dx * d; y += p.dy * d;
          }
          const tw = 0.65 + 0.35 * Math.sin(time * 2.4 + p.tw);
          const s = p.size * (heart > 0 ? 1 + heart * 0.15 : 1);
          ctx.globalAlpha = pAlpha * tw;
          ctx.drawImage(sprites[p.col], cx + x - s / 2, cy + y - s / 2, s, s);
        }
      }

      // ---- 爆散闪光 ----
      if (flash > 0) {
        const fg = ctx.createRadialGradient(cx, cy, 0, cx, cy, Math.max(w, h) * 0.7);
        fg.addColorStop(0, `rgba(255,235,245,${flash})`);
        fg.addColorStop(1, "rgba(255,180,220,0)");
        ctx.globalAlpha = 1;
        ctx.fillStyle = fg;
        ctx.fillRect(0, 0, w, h);
      }

      // ---- 暗角 ----
      ctx.globalCompositeOperation = "source-over";
      ctx.globalAlpha = 1;
      const vg = ctx.createRadialGradient(cx, cy, Math.min(w, h) * 0.35, cx, cy, Math.max(w, h) * 0.75);
      vg.addColorStop(0, "rgba(0,0,0,0)");
      vg.addColorStop(1, "rgba(0,0,0,0.7)");
      ctx.fillStyle = vg;
      ctx.fillRect(0, 0, w, h);

      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return <canvas ref={canvasRef} className="cosmos" aria-hidden />;
});

export default Cosmos;
