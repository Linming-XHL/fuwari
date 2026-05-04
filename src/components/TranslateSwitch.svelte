<script lang="ts">
import Icon from "@iconify/svelte";
import { onMount } from "svelte";

let currentLang = $state("zh-CN");
let isOpen = $state(false);

const languages = [
	{ code: "zh-CN", name: "简体中文", icon: "material-symbols:language-chinese-array" },
	{ code: "zh-TW", name: "繁體中文", icon: "material-symbols:language-chinese-array" },
	{ code: "en", name: "English", icon: "material-symbols:language" },
	{ code: "ja", name: "日本語", icon: "material-symbols:language" },
	{ code: "ko", name: "한국어", icon: "material-symbols:language" },
	{ code: "fr", name: "Français", icon: "material-symbols:language" },
	{ code: "de", name: "Deutsch", icon: "material-symbols:language" },
	{ code: "ru", name: "Русский", icon: "material-symbols:language" },
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

function togglePanel() {
	isOpen = !isOpen;
}

function changeLanguage(langCode: string) {
	currentLang = langCode;
	localStorage.setItem("translate-lang", langCode);
	isOpen = false;

	if (typeof window !== "undefined") {
		const w = window as unknown as Record<string, unknown>;
		if (w.translate) {
			(w.translate as Record<string, (lang: string) => void>).changeLanguage(langCode);
		}
	}
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
						onclick={() => changeLanguage(lang.code)}
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
