(() => {
	let isPlaying = false;
	let animationFrame = null;
	let audio = null;
	let startTime = 0;
	let frames = [];
	let frameCount = 0;
	const fps = 30;

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
			// 先加载字符画数据
			const framesResponse = await fetch("/badapple/frames.json");
			frames = await framesResponse.json();
			frameCount = frames.length;

			console.log(
				`%cLoaded ${frameCount} frames`,
				"color: #00ff00; font-size: 14px;",
			);

			// 加载音频
			const audioResponse = await fetch("/badapple/audio.mp3");
			const audioBlob = await audioResponse.blob();
			const audioUrl = URL.createObjectURL(audioBlob);

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

				if (currentFrame >= frameCount) {
					stopBadApple();
					return;
				}

				// 清除控制台并显示当前帧
				console.clear();
				console.log(
					`%c${frames[currentFrame]}`,
					"font-family: monospace; white-space: pre; line-height: 1; font-size: 10px; letter-spacing: 0; word-spacing: 0;",
				);

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
