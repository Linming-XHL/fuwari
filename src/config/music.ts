export interface Song {
  // 歌曲封面
  cover: string;
  // 歌名
  title: string;
  // 作者
  artist: string;
  // 音乐 mp3 地址
  url: string;
}

export const musicPlayerConfig = {
  // 是否启用音乐播放器
  enabled: true,
  // 歌曲列表
  songs: [
    {
      cover: "https://p1.music.126.net/z_rf3dqC5xHq5cqUchD8sw==/109951164937209894.jpg",
      title: "Inspiration",
      artist: "WavebeatsMusic",
      url: "https://music.163.com/song/media/outer/url?id=1443334642.mp3",
    },
    {
      cover: "https://p2.music.126.net/htlkqWdjglVH3rcNz-zwHg==/109951163017362740.jpg",
      title: "葬花",
      artist: "THT",
      url: "https://music.163.com/song/media/outer/url?id=503426999.mp3",
    },
    {
      cover: "https://p1.music.126.net/JyPsd_g00M-4mqXLLtHncw==/5984641790343690.jpg",
      title: "The Way I Still Love You",
      artist: "Reynard Silva",
      url: "https://music.163.com/song/media/outer/url?id=2053342443.mp3",
    },
    {
      cover: "https://p1.music.126.net/u8sBsK1P8RwXLe9zNhDUIw==/109951165643598348.jpg",
      title: "Past Lives",
      artist: "Martin Arteta,creamy,11:11 Music Group",
      url: "https://music.163.com/song/media/outer/url?id=1813454565.mp3",
    },
    {
      cover: "https://p1.music.126.net/vI69Lo8XO58-RwFk_NfwhQ==/109951163320249765.jpg",
      title: "Snowdream",
      artist: "VibeNova",
      url: "https://music.163.com/song/media/outer/url?id=568709232.mp3",
    },
    {
      cover: "https://p2.music.126.net/VxDvhpjxxHaUVx3RJeadOw==/109951169535119880.jpg",
      title: "Collapsing World",
      artist: "Lightscape",
      url: "https://music.163.com/song/media/outer/url?id=2150413480.mp3",
    },
    {
      cover: "https://p2.music.126.net/QFwzGhhmZDINqQ6iTlgaWg==/109951173127839710.jpg",
      title: "室内系的TrackMaker",
      artist: "Reze",
      url: "https://music.163.com/song/media/outer/url?id=3374977079.mp3",
    },
    {
      cover: "https://p1.music.126.net/vfArwmf4yUKmZhi-ZCwOXA==/109951166569406479.jpg",
      title: "it's 6pm but I miss u already.",
      artist: "BlueLee,Furyl,Siren",
      url: "https://music.163.com/song/media/outer/url?id=1890756154.mp3",
    },
  ],
};
