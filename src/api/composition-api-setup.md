# 组合式 API：setup() {#composition-api-setup}

## 基本使用 {#basic-usage}

`setup()` 是在组件里使用组合式 API 的入口，通常只在以下情况使用：

1. 不在单文件组件里，却要用组合式 API。
2. 在选项式 API 组件里，接入组合式 API 代码。

:::info 注意
在单文件组件里用组合式 API，推荐 [`<script setup>`](/api/sfc-script-setup)，语法更简洁。
:::

可以用[响应式 API](./reactivity-core) 声明响应式状态。`setup()` 返回的对象会暴露给模板和组件实例，其他选项式 API 钩子也能通过 `this` 访问这些属性：

```vue
<script>
import { ref } from 'vue'

export default {
  setup() {
    const count = ref(0)

    // 返回值会暴露给模板和其他的选项式 API 钩子
    return {
      count
    }
  },

  mounted() {
    console.log(this.count) // 0
  }
}
</script>

<template>
  <button @click="count++">{{ count }}</button>
</template>
```

模板里访问 `setup` 返回的 [ref](/api/reactivity-core#ref) 时会[自动浅层解包](/guide/essentials/reactivity-fundamentals#deep-reactivity)，不必写 `.value`。通过 `this` 访问时同样会解包。

`setup()` 里不能访问组件实例，`this` 是 `undefined`。选项式 API 可以访问组合式 API 暴露的值，反过来不行。

`setup()` 应*同步*返回一个对象。只有组件是 [Suspense](../guide/built-ins/suspense) 的后代时，才可以用 `async setup()`。

## 访问 Props {#accessing-props}

`setup` 的第一个参数是组件 `props`。和一般组件一样，`props` 是响应式的，新 props 传入时会同步更新。

```js
export default {
  props: {
    title: String
  },
  setup(props) {
    console.log(props.title)
  }
}
```

若解构 `props`，解构出的变量会失去响应性。推荐用 `props.xxx` 访问 props。

若确实需要解构，或要把某个 prop 传给外部函数并保持响应性，可用 [toRefs()](./reactivity-utilities#torefs) 和 [toRef()](/api/reactivity-utilities#toref)：

```js
import { toRefs, toRef } from 'vue'

export default {
  setup(props) {
    // 将 `props` 转为一个其中全是 ref 的对象，然后解构
    const { title } = toRefs(props)
    // `title` 是一个追踪着 `props.title` 的 ref
    console.log(title.value)

    // 或者，将 `props` 的单个属性转为一个 ref
    const title = toRef(props, 'title')
  }
}
```

## Setup 上下文 {#setup-context}

`setup` 的第二个参数是 **Setup 上下文**对象，包含 `setup` 里可能用到的其他值：

```js
export default {
  setup(props, context) {
    // 透传 Attributes (非响应式的对象，等价于 $attrs)
    console.log(context.attrs)

    // 插槽(非响应式的对象，等价于 $slots)
    console.log(context.slots)

    // 触发事件(函数，等价于 $emit)
    console.log(context.emit)

    // 暴露公共属性(函数)
    console.log(context.expose)
  }
}
```

上下文对象不是响应式的，可以安全解构：

```js
export default {
  setup(props, { attrs, slots, emit, expose }) {
    ...
  }
}
```

`attrs` 和 `slots` 是有状态对象，会随组件更新而更新。不要解构它们，始终用 `attrs.x` 或 `slots.x` 访问。和 `props` 不同，`attrs` 和 `slots` 的属性**不是**响应式的。若要根据 `attrs` 或 `slots` 变化执行副作用，应在 `onBeforeUpdate` 生命周期钩子里写逻辑。

### 暴露公共属性 {#exposing-public-properties}

`expose` 用来显式限制组件对外暴露的内容。父组件通过[模板引用](/guide/essentials/template-refs#ref-on-component)访问子组件实例时，只能访问 `expose` 暴露的部分：

```js{5,10}
export default {
  setup(props, { expose }) {
    // 让组件实例处于 “关闭状态”
    // 即不向父组件暴露任何东西
    expose()

    const publicCount = ref(0)
    const privateCount = ref(0)
    // 有选择地暴露局部状态
    expose({ count: publicCount })
  }
}
```

## 与渲染函数一起使用 {#usage-with-render-functions}

`setup` 也可以返回[渲染函数](/guide/extras/render-function)，在渲染函数里可直接使用同作用域下的响应式状态：

```js{6}
import { h, ref } from 'vue'

export default {
  setup() {
    const count = ref(0)
    return () => h('div', count.value)
  }
}
```

返回渲染函数后就不能再返回其他内容。组件内部没问题，但若要通过模板引用把方法暴露给父组件，就会有问题。

可以调用 [`expose()`](#exposing-public-properties) 解决：

```js{8-10}
import { h, ref } from 'vue'

export default {
  setup(props, { expose }) {
    const count = ref(0)
    const increment = () => ++count.value

    expose({
      increment
    })

    return () => h('div', count.value)
  }
}
```

此时父组件可通过模板引用访问 `increment` 方法。
