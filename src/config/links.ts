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
		avatar: "https://raw.githubusercontent.com/5ime/img/master/avatar.jpg",
	},
	{
		name: "Aicsukの世界(HTTP)",
		url: "http://www.aicsuk.net/",
		description: "一个小小的博客",
		avatar: "http://www.aicsuk.net/images/avatar.jpg",
	},
	{
		name: "落憾_EnLtLH",
		url: "https://blog.luoh.org/",
		description: "落人间，破三弦，忆李仙",
		avatar:
			"https://cdn2.elh.dpdns.org/picture/2025/57bd486ead4f5b34a28aea7f160a70ae.avif",
	},
	{
		name: "Z次元",
		url: "https://blog.ahzoo.cn",
		description: "探索代码的世界，追寻生活的诗篇",
		avatar: "https://ahzoo.cn/img/avatar.webp",
	},
	// 在这里添加更多友链
];
