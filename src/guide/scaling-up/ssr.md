---
outline: deep
---

# 服务端渲染 (SSR) {#server-side-rendering-ssr}

## 总览 {#overview}

### 什么是 SSR？ {#what-is-ssr}

Vue.js 用于构建客户端应用。默认情况下，Vue 组件在浏览器里生成并操作 DOM。Vue 也支持在服务端把组件渲染成 HTML 字符串，随响应返回浏览器，再在浏览器里把静态 HTML **激活** (hydrate) 成可交互的应用。

服务端渲染的 Vue 应用也常被称为 **同构** (Isomorphic) 或 **通用** (Universal) 应用：大部分代码同时在服务端**和**客户端运行。

### 为什么要用 SSR？ {#why-ssr}

与客户端单页面应用 (SPA) 相比，SSR 的主要优势：

- **更快的首屏**：在慢网络或弱设备上尤其明显。服务端 HTML 不必等所有 JavaScript 下载并执行完才显示，用户能更快看到完整页面。首次访问时，数据获取可在服务端完成，数据库连接可能更快。这往往带来更好的[核心 Web 指标](https://web.dev/vitals/)、更好的体验；若首屏速度与转化率直接相关，这一点可能很关键。

- **统一的心智模型**：前后端可以用同一种语言、同一种声明式、组件化方式开发，不必在后端模板和前端框架之间来回切换。

- **更好的 SEO**：爬虫可以直接看到完整 HTML。

  :::tip
  目前 Google、Bing 能较好索引**同步** JavaScript 应用——关键词是“同步”。若页面先显示 loading，再用 Ajax 拉内容，爬虫不一定会等内容加载完。若 SEO 很重要且内容是异步获取的，SSR 可能是必要的。
  :::

使用 SSR 也有代价：

- **开发限制**：依赖浏览器的 API 只能在部分生命周期钩子里用；部分第三方库在 SSR 应用里需要特殊处理。

- **构建与部署更复杂**：需要能运行 Node.js 的环境；不像纯静态 SPA 那样可以只部署静态文件。

- **服务端负载更高**：在 Node.js 里渲染整页比只托管静态文件更耗 CPU。若预期流量大，要准备服务器容量并做好缓存。

选型前先问自己：是否真的需要 SSR？若你在做内部管理后台，首屏慢几百毫秒也许无所谓，SSR 价值不大。若内容展示速度极其重要，SSR 能尽量优化首屏。

### SSR vs. SSG {#ssr-vs-ssg}

**静态站点生成** (Static-Site Generation，SSG)，也叫预渲染：若每个用户看到的数据相同，可以在**构建时**渲染一次，生成静态 HTML，而不是每个请求都重新渲染。

SSG 首屏体验与 SSR 类似，但成本更低、部署更简单（输出静态 HTML 和资源）。关键词是**静态**：只适合构建时数据已确定、请求之间不会变的页面；数据一变就要重新部署。

若你只是为了少数营销页做 SEO（如 `/`、`/about`、`/contact`），也许 SSG 比 SSR 更合适。SSG 也适合文档站、博客。本站就是用 [VitePress](https://vitepress.dev/)（Vue 驱动的静态站点生成器）生成的。

## 基础教程 {#basic-tutorial}

### 渲染一个应用 {#rendering-an-app}

下面是一个最基础的 Vue SSR 示例。

1. 新建文件夹并 `cd` 进入
2. 运行 `npm init -y`
3. 在 `package.json` 中添加 `"type": "module"`，让 Node.js 以 [ES modules mode](https://nodejs.org/api/esm.html#modules-ecmascript-modules) 运行
4. 运行 `npm install vue`
5. 创建 `example.js`：

```js
// 此文件运行在 Node.js 服务器上
import { createSSRApp } from 'vue'
// Vue 的服务端渲染 API 位于 `vue/server-renderer` 路径下
import { renderToString } from 'vue/server-renderer'

const app = createSSRApp({
  data: () => ({ count: 1 }),
  template: `<button @click="count++">{{ count }}</button>`
})

renderToString(app).then((html) => {
  console.log(html)
})
```

运行：

```sh
> node example.js
```

命令行应输出：

```
<button>1</button>
```

[`renderToString()`](/api/ssr#rendertostring) 接收 Vue 应用实例，返回 Promise，resolve 时得到 HTML。也可用 [Node.js Stream API](https://nodejs.org/api/stream.html) 或 [Web Streams API](https://developer.mozilla.org/zh-CN/docs/Web/API/Streams_API) 做流式渲染。详见 [SSR API 参考](/api/ssr)。

接下来把 SSR 代码放进服务器请求处理函数，把 HTML 片段包进完整页面。下面用 [`express`](https://expressjs.com/)：

- 运行 `npm install express`
- 创建 `server.js`：

```js
import express from 'express'
import { createSSRApp } from 'vue'
import { renderToString } from 'vue/server-renderer'

const server = express()

server.get('/', (req, res) => {
  const app = createSSRApp({
    data: () => ({ count: 1 }),
    template: `<button @click="count++">{{ count }}</button>`
  })

  renderToString(app).then((html) => {
    res.send(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Vue SSR Example</title>
      </head>
      <body>
        <div id="app">${html}</div>
      </body>
    </html>
    `)
  })
})

server.listen(3000, () => {
  console.log('ready')
})
```

运行 `node server.js`，访问 `http://localhost:3000`，应能看到按钮。

[在 StackBlitz 上试试](https://stackblitz.com/fork/vue-ssr-example-basic?file=index.js)

### 客户端激活 {#client-hydration}

点击按钮，数字不会变——因为浏览器里还没有加载 Vue，这段 HTML 在客户端是静态的。

要让应用可交互，Vue 需要执行**激活**：创建与服务端一致的应用实例，把每个组件和对应 DOM 节点匹配，并绑定事件。

激活时应使用 [`createSSRApp()`](/api/application#createssrapp)，而不是 `createApp()`：

```js{2}
// 该文件运行在浏览器中
import { createSSRApp } from 'vue'

const app = createSSRApp({
  // ...和服务端完全一致的应用实例
})

// 在客户端挂载一个 SSR 应用时会假定
// HTML 是预渲染的，然后执行激活过程，
// 而不是挂载新的 DOM 节点
app.mount('#app')
```

### 代码结构 {#code-structure}

如何在客户端复用服务端的应用代码？这就涉及 SSR 的**代码结构**——如何在服务器和客户端之间共享代码。

下面是最基础的拆分：把创建应用的逻辑放到 `app.js`：

```js [app.js]
// (在服务器和客户端之间共享)
import { createSSRApp } from 'vue'

export function createApp() {
  return createSSRApp({
    data: () => ({ count: 1 }),
    template: `<button @click="count++">{{ count }}</button>`
  })
}
```

该文件及其依赖在服务端和客户端共享，称为**通用代码**。写通用代码有一些注意事项，见下文[书写 SSR 友好的代码](#writing-ssr-friendly-code)。

客户端入口导入通用代码，创建应用并挂载：

```js [client.js]
import { createApp } from './app.js'

createApp().mount('#app')
```

服务端在请求处理函数里使用同样的创建逻辑：

```js{2,5} [server.js]
// (不相关的代码省略)
import { createApp } from './app.js'

server.get('/', (req, res) => {
  const app = createApp()
  renderToString(app).then(html => {
    // ...
  })
})
```

要在浏览器加载客户端文件，还需要：

1. 在 `server.js` 添加 `server.use(express.static('.'))` 托管客户端文件。
2. 在 HTML 中加入 `<script type="module" src="/client.js"></script>` 加载客户端入口。
3. 在 HTML 中加入 [Import Map](https://github.com/WICG/import-maps)，以支持浏览器里 `import * from 'vue'`。

[在 StackBlitz 上尝试完整示例](https://stackblitz.com/fork/vue-ssr-example?file=index.js)。按钮现在可以交互了。

## 更通用的解决方案 {#higher-level-solutions}

从上面的例子到可上线的 SSR 应用，还要做很多事，例如：

- 支持 Vue 单文件组件和其他构建步骤。通常要对同一应用做**两次构建**：一次给客户端，一次给服务端。

  :::tip
  组件在 SSR 下的编译结果不同——模板会编译成字符串拼接，而不是 render 函数，以提升渲染性能。
  :::

- 在服务端返回的 HTML 里包含正确的资源链接和加载提示（如 prefetch、preload）。可能还要在 SSR 与 SSG 之间切换，或混合使用。

- 以统一方式管理路由、数据获取和状态。

完整实现很复杂，且依赖构建工具。建议使用更集成、更高层的方案。Vue 生态中的 SSR 方案包括：

### Nuxt {#nuxt}

[Nuxt](https://nuxt.com/) 基于 Vue 生态的全栈框架，开发 Vue SSR 体验很好，也可当作静态站点生成器使用。强烈建议尝试。

### Quasar {#quasar}

[Quasar](https://quasar.dev) 是 Vue 全栈方案：同一套代码可构建 SPA、SSR、PWA、移动端、桌面端和浏览器插件，并提供 Material Design 风格组件库。

### Vite SSR {#vite-ssr}

Vite 内置 [Vue 服务端渲染支持](https://cn.vitejs.dev/guide/ssr.html)，但偏底层。若直接用 Vite，可看社区插件 [vite-plugin-ssr](https://vite-plugin-ssr.com/)，它封装了许多细节。

也可参考[手动配置的 Vue + Vite SSR 示例](https://github.com/vitejs/vite-plugin-vue/tree/main/playground/ssr-vue)。只有在你有丰富 SSR 和构建经验、并想深度定制架构时才建议从这里起步。

## 书写 SSR 友好的代码 {#writing-ssr-friendly-code}

无论构建配置或顶层框架如何，以下原则适用于所有 Vue SSR 应用。

### 服务端的响应性 {#reactivity-on-the-server}

SSR 时，每个请求 URL 对应一种应用状态。没有用户交互和 DOM 更新，服务端不需要响应性。为性能考虑，SSR 期间默认关闭响应性。

### 组件生命周期钩子 {#component-lifecycle-hooks}

没有动态更新，<span class="options-api">`mounted`</span><span class="composition-api">`onMounted`</span>、<span class="options-api">`updated`</span><span class="composition-api">`onUpdated`</span> 等钩子在 SSR 期间**不会**执行，只在客户端运行。<span class="options-api">只有 `beforeCreate` 和 `created` 会在 SSR 期间调用。</span>

避免在 <span class="options-api">`beforeCreate` 和 `created`</span><span class="composition-api">`setup()` 或 `<script setup>` 根作用域</span>里写需要清理的副作用代码。例如用 `setInterval` 设定时器：若在客户端钩子里设置，应在 <span class="options-api">`beforeUnmount`</span><span class="composition-api">`onBeforeUnmount`</span> 或 <span class="options-api">`unmounted`</span><span class="composition-api">`onUnmounted`</span> 里清除。但 SSR 不会调用 unmount 钩子，定时器会一直存在。请把副作用放到 <span class="options-api">`mounted`</span><span class="composition-api">`onMounted`</span> 里。

### 访问平台特有 API {#access-to-platform-specific-apis}

通用代码不能直接用平台 API。若代码使用 `window`、`document` 等浏览器全局变量，在 Node.js 会报错；反之亦然。

若任务在服务端和客户端都要做、但 API 不同，建议封装成通用 API，或使用已封装的库。例如服务端和客户端都可用 [`node-fetch`](https://github.com/node-fetch/node-fetch) 提供相同的 fetch API。

浏览器 API 通常在仅客户端的生命周期钩子里访问，例如 <span class="options-api">`mounted`</span><span class="composition-api">`onMounted`</span>。

若第三方库未考虑通用性，接入 SSR 可能很麻烦。你也许可以 mock 全局变量让它跑起来，但这属于 hack，可能影响其他库的环境检测。

### 跨请求状态污染 {#cross-request-state-pollution}

在[状态管理](./state-management#simple-state-management-with-reactivity-api)一章里，我们介绍了用响应式 API 做简单 store 的模式。在 SSR 里，这种模式需要调整。

该模式在 JavaScript 模块根作用域声明共享状态，属于**单例**：整个应用生命周期只有一个响应式对象。在纯客户端应用里，每次打开页面都会重新初始化模块，这没问题。

在 SSR 里，应用模块通常在服务器启动时只初始化一次，会在多个请求之间复用，单例状态也一样。若用某个用户的数据改了共享状态，可能泄露给下一个请求。这叫**跨请求状态污染**。

技术上可以在每个请求重新初始化所有模块，就像浏览器里那样，但初始化成本很高，会明显影响性能。

推荐做法：为每个请求创建全新的应用实例（含 router 和全局 store），用[应用级 provide](/guide/components/provide-inject#app-level-provide) 提供状态，在需要的组件里 inject，而不是在组件里直接 import 全局 store：

```js [app.js]
// (在服务端和客户端间共享)
import { createSSRApp } from 'vue'
import { createStore } from './store.js'

// 每次请求时调用
export function createApp() {
  const app = createSSRApp(/* ... */)
  // 对每个请求都创建新的 store 实例
  const store = createStore(/* ... */)
  // 提供应用级别的 store
  app.provide('store', store)
  // 也为激活过程暴露出 store
  return { app, store }
}
```

Pinia 等库在设计时已考虑 SSR。详见 [Pinia 的 SSR 指南](https://pinia.vuejs.org/zh/ssr/)。

### 激活不匹配 {#hydration-mismatch}

若预渲染 HTML 的 DOM 结构与客户端应用预期不一致，就会出现激活不匹配。常见原因：

1. **模板 HTML 不规范**，浏览器解析时自动纠正 DOM。例如 [`<div>` 不能放在 `<p>` 里](https://stackoverflow.com/questions/8397852/why-cant-the-p-tag-contain-a-div-tag-inside-it)：

   ```html
   <p><div>hi</div></p>
   ```

   服务端若输出上述 HTML，遇到 `<div>` 时浏览器会结束第一个 `<p>`，解析为：

   ```html
   <p></p>
   <div>hi</div>
   <p></p>
   ```

2. **数据含随机值**。同一应用会在服务端和客户端各执行一次，随机数可能不同。解决办法：

   1. 用 `v-if` + `onMounted`，让含随机数的部分只在客户端渲染。上层框架可能提供简化 API，如 VitePress 的 `<ClientOnly>`。

   2. 使用可设种子的随机数库，并保证服务端和客户端用同一种子（例如把种子放进序列化状态，客户端再读取）。

3. **时区不一致**。把 UTC 时间转“用户本地时间”时，服务端时区可能与用户不同，也无法在服务端可靠知道用户时区。这类转换应放在纯客户端逻辑里执行。

遇到激活不匹配时，Vue 会尝试自动修复 DOM 以匹配客户端状态，可能损失一些性能（丢弃不匹配节点并重新渲染），但多数情况下应用仍能工作。最好在开发阶段就避免不匹配。

#### 消除激活不匹配 <sup class="vt-badge" data-text="3.5+" /> {#suppressing-hydration-mismatches}

Vue 3.5+ 可用 [`data-allow-mismatch`](/api/ssr#data-allow-mismatch) 有选择地消除无法避免的激活不匹配警告。

### 自定义指令 {#custom-directives}

多数自定义指令会直接操作 DOM，SSR 时会忽略。若你想控制 SSR 时指令如何渲染（给元素加哪些 attribute），可用 `getSSRProps` 钩子：

```js
const myDirective = {
  mounted(el, binding) {
    // 客户端实现：
    // 直接更新 DOM
    el.id = binding.value
  },
  getSSRProps(binding) {
    // 服务端实现：
    // 返回需要渲染的 prop
    // getSSRProps 只接收一个 binding 参数
    return {
      id: binding.value
    }
  }
}
```

### Teleports {#teleports}

SSR 时 Teleport 需要特殊处理。若应用包含 Teleport，传送内容不会出现在主应用渲染的 HTML 字符串里。多数情况下，更推荐在客户端挂载时条件渲染 Teleport。

若需要激活 Teleport 内容，可在服务端渲染上下文的 `teleports` 属性里读取：

```js
const ctx = {}
const html = await renderToString(app, ctx)

console.log(ctx.teleports) // { '#teleported': 'teleported content' }
```

与主应用 HTML 一样，你需要自己把 Teleport 的 HTML 插入页面正确位置。

:::tip
避免在 SSR 时把 Teleport 目标设为 `body`——`<body>` 里通常已有其他服务端渲染内容，Teleport 难以确定激活起点。

推荐用独立容器，例如 `<div id="teleported"></div>`。
:::
