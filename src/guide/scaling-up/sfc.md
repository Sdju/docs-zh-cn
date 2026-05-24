# 单文件组件 {#single-file-components}

## 介绍 {#introduction}

Vue 的单文件组件（`*.vue` 文件，英文 Single-File Component，简称 **SFC**）是一种特殊文件格式，可以把一个 Vue 组件的模板、逻辑和样式放在同一个文件里。下面是一个例子：

<div class="options-api">

```vue
<script>
export default {
  data() {
    return {
      greeting: 'Hello World!'
    }
  }
}
</script>

<template>
  <p class="greeting">{{ greeting }}</p>
</template>

<style>
.greeting {
  color: red;
  font-weight: bold;
}
</style>
```

</div>

<div class="composition-api">

```vue
<script setup>
import { ref } from 'vue'
const greeting = ref('Hello World!')
</script>

<template>
  <p class="greeting">{{ greeting }}</p>
</template>

<style>
.greeting {
  color: red;
  font-weight: bold;
}
</style>
```

</div>

可以看到，单文件组件延续了网页开发里 HTML、CSS 和 JavaScript 的组合方式。`<template>`、`<script>` 和 `<style>` 三个块放在同一文件里，分别对应组件的视图、逻辑和样式。完整语法见[单文件组件语法说明](/api/sfc-spec)。

## 为什么要使用单文件组件 {#why-sfc}

使用单文件组件需要构建工具，但你能得到这些好处：

- 用熟悉的 HTML、CSS 和 JavaScript 语法写模块化组件
- [把本来就相关的内容放在一起](#what-about-separation-of-concerns)
- 模板在构建时编译，减少运行时的编译开销
- [组件作用域的 CSS](/api/sfc-css-features)
- [配合组合式 API 时语法更简单](/api/sfc-script-setup)
- 编译器可以同时分析模板和逻辑，做更多编译时优化
- [更好的 IDE 支持](/guide/scaling-up/tooling#ide-support)：自动补全、模板表达式类型检查
- 开箱即用的模块热更新 (HMR)

单文件组件是 Vue 自带的能力，也是官方推荐的项目组织方式，适用于：

- 单页面应用 (SPA)
- 静态站点生成 (SSG)
- 任何愿意加构建步骤、换取更好开发体验 (DX) 的项目

在很轻量的场景里，单文件组件可能有点“过重”。Vue 也可以不用构建步骤，直接用 JavaScript。如果你只想给静态 HTML 加一点交互，可以看 [petite-vue](https://github.com/vuejs/petite-vue)：大约 6 kB 的 Vue 子集，更适合渐进式增强。

## 单文件组件是如何工作的 {#how-it-works}

单文件组件是 Vue 规定的格式，必须用 [@vue/compiler-sfc](https://github.com/vuejs/core/tree/main/packages/compiler-sfc) 编译成普通的 JavaScript 和 CSS。编译结果是标准的 ES 模块；构建配置正确时，可以像导入其他 ES 模块一样导入 `.vue` 文件：

```js
import MyComponent from './MyComponent.vue'

export default {
  components: {
    MyComponent
  }
}
```

开发时，`<style>` 通常会注入成页面里的 `<style>` 标签，以支持热更新；生产环境会把样式抽成单独的 CSS 文件。

你可以在 [Vue 单文件组件演练场](https://play.vuejs.org/)里试用，并查看编译后的结果。

实际项目里，一般用带 SFC 编译器的构建工具，例如 [Vite](https://cn.vitejs.dev/) 或基于 [webpack](https://webpack.js.org/) 的 [Vue CLI](https://cli.vuejs.org/zh/)。Vue 也提供脚手架，帮你快速上手。更多内容见[单文件组件工具链](/guide/scaling-up/tooling)。

## 如何看待关注点分离？ {#what-about-separation-of-concerns}

有些传统 Web 开发者会担心：单文件组件把 HTML、CSS、JS 放在一起，是不是违背了“分离”？

需要先明确一点：**前端的“关注点”并不只是按文件类型分开**。工程化的目标，是更好维护代码。只按 HTML / CSS / JS 拆文件，并不能自动让复杂应用更好维护。

在现代 UI 开发里，与其把整站拆成三层、再互相穿插，不如拆成松耦合的组件，按需组合。在一个组件里，模板、逻辑、样式本来就相关，放在一起反而更内聚、更好维护。

如果你仍想把 JS 和 CSS 拆成独立文件，也可以通过[资源导入](/api/sfc-spec#src-imports)获得热更新和预编译等能力。
