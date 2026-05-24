# 内置特殊元素 {#built-in-special-elements}

:::info 不是组件
`<component>`、`<slot>` 和 `<template>` 有类似组件的特性，也是模板语法的一部分。但它们不是真正的组件，编译时会被编译掉。模板中通常用小写书写。
:::

## `<component>` {#component}

用于渲染动态组件或元素的“元组件”。

- **Props**

  ```ts
  interface DynamicComponentProps {
    is: string | Component
  }
  ```

- **详细信息**

  实际渲染的组件由 `is` prop 决定。

  - `is` 是字符串时，可以是 HTML 标签名或组件注册名。
  - `is` 也可直接绑定组件定义。

- **示例**

  按注册名渲染组件 (选项式 API)：

  ```vue
  <script>
  import Foo from './Foo.vue'
  import Bar from './Bar.vue'

  export default {
    components: { Foo, Bar },
    data() {
      return {
        view: 'Foo'
      }
    }
  }
  </script>

  <template>
    <component :is="view" />
  </template>
  ```

  按定义渲染组件 (`<script setup>` 组合式 API)：

  ```vue
  <script setup>
  import Foo from './Foo.vue'
  import Bar from './Bar.vue'
  </script>

  <template>
    <component :is="Math.random() > 0.5 ? Foo : Bar" />
  </template>
  ```

  渲染 HTML 元素：

  ```vue-html
  <component :is="href ? 'a' : 'span'"></component>
  ```

  [内置组件](./built-in-components) 可传给 `is`，但按名称传递需先注册。例如：

  ```vue
  <script>
  import { Transition, TransitionGroup } from 'vue'

  export default {
    components: {
      Transition,
      TransitionGroup
    }
  }
  </script>

  <template>
    <component :is="isGroup ? 'TransitionGroup' : 'Transition'">
      ...
    </component>
  </template>
  ```

  若把组件本身（而非名称）传给 `is`，则无需注册，例如在 `<script setup>` 中。

  在 `<component>` 上使用 `v-model` 时，编译器会扩展为 `modelValue` prop 和 `update:modelValue` 事件，与其他组件相同。但这与原生 HTML 元素（如 `<input>`、`<select>`）不兼容，因此在动态创建的原生元素上 `v-model` 不起作用：

  ```vue
  <script setup>
  import { ref } from 'vue'

  const tag = ref('input')
  const username = ref('')
  </script>

  <template>
    <!-- 由于 'input' 是原生 HTML 元素，因此这个 v-model 不起作用 -->
    <component :is="tag" v-model="username" />
  </template>
  ```

  实际项目中这种场景很少见，原生表单字段通常包在组件里。若必须直接用原生元素，可手动把 `v-model` 拆成 attribute 和事件。

- **参考**[动态组件](/guide/essentials/component-basics#dynamic-components)

## `<slot>` {#slot}

模板中插槽内容的出口。

- **Props**

  ```ts
  interface SlotProps {
    /**
     * 任何传递给 <slot> 的 prop 都可以作为作用域插槽
     * 的参数传递
     */
    [key: string]: any
    /**
     * 保留，用于指定插槽名。
     */
    name?: string
  }
  ```

- **详细信息**

  `<slot>` 可用 `name` attribute 指定插槽名。未指定时渲染默认插槽。传给 `<slot>` 的额外 attributes 会作为插槽 props，传给父级定义的作用域插槽。

  元素本身会被匹配的插槽内容替换。

  Vue 模板里的 `<slot>` 会编译成 JavaScript，不要与[原生 `<slot>` 元素](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/slot)混淆。

- **参考**[组件 - 插槽](/guide/components/slots)

## `<template>` {#template}

想用内置指令但不在 DOM 中渲染元素时，`<template>` 可作为占位符。

- **详细信息**

  只有与以下指令一起使用时，`<template>` 才有特殊处理：

  - `v-if`、`v-else-if` 或 `v-else`
  - `v-for`
  - `v-slot`

  没有这些指令时，会渲染成[原生 `<template>` 元素](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/template)。

  带 `v-for` 的 `<template>` 也可有 [`key` 属性](/api/built-in-special-attributes#key)。其他 attributes 和指令会被丢弃，因为没有对应元素。

  单文件组件用[顶层 `<template>` 标签](/api/sfc-spec#language-blocks)包裹整个模板。这与上面的 `<template>` 用法不同：顶层标签不是模板的一部分，不支持指令等模板语法。

- **参考**
  - [指南 - `<template>` 上的 `v-if`](/guide/essentials/conditional#v-if-on-template)
  - [指南 - `<template>` 上的 `v-for`](/guide/essentials/list#v-for-on-template)
  - [指南 - 具名插槽](/guide/components/slots#named-slots)
