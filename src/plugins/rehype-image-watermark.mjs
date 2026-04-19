import { visit } from "unist-util-visit";
import sharp from "sharp";
import fs from "node:fs";
import path from "node:path";

const WATERMARK_TEXT = "临明小狐狸の小窝";
const WATERMARK_URL = "https://lmxhl.top";
const MIN_WIDTH = 480;
const MIN_HEIGHT = 360;

export function rehypeImageWatermark() {
	return async (tree) => {
		const imageNodes = [];

		visit(tree, "element", (node) => {
			if (node.tagName === "img" && node.properties?.src) {
				imageNodes.push(node);
			}
		});

		for (const node of imageNodes) {
			const src = node.properties.src;

			if (!src || src.startsWith("http://") || src.startsWith("https://") || src.startsWith("data:")) {
				continue;
			}

			const imagePath = path.resolve(process.cwd(), "public", src.replace(/^\//, ""));

			if (!fs.existsSync(imagePath)) {
				continue;
			}

			try {
				const image = sharp(imagePath);
				const metadata = await image.metadata();

				if (!metadata.width || !metadata.height) {
					continue;
				}

				if (metadata.width >= MIN_WIDTH && metadata.height >= MIN_HEIGHT) {
					const outputPath = path.resolve(process.cwd(), "dist", "_astro", path.basename(src));

					if (!fs.existsSync(path.dirname(outputPath))) {
						fs.mkdirSync(path.dirname(outputPath), { recursive: true });
					}

					const fontSize = Math.max(12, Math.floor(metadata.width / 40));
					const padding = Math.floor(fontSize / 2);

					const svgText = `
						<svg width="${metadata.width}" height="${metadata.height}">
							<defs>
								<style>
									.watermark-text {
										font-family: sans-serif;
										font-size: ${fontSize}px;
										fill: rgba(255, 255, 255, 0.7);
										text-anchor: end;
										font-weight: bold;
										text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.8);
									}
									.watermark-url {
										font-family: sans-serif;
										font-size: ${fontSize - 2}px;
										fill: rgba(255, 255, 255, 0.6);
										text-anchor: end;
										font-weight: normal;
										text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.8);
									}
								</style>
							</defs>
							<text x="${metadata.width - padding}" y="${metadata.height - padding * 3}" class="watermark-text">${WATERMARK_TEXT}</text>
							<text x="${metadata.width - padding}" y="${metadata.height - padding}" class="watermark-url">${WATERMARK_URL}</text>
						</svg>
					`;

					const svgBuffer = Buffer.from(svgText);

					await image
						.composite([{ input: svgBuffer, top: 0, left: 0, blend: "over" }])
						.toFile(outputPath);

					node.properties.src = `/_astro/${path.basename(src)}`;
				}
			} catch (error) {
				console.error(`Error processing image ${src}:`, error);
			}
		}
	};
}
