export interface Song {
	// 歌曲封面
	cover: string;
	// 歌名
	title: string;
	// 作者
	artist: string;
	// 音乐 mp3 地址
	url: string;
	// 网易云音乐ID（用于获取歌词）
	id: number;
}

export const musicPlayerConfig = {
	// 是否启用音乐播放器
	enabled: true,
	// 歌曲列表
	songs: [
		{
			cover:
				"https://p4.music.126.net/4mq0-ILxPXkD9EyxLAP89Q==/109951167519653817.jpg",
			title: "Your Star",
			artist: "塞壬唱片-MSR/DJ OKAWARI/Stephanie",
			url: "https://music.163.com/song/media/outer/url?id=1953860839.mp3",
			id: 1953860839,
		},
		{
			cover:
				"https://p3.music.126.net/v0x0-vcvfNk-yhtzyEl0aA==/109951167557047755.jpg",
			title: "Like A Star (Piano Version)",
			artist: "Youngso Kim",
			url: "https://music.163.com/song/media/outer/url?id=1956462195.mp3",
			id: 1956462195,
		},
	] as Song[],
} as const;
