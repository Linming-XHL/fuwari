(() => {
	let isPlaying = false;
	let animationFrame = null;
	let audio = null;
	let startTime = 0;
	let frames = [];
	let frameCount = 0;
	let lyrics = [];
	const fps = 30;

	// 解析LRC歌词
	function parseLRC(lrcContent) {
		const lines = lrcContent.split("\n");
		const result = [];

		lines.forEach((line) => {
			const timeMatch = line.match(/\[(\d+):(\d+\.\d+)\]/);
			if (timeMatch) {
				const minutes = Number.parseInt(timeMatch[1], 10);
				const seconds = Number.parseFloat(timeMatch[2]);
				const timestamp = minutes * 60 + seconds;

				const text = line.replace(/\[(\d+):(\d+\.\d+)\]/, "").trim();
				if (text) {
					// 处理双语歌词（带有斜杠的行）
					const parts = text.split("/");
					result.push({
						timestamp,
						text: parts,
					});
				}
			}
		});

		return result;
	}

	// 获取当前时间的歌词
	function getCurrentLyric(currentTime) {
		for (let i = lyrics.length - 1; i >= 0; i--) {
			if (lyrics[i].timestamp <= currentTime) {
				return lyrics[i];
			}
		}
		return null;
	}

	window.badapple = async () => {
		if (isPlaying) {
			console.log(
				"%cBad Apple is already playing!",
				"color: #ff0000; font-size: 14px;",
			);
			return;
		}

		isPlaying = true;
		console.log(
			"%cLoading Bad Apple data...",
			"color: #00ff00; font-size: 14px;",
		);

		try {
			// 并行加载所有数据
			const [framesResponse, audioResponse, lyricResponse] = await Promise.all([
				fetch("/badapple/frames.json"),
				fetch("/badapple/audio.mp3"),
				fetch("/badapple/lyric.lrc"),
			]);

			frames = await framesResponse.json();
			frameCount = frames.length;

			const audioBlob = await audioResponse.blob();
			const audioUrl = URL.createObjectURL(audioBlob);

			const lyricContent = await lyricResponse.text();
			lyrics = parseLRC(lyricContent);

			console.log(
				`%cLoaded ${frameCount} frames`,
				"color: #00ff00; font-size: 14px;",
			);
			console.log(
				`%cLoaded ${lyrics.length} lyrics`,
				"color: #00ff00; font-size: 14px;",
			);

			audio = new Audio(audioUrl);

			// 预加载音频
			await audio.load();

			console.log(
				"%cStarting Bad Apple...",
				"color: #00ff00; font-size: 14px;",
			);

			// 开始播放
			startTime = performance.now();
			audio.play();

			// 使用requestAnimationFrame以获得更平滑的动画
			function playFrame() {
				if (!isPlaying) {
					stopBadApple();
					return;
				}

				// 计算当前应该播放的帧
				const elapsed = performance.now() - startTime;
				const currentFrame = Math.floor((elapsed / 1000) * fps);
				const currentTime = elapsed / 1000;

				if (currentFrame >= frameCount) {
					stopBadApple();
					return;
				}

				// 清除控制台
				console.clear();

				// 显示当前帧
				console.log(
					`%c${frames[currentFrame]}`,
					"font-family: monospace; white-space: pre; line-height: 1; font-size: 10px; letter-spacing: 0; word-spacing: 0;",
				);

				// 显示当前歌词
				const currentLyric = getCurrentLyric(currentTime);
				if (currentLyric) {
					console.log(
						"%c\n------------------------",
						"color: #ffff00; font-size: 10px;",
					);
					currentLyric.text.forEach((line) => {
						console.log(
							`%c${line}`,
							"color: #ffff00; font-size: 12px; font-weight: bold;",
						);
					});
					console.log(
						"%c------------------------",
						"color: #ffff00; font-size: 10px;",
					);
				}

				animationFrame = requestAnimationFrame(playFrame);
			}

			playFrame();

			audio.onended = () => {
				stopBadApple();
			};

			audio.onerror = (error) => {
				console.error(
					"%cAudio error:",
					"color: #ff0000; font-size: 14px;",
					error,
				);
			};
		} catch (error) {
			console.error(
				"%cFailed to load Bad Apple:",
				"color: #ff0000; font-size: 14px;",
				error,
			);
			stopBadApple();
		}
	};

	function stopBadApple() {
		isPlaying = false;
		if (animationFrame) {
			cancelAnimationFrame(animationFrame);
			animationFrame = null;
		}
		if (audio) {
			audio.pause();
			audio.currentTime = 0;
			audio = null;
		}
		console.clear();
		console.log("%cBad Apple finished!", "color: #00ff00; font-size: 14px;");
	}

	console.log(
		'%cType "badapple()" in the console to play Bad Apple!',
		"color: #00ffff; font-size: 16px; font-weight: bold;",
	);
})();
