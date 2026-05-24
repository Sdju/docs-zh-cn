# 开始 {#getting-started}

欢迎来到 Vue 互动教程！

这个教程帮你在浏览器里快速体验 Vue。它不会讲所有细节。有些内容一时看不懂也没关系。学完教程后，请阅读<a target="_blank" href="/guide/introduction.html">深入指南</a>，这样你能更完整地理解这些话题。

## 前置要求 {#prerequisites}

本教程默认你已经会一些 HTML、CSS 和 JavaScript。如果你完全没做过前端，不建议直接从框架开始学——最好先学基础，再回来看这里。以前用过其他框架会有帮助，但不是必须的。

## 如何使用本教程 {#how-to-use-this-tutorial}

你可以编辑<span class="wide">右侧</span><span class="narrow">上方</span>的代码，结果会马上更新。每一步都会介绍一个 Vue 核心功能。你需要补全代码，让 demo 跑起来。如果卡住了，可以点「看答案！」按钮，它会显示能运行的代码。尽量别总点这个按钮——自己写会学得更快。

如果你用过 Vue 2 或其他框架，可以改一些设置，更好地用这个教程。如果你是新手，建议用默认设置。

<details>
<summary>教程设置详情</summary>

- Vue 有两种 API 风格：选项式 API 和组合式 API。本教程两种都支持——用顶部的 **API 风格偏好** 切换。<a target="_blank" href="/guide/introduction.html#api-styles">了解更多 API 风格</a>。

- 你也可以在单文件组件模式和 HTML 模式之间切换。前者用<a target="_blank" href="/guide/introduction.html#single-file-components">单文件组件</a> (SFC) 格式展示代码。这是大多数开发者配合构建工具使用 Vue 的方式。HTML 模式适合不用构建工具的情况。

<div class="html">

:::tip
如果你想在应用里用 HTML 模式、不做构建，请确保在脚本里这样导入：

```js
import { ... } from 'vue/dist/vue.esm-bundler.js'
```

或者配置构建工具来正确解析 `vue`。下面是 [Vite](https://vitejs.dev/) 的配置示例：

```js [vite.config.js]
export default {
  resolve: {
    alias: {
      vue: 'vue/dist/vue.esm-bundler.js'
    }
  }
}
```

更多信息请看[工具链指南中的相关部分](/guide/scaling-up/tooling.html#note-on-in-browser-template-compilation)。
:::

</div>

</details>

准备好了吗？点击「下一步」开始吧。
