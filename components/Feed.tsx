"use client";

import { useEffect, useState } from "react";
import type { Post } from "@/content/site";

const TABS = [
  { key: "all", label: "全部" },
  { key: "photo", label: "照片" },
  { key: "video", label: "视频" },
  { key: "text", label: "碎碎念" },
] as const;

type TabKey = (typeof TABS)[number]["key"];

function chunk<T>(arr: T[], n: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += n) out.push(arr.slice(i, i + n));
  return out;
}

/** 按图片原始宽高比分配宽度，同一行等高，不裁切 */
function Thumb({ src, alt, onOpen }: { src: string; alt: string; onOpen: () => void }) {
  const [ratio, setRatio] = useState(1);
  return (
    <button className="thumb" style={{ flex: `${ratio * 100} 1 0` }} /* ×100：flex-grow 总和小于 1 时不会占满整行 */ onClick={onOpen}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={alt}
        loading="lazy"
        ref={(img) => {
          if (img?.complete && img.naturalWidth) setRatio(img.naturalWidth / img.naturalHeight);
        }}
        onLoad={(e) => setRatio(e.currentTarget.naturalWidth / e.currentTarget.naturalHeight)}
      />
    </button>
  );
}

export default function Feed({ posts }: { posts: Post[] }) {
  const [tab, setTab] = useState<TabKey>("all");
  const [lightbox, setLightbox] = useState<{ photos: string[]; i: number } | null>(null);

  useEffect(() => {
    if (!lightbox) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setLightbox(null);
      if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
        const d = e.key === "ArrowRight" ? 1 : -1;
        setLightbox((lb) => lb && { ...lb, i: (lb.i + d + lb.photos.length) % lb.photos.length });
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [lightbox]);

  const shown = tab === "all" ? posts : posts.filter((p) => p.type === tab);

  return (
    <>
      <nav className="tabs">
        {TABS.map((t) => (
          <button
            key={t.key}
            className={tab === t.key ? "tab active" : "tab"}
            onClick={() => setTab(t.key)}
          >
            {t.label}
          </button>
        ))}
      </nav>

      <div className="feed">
        {shown.length === 0 && <p className="empty">这里还空空的～</p>}
        {shown.map((p, idx) => (
          <article key={idx} className={`post post-${p.type}`}>
            <time>{p.date}</time>

            {p.type === "text" && <p className="exclaim">{p.text}</p>}

            {p.type === "photo" && (
              <>
                <div className="gallery">
                  {chunk(p.photos, 3).map((row, r) => (
                    <div key={r} className="row">
                      {row.map((src, j) => (
                        <Thumb
                          key={src}
                          src={src}
                          alt={p.caption ?? ""}
                          onOpen={() => setLightbox({ photos: p.photos, i: r * 3 + j })}
                        />
                      ))}
                    </div>
                  ))}
                </div>
                {p.caption && <p className="caption">{p.caption}</p>}
              </>
            )}

            {p.type === "video" && (
              <>
                <div className="video">
                  {p.embed ? (
                    <iframe src={p.embed} allowFullScreen allow="autoplay; encrypted-media; picture-in-picture" />
                  ) : (
                    <video src={p.src || undefined} poster={p.poster} controls playsInline preload="metadata" />
                  )}
                </div>
                {p.caption && <p className="caption">{p.caption}</p>}
              </>
            )}
          </article>
        ))}
      </div>

      {lightbox && (
        <div className="lightbox" onClick={() => setLightbox(null)}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={lightbox.photos[lightbox.i]} alt="" onClick={(e) => e.stopPropagation()} />
          {lightbox.photos.length > 1 && (
            <span className="counter">
              {lightbox.i + 1} / {lightbox.photos.length}
            </span>
          )}
        </div>
      )}
    </>
  );
}
