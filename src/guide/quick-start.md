---
footer: false
---

<script setup>
import { VTCodeGroup, VTCodeGroupTab } from '@vue/theme'
</script>

# 快速上手 {#quick-start}

## 线上尝试 Vue {#try-vue-online}

- 想快速试试 Vue？可以直接打开我们的[演练场](https://play.vuejs.org/#eNo9jcEKwjAMhl/lt5fpQYfXUQfefAMvvRQbddC1pUuHUPrudg4HIcmXjyRZXEM4zYlEJ+T0iEPgXjn6BB8Zhp46WUZWDjCa9f6w9kAkTtH9CRinV4fmRtZ63H20Ztesqiylphqy3R5UYBqD1UyVAPk+9zkvV1CKbCv9poMLiTEfR2/IXpSoXomqZLtti/IFwVtA9A==)。

- 如果你更喜欢纯 HTML、不用构建工具，可以用 [JSFiddle](https://jsfiddle.net/yyx990803/2ke1ab0z/) 入门。

- 如果你已经会 Node.js 和构建工具，可以在浏览器里打开 [StackBlitz](https://vite.new/vue)，体验完整的构建环境。

- 想了解推荐的搭建流程，可以看这个互动 [Scrimba](http://scrimba.com/links/vue-quickstart) 教程。它会教你运行、编辑和部署第一个 Vue 应用。

## 创建一个 Vue 应用 {#creating-a-vue-application}

:::tip 前提条件

- 熟悉命令行
- 已安装 `^20.19.0 || >=22.12.0` 版本的 [Node.js](https://nodejs.org/)
:::

本节介绍如何在本地搭建 Vue [单页应用](/guide/extras/ways-of-using-vue#single-page-application-spa)。创建的项目会用 [Vite](https://vitejs.dev) 做构建，并支持 Vue 的[单文件组件](/guide/scaling-up/sfc) (SFC)。

请先安装最新版 [Node.js](https://nodejs.org/)，并在你想创建项目的文件夹里打开命令行。运行下面命令（不要输入 `$`）：

::: code-group

```sh [npm]
$ npm create vue@latest
```

```sh [pnpm]
$ pnpm create vue@latest
```

```sh [yarn]
# For Yarn (v1+)
$ yarn create vue

# For Yarn Modern (v2+)
$ yarn create vue@latest
  
# For Yarn ^v4.11
$ yarn dlx create-vue@latest
```

```sh [bun]
$ bun create vue@latest
```
:::

这条命令会安装并运行 [create-vue](https://github.com/vuejs/create-vue)，它是 Vue 官方的项目脚手架。你会看到一些可选功能提示，比如 TypeScript 和测试支持：

<div class="language-sh"><pre><code><span style="color:var(--vt-c-green);">✔</span> <span style="color:#A6ACCD;">Project name: <span style="color:#888;">… <span style="color:#89DDFF;">&lt;</span><span style="color:#888;">your-project-name</span><span style="color:#89DDFF;">&gt;</span></span></span>
<span style="color:var(--vt-c-green);">✔</span> <span style="color:#A6ACCD;">Add TypeScript? <span style="color:#888;">… <span style="color:#89DDFF;text-decoration:underline">No</span> / Yes</span></span>
<span style="color:var(--vt-c-green);">✔</span> <span style="color:#A6ACCD;">Add JSX Support? <span style="color:#888;">… <span style="color:#89DDFF;text-decoration:underline">No</span> / Yes</span></span>
<span style="color:var(--vt-c-green);">✔</span> <span style="color:#A6ACCD;">Add Vue Router for Single Page Application development? <span style="color:#888;">… <span style="color:#89DDFF;text-decoration:underline">No</span> / Yes</span></span>
<span style="color:var(--vt-c-green);">✔</span> <span style="color:#A6ACCD;">Add Pinia for state management? <span style="color:#888;">… <span style="color:#89DDFF;text-decoration:underline">No</span> / Yes</span></span>
<span style="color:var(--vt-c-green);">✔</span> <span style="color:#A6ACCD;">Add Vitest for Unit testing? <span style="color:#888;">… <span style="color:#89DDFF;text-decoration:underline">No</span> / Yes</span></span>
<span style="color:var(--vt-c-green);">✔</span> <span style="color:#A6ACCD;">Add an End-to-End Testing Solution? <span style="color:#888;">… <span style="color:#89DDFF;text-decoration:underline">No</span> / Cypress / Nightwatch / Playwright</span></span>
<span style="color:var(--vt-c-green);">✔</span> <span style="color:#A6ACCD;">Add ESLint for code quality? <span style="color:#888;">… No / <span style="color:#89DDFF;text-decoration:underline">Yes</span></span></span>
<span style="color:var(--vt-c-green);">✔</span> <span style="color:#A6ACCD;">Add Prettier for code formatting? <span style="color:#888;">… <span style="color:#89DDFF;text-decoration:underline">No</span> / Yes</span></span>
<span style="color:var(--vt-c-green);">✔</span> <span style="color:#A6ACCD;">Add Vue DevTools 7 extension for debugging? (experimental) <span style="color:#888;">… <span style="color:#89DDFF;text-decoration:underline">No</span> / Yes</span></span>
<span></span>
<span style="color:#A6ACCD;">Scaffolding project in ./<span style="color:#89DDFF;">&lt;</span><span style="color:#888;">your-project-name</span><span style="color:#89DDFF;">&gt;</span>...</span>
<span style="color:#A6ACCD;">Done.</span></code></pre></div>

如果不确定要不要开某个功能，直接按回车选 `No` 就行。项目创建好后，按下面步骤安装依赖并启动开发服务器：

::: code-group

```sh-vue [npm]
$ cd {{'<your-project-name>'}}
$ npm install
$ npm run dev
```

```sh-vue [pnpm]
$ cd {{'<your-project-name>'}}
$ pnpm install
$ pnpm run dev
```

```sh-vue [yarn]
$ cd {{'<your-project-name>'}}
$ yarn
$ yarn dev
```

```sh-vue [bun]
$ cd {{'<your-project-name>'}}
$ bun install
$ bun run dev
```

:::


这时你的第一个 Vue 项目应该已经跑起来了！注意：示例组件用的是[组合式 API](/guide/introduction#composition-api) 和 `<script setup>`，不是[选项式 API](/guide/introduction#options-api)。补充提示：

- 推荐用 [Visual Studio Code](https://code.visualstudio.com/) + [Vue - Official 扩展](https://marketplace.visualstudio.com/items?itemName=Vue.volar)。如果用其他编辑器，请看 [IDE 支持章节](/guide/scaling-up/tooling#ide-support)。
- 更多工具细节（包括和后端框架整合），见[工具链指南](/guide/scaling-up/tooling)。
- 想了解 Vite 的更多细节，请看 [Vite 文档](https://cn.vitejs.dev)。
- 如果用 TypeScript，请读 [TypeScript 使用指南](typescript/overview)。

准备把应用发布到线上时，运行：

::: code-group

```sh [npm]
$ npm run build
```

```sh [pnpm]
$ pnpm run build
```

```sh [yarn]
$ yarn build
```

```sh [bun]
$ bun run build
```

:::


这会在 `./dist` 文件夹里生成生产环境版本。更多上线内容，请看[生产环境部署指南](/guide/best-practices/production-deployment)。

[下一步>](#next-steps)

## 通过 CDN 使用 Vue {#using-vue-from-cdn}

你可以用 script 标签，通过 CDN 直接使用 Vue：

```html
<script src="https://unpkg.com/vue@3/dist/vue.global.js"></script>
```

这里用的是 [unpkg](https://unpkg.com/)，你也可以用其他 CDN，比如 [jsdelivr](https://www.jsdelivr.com/package/npm/vue) 或 [cdnjs](https://cdnjs.com/libraries/vue)。当然，也可以下载文件自己托管。

通过 CDN 用 Vue 时，不需要「构建步骤」。设置更简单，适合增强静态 HTML，或和后端框架一起用。但这样不能用单文件组件 (SFC) 语法。

### 使用全局构建版本 {#using-the-global-build}

上面的链接用的是 Vue 的*全局构建版本*。所有顶层 API 都挂在全局 `Vue` 对象上。下面是一个例子：

<div class="options-api">

```html
<script src="https://unpkg.com/vue@3/dist/vue.global.js"></script>

<div id="app">{{ message }}</div>

<script>
  const { createApp } = Vue
  
  createApp({
    data() {
      return {
        message: 'Hello Vue!'
      }
    }
  }).mount('#app')
</script>
```

[CodePen 示例 >](https://codepen.io/vuejs-examples/pen/QWJwJLp)

</div>

<div class="composition-api">

```html
<script src="https://unpkg.com/vue@3/dist/vue.global.js"></script>

<div id="app">{{ message }}</div>

<script>
  const { createApp, ref } = Vue

  createApp({
    setup() {
      const message = ref('Hello vue!')
      return {
        message
      }
    }
  }).mount('#app')
</script>
```

[CodePen 示例 >](https://codepen.io/vuejs-examples/pen/eYQpQEG)

:::tip
本指南里很多组合式 API 例子会用 `<script setup>`，这需要构建工具。如果你不用构建工具，又想用组合式 API，请看 [`setup()` 选项](/api/composition-api-setup)。
:::

</div>

### 使用 ES 模块构建版本 {#using-the-es-module-build}

本文档其余部分主要用 [ES 模块](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Guide/Modules) 语法。现代浏览器大多支持 ES 模块，所以可以这样通过 CDN 使用 Vue：

<div class="options-api">

```html{3,4}
<div id="app">{{ message }}</div>

<script type="module">
  import { createApp } from 'https://unpkg.com/vue@3/dist/vue.esm-browser.js'
  
  createApp({
    data() {
      return {
        message: 'Hello Vue!'
      }
    }
  }).mount('#app')
</script>
```

</div>

<div class="composition-api">

```html{3,4}
<div id="app">{{ message }}</div>

<script type="module">
  import { createApp, ref } from 'https://unpkg.com/vue@3/dist/vue.esm-browser.js'

  createApp({
    setup() {
      const message = ref('Hello Vue!')
      return {
        message
      }
    }
  }).mount('#app')
</script>
```

</div>

注意我们用了 `<script type="module">`，CDN 链接指向 Vue 的 **ES 模块构建版本**。

<div class="options-api">

[CodePen 示例 >](https://codepen.io/vuejs-examples/pen/VwVYVZO)

</div>
<div class="composition-api">

[CodePen 示例 >](https://codepen.io/vuejs-examples/pen/MWzazEv)

</div>

### 启用 Import maps {#enabling-import-maps}

上面的例子用了完整的 CDN URL 来导入。但文档后面你会看到这种写法：

```js
import { createApp } from 'vue'
```

我们可以用[导入映射表 (Import Maps)](https://caniuse.com/import-maps)，告诉浏览器去哪里找 `vue`：

<div class="options-api">

```html{1-7,12}
<script type="importmap">
  {
    "imports": {
      "vue": "https://unpkg.com/vue@3/dist/vue.esm-browser.js"
    }
  }
</script>

<div id="app">{{ message }}</div>

<script type="module">
  import { createApp } from 'vue'

  createApp({
    data() {
      return {
        message: 'Hello Vue!'
      }
    }
  }).mount('#app')
</script>
```

[CodePen 示例 >](https://codepen.io/vuejs-examples/pen/wvQKQyM)

</div>

<div class="composition-api">

```html{1-7,12}
<script type="importmap">
  {
    "imports": {
      "vue": "https://unpkg.com/vue@3/dist/vue.esm-browser.js"
    }
  }
</script>

<div id="app">{{ message }}</div>

<script type="module">
  import { createApp, ref } from 'vue'

  createApp({
    setup() {
      const message = ref('Hello Vue!')
      return {
        message
      }
    }
  }).mount('#app')
</script>
```

[CodePen 示例 >](https://codepen.io/vuejs-examples/pen/YzRyRYM)

</div>

你也可以在映射表里加其他依赖——但请确保用的是该库的 ES 模块版本。

:::tip 导入映射表的浏览器支持情况
导入映射表是比较新的浏览器功能。请用[支持列表](https://caniuse.com/import-maps)里的浏览器。注意：Safari 需要 16.4 以上。
:::

:::warning 生产环境中的注意事项
到目前为止，例子用的都是 Vue 的开发版本。如果你要在生产环境通过 CDN 用 Vue，请看[生产环境部署指南](/guide/best-practices/production-deployment#without-build-tools)。

Vue 可以不靠构建系统使用。也可以看看 [`vuejs/petite-vue`](https://github.com/vuejs/petite-vue)，它更适合在 [`jquery/jquery`](https://github.com/jquery/jquery)（以前）或 [`alpinejs/alpine`](https://github.com/alpinejs/alpine)（现在）这类场景里用。
:::

### 拆分模块 {#splitting-up-the-modules}

随着深入阅读，我们可能需要把代码拆成单独的 JavaScript 文件，方便管理。例如：

```html [index.html]
<div id="app"></div>

<script type="module">
  import { createApp } from 'vue'
  import MyComponent from './my-component.js'

  createApp(MyComponent).mount('#app')
</script>
```

<div class="options-api">

```js [my-component.js]
export default {
  data() {
    return { count: 0 }
  },
  template: `<div>Count is: {{ count }}</div>`
}
```

</div>
<div class="composition-api">

```js [my-component.js]
import { ref } from 'vue'
export default {
  setup() {
    const count = ref(0)
    return { count }
  },
  template: `<div>Count is: {{ count }}</div>`
}
```

</div>

如果你直接在浏览器里打开上面的 `index.html`，会报错。因为 ES 模块不能用 `file://` 协议（本地文件协议）。

出于安全原因，ES 模块只能用 `http://` 协议（网页协议）。要在本地用 ES 模块，需要启动本地 HTTP 服务器，用 `http://` 提供 `index.html`。

启动本地服务器：先安装 [Node.js](https://nodejs.org/zh/)，在 HTML 文件所在文件夹运行 `npx serve`。也可以用其他能正确提供静态文件的 HTTP 服务器。

你可能也注意到，组件模板是内联的 JavaScript 字符串。如果用 VS Code，可以安装 [es6-string-html](https://marketplace.visualstudio.com/items?itemName=Tobermory.es6-string-html) 扩展，在字符串前加 `/*html*/` 注释来高亮语法。

## 下一步 {#next-steps}

如果还没读[简介](/guide/introduction)，建议先回去读一下，再继续后面的文档。

<div class="vt-box-container next-steps">
  <a class="vt-box" href="/guide/essentials/application.html">
    <p class="next-steps-link">继续阅读该指南</p>
    <p class="next-steps-caption">会带你了解框架各个部分的细节。</p>
  </a>
  <a class="vt-box" href="/tutorial/">
    <p class="next-steps-link">尝试互动教程</p>
    <p class="next-steps-caption">适合喜欢边做边学的人。</p>
  </a>
  <a class="vt-box" href="/examples/">
    <p class="next-steps-link">查看示例</p>
    <p class="next-steps-caption">浏览核心功能和常见界面的例子。</p>
  </a>
</div>
