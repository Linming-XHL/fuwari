/**
 * Circular-reveal theme transition.
 *
 * Uses the View Transitions API so the browser snapshots the outgoing theme and
 * plays a `clip-path: circle()` expansion from the triggering control, revealing
 * the incoming theme. Because the clip is animated on the compositor with a
 * non-linear easing curve, the sweep stays smooth even on a full page repaint.
 *
 * Everything degrades to an immediate (no-animation) switch when the API is
 * unavailable or the visitor asked for reduced motion.
 */

/** A viewport-space point the circle grows from. */
export interface RevealOrigin {
	x: number;
	y: number;
}

/**
 * Duration of the sweep in ms. Long enough to read as a deliberate reveal,
 * short enough that the switch still feels instant.
 */
const REVEAL_DURATION = 520;

/**
 * Decelerating curve: leaves the origin briskly, then eases into the final
 * radius so the leading edge does not slam into the viewport corners.
 */
const REVEAL_EASING = "ease-out";

/** Reads the reduced-motion preference, falling back to "no preference". */
function prefersReducedMotion(): boolean {
	return (
		typeof window.matchMedia === "function" &&
		window.matchMedia("(prefers-reduced-motion: reduce)").matches
	);
}

/** Skip animation on very low-end / overloaded devices to avoid jank. */
function shouldSkipAnimation(): boolean {
	if (prefersReducedMotion()) return true;
	try {
		const dpr = window.devicePixelRatio || 1;
		const { width } = viewportSize();
		if (dpr >= 3 && width < 400) return true;
	} catch {
		// Ignore measurement errors.
	}
	return false;
}

/**
 * Distance from the origin to the furthest viewport corner, so the circle is
 * guaranteed to cover the whole page regardless of where the control sits.
 */
function viewportSize(): { width: number; height: number } {
	// Android 竖屏浏览器常有地址栏收缩/软键盘弹出导致 visualViewport
	// 尺寸不一致的问题。我们先取 documentElement 的真实布局尺寸，
	// 再与 visualViewport 对比取最大值，确保半径计算不会被低估。
	const rootRect = document.documentElement.getBoundingClientRect();
	const rootW = rootRect.width || window.innerWidth;
	const rootH = rootRect.height || window.innerHeight;

	const vv = (window as { visualViewport?: VisualViewport }).visualViewport;
	if (
		vv &&
		typeof vv.width === "number" &&
		vv.width > 0 &&
		typeof vv.height === "number" &&
		vv.height > 0
	) {
		return {
			width: Math.max(rootW, vv.width),
			height: Math.max(rootH, vv.height),
		};
	}
	return { width: rootW, height: rootH };
}

function coverRadius(origin: RevealOrigin): number {
	const { x, y } = origin;
	const { width, height } = viewportSize();
	const dx = Math.max(x, width - x);
	const dy = Math.max(y, height - y);
	return Math.hypot(dx, dy);
}

/** Centre of an element in viewport coordinates, for use as a reveal origin. */
export function originFromElement(
	el: Element | null | undefined,
): RevealOrigin {
	if (el instanceof Element) {
		const rect = el.getBoundingClientRect();
		return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
	}
	return {
		x: viewportSize().width / 2,
		y: viewportSize().height / 2,
	};
}

/**
 * Runs `apply` (which mutates the DOM, e.g. toggling the `dark` class) behind a
 * circular reveal growing out of `origin`.
 *
 * Returns a promise that resolves once the sweep has finished, or immediately
 * when the transition is skipped.
 */
export function withCircularReveal(
	origin: RevealOrigin,
	apply: () => void,
): Promise<void> {
	if (
		typeof document.startViewTransition !== "function" ||
		prefersReducedMotion() ||
		shouldSkipAnimation()
	) {
		apply();
		return Promise.resolve();
	}

	const root = document.documentElement;

	// Freeze colour transitions so the captured snapshot shows the final palette
	// rather than a mid-fade frame. Removed as soon as the capture is done.
	root.classList.add("vt-instant");

	const transition = document.startViewTransition(() => {
		apply();
	});

	// The snapshots are taken once the update callback settles; release the
	// suppression right away so normal hover/colour transitions keep working
	// while the circle is still expanding.
	transition.updateCallbackDone.finally(() => {
		root.classList.remove("vt-instant");
	});

	// Pre-hint the compositor so the clip-path animation stays on its own layer.
	root.style.willChange = "clip-path";

	return transition.ready
		.then(() => {
			const radius = coverRadius(origin);
			const clipPath = [
				`circle(0px at ${origin.x}px ${origin.y}px)`,
				`circle(${radius}px at ${origin.x}px ${origin.y}px)`,
			];

			const animation = root.animate(
				{ clipPath },
				{
					duration: REVEAL_DURATION,
					easing: REVEAL_EASING,
					// Paint the incoming snapshot clipped to the growing circle.
					pseudoElement: "::view-transition-new(root)",
				},
			);

			return animation.finished.finally(() => {
				root.style.willChange = "";
			});
		})
		.then(() => undefined)
		.catch(() => {
			// A skipped/failed transition must never leave the theme unapplied or
			// the colour transitions suppressed; `apply` has already run.
			root.classList.remove("vt-instant");
		});
}
