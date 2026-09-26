export function remarkHasMath() {
	return (tree, { data }) => {
		let hasMath = false;
		const walk = (node) => {
			if (node.type === "math" || node.type === "inlineMath") {
				hasMath = true;
				return;
			}
			for (const child of node.children ?? []) {
				walk(child);
				if (hasMath) return;
			}
		};
		walk(tree);
		data.astro.frontmatter.hasMath = hasMath;
	};
}
