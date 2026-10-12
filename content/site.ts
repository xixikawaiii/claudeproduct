// ============================================================
//  你的网站内容 —— 平时只需要改这个文件
//  图片 / 视频放进 public/media/，路径写成 "/media/xxx.jpg"
// ============================================================

export type LinkType =
  | "instagram" | "x" | "youtube" | "tiktok"
  | "bilibili" | "xiaohongshu" | "discord" | "mail";

export type Post =
  | { type: "text"; date: string; text: string }
  | { type: "photo"; date: string; caption?: string; photos: string[] }
  | {
      type: "video";
      date: string;
      caption?: string;
      /** 本地视频，如 "/media/clip.mp4" */
      src?: string;
      /** 或者嵌入链接：YouTube "https://www.youtube.com/embed/xxx"
       *  B站 "https://player.bilibili.com/player.html?bvid=BVxxx" */
      embed?: string;
      poster?: string;
    };

export const SITE = {
  name: "xixikawaii",
  bio: "just some human ✦ 记录一些碎片",
  avatar: "/media/avatar.jpg",
  links: [
    { type: "instagram", url: "https://instagram.com/" },
    { type: "x", url: "https://x.com/" },
    { type: "youtube", url: "https://youtube.com/" },
    { type: "bilibili", url: "https://bilibili.com/" },
    { type: "xiaohongshu", url: "https://xiaohongshu.com/" },
    { type: "mail", url: "mailto:you@example.com" },
  ] satisfies { type: LinkType; url: string }[],
};

// 最新的写在最上面
export const POSTS: Post[] = [
  {
    type: "text",
    date: "2026-10-12",
    text: "今天的晚霞是蜜桃色的，和这个网站一样 🍑",
  },
  {
    type: "photo",
    date: "2026-10-10",
    caption: "周末散步随手拍",
    photos: ["/media/photo-1.jpg", "/media/photo-2.jpg", "/media/photo-3.jpg"],
  },
  {
    type: "video",
    date: "2026-10-08",
    caption: "一段小视频 🎬",
    src: "/media/video.mp4",
  },
  {
    type: "text",
    date: "2026-10-05",
    text: "啊——\n为什么周一总是来得这么快。",
  },
  {
    type: "photo",
    date: "2026-10-01",
    photos: ["/media/photo-4.svg"],
  },
];
