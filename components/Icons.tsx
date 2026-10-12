import type { LinkType } from "@/content/site";

const P: Record<LinkType, React.ReactNode> = {
  instagram: (
    <>
      <rect x="3" y="3" width="18" height="18" rx="5" fill="none" stroke="currentColor" strokeWidth="2" />
      <circle cx="12" cy="12" r="4" fill="none" stroke="currentColor" strokeWidth="2" />
      <circle cx="17.5" cy="6.5" r="1.3" />
    </>
  ),
  x: <path d="M4 3h4.6l4 5.6L17.4 3H20l-6.2 7.2L21 21h-4.6l-4.4-6.1L6.7 21H4l6.8-7.8z" />,
  youtube: (
    <path d="M22 8.2a3 3 0 0 0-2.1-2.1C18 5.6 12 5.6 12 5.6s-6 0-7.9.5A3 3 0 0 0 2 8.2 31 31 0 0 0 1.6 12 31 31 0 0 0 2 15.8a3 3 0 0 0 2.1 2.1c1.9.5 7.9.5 7.9.5s6 0 7.9-.5a3 3 0 0 0 2.1-2.1 31 31 0 0 0 .4-3.8 31 31 0 0 0-.4-3.8zM10 15.2V8.8l5.3 3.2z" />
  ),
  tiktok: (
    <path d="M16.6 3c.3 2.2 1.6 3.6 3.9 3.8v3.1a7 7 0 0 1-3.8-1.1v6.1a5.9 5.9 0 1 1-5.9-5.9h.6v3.1a2.8 2.8 0 1 0 2.1 2.7V3z" />
  ),
  bilibili: (
    <>
      <path d="M7 3.5 9.5 6M17 3.5 14.5 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <rect x="2.5" y="6" width="19" height="14" rx="3.5" fill="none" stroke="currentColor" strokeWidth="2" />
      <path d="M8 11.5v2M16 11.5v2" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
    </>
  ),
  xiaohongshu: (
    <>
      <rect x="2.5" y="2.5" width="19" height="19" rx="5" fill="none" stroke="currentColor" strokeWidth="2" />
      <text x="12" y="16.2" fontSize="9.5" fontWeight="700" textAnchor="middle" fontFamily="sans-serif">红</text>
    </>
  ),
  discord: (
    <path d="M19.3 5.3A17 17 0 0 0 15 4l-.5 1.1a16 16 0 0 0-5 0L9 4a17 17 0 0 0-4.3 1.3C2 9.4 1.3 13.3 1.6 17.2A17 17 0 0 0 6.8 20l1.1-1.8a11 11 0 0 1-1.7-.8l.4-.3a12 12 0 0 0 10.8 0l.4.3-1.7.8 1.1 1.8a17 17 0 0 0 5.2-2.8c.4-4.5-.7-8.4-3.1-11.9zM8.7 14.8c-1 0-1.9-1-1.9-2.1s.8-2.1 1.9-2.1 1.9 1 1.9 2.1-.8 2.1-1.9 2.1zm6.6 0c-1 0-1.9-1-1.9-2.1s.8-2.1 1.9-2.1 1.9 1 1.9 2.1-.8 2.1-1.9 2.1z" />
  ),
  mail: (
    <>
      <rect x="2.5" y="5" width="19" height="14" rx="2" />
      <path d="m3 6.5 9 6.5 9-6.5" fill="none" stroke="var(--card)" strokeWidth="1.8" />
    </>
  ),
};

export function Icon({ type }: { type: LinkType }) {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden>
      {P[type]}
    </svg>
  );
}
