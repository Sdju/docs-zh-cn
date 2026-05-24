# 使用 Vue 的多种方式 {#ways-of-using-vue}

Web 上没有一套方案适合所有项目。Vue 因此设计得灵活、可渐进接入——按场景选用法，在复杂度、开发体验和性能之间找平衡。

## 独立脚本 {#standalone-script}

Vue 可以单独一个 JS 文件就用，不用构建。若后端已渲染大部分 HTML，或前端逻辑简单，这是最简单的用法。这时可以把 Vue 当成更声明式的 jQuery 替代。

我们曾提供 [petite-vue](https://github.com/vuejs/petite-vue)，专门给现有 HTML 做渐进增强，但已不再积极维护，最后版本对应 Vue 3.2.27。

## 作为 Web Component 嵌入 {#embedded-web-components}

可以用 Vue [构建标准 Web Component](/guide/extras/web-components)，嵌入任意 HTML 页面，不管页面怎么渲染。这样不用事先定死使用场景：生成的 Web Component 可放进老应用、静态 HTML，甚至其他框架的应用。

## 单页面应用 (SPA) {#single-page-application-spa}

有些前端需要强交互、长会话、复杂状态。适合用 Vue 管整页、拉新数据、切换页面而不整页刷新——即单页应用 (SPA)。

Vue 有核心库和[完整工具链](/guide/scaling-up/tooling)，现代 SPA 开发体验好，包括：

- 客户端路由
- 很快的构建工具
- IDE 支持
- 浏览器开发工具
- TypeScript 支持
- 测试工具

SPA 通常要后端 API；也可配合 [Inertia.js](https://inertiajs.com) 等，保留偏后端的开发方式，同时拿到 SPA 的好处。

## 全栈 / SSR {#fullstack-ssr}

纯客户端 SPA 首屏和 SEO 较弱：浏览器先收到大片空 HTML，等 JS 加载完才有内容。

Vue 提供 API，把应用在服务端渲染成 HTML 字符串。服务器可直接返回已渲染 HTML，用户不用等 JS 就能看到内容；之后客户端再[激活 (hydrate)](/guide/scaling-up/ssr) 恢复交互。这叫服务端渲染 (SSR)，能改善 [LCP](https://web.dev/lcp/) 等核心指标。

生态里有 [NuxtJS](https://nuxt.com/) 等基于 Vue 的全栈框架，用 Vue 和 JavaScript 做全栈应用。

## JAMStack / SSG {#jamstack-ssg}

若数据是静态的，可提前在服务端渲染，把整个应用预渲染成 HTML 并以静态文件部署。性能更好，部署也简单，不必按请求动态渲染。Vue 仍可在客户端激活以提供交互。这叫静态站点生成 (SSG)，也称 [JAMStack](https://jamstack.org/what-is-jamstack/)。

SSG 分单页和多页，都会预渲染成静态 HTML，区别在于：

- 单页 SSG：首屏后「激活」成 SPA。前期要多加载、激活 JS，但之后导航更快，只更新部分内容。

- 多页 SSG：每次导航加载新页。好处是 JS 可以很少，甚至页面不需交互时零 JS。[Astro](https://astro.build/) 等还支持「部分激活」——在静态 HTML 里用 Vue 做交互「岛」。

单页 SSG 适合重交互、长会话，或要在导航间保留元素/状态；否则多页 SSG 往往更合适。

Vue 团队维护 [VitePress](https://vitepress.dev/) 静态站点生成器，本文档就是用它写的。VitePress 支持两种 SSG；[NuxtJS](https://nuxt.com/) 也支持 SSG，同一 Nuxt 应用里还可按路由混用 SSR 和 SSG。

## Web 之外... {#beyond-the-web}

Vue 主要面向 Web，但不限浏览器。还可以：

- 用 [Electron](https://www.electronjs.org/) 或 [Wails](https://wails.io) 做桌面应用
- 用 [Ionic Vue](https://ionicframework.com/docs/vue/overview) 做移动应用
- 用 [Quasar](https://quasar.dev/) 或 [Tauri](https://tauri.app) 一套代码同时做桌面和移动
- 用 [TresJS](https://tresjs.org/) 做 3D WebGL
- 用 Vue [自定义渲染 API](/api/custom-renderer) 做自定义渲染器，例如[终端 UI](https://github.com/vue-terminal/vue-termui)
