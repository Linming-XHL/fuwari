/**
 * Multi-language switch helper.
 * Keeps SEO unaffected: no URL rewrite, no <link rel="alternate"> injection,
 * no content duplication — only updates the document language and icon state.
 */

export const SUPPORTED_LANGS = [
	{ code: "zh_CN", label: "简体中文", iconLabel: "文" },
	{ code: "en", label: "English", iconLabel: "A" },
] as const;

export type LangCode = (typeof SUPPORTED_LANGS)[number]["code"];

/** Get the current language code from <html lang> or site config. */
export function getCurrentLang(): LangCode {
	const htmlLang = document.documentElement.lang;
	if (htmlLang) {
		const normalized = htmlLang.replace("-", "_");
		if (SUPPORTED_LANGS.some((l) => l.code === normalized)) {
			return normalized as LangCode;
		}
		if (SUPPORTED_LANGS.some((l) => l.code === htmlLang)) {
			return htmlLang as LangCode;
		}
	}
	return "zh_CN";
}

/** Toggle to the next supported language. */
export function cycleLanguage(): LangCode {
	const current = getCurrentLang();
	const idx = SUPPORTED_LANGS.findIndex((l) => l.code === current);
	const next = SUPPORTED_LANGS[(idx + 1) % SUPPORTED_LANGS.length];
	setDocumentLanguage(next.code);
	return next.code;
}

/** Set the document language attribute (SEO-safe, updates <html lang>). */
export function setDocumentLanguage(code: LangCode): void {
	document.documentElement.lang = code.replace("_", "-");
}
