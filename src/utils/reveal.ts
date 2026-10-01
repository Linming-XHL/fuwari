/**
 * Viewport-triggered entrance.
 *
 * Marks blocks with `data-reveal`, then promotes them to `.is-revealed` the
 * first time they enter the viewport. Previously every entrance fired at load,
 * so blocks below the fold finished their animation while still off-screen —
 * a reader scrolling down found everything already settled.
 *
 * Two behaviours are deliberate:
 *
 * 1. Targets already on screen when this runs are revealed immediately, with
 *    no transition. They are part of the page's own arrival: the container
 *    around them (#content-wrapper on first paint, #swup-container on a
 *    client-side navigation) is fading and rising at that moment. Animating
 *    them as well would compound two vertical offsets into one floating,
 *    laggy movement.
 * 2. Everything else stays hidden until the observer reaches it, then rises.
 *
 * `html.reveal-init` gates the hidden state. The head bootstrap applies it
 * before first paint, so a target is never painted visible and then yanked
 * back. The failure mode is always "no animation", never "no content": a
 * watchdog drops the class if this module never runs, and reduced motion is
 * handled entirely in CSS.
 */

/** Distance from the viewport edge at which a block starts its entrance. */
const ROOT_MARGIN = "0px 0px -12% 0px";

/** Per-item stagger when several blocks are revealed in the same frame. */
const STAGGER_MS = 60;

/** Ceiling on the stagger, so a long list does not trail off forever. */
const MAX_STAGGER_MS = 240;

/** Disconnects the observer from the previous page view, if any. */
let disconnect: (() => void) | null = null;

/** Reveals everything at once, used whenever the effect cannot run. */
function revealAll(root: ParentNode): void {
	document.documentElement.classList.remove("reveal-init");
	for (const el of root.querySelectorAll("[data-reveal]")) {
		el.classList.add("is-revealed");
	}
}

/** Whether an element is currently within the viewport. */
function isOnScreen(el: HTMLElement, viewportHeight: number): boolean {
	const rect = el.getBoundingClientRect();
	return rect.top < viewportHeight && rect.bottom > 0;
}

/**
 * Fade-and-rises every `[data-reveal]` element inside `root` as it scrolls into
 * view. Replaces any observer from a previous page view.
 *
 * Returns whether an observer took over the hidden state.
 */
export function initReveal(root: ParentNode = document): boolean {
	// A client-side navigation replaces the containers, so the previous
	// observer is holding detached nodes. Drop it before attaching a new one.
	disconnect?.();
	disconnect = null;

	const reduceMotion = window.matchMedia(
		"(prefers-reduced-motion: reduce)",
	).matches;

	if (reduceMotion || typeof IntersectionObserver !== "function") {
		revealAll(root);
		return false;
	}

	const targets = Array.from(
		root.querySelectorAll<HTMLElement>("[data-reveal]"),
	);

	if (targets.length === 0) return false;

	try {
		const observer = new IntersectionObserver(
			(entries) => {
				// Reveal in reading order so a row staggers as one gesture rather
				// than in whatever order the observer happens to report.
				const entering = entries
					.filter((entry) => entry.isIntersecting)
					.map((entry) => entry.target as HTMLElement)
					.sort(
						(a, b) => a.offsetTop - b.offsetTop || a.offsetLeft - b.offsetLeft,
					);

				entering.forEach((el, i) => {
					el.style.setProperty(
						"--reveal-delay",
						`${Math.min(i * STAGGER_MS, MAX_STAGGER_MS)}ms`,
					);
					el.classList.add("is-revealed");
					observer.unobserve(el);
				});
			},
			{ rootMargin: ROOT_MARGIN },
		);

		const viewportHeight =
			window.innerHeight || document.documentElement.clientHeight;

		for (const el of targets) {
			// Already visible: this is the page arriving, not the reader
			// scrolling. Marked `reveal--instant` because the container above is
			// already fading and rising right now — a second vertical offset
			// stacked on top of it would read as floating.
			if (isOnScreen(el, viewportHeight)) {
				el.classList.add("reveal--instant", "is-revealed");
				continue;
			}
			observer.observe(el);
		}

		// Setup completed, so the bootstrap watchdog is no longer the thing
		// keeping these elements visible. Disarm it only now: if anything above
		// threw, leaving it armed is what reveals the content.
		if (typeof window.__revealWatchdog === "number") {
			window.clearTimeout(window.__revealWatchdog);
			window.__revealWatchdog = undefined;
		}

		disconnect = () => observer.disconnect();
		return true;
	} catch {
		// Any failure here must not strand content behind the hidden state.
		revealAll(root);
		return false;
	}
}
