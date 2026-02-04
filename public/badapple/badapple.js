(() => {
	let isPlaying = false;
	let animationFrame = null;
	let audio = null;
	let startTime = 0;
	let frames = [];
	let frameCount = 0;
	let lyrics = [];
	const fps = 30;

	// 解析ASS歌词
	function parseASS(assContent) {
		const lines = assContent.split("\n");
		const result = [];
		let inEventsSection = false;

		lines.forEach((line) => {
			// 检查是否进入Events部分
			if (line.trim() === "[Events]") {
				inEventsSection = true;
				return;
			}

			// 只处理Events部分的Dialogue行
			if (inEventsSection && line.startsWith("Dialogue:")) {
				// 分割Dialogue行
				const parts = line.split(",");
				if (parts.length >= 10) {
					// 解析开始时间 (格式: 0:00:29.22)
					const startTimeStr = parts[1];
					const timeParts = startTimeStr.split(":");
					if (timeParts.length === 3) {
						const hours = Number.parseInt(timeParts[0], 10);
						const minutes = Number.parseInt(timeParts[1], 10);
						const seconds = Number.parseFloat(timeParts[2]);
						const timestamp = hours * 3600 + minutes * 60 + seconds;

						// 获取歌词文本（从第9个元素开始，因为前面的元素可能包含逗号）
						const text = parts.slice(9).join(",").trim();
						if (text) {
							// 处理双语歌词（带有斜杠的行）
							const parts = text.split("/").map((part) => part.trim());
							result.push({
								timestamp,
								text: parts,
							});
						}
					}
				}
			}
		});

		// 按时间戳排序
		return result.sort((a, b) => a.timestamp - b.timestamp);
	}

	// 获取当前时间的歌词
	function getCurrentLyricIndex(currentTime) {
		for (let i = lyrics.length - 1; i >= 0; i--) {
			if (lyrics[i].timestamp <= currentTime) {
				return i;
			}
		}
		return -1;
	}

	// 优化版控制台打印（减少闪烁）
	function consolePrint(content, style) {
		// 使用单个console.log调用减少控制台操作
		console.log(`%c${content}`, style);
	}

	window.badapple = async () => {
		if (isPlaying) {
			consolePrint(
				"Bad Apple is already playing!",
				"color: #ff0000; font-size: 14px;",
			);
			return;
		}

		isPlaying = true;
		consolePrint(
			"Loading Bad Apple data...",
			"color: #00ff00; font-size: 14px;",
		);

		try {
			// 并行加载所有数据
			const [framesResponse, audioResponse, lyricResponse] = await Promise.all([
				fetch("/badapple/frames.json"),
				fetch("/badapple/audio.mp3"),
				fetch("/badapple/lyric.ass"),
			]);

			frames = await framesResponse.json();
			frameCount = frames.length;

			const audioBlob = await audioResponse.blob();
			const audioUrl = URL.createObjectURL(audioBlob);

			const lyricContent = await lyricResponse.text();
			lyrics = parseASS(lyricContent);

			consolePrint(
				`Loaded ${frameCount} frames`,
				"color: #00ff00; font-size: 14px;",
			);
			consolePrint(
				`Loaded ${lyrics.length} lyrics`,
				"color: #00ff00; font-size: 14px;",
			);

			audio = new Audio(audioUrl);

			// 预加载音频
			await audio.load();

			consolePrint("Starting Bad Apple...", "color: #00ff00; font-size: 14px;");

			// 开始播放
			startTime = performance.now();
			audio.play();

			// 上一帧的歌词索引
			let lastLyricIndex = -1;
			// 上一帧的字符画索引
			let lastFrameIndex = -1;
			// 上次更新帧的时间
			let lastFrameUpdateTime = 0;
			// 帧间隔时间
			const frameInterval = 1000 / fps;

			// 双缓冲实现
			let frameBuffer = null;
			let lyricBuffer = null;

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

				// 获取当前歌词索引
				const lyricIndex = getCurrentLyricIndex(currentTime);

				// 只在帧时间到达时更新帧内容
				if (
					elapsed - lastFrameUpdateTime >= frameInterval ||
					currentFrame !== lastFrameIndex
				) {
					frameBuffer = frames[currentFrame];
					lastFrameIndex = currentFrame;
					lastFrameUpdateTime = elapsed;
				}

				// 只在歌词变化时更新歌词
				if (lyricIndex !== lastLyricIndex) {
					if (lyricIndex !== -1) {
						lyricBuffer = {
							text: lyrics[lyricIndex].text,
						};
					} else {
						lyricBuffer = null;
					}
					lastLyricIndex = lyricIndex;
				}

				// 渲染缓冲区内容
				if (frameBuffer !== null) {
					// 清除控制台
					console.clear();

					// 显示当前帧
					consolePrint(
						frameBuffer,
						"font-family: monospace; white-space: pre; line-height: 1; font-size: 10px; letter-spacing: 0; word-spacing: 0;",
					);

					// 显示当前歌词
					if (lyricBuffer !== null) {
						consolePrint(
							"\n------------------------",
							"color: #4dabf7; font-size: 10px;",
						);
						lyricBuffer.text.forEach((line) => {
							consolePrint(
								line,
								"color: #ffff00; font-size: 12px; font-weight: bold; background-color: #1e88e5; padding: 2px 6px; border-radius: 3px;",
							);
						});
						consolePrint(
							"------------------------",
							"color: #4dabf7; font-size: 10px;",
						);
					}
				}

				// 使用requestAnimationFrame启用硬件加速
				animationFrame = requestAnimationFrame(playFrame);
			}

			// 开始播放
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
		consolePrint("Bad Apple finished!", "color: #00ff00; font-size: 14px;");
	}

	consolePrint(
		'Type "badapple()" in the console to play Bad Apple!',
		"color: #00ffff; font-size: 16px; font-weight: bold;",
	);
})();
