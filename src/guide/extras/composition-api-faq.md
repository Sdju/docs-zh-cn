---
outline: deep
---

# 组合式 API 常见问答 {#composition-api-faq}

:::tip
本 FAQ 假定你已有一些 Vue 经验，尤其是 Vue 2 选项式 API 的经验。
:::

## 什么是组合式 API？ {#what-is-composition-api}

<VueSchoolLink href="https://vueschool.io/lessons/introduction-to-the-vue-js-3-composition-api" title="免费的组合式 API 课程"/>

组合式 API (Composition API) 是一组 API，让你用函数而不是选项来组织 Vue 组件代码。它是总称，包括：

- [响应式 API](/api/reactivity-core)：如 `ref()`、`reactive()`，直接创建响应式状态、计算属性和侦听器。

- [生命周期钩子](/api/composition-api-lifecycle)：如 `onMounted()`、`onUnmounted()`，在组件各生命周期阶段加逻辑。

- [依赖注入](/api/composition-api-dependency-injection)：如 `provide()`、`inject()`，在组合式 API 里使用 Vue 的依赖注入。

组合式 API 是 Vue 3 和 [Vue 2.7](https://blog.vuejs.org/posts/vue-2-7-naruto.html) 的内置能力。更老的 Vue 2 可用官方插件 [`@vue/composition-api`](https://github.com/vuejs/composition-api)。在 Vue 3 里，组合式 API 通常配合单文件组件的 [`<script setup>`](/api/sfc-script-setup.html) 使用。示例：

```vue
<script setup>
import { ref, onMounted } from 'vue'

// 响应式状态
const count = ref(0)

// 更改状态、触发更新的函数
function increment() {
  count.value++
}

// 生命周期钩子
onMounted(() => {
  console.log(`The initial count is ${count.value}.`)
})
</script>

<template>
  <button @click="increment">Count is: {{ count }}</button>
</template>
```

这套 API 风格基于函数组合，但**组合式 API 不是函数式编程**。它建立在 Vue 可变、细粒度响应式系统上；函数式编程通常强调数据不可变。

若你想用组合式 API 学 Vue，可在左侧边栏上方把 API 偏好切到组合式 API，从头阅读指引。

## 为什么要有组合式 API？ {#why-composition-api}

### 更好的逻辑复用 {#better-logic-reuse}

组合式 API 最核心的优势，是通过[组合函数](/guide/reusability/composables) 更简洁地复用逻辑。选项式 API 主要靠 mixins，组合式 API 解决了 [mixins 的常见问题](/guide/reusability/composables#vs-mixins)。

组合式 API 催生了 [VueUse](https://vueuse.org/) 等社区项目——不断增长的工具型组合式函数集合。它也为第三方状态库与 Vue 响应式系统的集成提供了清晰机制，例如[不可变数据](/guide/extras/reactivity-in-depth#immutable-data)、[状态机](/guide/extras/reactivity-in-depth#state-machines)和 [RxJS](/guide/extras/reactivity-in-depth#rxjs)。

### 更灵活的代码组织 {#more-flexible-code-organization}

很多人喜欢选项式 API，是因为默认就能把代码分门别类放进对应选项。但当单个组件逻辑变复杂时，选项式 API 会遇到明显限制，尤其在要处理多个**逻辑关注点**的组件里——这在 Vue 2 实战里很常见。

以 Vue CLI GUI 的文件浏览器组件为例，它要处理：

- 追踪当前文件夹状态并展示内容
- 文件夹操作（打开、关闭、刷新）
- 创建新文件夹
- 只显示收藏文件夹
- 显示隐藏文件夹
- 处理工作目录变更

[最初版本](https://github.com/vuejs/vue-cli/blob/a09407dd5b9f18ace7501ddb603b95e31d6d93c0/packages/@vue/cli-ui/src/components/folder/FolderExplorer.vue#L198-L404) 用选项式 API 写成。若按逻辑关注点上色，大致是：

<img alt="folder component before" src="https://user-images.githubusercontent.com/499550/62783021-7ce24400-ba89-11e9-9dd3-36f4f6b1fae2.png" width="129" height="500" style="margin: 1.2em auto">

同一逻辑被拆到不同选项、文件不同位置。几百行的大组件里，要理解一个关注点得上下反复滚动。[用组合式 API 重构](https://github.com/vuejs-translations/docs-zh-cn/blob/main/assets/FileExplorer.vue) 后：

![重构后的文件夹组件](https://user-images.githubusercontent.com/499550/62783026-810e6180-ba89-11e9-8774-e7771c8095d6.png)

同一逻辑的代码归在一起，不必在选项块之间来回跳。也更容易整组抽到外部文件，不必为抽象而大幅重组，长期维护大项目时很重要。

### 更好的类型推导 {#better-type-inference}

越来越多开发者用 [TypeScript](https://www.typescriptlang.org/) 写更稳的代码，IDE 支持也好。但选项式 API 设计于 2013 年，当时没考虑类型推导，我们不得不做[复杂的类型体操](https://github.com/vuejs/core/blob/44b95276f5c086e1d88fa3c686a5f39eb5bb7821/packages/runtime-core/src/componentPublicInstance.ts#L132-L165) 才能推导选项式 API，对 mixins 和依赖注入类型仍不理想。

所以很多想用 TS 的 Vue 开发者用了 `vue-class-component` 的 Class API。但 Class API 很依赖 ES 装饰器；2019 年开发 Vue 3 时装饰器还只是 stage 2。在不稳定提案上设计核心 API 风险太大，我们没有继续走 Class API。之后装饰器提案又变过，2022 年才到 stage 3。另外 Class API 在逻辑复用和代码组织上和选项式 API 有同样限制。

组合式 API 主要用普通变量和函数，本身对类型友好。重写的代码能享受完整类型推导，少写类型标注。多数时候 TS 写的组合式 API 和 JS 写法差不多，纯 JS 用户也能在 IDE 里获得部分推导。

### 更小的生产包体积 {#smaller-production-bundle-and-less-overhead}

配合 `<script setup>` 时，组合式 API 比同等选项式 API 更高效，也更利于压缩。`<script setup>` 的模板会编译成与脚本同作用域的内联函数；不像选项式 API 要通过 `this` 访问属性，编译后的模板可直接访问 `<script setup>` 里的变量，无需实例代理。本地变量名可压缩，对象属性名不能。

## 与选项式 API 的关系 {#relationship-with-options-api}

### 取舍 {#trade-offs}

有些从选项式 API 迁过来的用户觉得组合式 API 代码「更乱」，得出组合式 API 组织性更差的结论。我们建议换个角度想。

组合式 API 不会像选项式 API 那样告诉你代码该放哪，但反过来，你可以像写普通 JavaScript 一样写组件——**应该，也能够在写组合式 API 时运用 JS 代码组织的最佳实践**。能写好有组织的 JS，就能写好有组织的组合式 API。

选项式 API 让你写组件时「少动脑」，很多人因此喜欢它。但少动脑也意味着被固定组织模式锁住，大项目里难重构、难提质量。组合式 API 长期可维护性更好。

### 组合式 API 是否覆盖了所有场景？ {#does-composition-api-cover-all-use-cases}

组合式 API 能覆盖所有状态逻辑需求。除此之外只需少量选项：`props`、`emits`、`name` 和 `inheritAttrs`。

:::tip

从 3.3 起可在 `<script setup>` 里用 `defineOptions` 设置组件名或 `inheritAttrs`。

:::

若只用组合式 API（及上述必需选项），可通过[编译时标记](/api/compile-time-flags) 去掉运行时里选项式 API 的支持代码，生产包大约能小几 kb。注意这也会影响依赖里的 Vue 组件。

### 可以在同一个组件中使用两种 API 吗？ {#can-i-use-both-apis-in-the-same-component}

可以。在选项式 API 组件里可通过 [`setup()`](/api/composition-api-setup) 使用组合式 API。

但我们只建议在：已经长期用选项式 API，又要和组合式 API 新代码或第三方库整合的项目里这样做。

### 选项式 API 会被废弃吗？ {#will-options-api-be-deprecated}

不会，没有这类计划。选项式 API 是 Vue 的一部分，很多开发者也喜欢。组合式 API 更适合大型项目；中小型项目选项式 API 仍是好选择。

## 与 Class API 的关系 {#relationship-with-class-api}

Vue 3 不再推荐 Class API。组合式 API 的 TypeScript 集成更好，还有逻辑复用和代码组织上的优势。

## 和 React Hooks 的对比 {#comparison-with-react-hooks}

组合式 API 和 React Hooks 在逻辑组织上同级，但有重要区别。

React Hooks 在组件每次更新时都会重新调用，连老手有时也会困惑，还有性能和体验问题，例如：

- Hooks 调用顺序严格，不能写在条件分支里。

- 组件里定义的变量会被钩子闭包捕获；依赖数组传错会「过期」。React 开发者很依赖 ESLint 规则保证依赖正确，但规则不够智能，维护成本高，边缘情况还会误报。

- 昂贵计算要用 `useMemo`，也要传对依赖数组。

- 默认传给子组件的事件处理会导致子组件不必要更新，常要显式 `useCallback`，同样依赖数组，几乎总要写，漏了容易过度渲染。

- 闭包变量问题加上并发特性，很难判断钩子何时运行；要在多次渲染间保持引用的可变状态（`useRef`）也不好处理。

> 注意：部分与记忆化相关的问题可能由即将推出的 [React Compiler](https://react.dev/learn/react-compiler) 缓解。

相比之下，Vue 组合式 API：

- `setup()` 或 `<script setup>` 的代码只执行一次，更符合日常 JS 直觉，不必担心闭包变量；调用顺序也不受限，可条件调用。

- Vue 响应式系统在运行时自动收集计算属性和侦听器的依赖，不必手动声明。

- 不必手动缓存回调来避免子组件多余更新。细粒度响应式让组件在绝大多数情况下只更新必要的部分，Vue 开发者很少要手动优化子组件更新。

我们承认 React Hooks 有创意，是组合式 API 的重要灵感；但它的设计也有上述问题，Vue 的响应式模型恰好能缓解这些点。
