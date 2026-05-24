---
outline: deep
---

# 透传 Attributes {#fallthrough-attributes}

> 建议先阅读[组件基础](/guide/essentials/component-basics)。如果还不熟悉组件，请先看完那一章。

## Attributes 继承 {#attribute-inheritance}

**透传 attribute** 指传给组件、但没有被声明为 [props](./props) 或 [emits](./events#defining-custom-events) 的 attribute，以及 `v-on` 事件监听器。常见例子有 `class`、`style` 和 `id`。

当组件只有一个根元素时，透传的 attribute 会自动加到根元素上。例如 `<MyButton>` 的模板是：

```vue-html
<!-- <MyButton> 的模板 -->
<button>Click Me</button>
```

父组件使用时传了 `class`：

```vue-html
<MyButton class="large" />
```

最终 DOM 是：

```html
<button class="large">Click Me</button>
```

`<MyButton>` 没有把 `class` 声明为 prop，所以 `class` 被视为透传 attribute，自动落到根元素 `<button>` 上。

### 对 `class` 和 `style` 的合并 {#class-and-style-merging}

如果子组件根元素已有 `class` 或 `style`，会和父组件传下来的值合并。把 `<MyButton>` 改成：

```vue-html
<!-- <MyButton> 的模板 -->
<button class="btn">Click Me</button>
```

渲染结果是：

```html
<button class="btn large">Click Me</button>
```

### `v-on` 监听器继承 {#v-on-listener-inheritance}

`v-on` 监听器也遵循同样规则：

```vue-html
<MyButton @click="onClick" />
```

`click` 会加到 `<MyButton>` 的根元素（原生 `<button>`）上。点击按钮会触发父组件的 `onClick`。如果按钮自己也绑了 `v-on`，父组件继承的监听器和自身的监听器都会触发。

### 深层组件继承 {#nested-component-inheritance}

有时组件的根节点是另一个组件。例如 `<MyButton>` 在根上渲染 `<BaseButton>`：

```vue-html
<!-- <MyButton/> 的模板，只是渲染另一个组件 -->
<BaseButton />
```

此时传给 `<MyButton>` 的透传 attribute 会继续传给 `<BaseButton>`。

请注意：

1. 透传 attribute **不会**包含 `<MyButton>` 已声明的 props，也不会包含针对 `emits` 声明事件的 `v-on` 监听器。也就是说，已声明的 props 和事件监听器会被 `<MyButton>` “消费”掉。

2. 符合声明的透传 attribute，也可以作为 props 传给 `<BaseButton>`。

## 禁用 Attributes 继承 {#disabling-attribute-inheritance}

如果不想自动继承 attribute，可以在组件选项里设置 `inheritAttrs: false`。

<div class="composition-api">

从 3.3 起，也可以在 `<script setup>` 里用 [`defineOptions`](/api/sfc-script-setup#defineoptions)：

```vue
<script setup>
defineOptions({
  inheritAttrs: false
})
// ...setup 逻辑
</script>
```

</div>

常见场景是：attribute 需要加到根节点以外的元素上。设置 `inheritAttrs: false` 后，可以完全自己控制透传 attribute 怎么用。

透传进来的 attribute 可以在模板里通过 `$attrs` 访问：

```vue-html
<span>Fallthrough attribute: {{ $attrs }}</span>
```

`$attrs` 包含除已声明的 `props` 和 `emits` 之外的所有 attribute，例如 `class`、`style`、`v-on` 监听器等。

几点说明：

- 和 props 不同，透传 attributes 在 JavaScript 里保留原始大小写，所以 `foo-bar` 要用 `$attrs['foo-bar']` 访问。

- `@click` 这类 `v-on` 监听器在对象里是函数，例如 `$attrs.onClick`。

再看 [前面](#attribute-inheritance) 的 `<MyButton>`。有时为了样式，要在 `<button>` 外包一层 `<div>`：

```vue-html
<div class="btn-wrapper">
  <button class="btn">Click Me</button>
</div>
```

我们希望 `class`、`v-on` 等透传 attribute 加在内部 `<button>` 上，而不是外层 `<div>`。可以设 `inheritAttrs: false`，并用 `v-bind="$attrs"`：

```vue-html{2}
<div class="btn-wrapper">
  <button class="btn" v-bind="$attrs">Click Me</button>
</div>
```

小提示：[没有参数的 `v-bind`](/guide/essentials/template-syntax#dynamically-binding-multiple-attributes) 会把对象里的所有属性都绑定到目标元素上。

## 多根节点的 Attributes 继承 {#attribute-inheritance-on-multiple-root-nodes}

和单根组件不同，**多根节点**组件不会自动透传 attribute。如果没有显式绑定 `$attrs`，运行时会报警告。

```vue-html
<CustomLayout id="custom-layout" @click="changeValue" />
```

如果 `<CustomLayout>` 的模板有多个根节点，Vue 不知道 attribute 该落到哪个根上，就会警告：

```vue-html
<header>...</header>
<main>...</main>
<footer>...</footer>
```

如果显式绑定 `$attrs`，就不会警告：

```vue-html{2}
<header>...</header>
<main v-bind="$attrs">...</main>
<footer>...</footer>
```

## 在 JavaScript 中访问透传 Attributes {#accessing-fallthrough-attributes-in-javascript}

<div class="composition-api">

在 `<script setup>` 里，可以用 `useAttrs()` 访问所有透传 attribute：

```vue
<script setup>
import { useAttrs } from 'vue'

const attrs = useAttrs()
</script>
```

如果没用 `<script setup>`，`attrs` 在 `setup()` 上下文里：

```js
export default {
  setup(props, ctx) {
    // 透传 attribute 被暴露为 ctx.attrs
    console.log(ctx.attrs)
  }
}
```

注意：`attrs` 会反映最新的透传 attribute，但**不是响应式的**（出于性能考虑）。不能用侦听器监听它的变化。需要响应性时，用 prop；或在 `onUpdated()` 里结合最新 `attrs` 执行副作用。

</div>

<div class="options-api">

可以通过实例属性 `$attrs` 访问所有透传 attribute：

```js
export default {
  created() {
    console.log(this.$attrs)
  }
}
```

</div>
