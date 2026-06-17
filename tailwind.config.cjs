/** @type {import('tailwindcss').Config} */
const defaultTheme = require("tailwindcss/defaultTheme");
module.exports = {
	content: ["./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue,mjs}"],
	darkMode: "class", // allows toggling dark mode manually
	theme: {
		extend: {
			fontFamily: {
				sans: ["LXGW WenKai GB", "Noto Serif SC", "serif", ...defaultTheme.fontFamily.sans],
				serif: ["Noto Serif SC", "serif"],
				mono: ["Maple Mono", "ui-monospace", "SFMono-Regular", "Menlo", "Monaco", "Consolas", "monospace"],
			},
		},
	},
	plugins: [require("@tailwindcss/typography")],
};
