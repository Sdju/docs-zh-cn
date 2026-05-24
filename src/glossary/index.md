# 术语表 {#glossary}

这份术语表帮你理解讨论 Vue 时常见的技术词。它意在*说明*这些词通常怎么用，而不是*规定*你必须怎么用。在不同情况下，同一个词的含义可能略有不同。

[[TOC]]

## 异步组件 (async component) {#async-component}

*异步组件*是包住另一个组件的「外壳」，让里面的组件可以懒加载。常见做法是把构建后的 `.js` 拆成小文件，需要时再加载，从而减小体积。

Vue Router 也有[路由懒加载](https://router.vuejs.org/zh/guide/advanced/lazy-loading.html)，但这不是用 Vue 异步组件实现的。

详见：
- [指南 - 异步组件](/guide/components/async.html)

## 编译器宏 (compiler macro) {#compiler-macro}

*编译器宏*是一种特殊代码，由编译器处理并转成别的东西。可以把它想成更巧妙的「查找替换」。

Vue 的[单文件组件](#single-file-component)编译器支持多种宏，例如 `defineProps()`、`defineEmits()` 和 `defineExpose()`。它们看起来像普通 JavaScript 函数，这样可以用同样的解析器和类型推断工具。但它们不是在浏览器里运行的真函数。编译器会识别这些特殊字符串，并替换成实际运行的 JavaScript。

宏有一些普通 JavaScript 没有的规则。例如，`const dp = defineProps` 不会给 `defineProps` 起别名，反而会报错。传给 `defineProps()` 的值也有限制，因为「参数」要由编译器处理，而不是在运行时处理。

详见：
- [`<script setup>` - `defineProps()` & `defineEmits()`](/api/sfc-script-setup.html#defineprops-defineemits)
- [`<script setup>` - `defineExpose()`](/api/sfc-script-setup.html#defineexpose)

## 组件 (component) {#component}

*组件*不是 Vue 独有的词。很多 UI 框架都有这个概念。它指 UI 的一小块，比如按钮或复选框。多个组件还可以组成更大的组件。

在 Vue 里，组件是把 UI 拆成小片段的主要方式。这样更好维护，也方便复用代码。

Vue 组件是一个对象。所有属性都是可选的，但必须有模板或渲染函数之一，才能渲染组件。例如，下面这个对象就是一个有效组件：

```js
const HelloWorldComponent = {
  render() {
    return 'Hello world!'
  }
}
```

实践中，大多数 Vue 应用用[单文件组件](#single-file-component)（`.vue` 文件）写。它们看起来不像对象，但单文件组件编译器会转成作为默认导出的一个对象。从外部看，`.vue` 文件只是导出组件对象的 ES 模块。

组件对象的属性通常叫*选项*。这就是[选项式 API](#options-api) 名字的由来。

选项定义如何创建组件实例。概念上，组件有点像类，但 Vue 不用真正的 JavaScript 类来定义它们。

「组件」也可以泛指组件实例。

详见：
- [指南 - 组件基础](/guide/essentials/component-basics.html)

「组件」还出现在这些术语里：
- [异步组件](#async-component)
- [动态组件](#dynamic-component)
- [函数式组件](#functional-component)
- [Web Component](#web-component)

## 组合式函数 (composable) {#composable}

*组合式函数*描述 Vue 里的一种常见写法。它不是 Vue 的单独功能，而是用[组合式 API](#composition-api) 的一种方式。

* 组合式函数就是一个函数。
* 它用来封装和复用有状态的逻辑。
* 函数名通常以 `use` 开头，方便别人认出它是组合式函数。
* 通常在组件的 `setup()`（或等价的 `<script setup>` 块）同步执行期间调用。这样会把组合式函数和当前组件的上下文绑在一起，例如可以调用 `provide()`、`inject()` 或 `onMounted()`。
* 组合式函数一般返回普通对象，而不是响应式对象。对象里常有 `ref` 和函数，调用方通常会解构使用。

和许多模式一样，某段代码算不算组合式函数，有时会有争议。不是所有 JavaScript 工具函数都是组合式函数。如果没用组合式 API，可能就不是。如果不要求在 `setup()` 同步执行期间调用，也可能不是。组合式函数专门封装有状态逻辑，不只是命名习惯。

更多写法细节见[指南 - 组合式函数](/guide/reusability/composables.html)。

## 组合式 API (Composition API) {#composition-api}

*组合式 API* 是 Vue 里一组用来写组件和组合式函数的 API。

这个词也指写组件的两种主要风格之一，另一种是[选项式 API](#options-api)。用组合式 API 写的组件会用 `<script setup>` 或显式的 `setup()`。

更多细节见[组合式 API 常见问答](/guide/extras/composition-api-faq)。

## 自定义元素 (custom element) {#custom-element}

*自定义元素*是浏览器里 [Web Components](#web-component) 标准的一部分。它指在 HTML 里写自定义标签，在页面该位置插入 Web Component。

Vue 内置支持渲染自定义元素，可以直接在 Vue 组件模板里用。

不要把自定义元素和「在 Vue 模板里放另一个 Vue 组件」混为一谈。自定义元素用来建 Web Components，不是 Vue 组件。

详见：
- [Vue 与 Web Components](/guide/extras/web-components.html)

## 指令 (directive) {#directive}

*指令*指以 `v-` 开头的模板属性，或它们的简写形式。

内置指令包括 `v-if`、`v-for`、`v-bind`、`v-on` 和 `v-slot`。

Vue 也支持自定义指令，但通常只用来直接操作 DOM，作为「逃生舱」。自定义指令一般不能重做内置指令的功能。

详见：
- [指南 - 模板语法 - 指令](/guide/essentials/template-syntax.html#directives)
- [指南 - 自定义指令](/guide/reusability/custom-directives.html)

## 动态组件 (dynamic component) {#dynamic-component}

*动态组件*指需要动态选择要渲染哪个子组件的情况。通常用 `<component :is="type">` 实现。

动态组件不是一种特殊类型的组件。任何组件都可以当动态组件用。「动态」指的是选哪个组件，不是组件本身特殊。

详见：
- [指南 - 组件基础 - 动态组件](/guide/essentials/component-basics.html#dynamic-components)

## 作用 (effect) {#effect}

见[响应式作用](#reactive-effect)和[副作用](#side-effect)。

## 事件 (event) {#event}

用事件在不同代码部分之间通信，在很多编程领域都很常见。在 Vue 里，这个词常指原生 HTML 元素事件和 Vue 组件事件。模板里用 `v-on` 监听这两种事件。

详见：
- [指南 - 事件处理](/guide/essentials/event-handling.html)
- [指南 - 组件事件](/guide/components/events.html)

## 片段 (fragment) {#fragment}

*片段*是一种特殊的 [VNode](#vnode)，作为其他 VNode 的父节点，但自己不会渲染任何元素。

名字来自类似概念：原生 DOM API 里的 [`DocumentFragment`](https://developer.mozilla.org/zh-CN/docs/Web/API/DocumentFragment)。

片段用来支持有多个根节点的组件。表面上组件有多个根，背后仍有一个片段根节点，作为这些「根」的父节点。

片段也用来在模板编译器里包住多个动态节点，例如 `v-for` 或 `v-if` 生成的节点。这样能给 [VDOM](#virtual-dom) 补丁算法额外提示。这些多在内部处理，但你可能遇到的一种情况是在 `<template>` 上对 `v-for` 使用 `key`。此时 `key` 会作为 [prop](#prop) 加到片段的 VNode 上。

片段节点目前在 DOM 里渲染成空文本节点，这只是实现细节。用 `$el` 或浏览器 API 遍历 DOM 时，可能会意外看到这些文本节点。

## 函数式组件 (functional component) {#functional-component}

组件定义通常是一个包含选项的对象。用 `<script setup>` 时看起来不像对象，但从 `.vue` 导出的仍是对象。

*函数式组件*是另一种形式，用函数声明，函数充当组件的[渲染函数](#render-function)。

函数式组件不能有自己的状态，也不会走通常的组件生命周期，因此不能用生命周期钩子。所以它比有状态组件稍轻一些。

详见：
- [指南 - 渲染函数 & JSX - 函数式组件](/guide/extras/render-function.html#functional-components)

## 变量提升 (hoisting) {#hoisting}

*变量提升*指某段代码在「到达」它之前就执行，执行被提前了。

JavaScript 会对某些结构做提升，例如 `var`、`import` 和函数声明。

在 Vue 里，模板编译器用*变量提升*来提高性能。把模板转成渲染函数时，一些静态内容会被提升到组件作用域之外。这些内容叫「被提升的」，因为在组件创建之前、在外面就创建好了。

## 缓存静态内容 (cache-static) {#cache-static}

*缓存*指把经常访问的数据临时存起来，以提高性能。

Vue 模板编译器会识别静态 VNode，首次渲染时缓存，之后在重新渲染时复用。

详见：
- [指南 - 渲染机制 - 缓存静态内容](/guide/extras/rendering-mechanism.html#cache-static)

## DOM 内模板 (in-DOM template) {#in-dom-template}

指定组件模板的方式很多。多数情况下，模板是字符串。

*DOM 内模板*指用 DOM 节点而不是字符串提供模板。Vue 会通过 `innerHTML` 把 DOM 节点转成模板字符串。

通常，内联 DOM 模板是直接写在页面 HTML 里的标记。浏览器先解析成 DOM 节点，Vue 再读这些节点的 `innerHTML`。

详见：
- [指南 - 创建一个应用 - DOM 中的根组件模板](/guide/essentials/application.html#in-dom-root-component-template)
- [指南 - 组件基础 - DOM 内模板解析注意事项](/guide/essentials/component-basics.html#in-dom-template-parsing-caveats)
- [渲染选项 - template](/api/options-rendering.html#template)

## 注入 (inject) {#inject}

见[提供 / 注入](#provide-inject)。

## 生命周期钩子 (lifecycle hooks) {#lifecycle-hooks}

Vue 组件实例会经历生命周期，例如创建、挂载、更新和卸载。

*生命周期钩子*用来监听这些生命周期事件。

选项式 API 里，每个钩子是一个单独选项，例如 `mounted`。组合式 API 用函数，例如 `onMounted()`。

详见：
- [指南 - 生命周期钩子](/guide/essentials/lifecycle.html)

## 宏 (macro) {#macro}

见[编译器宏](#compiler-macro)。

## 具名插槽 (named slot) {#named-slot}

组件可以有多个按名称区分的插槽。默认插槽以外的都叫*具名插槽*。

详见：
- [指南 - 插槽 - 具名插槽](/guide/components/slots.html#named-slots)

## 选项式 API (Options API) {#options-api}

Vue 组件用对象定义，对象上的属性叫*选项*。

写组件有两种风格。一种把[组合式 API](#composition-api) 和 `setup`（通过 `setup()` 选项或 `<script setup>`）一起用。另一种几乎不用组合式 API，而用各种组件选项达到类似效果。这样用的选项叫*选项式 API*。

选项式 API 包括 `data()`、`computed`、`methods` 和 `created()` 等。

有些选项，例如 `props`、`emits` 和 `inheritAttrs`，两种风格都能用。因为它们是组件选项，可以算选项式 API 的一部分。但它们也常和 `setup()` 一起用，所以更适合看成两种风格共享的选项。

`setup()` 本身也是组件选项，所以*可以*算选项式 API 的一部分。但日常说「选项式 API」时，通常不把 `setup()` 算进去，而把它算组合式 API。

## 插件 (plugin) {#plugin}

*插件*在不同上下文里意思不同。在 Vue 里，它有特定含义：向应用添加功能的一种方式。

调用 `app.use(plugin)` 可以把插件加到应用里。插件可以是函数，也可以是带 `install` 函数的对象。会传入应用实例，然后做需要的事。

详见：
- [指南 - 插件](/guide/reusability/plugins.html)

## Prop {#prop}

*Prop* 在 Vue 里有三种常见用法：

* 组件 prop
* VNode prop
* 插槽 prop

多数时候，prop 指*组件 prop*。组件通过 `defineProps()` 或 `props` 选项显式定义。

*VNode prop* 指传给 `h()` 第二个参数的对象上的属性。可以包括组件 prop、组件事件、DOM 事件、DOM attribute 和 DOM property。通常只在用渲染函数直接操作 VNode 时会用到。

*插槽 prop* 是传给作用域插槽的属性。

总之，prop 都是从别处传过来的属性。

虽然 prop 来自 *properties*，但在 Vue 里有更具体的含义。不要把它当成 properties 的缩写乱用。

详见：
- [指南 - Props](/guide/components/props.html)
- [指南 - 渲染函数 & JSX](/guide/extras/render-function.html)
- [指南 - 插槽 - 作用域插槽](/guide/components/slots.html#scoped-slots)

## 提供 / 注入 (provide / inject) {#provide-inject}

`provide` 和 `inject` 是一种组件间通信方式。

组件*提供*一个值后，所有后代组件都可以用 `inject` 取这个值。和 prop 不同，提供方不知道谁在接收。

`provide` 和 `inject` 有时用来避免 *prop 逐级透传*。它们也可以让组件和插槽内容隐式通信。

`provide` 也可以在应用级别使用，让该应用里所有组件都能拿到这个值。

详见：
- [指南 - 依赖注入](/guide/components/provide-inject.html)

## 响应式作用 (reactive effect) {#reactive-effect}

*响应式作用*是 Vue 响应性系统的一部分。它指跟踪函数的依赖，并在依赖的值变化时重新运行该函数。

`watchEffect()` 是最直接的创建方式。Vue 内部其他地方也会用，例如组件渲染更新、`computed()` 和 `watch()`。

Vue 只在响应式作用内部跟踪响应式依赖。在作用外读属性值会「丢失」响应性，因为 Vue 不知道值变了之后该做什么。

这个词来自「副作用」。调用作用函数，是属性值改变带来的副作用。

详见：
- [指南 - 深入响应式系统](/guide/extras/reactivity-in-depth.html)

## 响应性 (reactivity) {#reactivity}

一般来说，*响应性*指数据变化时自动执行操作，例如数据变了就更新 DOM，或发网络请求。

在 Vue 里，响应性指一组功能。它们组成*响应性系统*，通过[响应性 API](#reactivity-api) 暴露。

实现响应性系统的方式很多。例如可以用静态分析代码找依赖。但 Vue 没用这种方式。

Vue 的响应性系统在运行时跟踪属性的访问，通过 Proxy 包装器和 [getter](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Functions/get#description)/[setter](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Functions/set#description) 实现。

详见：
- [指南 - 响应式基础](/guide/essentials/reactivity-fundamentals.html)
- [指南 - 深入响应式系统](/guide/extras/reactivity-in-depth.html)

## 响应性 API (Reactivity API) {#reactivity-api}

*响应性 API* 是一组与[响应性](#reactivity)相关的核心 Vue 函数，可以脱离组件使用。包括 `ref()`、`reactive()`、`computed()`、`watch()` 和 `watchEffect()` 等。

响应性 API 是组合式 API 的子集。

详见：
- [响应性 API：核心](/api/reactivity-core.html)
- [响应性 API：工具](/api/reactivity-utilities.html)
- [响应性 API：进阶](/api/reactivity-advanced.html)

## ref {#ref}

> 本条讲响应性里的 `ref`。模板里的 `ref` attribute 见[模板 ref](#template-ref)。

`ref` 是 Vue 响应性系统的一部分。它是一个对象，有一个响应式属性，叫 `value`。

Ref 有多种类型，例如用 `ref()`、`shallowRef()`、`computed()` 和 `customRef()` 创建。`isRef()` 可判断是不是 ref，`isReadonly()` 可判断 ref 能不能直接重新赋值。

详见：
- [指南 - 响应式基础](/guide/essentials/reactivity-fundamentals.html)
- [响应性 API：核心](/api/reactivity-core.html)
- [响应性 API：工具](/api/reactivity-utilities.html)
- [响应性 API：进阶](/api/reactivity-advanced.html)

## 渲染函数 (render function) {#render-function}

*渲染函数*是组件的一部分，在渲染时生成 VNode。模板会编译成渲染函数。

详见：
- [指南 - 渲染函数 & JSX](/guide/extras/render-function.html)

## 调度器 (scheduler) {#scheduler}

*调度器*是 Vue 内部的一部分，控制[响应式作用](#reactive-effect)何时运行。

响应式状态变化时，Vue 不会马上触发渲染更新，而是用队列批处理。这样即使底层数据改了很多次，组件也只重新渲染一次。

[侦听器](/guide/essentials/watchers.html)也用调度器队列批处理。`flush: 'pre'`（默认）的侦听器在组件渲染前运行，`flush: 'post'` 的在渲染后运行。

调度器里的任务还用来执行其他内部工作，例如触发部分[生命周期钩子](#lifecycle-hooks)、更新[模板 ref](#template-ref)。

## 作用域插槽 (scoped slot) {#scoped-slot}

*作用域插槽*指接收 [prop](#prop) 的[插槽](#slot)。

过去，Vue 里作用域插槽和非作用域插槽差别很大，有点像模板语法背后统一的两个不同功能。

Vue 3 简化了插槽 API，让所有插槽都像作用域插槽。但使用场景仍常不同，所以仍用这个词特指带 prop 的插槽。

传给插槽的 prop 只能在父模板里定义该插槽内容的区域使用。这个区域像 prop 的变量作用域，所以叫「作用域插槽」。

详见：
- [指南 - 插槽 - 作用域插槽](/guide/components/slots.html#scoped-slots)

## SFC {#sfc}

见[单文件组件](#single-file-component)。

## 副作用 (side effect) {#side-effect}

*副作用*不是 Vue 专有的词。它指超出局部作用域的操作或函数。

例如写 `user.name = null` 时，我们预期 `user.name` 会变。如果还做了别的事，比如触发 Vue 响应性系统，就叫副作用。Vue 里[响应式 effect](#reactive-effect) 这个词就来自这里。

说函数有副作用，指它除了返回值，还做了函数外能观察到的事，比如改状态或发网络请求。

这个词常用来描述渲染或计算属性。最佳实践是：渲染不应有副作用，计算属性的 getter 也不应有副作用。

## 单文件组件 (Single-File Component) {#single-file-component}

*单文件组件*（SFC）指 Vue 组件常用的 `.vue` 文件格式。

参考：
- [指南 - 单文件组件](/guide/scaling-up/sfc.html)
- [单文件组件语法定义](/api/sfc-spec.html)

## 插槽 (slot) {#slot}

插槽用来向子组件传内容。prop 传数据，插槽传更丰富的内容，包括 HTML 元素和其他 Vue 组件。

详见：
- [指南 - 插槽](/guide/components/slots.html)

## 模板 ref (template ref) {#template-ref}

*模板 ref* 指在模板标签上使用 `ref` 属性。组件渲染后，会用对应 HTML 元素或组件实例填充这个属性。

用选项式 API 时，ref 通过 `$refs` 暴露。

用组合式 API 时，模板 ref 会填充同名[响应式 ref](#ref)。

不要把模板 ref 和响应性系统里的响应式 ref 混淆。

详见：
- [指南 - Template Refs](/guide/essentials/template-refs.html)

## VDOM {#vdom}

参考[虚拟 DOM](#virtual-dom)。

## 虚拟 DOM (virtual DOM) {#virtual-dom}

*虚拟 DOM*（VDOM）不是 Vue 独有的。很多 Web 框架用它来管理 UI 更新。

浏览器用节点树表示页面当前状态。这棵树以及操作它的 JavaScript API 叫*文档对象模型*，即 *DOM*。

更新 DOM 是主要的性能瓶颈之一。虚拟 DOM 提供了一种管理 DOM 的策略。

Vue 组件不直接创建 DOM 节点，而是生成想要的 DOM 节点的描述。这些描述是普通 JavaScript 对象，叫 VNode（虚拟 DOM 节点）。创建 VNode 成本相对较低。

组件每次重新渲染，会把新的 VNode 树和旧的比较，再把差异应用到真实 DOM。没变化就不改 DOM。

Vue 用混合方法，叫[带编译时信息的虚拟 DOM](/guide/extras/rendering-mechanism.html#compiler-informed-virtual-dom)。模板编译器能根据静态分析做性能优化。Vue 不会在运行时完整对比新旧 VNode 树，而是用编译器提取的信息，只对比可能变化的部分。

详见：
- [指南 - 渲染机制](/guide/extras/rendering-mechanism.html)
- [指南 - 渲染函数 & JSX](/guide/extras/render-function.html)

## VNode {#vnode}

*VNode* 即*虚拟 DOM 节点*，可用 [`h()`](/api/render-function.html#h) 创建。

详见[虚拟 DOM](#virtual-dom)。

## Web Component {#web-component}

*Web Component* 标准是浏览器里实现的一组功能。

Vue 组件不是 Web 组件，但可以用 `defineCustomElement()` 从 Vue 组件创建[自定义元素](#custom-element)。Vue 也支持在组件内部使用自定义元素。

详见：
- [指南 - Vue 和 Web Components](/guide/extras/web-components.html)
