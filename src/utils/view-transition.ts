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
const REVEAL_EASING = "cubic-bezier(0.22, 1, 0.36, 1)";

/** Reads the reduced-motion preference, falling back to "no preference". */
function prefersReducedMotion(): boolean {
	return (
		typeof window.matchMedia === "function" &&
		window.matchMedia("(prefers-reduced-motion: reduce)").matches
	);
}

/**
 * Distance from the origin to the furthest viewport corner, so the circle is
 * guaranteed to cover the whole page regardless of where the control sits.
 */
function coverRadius(origin: RevealOrigin): number {
	const { x, y } = origin;
	const dx = Math.max(x, window.innerWidth - x);
	const dy = Math.max(y, window.innerHeight - y);
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
	return { x: window.innerWidth / 2, y: window.innerHeight / 2 };
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
		prefersReducedMotion()
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

			return animation.finished;
		})
		.then(() => undefined)
		.catch(() => {
			// A skipped/failed transition must never leave the theme unapplied or
			// the colour transitions suppressed; `apply` has already run.
			root.classList.remove("vt-instant");
		});
}
