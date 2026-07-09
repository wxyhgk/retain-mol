# mol-viewer 思维导图

这个目录提供 `packages/mol-viewer/src` 的思维导图版本，方便导入外部工具看整体结构。

## 推荐格式

当前推荐使用 Mermaid mindmap：

- 预览页：[mmd/index.html](./mmd/index.html)
- 源文件：[mmd/src-structure.mmd](./mmd/src-structure.mmd)
- 优点：纯文本、可以进 git、GitHub/很多 Markdown 工具能预览。
- 适合：先看包结构、职责边界、后续拆分重点。

## 可以使用的工具

1. Mermaid

   直接打开 `mmd/index.html`，或者复制 `mmd/src-structure.mmd` 到支持 Mermaid 的编辑器。

   ```mermaid
   mindmap
     root((packages/mol-viewer/src))
       public
       store
       lib
       styles
   ```

2. Markmap

   如果你更喜欢 Markdown 层级导图，可以用 Markmap。它更适合从 Markdown 标题生成导图，但对“文件树 + 职责说明”的表达不如 Mermaid mindmap 直接。

3. FreeMind `.mm`

   一些传统思维导图软件支持 `.mm`。如果后面你确认使用的具体软件支持 FreeMind，我可以再生成一份 `src-structure.mm`。

4. XMind

   XMind 通常可以导入 Markdown 或 OPML。更通用的方式是先生成 Markdown/OPML，再导入 XMind。

## 后续建议

如果这个导图要长期维护，建议再加一个脚本：

```text
scripts/generate-mol-viewer-mindmap.mjs
```

它可以从真实目录自动生成基础文件树，再手动维护“职责说明”节点。纯自动生成适合看文件，手写职责节点适合理解架构。
