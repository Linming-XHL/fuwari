<script lang="ts">
import { AUTO_MODE, DARK_MODE, LIGHT_MODE } from "@constants/constants.ts";
import I18nKey from "@i18n/i18nKey";
import { i18n } from "@i18n/translation";
import {
	applyThemeToDocument,
	getStoredTheme,
	setTheme,
} from "@utils/setting-utils.ts";
import {
	originFromElement,
	withCircularReveal,
} from "@utils/view-transition.ts";
import { onMount } from "svelte";
import type { LIGHT_DARK_MODE } from "@/types/config.ts";
import Icon from "./misc/OfflineIcon.svelte";

const seq: LIGHT_DARK_MODE[] = [LIGHT_MODE, DARK_MODE, AUTO_MODE];
let mode: LIGHT_DARK_MODE = $state(AUTO_MODE);

// Language state
let currentLanguage = $state("chinese_simplified");

const languages = [
	{ code: "chinese_simplified", name: "简体中文", icon: "🇨🇳" },
	{ code: "chinese_traditional", name: "繁體中文", icon: "🇨🇳" },
	{ code: "english", name: "English", icon: "🇬🇧" },
	{ code: "japanese", name: "日本語", icon: "🇯🇵" },
	{ code: "korean", name: "한국어", icon: "🇰🇷" },
];

onMount(() => {
	mode = getStoredTheme();
	const darkModePreference = window.matchMedia("(prefers-color-scheme: dark)");
	const changeThemeWhenSchemeChanged: Parameters<
		typeof darkModePreference.addEventListener<"change">
	>[1] = (_e) => {
		applyThemeToDocument(mode);
	};
	darkModePreference.addEventListener("change", changeThemeWhenSchemeChanged);

	// Dismiss the language menu when tapping outside it (touch has no mouseleave).
	document.addEventListener("pointerdown", onDocumentPointerDown);

	// Initialize current language from translate.js
	if (typeof window.translate !== "undefined") {
		const current = window.translate.language.getCurrent();
		// translate.js reports the site default as "chinese"; our menu uses the
		// full v2 identifier for simplified Chinese.
		currentLanguage =
			!current || current === "chinese" ? "chinese_simplified" : current;
	}

	return () => {
		darkModePreference.removeEventListener(
			"change",
			changeThemeWhenSchemeChanged,
		);
		document.removeEventListener("pointerdown", onDocumentPointerDown);
	};
});

/**
 * Switches the theme behind a circular reveal growing out of the control that
 * triggered it. `setTheme` also updates localStorage, so the transition wraps
 * the whole state change.
 */
function switchScheme(newMode: LIGHT_DARK_MODE, origin: Element | null) {
	if (newMode === mode) return;
	mode = newMode;
	withCircularReveal(originFromElement(origin), () => setTheme(newMode));
}

function toggleScheme(event: MouseEvent) {
	let i = 0;
	for (; i < seq.length; i++) {
		if (seq[i] === mode) {
			break;
		}
	}
	const next = seq[(i + 1) % seq.length];
	// Grow the circle from the toggle button itself.
	switchScheme(next, event.currentTarget as Element | null);
}

function showPanel() {
	const panel = document.querySelector("#light-dark-panel");
	panel?.classList.remove("float-panel-closed");
}

function hidePanel() {
	const panel = document.querySelector("#light-dark-panel");
	panel?.classList.add("float-panel-closed");
}

function showLanguagePanel() {
	const panel = document.querySelector("#language-panel");
	panel?.classList.remove("float-panel-closed");
}

function hideLanguagePanel() {
	const panel = document.querySelector("#language-panel");
	panel?.classList.add("float-panel-closed");
}

/**
 * Touch devices have no hover, so the button must toggle the panel instead of
 * only opening it.
 */
function toggleLanguagePanel() {
	const panel = document.querySelector("#language-panel");
	if (!panel) return;
	panel.classList.toggle("float-panel-closed");
}

/**
 * A tap on touch screens synthesises mouse events (mouseenter + click), which
 * would make showLanguagePanel() open the panel and the click handler close it
 * again immediately. Only treat hover as "open" for a real mouse pointer.
 */
function onLanguagePointerEnter(event: PointerEvent) {
	if (event.pointerType === "mouse") {
		showLanguagePanel();
	}
}

/**
 * Touch devices never fire `mouseleave`, so tapping anywhere outside the menu is
 * the only way to dismiss it.
 */
function onDocumentPointerDown(event: PointerEvent) {
	const panel = document.querySelector("#language-panel");
	if (!panel || panel.classList.contains("float-panel-closed")) return;
	const target = event.target as Node | null;
	// Ignore taps inside the menu itself (including the toggle button's wrapper).
	if (target && panel.parentElement?.contains(target)) return;
	hideLanguagePanel();
}

function switchLanguage(langCode: string) {
	if (typeof window.translate === "undefined") {
		console.warn("translate.js not loaded yet");
		return;
	}

	currentLanguage = langCode;

	// Translating INTO another language works in place: changeLanguage() re-scans
	// the DOM and renders the target language without a reload.
	if (langCode !== "chinese_simplified") {
		window.translate.changeLanguage(langCode);
		hideLanguagePanel();
		return;
	}

	// Going back to simplified Chinese is the one case in-place restore cannot
	// handle: translate.js only records originalText when whole-page translation is
	// enabled, so reset()/changeLanguage() leave nodes (e.g. article titles)
	// translated. Clearing the stored target language and reloading is reliable.
	window.translate.language.clearCacheLanguage();
	hideLanguagePanel();
	window.location.reload();
}

// Add type declaration for translate.js on window
declare global {
	interface Window {
		translate: any;
	}
}
</script>

<!-- Theme and Language switches in a flex container -->
<div class="flex items-center gap-2">
    <!-- z-50 make the panel higher than other float panels -->
    <div class="relative z-50" role="menu" tabindex="-1" onmouseleave={hidePanel}>
        <button aria-label="Light/Dark Mode" role="menuitem" class="relative btn-plain scale-animation rounded-lg h-11 w-11 active:scale-90" id="scheme-switch" onclick={toggleScheme} onmouseenter={showPanel}>
            <div class="absolute" class:opacity-0={mode !== LIGHT_MODE}>
                <Icon icon="material-symbols:wb-sunny-outline-rounded" class="text-[1.25rem]"></Icon>
            </div>
            <div class="absolute" class:opacity-0={mode !== DARK_MODE}>
                <Icon icon="material-symbols:dark-mode-outline-rounded" class="text-[1.25rem]"></Icon>
            </div>
            <div class="absolute" class:opacity-0={mode !== AUTO_MODE}>
                <Icon icon="material-symbols:radio-button-partial-outline" class="text-[1.25rem]"></Icon>
            </div>
        </button>

        <div id="light-dark-panel" class="hidden lg:block absolute transition float-panel-closed top-11 -right-2 pt-5" >
            <div class="card-base float-panel p-2">
                <button class="flex transition whitespace-nowrap items-center !justify-start w-full btn-plain scale-animation rounded-lg h-9 px-3 font-medium active:scale-95 mb-0.5"
                        class:current-theme-btn={mode === LIGHT_MODE}
                        onclick={(e) => switchScheme(LIGHT_MODE, e.currentTarget)}
                >
                    <Icon icon="material-symbols:wb-sunny-outline-rounded" class="text-[1.25rem] mr-3"></Icon>
                    {i18n(I18nKey.lightMode)}
                </button>
                <button class="flex transition whitespace-nowrap items-center !justify-start w-full btn-plain scale-animation rounded-lg h-9 px-3 font-medium active:scale-95 mb-0.5"
                        class:current-theme-btn={mode === DARK_MODE}
                        onclick={(e) => switchScheme(DARK_MODE, e.currentTarget)}
                >
                    <Icon icon="material-symbols:dark-mode-outline-rounded" class="text-[1.25rem] mr-3"></Icon>
                    {i18n(I18nKey.darkMode)}
                </button>
                <button class="flex transition whitespace-nowrap items-center !justify-start w-full btn-plain scale-animation rounded-lg h-9 px-3 font-medium active:scale-95"
                        class:current-theme-btn={mode === AUTO_MODE}
                        onclick={(e) => switchScheme(AUTO_MODE, e.currentTarget)}
                >
                    <Icon icon="material-symbols:radio-button-partial-outline" class="text-[1.25rem] mr-3"></Icon>
                    {i18n(I18nKey.systemMode)}
                </button>
            </div>
        </div>
    </div>

    <!-- Language switch with dropdown menu -->
    <div class="relative z-50" role="menu" tabindex="-1" onmouseleave={hideLanguagePanel}>
        <button aria-label="Switch language" role="menuitem" class="btn-plain scale-animation rounded-lg h-11 w-11 active:scale-90" onclick={toggleLanguagePanel} onpointerenter={onLanguagePointerEnter} title="切换语言">
            <Icon icon="material-symbols:translate" class="text-[1.25rem]"></Icon>
        </button>

        <!-- No `hidden lg:block`: touch devices have no hover and there is no other
             way to reach the language menu, so it must be openable at every width. -->
        <div id="language-panel" class="absolute transition float-panel-closed top-11 -right-2 pt-5">
            <div class="card-base float-panel p-2">
                {#each languages as lang}
                    <button 
                        class="flex transition whitespace-nowrap items-center !justify-start w-full btn-plain scale-animation rounded-lg h-9 px-3 font-medium active:scale-95 mb-0.5 last:mb-0"
                        class:current-theme-btn={currentLanguage === lang.code}
                        onclick={() => switchLanguage(lang.code)}
                    >
                        <span class="text-lg mr-2">{lang.icon}</span>
                        <span>{lang.name}</span>
                    </button>
                {/each}
            </div>
        </div>
    </div>
</div>

<style>
    .current-theme-btn {
        @apply bg-[var(--btn-content-bg-hover)];
    }
</style>
