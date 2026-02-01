export interface FriendLink {
  name: string;
  url: string;
  description: string;
  avatar?: string;
  // avatar 支持三种格式：
  // 1. 外部链接：以 http:// 或 https:// 开头
  // 2. public 目录：以 / 开头，如 /images/avatar.jpg
  // 3. 本地路径：相对于 src 目录，如 assets/images/avatar.jpg
}

export const friendLinks: FriendLink[] = [
  {
    name: "I Am I",
    url: "https://5ime.cn",
    description: "永远相信美好的事情即将发生",
    avatar: "https://gitproxy.127731.xyz/https://raw.githubusercontent.com/5ime/img/master/avatar.jpg",
  },
  {
    name: "SkonJIYHD",
    url: "https://blog.sikon.top/",
    description: "一个喜欢折腾的小笨蛋",
    avatar: "https://q.qlogo.cn/g?b=qq&nk=2661028830&s=640",
  },
  {
    name: "Aicsukの世界",
    url: "https://www.aicsuk.net/",
    description: "一个小小的博客",
    avatar: "https://www.aicsuk.net/images/avatar.jpg",
  },
  {
    name: "落憾_EnLtLH",
    url: "https://blog.luoh.org/",
    description: "落人间，破三弦，忆李仙",
    avatar: "https://cdn2.elh.dpdns.org/picture/2025/57bd486ead4f5b34a28aea7f160a70ae.avif",
  },
  {
    name: "Geekertao",
    url: "https://geekertao.top/",
    description: "不为梦想本身奋斗。为那个提出梦想的自己。",
    avatar: "https://obj.geekertao.top/geekertao.jpg",
  },
  {
    name: "AcoFork Blog",
    url: "https://blog.acofork.com/",
    description: "Protect What You Love.",
    avatar: "https://q2.qlogo.cn/headimg_dl?dst_uin=2726730791&spec=0",
  },
  {
    name: "沫泽的小站",
    url: "https://blog.pmoze.top",
    description: "一个技术宅的小窝",
    avatar: "https://blog.pmoze.top/wp-content/uploads/site.png",
  },
  {
    name: "Z次元",
    url: "https://blog.ahzoo.cn",
    description: "探索代码的世界，追寻生活的诗篇",
    avatar: "https://ahzoo.cn/img/avatar.webp",
  },
    {
    name: "熊猫の小窝",
    url: "https://www.pysio.online/",
    description: "一个温暖的家",
    avatar: "https://cdn.akaere.online/https://avatars.githubusercontent.com/u/71202163",
  },
  // 在这里添加更多友链
];
