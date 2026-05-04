<script lang="ts">
import Icon from "@iconify/svelte";
import { onMount } from "svelte";

let currentLang = $state("zh-CN");
let isOpen = $state(false);
let isTranslating = $state(false);

const languages = [
	{ code: "zh-CN", name: "简体中文", icon: "material-symbols:translate" },
	{ code: "zh-TW", name: "繁體中文", icon: "material-symbols:translate" },
	{ code: "en", name: "English", icon: "material-symbols:translate" },
	{ code: "ja", name: "日本語", icon: "material-symbols:translate" },
	{ code: "ko", name: "한국어", icon: "material-symbols:translate" },
	{ code: "fr", name: "Français", icon: "material-symbols:translate" },
	{ code: "de", name: "Deutsch", icon: "material-symbols:translate" },
	{ code: "ru", name: "Русский", icon: "material-symbols:translate" },
];

onMount(() => {
	const savedLang = localStorage.getItem("translate-lang");
	if (savedLang) {
		currentLang = savedLang;
	}

	const handleClickOutside = (e: MouseEvent) => {
		const target = e.target as HTMLElement;
		if (!target.closest("#translate-switch-wrapper")) {
			isOpen = false;
		}
	};
	document.addEventListener("click", handleClickOutside);
	return () => document.removeEventListener("click", handleClickOutside);
});

function togglePanel(e: Event) {
	e.preventDefault();
	e.stopPropagation();
	isOpen = !isOpen;
}

function changeLanguage(langCode: string) {
	if (isTranslating || langCode === currentLang) {
		isOpen = false;
		return;
	}

	isTranslating = true;
	currentLang = langCode;
	localStorage.setItem("translate-lang", langCode);
	isOpen = false;

	if (typeof window !== "undefined") {
		const w = window as unknown as Record<string, unknown>;
		if (w.translate) {
			const translateObj = w.translate as Record<string, unknown>;
			if (typeof translateObj.changeLanguage === "function") {
				(translateObj.changeLanguage as (lang: string) => void)(langCode);
			} else if (typeof translateObj.to === "function") {
				(translateObj.to as (lang: string) => void)(langCode);
			}
		}
	}

	setTimeout(() => {
		isTranslating = false;
	}, 500);
}
</script>

<div id="translate-switch-wrapper" class="relative z-50">
	<button
		aria-label="Switch Language"
		class="relative btn-plain scale-animation rounded-lg h-11 w-11 active:scale-90"
		onclick={togglePanel}
	>
		<Icon icon="material-symbols:translate" class="text-[1.25rem]"></Icon>
	</button>

	{#if isOpen}
		<div
			class="hidden lg:block absolute transition top-11 -right-2 pt-5"
			style="opacity: 1; transform: translateY(0);"
		>
			<div class="card-base float-panel p-2 min-w-[140px]">
				{#each languages as lang}
					<button
						class="flex transition whitespace-nowrap items-center !justify-start w-full btn-plain scale-animation rounded-lg h-9 px-3 font-medium active:scale-95 mb-0.5"
						class:current-theme-btn={currentLang === lang.code}
						onclick={(e: Event) => {
							e.preventDefault();
							e.stopPropagation();
							changeLanguage(lang.code);
						}}
						disabled={isTranslating}
					>
						<Icon icon={lang.icon} class="text-[1.25rem] mr-3"></Icon>
						{lang.name}
					</button>
				{/each}
			</div>
		</div>
	{/if}
</div>

<style>
	.current-theme-btn {
		background-color: var(--btn-plain-bg-hover);
		color: var(--primary);
	}
</style>
