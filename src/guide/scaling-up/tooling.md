<script setup>
import { VTCodeGroup, VTCodeGroupTab } from '@vue/theme'
</script>

# 工具链 {#tooling}

## 在线尝试 {#try-it-online}

不必在本地安装环境，也可以在浏览器里体验单文件组件开发：

- [Vue 单文件组件演练场](https://play.vuejs.org)
  - 会跟随 Vue 仓库最新提交更新
  - 可查看编译结果
- [StackBlitz 中的 Vue + Vite](https://vite.new/vue)
  - 类似 IDE，但在浏览器里运行 Vite 开发服务器
  - 更接近本地开发

提交 Bug 时，也建议用这些在线环境做最小复现。

## 项目脚手架 {#project-scaffolding}

### Vite {#vite}

[Vite](https://cn.vitejs.dev/) 是轻量、极快的构建工具，对 Vue 单文件组件有一流支持。作者是尤雨溪，也是 Vue 的作者。

用 Vite 创建 Vue 项目很简单：

::: code-group

```sh [npm]
$ npm create vue@latest
```

```sh [pnpm]
$ pnpm create vue@latest
```
  
```sh [yarn]
# For Yarn Modern (v2+)
$ yarn create vue@latest
  
# For Yarn ^v4.11
$ yarn dlx create-vue@latest
```
  
```sh [bun]
$ bun create vue@latest
```

:::

该命令会安装并运行 [create-vue](https://github.com/vuejs/create-vue)（Vue 官方脚手架）。按命令行提示操作即可。

- 更多 Vite 内容：[Vite 官方文档](https://cn.vitejs.dev)
- 配置 Vue 编译器选项等：见 [@vitejs/plugin-vue](https://github.com/vitejs/vite-plugin-vue/tree/main/packages/plugin-vue#readme)

上面两个在线演练场也支持把项目下载为 Vite 工程。

### Vue CLI {#vue-cli}

[Vue CLI](https://cli.vuejs.org/zh/) 是基于 Webpack 的官方工具链，目前处于维护模式。新项目建议用 Vite，除非你依赖特定 Webpack 能力。多数情况下 Vite 开发体验更好。

从 Vue CLI 迁移到 Vite 可参考：

- [VueSchool.io 的 Vue CLI -> Vite 迁移指南](https://vueschool.io/articles/vuejs-tutorials/how-to-migrate-from-vue-cli-to-vite/)
- [迁移支持工具 / 插件](https://github.com/vitejs/awesome-vite#vue-cli)

### 浏览器内模板编译注意事项 {#note-on-in-browser-template-compilation}

不用构建步骤时，组件模板写在页面 HTML 里，或写在 JavaScript 字符串里。这时 Vue 要在浏览器里运行模板编译器。若使用构建步骤，模板会提前编译，浏览器里就不需要编译器了。

为减小客户端包体积，Vue 提供[多种构建产物](https://unpkg.com/browse/vue@3/dist/)：

- 前缀为 `vue.runtime.*` 的是**运行时版本**：不含编译器；用这类版本时，所有模板都要在构建时预先编译。

- 名称里没有 `.runtime` 的是**完整版**：含编译器，可在浏览器里编译模板，体积大约多 14kb。

默认工具链使用运行时版本，因为单文件组件模板都已预编译。若在有构建步骤的项目里仍要在浏览器编译模板，可把 `vue` 改成 `vue/dist/vue.esm-bundler.js`。

更轻量、无需构建的替代方案：[petite-vue](https://github.com/vuejs/petite-vue)。

## IDE 支持 {#ide-support}

- 推荐 [VS Code](https://code.visualstudio.com/) + [Vue - Official 扩展](https://marketplace.visualstudio.com/items?itemName=Vue.volar)（前身是 Volar）。提供语法高亮、TypeScript 支持，以及模板表达式、组件 props 的智能提示。

  :::tip
  Vue - Official 取代了 Vue 2 时代的 [Vetur](https://marketplace.visualstudio.com/items?itemName=octref.vetur)。若在 Vue 3 项目中仍安装 Vetur，请禁用它。
  :::

- [WebStorm](https://www.jetbrains.com/webstorm/) 对单文件组件也有良好内置支持。

- 支持[语言服务协议](https://microsoft.github.io/language-server-protocol/) (LSP) 的 IDE 也可通过 LSP 使用 Volar 核心能力：

  - Sublime Text：[LSP-Volar](https://github.com/sublimelsp/LSP-volar)

  - vim / Neovim：[coc-volar](https://github.com/yaegassy/coc-volar)

  - emacs：[lsp-mode](https://emacs-lsp.github.io/lsp-mode/page/lsp-volar/)

## 浏览器开发者插件 {#browser-devtools}

Vue Devtools 可以查看组件树、组件状态、状态管理事件，并做性能分析。

![devtools 截图](./images/devtools.png)

- [文档](https://devtools.vuejs.org/)
- [Chrome 扩展商店页](https://chromewebstore.google.com/detail/vuejs-devtools-beta/ljjemllljcmogpfapbkkighbhhppjdbg)
- [Vite 插件](https://devtools.vuejs.org/guide/vite-plugin)
- [独立的 Electron 应用所属插件](https://devtools.vuejs.org/guide/standalone)

## TypeScript {#typescript}

详见：[配合 TypeScript 使用 Vue](/guide/typescript/overview)。

- [Vue - Official 扩展](https://github.com/vuejs/language-tools) 可为 `<script lang="ts">` 做类型检查，并为模板表达式和 props 提供补全与校验。

- [`vue-tsc`](https://github.com/vuejs/language-tools/tree/master/packages/tsc) 可在命令行做同样检查，常用于生成单文件组件的 `d.ts`。

## 测试 {#testing}

详见：[测试指南](/guide/scaling-up/testing)。

- [Cypress](https://www.cypress.io/) 适合 E2E；也可用 [Cypress 组件测试](https://docs.cypress.io/guides/component-testing/introduction) 测单文件组件。

- [Vitest](https://vitest.dev/) 由 Vue / Vite 团队开发，追求更快执行速度，适合 Vite 项目，组件测试反馈很快。

- [Jest](https://jestjs.io/) 可通过 [vite-jest](https://github.com/sodatea/vite-jest) 配合 Vite。更推荐已有 Jest 测试、正在迁到 Vite 的团队使用；新项目优先 Vitest，与 Vite 集成更简单。

## 代码规范 {#linting}

Vue 团队维护 [eslint-plugin-vue](https://github.com/vuejs/eslint-plugin-vue)，为单文件组件提供 ESLint 规则。

过去用 Vue CLI 时，常通过 webpack loader 配置 ESLint。基于 Vite 时，更推荐：

1. `npm install -D eslint eslint-plugin-vue`，再按 [eslint-plugin-vue 指引](https://eslint.vuejs.org/user-guide/#usage) 配置。

2. 安装 ESLint IDE 插件（如 [ESLint for VS Code](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint)），开发时即可看到提示，并避免启动 dev server 时做多余检查。

3. 把 ESLint 放进生产构建步骤，打包前得到完整检查结果。

4. （可选）用 [lint-staged](https://github.com/okonet/lint-staged) 等在 `git commit` 时自动检查。

## 格式化 {#formatting}

- [Vue - Official](https://github.com/vuejs/language-tools) VS Code 插件内置单文件组件格式化。

- [Prettier](https://prettier.io/) 也支持单文件组件格式化。

## 单文件组件自定义块集成 {#sfc-custom-block-integrations}

自定义块会编译成对同一 `.vue` 文件的不同 import 查询。具体行为取决于构建工具如何处理这类请求。

- **Vite**：需要自定义插件把自定义块转成可执行 JavaScript。[示例](https://github.com/vitejs/vite-plugin-vue/tree/main/packages/plugin-vue#example-for-transforming-custom-blocks)

- **Vue CLI / webpack**：需要 loader 配置自定义块转换。[示例](https://vue-loader.vuejs.org/zh/guide/custom-blocks.html)

## 底层库 {#lower-level-packages}

### `@vue/compiler-sfc` {#vue-compiler-sfc}

- [文档](https://github.com/vuejs/core/tree/main/packages/compiler-sfc)

该包属于 Vue 核心 monorepo，版本与 `vue` 主包一致。它已是 `vue` 的依赖，并暴露在 `vue/compiler-sfc`，一般不必单独安装。

它提供处理单文件组件的底层能力，主要给工具链开发者使用。

:::tip
请始终通过 `vue/compiler-sfc` 深度导入，以保证与运行时版本一致。
:::

### `@vitejs/plugin-vue` {#vitejs-plugin-vue}

- [文档](https://github.com/vitejs/vite-plugin-vue/tree/main/packages/plugin-vue)

Vite 官方 Vue 单文件组件插件。

### `vue-loader` {#vue-loader}

- [文档](https://vue-loader.vuejs.org/zh/)

webpack 官方 Vue 单文件组件 loader。使用 Vue CLI 时，修改选项见[文档](https://cli.vuejs.org/zh/guide/webpack.html#%E4%BF%AE%E6%94%B9-loader-%E9%80%89%E9%A1%B9)。

## 其他在线演练场 {#other-online-playgrounds}

- [VueUse Playground](https://play.vueuse.org)
- [Vue + Vite on Repl.it](https://replit.com/@templates/VueJS-with-Vite)
- [Vue on CodeSandbox](https://codesandbox.io/p/devbox/github/codesandbox/sandbox-templates/tree/main/vue-vite)
- [Vue on Codepen](https://codepen.io/pen/editor/vue)
- [Vue on WebComponents.dev](https://webcomponents.dev/create/cevue)

<!-- TODO ## Backend Framework Integrations -->
