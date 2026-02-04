(() => {
	let isPlaying = false;
	let animationFrame = null;
	let audio = null;

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
			const [framesData, audioResponse] = await Promise.all([
				fetch("/badapple/frames.json"),
				fetch("/badapple/audio.mp3"),
			]);

			const frames = await framesData.json();
			const audioBlob = await audioResponse.blob();
			const audioUrl = URL.createObjectURL(audioBlob);

			console.log(
				`%cLoaded ${frames.length} frames`,
				"color: #00ff00; font-size: 14px;",
			);
			console.log(
				"%cStarting Bad Apple...",
				"color: #00ff00; font-size: 14px;",
			);

			audio = new Audio(audioUrl);
			audio.play();

			let currentFrame = 0;
			const fps = 30;
			const frameDelay = 1000 / fps;

			function playFrame() {
				if (!isPlaying || currentFrame >= frames.length) {
					stopBadApple();
					return;
				}

				console.clear();
				console.log(
					`%c${frames[currentFrame]}`,
					"font-family: monospace; white-space: pre; line-height: 1; font-size: 8px;",
				);
				currentFrame++;

				animationFrame = setTimeout(playFrame, frameDelay);
			}

			playFrame();

			audio.onended = () => {
				stopBadApple();
			};
		} catch (error) {
			console.error(
				"%cFailed to load Bad Apple:",
				"color: #ff0000; font-size: 14px;",
				error,
			);
			isPlaying = false;
		}
	};

	function stopBadApple() {
		isPlaying = false;
		if (animationFrame) {
			clearTimeout(animationFrame);
			animationFrame = null;
		}
		if (audio) {
			audio.pause();
			audio = null;
		}
		console.log("%cBad Apple finished!", "color: #00ff00; font-size: 14px;");
	}

	console.log(
		'%cType "badapple()" in the console to play Bad Apple!',
		"color: #00ffff; font-size: 16px; font-weight: bold;",
	);
})();
