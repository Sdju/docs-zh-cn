# 自定义指令 {#custom-directives}

<script setup>
const vHighlight = {
  mounted: el => {
    el.classList.add('is-highlight')
  }
}
</script>

<style>
.vt-doc p.is-highlight {
  margin-bottom: 0;
}

.is-highlight {
  background-color: yellow;
  color: black;
}
</style>

## 介绍 {#introduction}

除了内置指令（如 `v-model`、`v-show`），Vue 还支持注册自定义指令 (Custom Directives)。

复用代码常见两种方式：[组件](/guide/essentials/component-basics)和[组合式函数](./composables)。组件负责 UI 结构，组合式函数侧重有状态逻辑。自定义指令则适合复用**直接操作普通元素 DOM** 的逻辑。

自定义指令用一个对象定义，里面的钩子类似组件生命周期，第一个参数是指令绑定的元素。下面例子在元素插入 DOM 后给它加上一个 class：

<div class="composition-api">

```vue
<script setup>
// 在模板中启用 v-highlight
const vHighlight = {
  mounted: (el) => {
    el.classList.add('is-highlight')
  }
}
</script>

<template>
  <p v-highlight>This sentence is important!</p>
</template>
```

</div>

<div class="options-api">

```js
const highlight = {
  mounted: (el) => el.classList.add('is-highlight')
}

export default {
  directives: {
    // 在模板中启用 v-highlight
    highlight
  }
}
```

```vue-html
<p v-highlight>This sentence is important!</p>
```

</div>

<div class="demo">
  <p v-highlight>This sentence is important!</p>
</div>

<div class="composition-api">

在 `<script setup>` 里，以 `v` 开头的驼峰变量可当自定义指令用。上例中 `vHighlight` 在模板里写成 `v-highlight`。

不用 `<script setup>` 时，要通过 `directives` 选项注册：

```js
export default {
  setup() {
    /*...*/
  },
  directives: {
    // 在模板中启用 v-highlight
    highlight: {
      /* ... */
    }
  }
}
```

</div>

<div class="options-api">

和组件一样，自定义指令要先注册才能在模板里用。上例用 `directives` 做了局部注册。

</div>

也可以把自定义指令全局注册到整个应用：

```js
const app = createApp({})

// 使 v-highlight 在所有组件中都可用
app.directive('highlight', {
  /* ... */
})
```

扩展 `vue` 里的 `ComponentCustomProperties` 接口，可为全局自定义指令加类型。

详见：[为自定义全局指令添加类型](/guide/typescript/composition-api#typing-global-custom-directives) <sup class="vt-badge ts" />

## 自定义指令的使用时机 {#when-to-use}

只有**必须直接操作 DOM** 才能实现的功能，才适合用自定义指令。

常见例子是让元素自动聚焦的 `v-focus` 指令。

<div class="composition-api">

```vue
<script setup>
// 在模板中启用 v-focus
const vFocus = {
  mounted: (el) => el.focus()
}
</script>

<template>
  <input v-focus />
</template>
```

</div>

<div class="options-api">

```js
const focus = {
  mounted: (el) => el.focus()
}

export default {
  directives: {
    // 在模板中启用 v-focus
    focus
  }
}
```

```vue-html
<input v-focus />
```

</div>

它比 `autofocus` 更实用：不仅在页面加载时生效，Vue 动态插入元素时也会生效。

能做的事尽量用 `v-bind` 等内置指令写在模板里，它们更高效，也更利于服务端渲染。

## 指令钩子 {#directive-hooks}

指令定义对象可提供以下钩子（均可选）：

```js
const myDirective = {
  // 在绑定元素的 attribute 前
  // 或事件监听器应用前调用
  created(el, binding, vnode) {
    // 下面会介绍各个参数的细节
  },
  // 在元素被插入到 DOM 前调用
  beforeMount(el, binding, vnode) {},
  // 在绑定元素的父组件
  // 及他自己的所有子节点都挂载完成后调用
  mounted(el, binding, vnode) {},
  // 绑定元素的父组件更新前调用
  beforeUpdate(el, binding, vnode, prevVnode) {},
  // 在绑定元素的父组件
  // 及他自己的所有子节点都更新后调用
  updated(el, binding, vnode, prevVnode) {},
  // 绑定元素的父组件卸载前调用
  beforeUnmount(el, binding, vnode) {},
  // 绑定元素的父组件卸载后调用
  unmounted(el, binding, vnode) {}
}
```

### 钩子参数 {#hook-arguments}

钩子会收到这些参数：

- `el`：指令绑定的 DOM 元素，可直接操作。

- `binding`：对象，包含：

  - `value`：传给指令的值。例如 `v-my-directive="1 + 1"` 时值为 `2`。
  - `oldValue`：上一次的值，仅在 `beforeUpdate` 和 `updated` 中有，不论是否变化。
  - `arg`：指令参数（若有）。例如 `v-my-directive:foo` 中 arg 为 `"foo"`。
  - `modifiers`：修饰符对象（若有）。例如 `v-my-directive.foo.bar` 对应 `{ foo: true, bar: true }`。
  - `instance`：使用此指令的组件实例。
  - `dir`：指令的定义对象。

- `vnode`：绑定元素对应的底层 VNode。
- `prevVnode`：上一次渲染时该元素的 VNode，仅在 `beforeUpdate` 和 `updated` 中有。

例如这样使用指令：

```vue-html
<div v-example:foo.bar="baz">
```

此时 `binding` 大致为：

```js
{
  arg: 'foo',
  modifiers: { bar: true },
  value: /* `baz` 的值 */,
  oldValue: /* 上一次更新时 `baz` 的值 */
}
```

和内置指令一样，自定义指令的参数也可以动态绑定，例如：

```vue-html
<div v-example:[arg]="value"></div>
```

指令参数会随组件的 `arg` 数据响应式更新。

:::tip Note
除 `el` 外，其他参数都是只读的，不要改。若要在钩子之间传信息，建议用元素的 [dataset](https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/dataset) attribute。
:::

## 简化形式 {#function-shorthand}

若只需在 `mounted` 和 `updated` 做同样的事，不必写完整对象，可以直接用函数定义指令：

```vue-html
<div v-color="color"></div>
```

```js
app.directive('color', (el, binding) => {
  // 这会在 `mounted` 和 `updated` 时都调用
  el.style.color = binding.value
})
```

## 对象字面量 {#object-literals}

若指令需要多个值，可传一个 JavaScript 对象字面量。指令的值也可以是任意合法的 JavaScript 表达式。

```vue-html
<div v-demo="{ color: 'white', text: 'hello!' }"></div>
```

```js
app.directive('demo', (el, binding) => {
  console.log(binding.value.color) // => "white"
  console.log(binding.value.text) // => "hello!"
})
```

## 在组件上使用 {#usage-on-components}

:::warning 不推荐
不建议在组件上用自定义指令。组件有多个根节点时，行为可能不符合预期。
:::

在组件上使用自定义指令时，会作用在组件的根节点上，规则类似[透传 attributes](/guide/components/attrs)。

```vue-html
<MyComponent v-demo="test" />
```

```vue-html
<!-- MyComponent 的模板 -->

<div> <!-- v-demo 指令会被应用在此处 -->
  <span>My component content</span>
</div>
```

注意：多根组件上会忽略该指令并报警告。与 attribute 不同，指令不能通过 `v-bind="$attrs"` 转绑到其他元素。
