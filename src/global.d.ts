import type { AstroIntegration } from "@swup/astro";

declare global {
	interface Window {
		// type from '@swup/astro' is incorrect
		swup: AstroIntegration;
		// Bad Apple easter egg launcher, injected by the layout
		badapple: () => Promise<void>;
		// Arknights-style loading overlay controls, injected by LoadingSkeleton
		__akLoader?: {
			start: () => void;
			// The predicate lets the caller veto a slow exit (first-paint budget)
			finish: (shouldRetire?: () => boolean) => void;
		};
		// Watchdog that un-hides reveal content if the reveal module never runs
		__revealWatchdog?: number;
		pagefind: {
			search: (query: string) => Promise<{
				results: Array<{
					data: () => Promise<SearchResult>;
				}>;
			}>;
		};
	}
}

interface SearchResult {
	url: string;
	meta: {
		title: string;
	};
	excerpt: string;
	content?: string;
	word_count?: number;
	filters?: Record<string, unknown>;
	anchors?: Array<{
		element: string;
		id: string;
		text: string;
		location: number;
	}>;
	weighted_locations?: Array<{
		weight: number;
		balanced_score: number;
		location: number;
	}>;
	locations?: number[];
	raw_content?: string;
	raw_url?: string;
	sub_results?: SearchResult[];
}
