---
outline: deep
---

# 性能优化 {#performance}

## 概述 {#overview}

Vue 在多数场景下性能已经不错，一般不用刻意优化。少数复杂场景才需要针对性调整。本节讲用 Vue 做应用时，性能上该注意什么。

Web 应用性能主要看两方面：

- **页面加载**：首次打开时，多快能看到内容、能操作。常用 Google 的 [Web 指标](https://web.dev/vitals/#core-web-vitals)衡量，如 [LCP](https://web.dev/lcp/)（最大内容绘制）和 [INP](https://web.dev/articles/inp)（交互到下次绘制）。

- **更新性能**：用户操作后界面多快更新。例如搜索框输入时列表刷新速度，或 SPA 切页速度。

理想是两者都好，但架构不同，侧重点也不同。应用类型也决定你先优化哪一块。第一步是先选对架构：

- 见[使用 Vue 的多种方式](/guide/extras/ways-of-using-vue)，了解不同架构。

- Jason Miller 的 [Application Holotypes](https://jasonformat.com/application-holotypes/) 讨论了各类 Web 应用适合的实现与交付方式。

## 分析选项 {#profiling-options}

要优化性能，先会测量。常用工具：

用于生产部署的负载性能分析：

- [PageSpeed Insights](https://pagespeed.web.dev/)
- [WebPageTest](https://www.webpagetest.org/)

用于本地开发期间的性能分析：

- [Chrome 开发者工具「性能」面板](https://developer.chrome.com/docs/devtools/evaluate-performance/)
  - [`app.config.performance`](/api/application#app-config-performance) 会开启 Vue 性能标记，显示在时间线上。
- [Vue 开发者工具](/guide/scaling-up/tooling#browser-devtools)也支持性能分析。

## 页面加载优化 {#page-load-optimizations}

页面加载优化很多与框架无关，[web.dev 指南](https://web.dev/fast/)有全面总结。这里主要讲和 Vue 相关的。

### 选用正确的架构 {#choosing-the-right-architecture}

若首屏速度很重要，尽量不要做成纯客户端 SPA，而让服务器直接返回用户要看的 HTML。纯 CSR 首屏往往慢，可用 [SSR](/guide/extras/ways-of-using-vue#fullstack-ssr) 或 [SSG](/guide/extras/ways-of-using-vue#jamstack-ssg) 改善。见 [SSR 指南](/guide/scaling-up/ssr)。交互要求不高时，也可由后端渲染 HTML，前端再用 Vue 增强。

主应用必须是 SPA，但还有落地页、关于页、博客等营销页时，请单独部署。营销页最好用 JS 很少的静态 HTML，走 SSG。

### 包体积与 Tree-shaking 优化 {#bundle-size-and-tree-shaking}

加快首屏，很有效的一招是减小 JS 包体积。用 Vue 时可以这样做：

- 尽可能地采用构建步骤

  - 现代打包工具支持 [tree-shake](https://developer.mozilla.org/en-US/docs/Glossary/Tree_shaking)。没用到的 Vue API（例如 `<Transition>`）不会进最终包。未使用的源码模块也会被去掉。

  - 有构建步骤时，模板会预编译，浏览器不必再加载 Vue 编译器。压缩并 gzip 后大约能少 **14kb**，也省掉运行时编译。

- 加新依赖时注意体积，常见原因是引入了过重的库。

  - 有构建步骤时，优先选 ES 模块版依赖，便于 tree-shake。例如用 `lodash-es` 而不是 `lodash`。

  - 看依赖体积是否值得。支持 tree-shake 的库，实际增加多少取决于你 import 了哪些 API。可用 [bundlejs.com](https://bundlejs.com/) 粗查，但以真实构建结果为准。

- 只做渐进增强、不想上构建时，可考虑 [petite-vue](https://github.com/vuejs/petite-vue)（约 **6kb**）。

### 代码分割 {#code-splitting}

代码分割是把打包后的 JS 拆成多个小文件，按需或并行加载。首屏只下必要代码，其余用时再下，能提升性能。

Rollup（Vite 基于它）或 webpack 会识别 ESM 动态 `import` 并自动分割：

```js
// lazy.js 及其依赖会被拆分到一个单独的文件中
// 并只在 `loadLazy()` 调用时才加载
function loadLazy() {
  return import('./lazy.js')
}
```

懒加载对首屏帮助很大，先跳过暂时用不到的功能。在 Vue 里可配合[异步组件](/guide/components/async)拆出独立代码块：

```js
import { defineAsyncComponent } from 'vue'

// 会为 Foo.vue 及其依赖创建单独的一个块
// 它只会按需加载
// (即该异步组件在页面中被渲染时)
const Foo = defineAsyncComponent(() => import('./Foo.vue'))
```

用 Vue Router 时，建议路由组件也用异步组件。Router 自带懒加载（不必一定用 `defineAsyncComponent`）。见[懒加载路由](https://router.vuejs.org/zh/guide/advanced/lazy-loading.html)。

## 更新优化 {#update-optimizations}

### Props 稳定性 {#props-stability}

在 Vue 里，子组件至少有一个 prop 变了才会更新。例如：

```vue-html
<ListItem
  v-for="item in list"
  :id="item.id"
  :active-id="activeId" />
```

`<ListItem>` 用 `id` 和 `activeId` 判断是否选中。可行，但 `activeId` 一变，列表里**每一项**都会更新。

更好的是只有选中项变化时才更新：在父组件里算好是否选中，只传 `active` prop：

```vue-html
<ListItem
  v-for="item in list"
  :id="item.id"
  :active="item.id === activeId" />
```

这样 `activeId` 变时，多数项的 `active` 不变，就不会无谓更新。要点：尽量让传给子组件的 props 保持稳定。

### `v-once` {#v-once}

`v-once` 是内置指令，适合渲染一次、之后不必再变的子树。详见 [API](/api/built-in-directives#v-once)。

### `v-memo` {#v-memo}

`v-memo` 可有条件地跳过大型子树或 `v-for` 列表的更新。详见 [API](/api/built-in-directives#v-memo)。

### 计算属性稳定性 {#computed-stability}

Vue 3.4+ 中，计算属性只有结果真的变了才会触发依赖它的副作用。例如下面 `isEven`，只有 `true`/`false` 切换时才会触发 `watchEffect`：

```js
const count = ref(0)
const isEven = computed(() => count.value % 2 === 0)

watchEffect(() => console.log(isEven.value)) // true

// 这将不会触发新的输出，因为计算属性的值依然为 `true`
count.value = 2
count.value = 4
```

这能减少多余更新。但若每次计算都返回新对象，就不起作用：

```js
const computedObj = computed(() => {
  return {
    isEven: count.value % 2 === 0
  }
})
```

每次是新对象，引用总不同，Vue 会认为变了，除非做深度比较（成本高）。可以手动比较，没变化就返回旧对象：

```js
const computedObj = computed((oldValue) => {
  const newValue = {
    isEven: count.value % 2 === 0
  }
  if (oldValue && oldValue.isEven === newValue.isEven) {
    return oldValue
  }
  return newValue
})
```

[演练场示例](https://play.vuejs.org/#eNqVVMtu2zAQ/JUFgSZK4UpuczMkow/40AJ9IC3aQ9mDIlG2EokUyKVt1PC/d0lKtoEminMQQC1nZ4c7S+7Yu66L11awGUtNoesOwQi03ZzLuu2URtiBFtUECtV2FkU5gU2OxWpRVaJA2EOlVQuXxHDJJZeFkgYJayVC5hKj6dUxLnzSjZXmV40rZfFrh3Vb/82xVrLH//5DCQNNKPkweNiNVFP+zBsrIJvDjksgGrRahjVAbRZrIWdBVLz2yBfwBrIsg6mD7LncPyryfIVnywupUmz68HOEEqqCI+XFBQzrOKR79MDdx66GCn1jhpQDZx8f0oZ+nBgdRVcH/aMuBt1xZ80qGvGvh/X6nlXwnGpPl6qsLLxTtitzFFTNl0oSN/79AKOCHHQuS5pw4XorbXsr9ImHZN7nHFdx1SilI78MeOJ7Ca+nbvgd+GgomQOv6CNjSQqXaRJuHd03+kHRdg3JoT+A3a7XsfcmpbcWkQS/LZq6uM84C8o5m4fFuOg0CemeOXXX2w2E6ylsgj2gTgeYio/f1l5UEqj+Z3yC7lGuNDlpApswNNTrql7Gd0ZJeqW8TZw5t+tGaMdDXnA2G4acs7xp1OaTj6G2YjLEi5Uo7h+I35mti3H2TQsj9Jp6etjDXC8Fhu3F9y9iS+vDZqtK2xB6ZPNGGNVYpzHA3ltZkuwTnFf70b+1tVz+MIstCmmGQzmh/p56PGf00H4YOfpR7nV8PTxubP8P2GAP9Q==)

注意：比较和返回旧值之前，仍要完整算一遍，保证依赖收集正确。

## 通用优化 {#general-optimizations}

> 以下技巧能同时改善页面加载和更新性能。

### 大型虚拟列表 {#virtualize-large-lists}

大列表渲染是最常见的性能瓶颈。框架再快，成千上万 DOM 节点也会慢。

不必一次渲染全部。屏幕上通常只看得见一小段。用**虚拟列表**只渲染视口内的项，能明显提升性能。

虚拟列表实现较复杂，可直接用社区库：

- [vue-virtual-scroller](https://github.com/Akryum/vue-virtual-scroller)
- [vue-virtual-scroll-grid](https://github.com/rocwang/vue-virtual-scroll-grid)
- [vueuc/VVirtualList](https://github.com/07akioni/vueuc)

### 减少大型不可变数据的响应性开销 {#reduce-reactivity-overhead-for-large-immutable-structures}

Vue 默认深度响应，写起来直观，但数据特别大时，每次访问深层属性都要走代理，开销不小。通常要一次访问 10 万+ 属性才明显，属于少数场景。

可用 [`shallowRef()`](/api/reactivity-advanced#shallowref) 和 [`shallowReactive()`](/api/reactivity-advanced#shallowreactive) 只做浅层响应：深层对象不再被代理，读深层更快，但深层要当不可变，只能替换根状态来触发更新：

```js
const shallowArray = shallowRef([
  /* 巨大的列表，里面包含深层的对象 */
])

// 这不会触发更新...
shallowArray.value.push(newObject)
// 这才会触发更新
shallowArray.value = [...shallowArray.value, newObject]

// 这不会触发更新...
shallowArray.value[0].foo = 1
// 这才会触发更新
shallowArray.value = [
  {
    ...shallowArray.value[0],
    foo: 1
  },
  ...shallowArray.value.slice(1)
]
```

### 避免不必要的组件抽象 {#avoid-unnecessary-component-abstractions}

有时会用[无渲染组件](/guide/components/slots#renderless-components)或高阶组件做抽象，这没问题，但组件实例比 DOM 节点贵，抽象过多会拖慢性能。

少删几个实例通常看不出差别；若抽象组件只渲染几次，不必纠结。最值得优化的是大列表：100 项、每项很多子组件时，去掉一层多余抽象，可能少几百个实例。
