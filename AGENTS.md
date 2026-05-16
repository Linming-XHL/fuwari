# Fuwari — Astro 博客模板

## 快速参考

| 命令 | 说明 |
|---|---|
| `pnpm dev` | 开发服务器，访问地址 `localhost:4321` |
| `pnpm build` | 构建 + Pagefind 搜索索引 |
| `pnpm preview` | 预览生产环境构建产物 |
| `pnpm check` | `astro check`（Astro 诊断） |
| `pnpm type-check` | `tsc --noEmit --isolatedDeclarations` |
| `pnpm lint` | `biome check --write ./src` |
| `pnpm format` | `biome format --write ./src` |
| `pnpm new-post <filename>` | 在 `src/content/posts/` 中创建博客文章 |

**执行顺序**：`pnpm lint` → `pnpm type-check` → `pnpm check` → `pnpm build`

## 包管理器

- **仅限 pnpm** —— 通过 `preinstall` 钩子中的 `only-allow` 强制约束。请勿使用 npm / yarn / bun。
- 要求 Node >= 20，pnpm >= 9。

## 项目结构

| 路径 | 用途 |
|---|---|
| `src/config.ts` | **主配置文件** —— 站点、个人资料、导航、横幅、许可证、评论 |
| `src/content/posts/` | 博客文章（Markdown / MDX） |
| `src/content/config.ts` | 内容集合的 schema 定义 |
| `src/pages/` | 路由页面（Astro） |
| `src/components/` | Svelte / Astro 组件 |
| `src/plugins/` | 自定义 remark / rehype 插件 |
| `src/types/config.ts` | 所有配置的 TypeScript 类型定义 |
| `dist/` | 构建输出（已忽略 Git） |
| `.astro/` | 生成的类型文件（已忽略 Git） |

## 路径别名

`@components/*`、`@assets/*`、`@constants/*`、`@utils/*`、`@i18n/*`、`@layouts/*`、`@/*` 均解析到 `src/*` 对应子目录。

## 代码风格

- **格式化工具**：Biome，配置 `indentStyle: tab`、`quoteStyle: double`
- **代码检查**：Biome 推荐规则 + 额外的 `style` 规则
- Biome **不**格式化 CSS 文件 —— Tailwind CSS 配置文件使用 CommonJS（`.cjs`）
- `.svelte` / `.astro` / `.vue` 文件：关闭 `noUnusedVariables`、`noUnusedImports`、`useConst`、`useImportType`（Biome 在这些文件的模板语法中会产生误报）
- 暗色模式：使用 `.class` 策略（Tailwind）

## 构建注意事项

- `pnpm build` 执行 `astro build && pagefind --site dist` —— 内容变更后必须重新构建 Pagefind 索引
- `astro check` 和 `tsc --noEmit` 是两个独立的命令，提交前都需要运行
- 生产环境构建使用 terser 压缩，移除 `console.*` 和 `debugger`
- Vite 会抑制关于同时动态导入和静态导入的模块的警告
- CSS 会进行代码分割；chunk 大小警告阈值为 1000 KB

## 博客文章

- 文章 Frontmatter 字段：`title`、`published`、`description`、`image`、`tags`、`category`、`draft`、`lang`
- 使用 `pnpm new-post <filename>` 创建文章（支持多级目录，例如 `subdir/post-name`）
- 额外支持的 Markdown 特性：提示框（note / tip / important / caution / warning）、GitHub 仓库卡片、Expressive Code 代码块、KaTeX 数学公式、自动章节标题

## 部署

- 部署在 Vercel 上，配置了自定义 `Cache-Control` 响应头（默认 1 小时，媒体/图片资源不可变缓存 12 小时）
- 部署前必须在 `astro.config.mjs` 中更新 Astro 的 `site` 配置

## 测试

本项目没有测试框架。CI 流程仅包含 lint + type-check + build。

---

<!-- AGENTS.md -->
# 项目语言规范

- **日常交流**：使用简体中文。
- **代码注释**：使用英文。
- **Git Commit**：使用中文，格式遵循 "feat: 新增功能"。

## 开发与提交流程

- 无需在本地进行编译或测试（不要求执行 `pnpm build`、`pnpm dev` 等命令）。
- 检查代码质量（如运行 `pnpm lint`、`pnpm type-check`、`pnpm check`）后，即可直接提交到 GitHub（使用 `git` 命令）。

## 博客文章（补充）

- 使用 `pnpm new-post <filename>` 创建文章时，**不要手动添加后缀名**（如 `.md` 或 `.mdx`），脚本会自动添加。例如：`pnpm new-post my-article`
- 文章创建后，务必修改文件开头的 **Frontmatter 元数据部分**（`title`、`published`、`description` 等），确保信息完整准确。

## 开发与编码规范

- **大道至简**：编写代码时，追求最少的修改实现完整功能，避免过度设计或不必要重构。
- **禁止自作主张**：除非用户明确要求，否则不要修改需求范围之外的代码。如果认为有必要改动其他代码，必须先询问用户是否继续。