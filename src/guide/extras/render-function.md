---
outline: deep
---

# 渲染函数 & JSX {#render-functions-jsx}

多数情况下 Vue 推荐用模板写应用。但有些场景需要 JavaScript 的全部表达能力，这时用**渲染函数**。

> 还不熟悉虚拟 DOM 和渲染函数？请先读[渲染机制](/guide/extras/rendering-mechanism)。

## 基本用法 {#basic-usage}

### 创建 Vnodes {#creating-vnodes}

Vue 提供了一个 `h()` 函数用于创建 vnodes：

```js
import { h } from 'vue'

const vnode = h(
  'div', // type
  { id: 'foo', class: 'bar' }, // props
  [
    /* children */
  ]
)
```

`h()` 即 **hyperscript**（能生成 HTML 的 JavaScript）的缩写，来自很多虚拟 DOM 实现的惯例。更准确的名字也许是 `createVNode()`，但写渲染函数时短名字更省事。

`h()` 用法很灵活：

```js
// 除了类型必填以外，其他的参数都是可选的
h('div')
h('div', { id: 'foo' })

// attribute 和 property 都能在 prop 中书写
// Vue 会自动将它们分配到正确的位置
h('div', { class: 'bar', innerHTML: 'hello' })

// 像 `.prop` 和 `.attr` 这样的属性修饰符
// 可以分别通过 `.` 和 `^` 前缀来添加
h('div', { '.name': 'some-name', '^width': '100' })

// 类与样式可以像在模板中一样
// 用数组或对象的形式书写
h('div', { class: [foo, { bar }], style: { color: 'red' } })

// 事件监听器应以 onXxx 的形式书写
h('div', { onClick: () => {} })

// children 可以是一个字符串
h('div', { id: 'foo' }, 'hello')

// 没有 props 时可以省略不写
h('div', 'hello')
h('div', [h('span', 'hello')])

// children 数组可以同时包含 vnodes 与字符串
h('div', ['hello', h('span', 'hello')])
```

得到的 vnode 为如下形式：

```js
const vnode = h('div', { id: 'foo' }, [])

vnode.type // 'div'
vnode.props // { id: 'foo' }
vnode.children // []
vnode.key // null
```

::: warning 注意事项
完整 `VNode` 接口还有其它内部字段，建议不要用本文未列出的那些，以免内部变更导致不兼容。
:::

### 声明渲染函数 {#declaring-render-function}

<div class="composition-api">

组合式 API 配模板时，`setup()` 返回值给模板用。用渲染函数时，可直接 `return` 渲染函数：

```js
import { ref, h } from 'vue'

export default {
  props: {
    /* ... */
  },
  setup(props) {
    const count = ref(1)

    // 返回渲染函数
    return () => h('div', props.msg + count.value)
  }
}
```

在 `setup()` 里写的渲染函数，天然能访问同作用域的 props 和响应式状态。

除 vnode 外，也可返回字符串或数组：

```js
export default {
  setup() {
    return () => 'hello world!'
  }
}
```

```js
import { h } from 'vue'

export default {
  setup() {
    // 使用数组返回多个根节点
    return () => [
      h('div'),
      h('div'),
      h('div')
    ]
  }
}
```

::: tip
务必返回**函数**，不要返回值。`setup()` 每个组件只跑一次，返回的渲染函数会跑多次。
:::

</div>
<div class="options-api">

选项式 API 用 `render` 选项声明渲染函数：

```js
import { h } from 'vue'

export default {
  data() {
    return {
      msg: 'hello'
    }
  },
  render() {
    return h('div', this.msg)
  }
}
```

`render()` 里可访问 `this`。

也可返回字符串或数组：

```js
export default {
  render() {
    return 'hello world!'
  }
}
```

```js
import { h } from 'vue'

export default {
  render() {
    // 用数组来返回多个根节点
    return [
      h('div'),
      h('div'),
      h('div')
    ]
  }
}
```

</div>

不需要实例状态的渲染组件，可直接写成函数：

```js
function Hello() {
  return 'hello world!'
}
```

这就是合法的 Vue 组件。详见[函数式组件](#functional-components)。

### Vnodes 必须唯一 {#vnodes-must-be-unique}

组件树中的 vnodes 必须是唯一的。下面是错误示范：

```js
function render() {
  const p = h('p', 'hi')
  return h('div', [
    // 啊哦，重复的 vnodes 是无效的
    p,
    p
  ])
}
```

若要渲染多个相同节点，用工厂函数每次新建 vnode，例如渲染 20 个相同段落：

```js
function render() {
  return h(
    'div',
    Array.from({ length: 20 }).map(() => {
      return h('p', 'hi')
    })
  )
}
```

### 在 `<template>` 中使用 Vnode

```vue
<script setup>
import { h } from 'vue'

const vnode = h('button', ['Hello'])
</script>

<template>
  <!-- 通过 <component /> -->
  <component :is="vnode">Hi</component>

  <!-- 或者直接作为元素 -->
  <vnode />
  <vnode>Hi</vnode>
</template>
```

vnode 在 `setup()` 里定义好后，可像普通组件一样渲染。

:::warning
vnode 是静态渲染结果，不是组件定义。在 `<template>` 里用它不会新建组件实例，只按原样渲染。不能当组件替代品。
:::

## JSX / TSX {#jsx-tsx}

[JSX](https://facebook.github.io/jsx/) 是 JavaScript 的类 XML 扩展，可以这样写：

```jsx
const vnode = <div>hello</div>
```

JSX 里用大括号嵌入动态值：

```jsx
const vnode = <div id={dynamicId}>hello, {userName}</div>
```

`create-vue` 和 Vue CLI 内置 JSX 支持。手动配置见 [`@vue/babel-plugin-jsx`](https://github.com/vuejs/jsx-next)。

JSX 最早由 React 推广，但语法本身没有固定运行时语义，可编译成不同输出。若用过 React JSX，注意 **Vue 的 JSX 转换与 React 不同**，不能在 Vue 里直接用 React 的 JSX 编译。和 React 的一些明显区别：

- 可以使用 HTML attributes 比如 `class` 和 `for` 作为 props - 不需要使用 `className` 或 `htmlFor`。
- 向组件传子内容（如 slots）的[方式不同](#passing-slots)。

Vue 类型定义也支持 TSX。用 TSX 时在 `tsconfig.json` 设 `"jsx": "preserve"`，保证 Vue JSX 转换完整。

### JSX 类型推断 {#jsx-type-inference}

类型方面，Vue JSX 也需要单独配置。

Vue 3.4 起不再隐式注册全局 `JSX` 命名空间。要让 TypeScript 用 Vue 的 JSX 类型，在 `tsconfig.json` 加上：

```json
{
  "compilerOptions": {
    "jsx": "preserve",
    "jsxImportSource": "vue"
    // ...
  }
}
```

也可在文件顶部加 `/* @jsxImportSource vue */` 单独开启。

若仍依赖全局 `JSX`，可导入或引用 `vue/jsx` 恢复 3.4 前的全局行为。

## 渲染函数案例 {#render-function-recipes}

下面是用渲染函数 / JSX 实现常见模板功能的例子：

### `v-if` {#v-if}

模板：

```vue-html
<div>
  <div v-if="ok">yes</div>
  <span v-else>no</span>
</div>
```

等价渲染函数 / JSX：

<div class="composition-api">

```js
h('div', [ok.value ? h('div', 'yes') : h('span', 'no')])
```

```jsx
<div>{ok.value ? <div>yes</div> : <span>no</span>}</div>
```

</div>
<div class="options-api">

```js
h('div', [this.ok ? h('div', 'yes') : h('span', 'no')])
```

```jsx
<div>{this.ok ? <div>yes</div> : <span>no</span>}</div>
```

</div>

### `v-for` {#v-for}

模板：

```vue-html
<ul>
  <li v-for="{ id, text } in items" :key="id">
    {{ text }}
  </li>
</ul>
```

等价渲染函数 / JSX：

<div class="composition-api">

```js
h(
  'ul',
  // assuming `items` is a ref with array value
  items.value.map(({ id, text }) => {
    return h('li', { key: id }, text)
  })
)
```

```jsx
<ul>
  {items.value.map(({ id, text }) => {
    return <li key={id}>{text}</li>
  })}
</ul>
```

</div>
<div class="options-api">

```js
h(
  'ul',
  this.items.map(({ id, text }) => {
    return h('li', { key: id }, text)
  })
)
```

```jsx
<ul>
  {this.items.map(({ id, text }) => {
    return <li key={id}>{text}</li>
  })}
</ul>
```

</div>

### `v-on` {#v-on}

以 `on` 加大写字母开头的 prop 当作事件监听，如 `onClick` 对应模板 `@click`。

```js
h(
  'button',
  {
    onClick(event) {
      /* ... */
    }
  },
  'Click Me'
)
```

```jsx
<button
  onClick={(event) => {
    /* ... */
  }}
>
  Click Me
</button>
```

### 事件修饰符 {#event-modifiers}

`.passive`、`.capture`、`.once` 可用驼峰拼在事件名后：

实例：

```js
h('input', {
  onClickCapture() {
    /* 捕捉模式中的监听器 */
  },
  onKeyupOnce() {
    /* 只触发一次 */
  },
  onMouseoverOnceCapture() {
    /* 单次 + 捕捉 */
  }
})
```

```jsx
<input
  onClickCapture={() => {}}
  onKeyupOnce={() => {}}
  onMouseoverOnceCapture={() => {}}
/>
```

对于事件和按键修饰符，可以使用 [`withModifiers`](/api/render-function#withmodifiers) 函数：

```js
import { withModifiers } from 'vue'

h('div', {
  onClick: withModifiers(() => {}, ['self'])
})
```

```jsx
<div onClick={withModifiers(() => {}, ['self'])} />
```

### 组件 {#components}

给组件创建 vnode 时，`h()` 第一个参数应是组件定义。渲染函数里不必再注册组件，直接导入即可：

```js
import Foo from './Foo.vue'
import Bar from './Bar.jsx'

function render() {
  return h('div', [h(Foo), h(Bar)])
}
```

```jsx
function render() {
  return (
    <div>
      <Foo />
      <Bar />
    </div>
  )
}
```

只要导入的是有效 Vue 组件，不论文件类型，`h` 都能用。

动态组件在渲染函数里也可直接写：

```js
import Foo from './Foo.vue'
import Bar from './Bar.jsx'

function render() {
    return ok.value ? h(Foo) : h(Bar)
}
```

```jsx
function render() {
  return ok.value ? <Foo /> : <Bar />
}
```

组件只按名字注册、无法直接导入时（如库全局注册），用 [`resolveComponent()`](/api/render-function#resolvecomponent)。

### 渲染插槽 {#rendering-slots}

<div class="composition-api">

渲染函数里通过 `setup()` 上下文访问插槽。`slots` 里每个插槽都是**返回 vnode 数组的函数**：

```js
export default {
  props: ['message'],
  setup(props, { slots }) {
    return () => [
      // 默认插槽：
      // <div><slot /></div>
      h('div', slots.default()),

      // 具名插槽：
      // <div><slot name="footer" :text="message" /></div>
      h(
        'div',
        slots.footer({
          text: props.message
        })
      )
    ]
  }
}
```

等价 JSX 语法：

```jsx
// 默认插槽
<div>{slots.default()}</div>

// 具名插槽
<div>{slots.footer({ text: props.message })}</div>
```

</div>
<div class="options-api">

渲染函数里用 [this.$slots](/api/component-instance#slots) 访问插槽：

```js
export default {
  props: ['message'],
  render() {
    return [
      // <div><slot /></div>
      h('div', this.$slots.default()),

      // <div><slot name="footer" :text="message" /></div>
      h(
        'div',
        this.$slots.footer({
          text: this.message
        })
      )
    ]
  }
}
```

等价 JSX 语法：

```jsx
// <div><slot /></div>
<div>{this.$slots.default()}</div>

// <div><slot name="footer" :text="message" /></div>
<div>{this.$slots.footer({ text: this.message })}</div>
```

</div>

### 传递插槽 {#passing-slots}

向组件传子内容与向元素传子内容略有不同：要传插槽函数或插槽函数对象，而不是数组。插槽函数返回值同渲染函数，子组件访问时会变成 vnode 数组。

```js
// 单个默认插槽
h(MyComponent, () => 'hello')

// 具名插槽
// 注意 `null` 是必需的
// 以避免 slot 对象被当成 prop 处理
h(MyComponent, null, {
    default: () => 'default slot',
    foo: () => h('div', 'foo'),
    bar: () => [h('span', 'one'), h('span', 'two')]
})
```

等价 JSX 语法：

```jsx
// 默认插槽
<MyComponent>{() => 'hello'}</MyComponent>

// 具名插槽
<MyComponent>{{
  default: () => 'default slot',
  foo: () => <div>foo</div>,
  bar: () => [<span>one</span>, <span>two</span>]
}}</MyComponent>
```

插槽以函数传递，子组件可懒调用，依赖会挂在子组件而不是父组件上，更新更准、更高效。

### 作用域插槽 {#scoped-slots}

父组件渲染作用域插槽时，要给子组件传一个带参数的插槽函数（如 `text`）。子组件调用它，把数据传给父组件。

```js
// 父组件
export default {
  setup() {
    return () => h(MyComp, null, {
      default: ({ text }) => h('p', text)
    })
  }
}
```

记得传 `null`，避免插槽对象被当成 prop：

```js
// 子组件
export default {
  setup(props, { slots }) {
    const text = ref('hi')
    return () => h('div', null, slots.default({ text: text.value }))
  }
}
```

等同于 JSX：

```jsx
<MyComponent>{{
  default: ({ text }) => <p>{ text }</p>  
}}</MyComponent>
```

### 内置组件 {#built-in-components}

`<KeepAlive>`、`<Transition>`、`<TransitionGroup>`、`<Teleport>`、`<Suspense>` 等[内置组件](/api/built-in-components)在渲染函数里要先导入：

<div class="composition-api">

```js
import { h, KeepAlive, Teleport, Transition, TransitionGroup } from 'vue'

export default {
  setup () {
    return () => h(Transition, { mode: 'out-in' }, /* ... */)
  }
}
```

</div>
<div class="options-api">

```js
import { h, KeepAlive, Teleport, Transition, TransitionGroup } from 'vue'

export default {
  render () {
    return h(Transition, { mode: 'out-in' }, /* ... */)
  }
}
```

</div>

### `v-model` {#v-model}

模板里 `v-model` 会编译成 `modelValue` 和 `onUpdate:modelValue`；渲染函数里需自己传这两个 prop：

<div class="composition-api">

```js
export default {
  props: ['modelValue'],
  emits: ['update:modelValue'],
  setup(props, { emit }) {
    return () =>
      h(SomeComponent, {
        modelValue: props.modelValue,
        'onUpdate:modelValue': (value) => emit('update:modelValue', value)
      })
  }
}
```

</div>
<div class="options-api">

```js
export default {
  props: ['modelValue'],
  emits: ['update:modelValue'],
  render() {
    return h(SomeComponent, {
      modelValue: this.modelValue,
      'onUpdate:modelValue': (value) => this.$emit('update:modelValue', value)
    })
  }
}
```

</div>

### 自定义指令 {#custom-directives}

用 [`withDirectives`](/api/render-function#withdirectives) 把自定义指令绑到 vnode：

```js
import { h, withDirectives } from 'vue'

// 自定义指令
const pin = {
  mounted() { /* ... */ },
  updated() { /* ... */ }
}

// <div v-pin:top.animate="200"></div>
const vnode = withDirectives(h('div'), [
  [pin, 200, 'top', { animate: true }]
])
```

指令按名字注册、无法直接导入时，用 [`resolveDirective`](/api/render-function#resolvedirective)。

### 模板引用 {#template-refs}

<div class="composition-api">

组合式 API 用 [`useTemplateRef()`](/api/composition-api-helpers#usetemplateref) <sup class="vt-badge" data-text="3.5+" /> 时，把字符串 `ref` 作为 prop 传给 vnode：

```js
import { h, useTemplateRef } from 'vue'

export default {
  setup() {
    const divEl = useTemplateRef('my-div')

    // <div ref="my-div">
    return () => h('div', { ref: 'my-div' })
  }
}
```

<details>
<summary>3.5 之前的用法</summary>

3.5 前没有 `useTemplateRef()`，把 `ref()` 本身作为 prop 传给 vnode：

```js
import { h, ref } from 'vue'

export default {
  setup() {
    const divEl = ref()

    // <div ref="divEl">
    return () => h('div', { ref: divEl })
  }
}
```
</details>
</div>
<div class="options-api">

选项式 API 在 vnode 的 `ref` prop 里传字符串引用名：

```js
export default {
  render() {
    // <div ref="divEl">
    return h('div', { ref: 'divEl' })
  }
}
```

</div>

## 函数式组件 {#functional-components}

函数式组件自身无状态，像纯函数：收 props，返回 vnodes。渲染时不创建组件实例（没有 `this`），也不走常规生命周期。

用普通函数（不是选项对象）定义，该函数就是渲染函数。

<div class="composition-api">

函数式组件的签名与 `setup()` 钩子相同：

```js
function MyComponent(props, { slots, emit, attrs }) {
  // ...
}
```

</div>
<div class="options-api">

函数式组件没有 `this`，Vue 把 `props` 作为第一个参数：

```js
function MyComponent(props, context) {
  // ...
}
```

第二个参数 `context` 含 `attrs`、`emit`、`slots`，对应实例的 [`$attrs`](/api/component-instance#attrs)、[`$emit`](/api/component-instance#emit)、[`$slots`](/api/component-instance#slots)。

</div>

函数式组件大多不能用普通组件的那些选项，除了 [`props`](/api/options-state#props) 和 [`emits`](/api/options-state#emits)。可通过对应属性声明它们：

```js
MyComponent.props = ['value']
MyComponent.emits = ['click']
```

未定义 `props` 时，传入函数的 `props` 会像 `attrs` 一样包含所有 attribute；未声明 `props` 时，prop 名不会做驼峰转换。

有明确 `props` 时，[attribute 透传](/guide/components/attrs) 与普通组件类似。未声明 `props` 时，默认只有 `class`、`style` 和 `onXxx` 从 `attrs` 继承。两种情况下都可设 `inheritAttrs: false` 关闭透传：

```js
MyComponent.inheritAttrs = false
```

函数式组件可像普通组件一样注册、使用。把函数作为 `h` 的第一个参数传入时，会当作函数式组件。

### 为函数式组件标注类型<sup class="vt-badge ts" /> {#typing-functional-components}

函数式组件可按是否具名来标注类型。单文件组件模板里，[Vue - Official 扩展](https://github.com/vuejs/language-tools) 也支持类型检查。

**具名函数式组件**

```tsx
import type { SetupContext } from 'vue'
type FComponentProps = {
  message: string
}

type Events = {
  sendMessage(message: string): void
}

function FComponent(
  props: FComponentProps,
  context: SetupContext<Events>
) {
  return (
    <button onClick={() => context.emit('sendMessage', props.message)}>
        {props.message} {' '}
    </button>
  )
}

FComponent.props = {
  message: {
    type: String,
    required: true
  }
}

FComponent.emits = {
  sendMessage: (value: unknown) => typeof value === 'string'
}
```

**匿名函数式组件**

```tsx
import type { FunctionalComponent } from 'vue'

type FComponentProps = {
  message: string
}

type Events = {
  sendMessage(message: string): void
}

const FComponent: FunctionalComponent<FComponentProps, Events> = (
  props,
  context
) => {
  return (
    <button onClick={() => context.emit('sendMessage', props.message)}>
        {props.message} {' '}
    </button>
  )
}

FComponent.props = {
  message: {
    type: String,
    required: true
  }
}

FComponent.emits = {
  sendMessage: (value) => typeof value === 'string'
}
```
