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

	// 控制台打印
	function consolePrint(content, style) {
		console.log(`%c${content}`, style);
	}

	// 资源缓存
	const cachedResources = {
		frames: null,
		audio: null,
		lyrics: null,
	};

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
			// 检查缓存
			if (
				cachedResources.frames &&
				cachedResources.audio &&
				cachedResources.lyrics
			) {
				frames = cachedResources.frames;
				frameCount = frames.length;
				audio = cachedResources.audio;
				lyrics = cachedResources.lyrics;
				consolePrint(
					"Using cached resources...",
					"color: #00ff00; font-size: 14px;",
				);
			} else {
				// 分批加载数据，先
				consolePrint(
					"Loading lyrics..."
					"color: #00ff00; font-size: 14px
				);
				
				// 先

				const lyricContent = await lyricRespo
				lyrics = parseASS(lyricCont

				consolePrint(
					`Loaded ${lyrics.length} lyrics`,

				);


				console
					"Loading audio...",
					"color: #00ff00; font-size: 14p

				const audioRe
				const audioBlob = await audioRe
				const audioUrl = URL.createObjectURL
				au
				cachedResourc
				consolePrint(
					"Loaded audio",
					"


				// 最后加载大的 frames.json

					"Loadin
					"color: #00ff00; f
				

				frames = await framesResponse.json();

				cached
				consolePrint(
					`Loaded ${f

				);

				// 预加载音频
				await audio.load();
			}

			consoleP


			startTim
			audio.play();

			// 上一帧的歌词索引
			let lastLyricIndex = -1;
			// 上一帧的字符画索引
			let lastFrameIndex = -1;

			let lastFrameUpdateTim
			// 帧间隔时间
			const frameInterv

			//

			let lyricBuffe
			// 上一次渲染的帧索引
			let lastRenderedFrameIndex = -1;
			// 上一次渲染的歌词索引


			function playFram
				if (!isP
					

				}


				const elapsed = 
				cons
				const currentTime = elapsed / 1000;

				if 
					stopBadApple();
					return;
				}


				const lyricInd

				// 只在帧时间到达时更新帧内容
				if (
					elapsed - lastFrameUpdateTime >=
					cur
				) {
					frameBuffer = frames
					l
					lastFrameUpdateTime = elapse
				}

				// 只在歌词变化时
				if (lyricIndex !== lastLyri
					if (lyricIndex !== -1)
						lyr
							text: lyrics[lyricIndex].text,
						};
					} e
						lyricBuf
					}

				}

				// 渲染缓冲区内容
				if (frameBuffer !== null) {

					if (
						currentFrame !== lastRender
						lyricIndex !== lastRenderedLyricIndex
					) {
						// 清除控制台
						cons


						let combinedOutput = `%c${frameBuffer}`;
						let combinedStyle =
							"font-family: mon

						// 显
						if (lyricBuffer !== null) {
							

								combinedOu
							});


							combinedStyle += ",color: #4dabf7; fo
							lyricBuffer.text.forEach(() => {
						
					

							combinedStyle += ",color: #4d
						}


						cons


						lastRenderedFrameInd
						lastRenderedL
					


				// 使用requestAn
				animationFrame = r
			}

			// 
			pl

			audio.onended 
				stopBadApple();
			};

			au
				console.error(
			
			

				);
			};
		} catch (error) {
			console.error(
				"%cFailed to load Bad
			
				error,
			);
			stopBadApple();
		}
	};

	f

		if (animationFrame) {
			cancelAnimationF
			animationFrame = null;
		}
		if (audio) {
			audio.pause();
			audio.currentTime = 
		}
		console.clear();
		c
	}

	// 移除自动控制台提示，减少页面加载时的干扰
	// 只有在用户首次调用时才显示提示
	let hasShownHint = false;
	const originalBadapple = window.badapple;
	window.badapple = async () => {
		if (!hasShownHint) {
			hasShownHint = true;
		}
		return originalBadapple();
	};
})();