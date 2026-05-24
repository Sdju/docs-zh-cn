# 响应性语法糖 {#reactivity-transform}

:::danger 已移除的实验性功能
响应性语法糖曾是实验功能，已在 Vue 3.4 移除。原因见[讨论](https://github.com/vuejs/rfcs/discussions/369#discussioncomment-5059028)。

若仍要使用，可改用 [Vue Macros](https://vue-macros.sxzz.moe/features/reactivity-transform.html) 插件。
:::

:::tip 组合式 API 特有
响应性语法糖只适用于组合式 API，且需要构建步骤。
:::

## ref vs. 响应式变量 {#refs-vs-reactive-variables}

组合式 API 里常纠结：用 `ref` 还是 `reactive`？`reactive` 解构会丢响应性；`ref` 要到处写 `.value`，没类型提示时还容易漏。

[响应性语法糖](https://github.com/vuejs/core/tree/main/packages/reactivity-transform) 是编译时转换，可以这样写：

```vue
<script setup>
let count = $ref(0)

console.log(count)

function increment() {
  count++
}
</script>

<template>
  <button @click="increment">{{ count }}</button>
</template>
```

`$ref()` 是**编译期宏**，运行时不会调用。它告诉编译器：`count` 应是**响应式变量**。

写法像普通变量，编译后会变成带 `.value` 的 ref。上面 `<script>` 会编译成：

```js{5,8}
import { ref } from 'vue'

let count = ref(0)

console.log(count.value)

function increment() {
  count.value++
}
```

每个返回 ref 的响应式 API 都有对应的 `$` 前缀宏：

- [`ref`](/api/reactivity-core#ref) -> `$ref`
- [`computed`](/api/reactivity-core#computed) -> `$computed`
- [`shallowRef`](/api/reactivity-advanced#shallowref) -> `$shallowRef`
- [`customRef`](/api/reactivity-advanced#customref) -> `$customRef`
- [`toRef`](/api/reactivity-utilities#toref) -> `$toRef`

启用后这些宏全局可用，不必手动导入。也可从 `vue/macros` 显式引入：

```js
import { $ref } from 'vue/macros'

let count = $ref(0)
```

## 通过 `$()` 解构 {#destructuring-with}

组合函数常返回多个 ref 的对象，解构后要用 **`$()`** 宏保持响应性：

```js
import { useMouse } from '@vueuse/core'

const { x, y } = $(useMouse())

console.log(x, y)
```

编译为：

```js
import { toRef } from 'vue'
import { useMouse } from '@vueuse/core'

const __temp = useMouse(),
  x = toRef(__temp, 'x'),
  y = toRef(__temp, 'y')

console.log(x.value, y.value)
```

若 `x` 已是 ref，`toRef(__temp, 'x')` 会直接返回它。解构出的非 ref 值（如函数）也会被包成 ref，其它代码照常工作。

`$()` 解构对响应式对象和「多个 ref 的对象」都适用。

## 用 `$()` 将现存的 ref 转换为响应式对象 {#convert-existing-refs-to-reactive-variables-with}

已有返回 ref 的函数时，编译器无法提前知道。可用 `$()` 把现有 ref 转成响应式变量写法：

```js
function myCreateRef() {
  return ref(0)
}

let count = $(myCreateRef())
```

## 响应式 props 解构 {#reactive-props-destructure}

`<script setup>` 里 `defineProps` 有两个常见痛点：

1. 为保持响应性，通常要写 `props.x`，不能直接解构——解构得到的变量不是响应式的。

2. [基于类型的 props](https://v3.vuejs.org/api/sfc-script-setup#type-only-props-emit-declarations) 声明默认值不方便，要用 `withDefaults()`，仍偏繁琐。

配合解构时，编译器可做转换（类似 `$()`）：

```html
<script setup lang="ts">
  interface Props {
    msg: string
    count?: number
    foo?: string
  }

  const {
    msg,
    // 默认值正常可用
    count = 1,
    // 解构时命别名也可用
    // 这里我们就将 `props.foo` 命别名为 `bar`
    foo: bar
  } = defineProps<Props>()

  watchEffect(() => {
    // 会在 props 变化时打印
    console.log(msg, count, bar)
  })
</script>
```

上面会编译成类似下面的运行时声明：

```js
export default {
  props: {
    msg: { type: String, required: true },
    count: { type: Number, default: 1 },
    foo: String
  },
  setup(props) {
    watchEffect(() => {
      console.log(props.msg, props.count, props.foo)
    })
  }
}
```

## 保持在函数间传递时的响应性 {#retaining-reactivity-across-function-boundaries}

响应式变量省掉了 `.value`，但在函数间传递时可能「丢响应性」。常见两种场景：

### 以参数形式传入函数 {#passing-into-function-as-argument}

假设函数要接收 ref：

```ts
function trackChange(x: Ref<number>) {
  watch(x, (x) => {
    console.log('x 改变了！')
  })
}

let count = $ref(0)
trackChange(count) // 无效！
```

因为会编译成：

```ts
let count = ref(0)
trackChange(count.value)
```

`count.value` 是 number，不是 ref。传入前用 `$$()` 包装：

```diff
let count = $ref(0)
- trackChange(count)
+ trackChange($$(count))
```

编译为：

```js
import { ref } from 'vue'

let count = ref(0)
trackChange(count)
```

`$$()` 像**转义**：其中的响应式变量不会自动加 `.value`。

### 作为函数返回值 {#returning-inside-function-scope}

在 return 表达式里直接用响应式变量会丢响应性：

```ts
function useMouse() {
  let x = $ref(0)
  let y = $ref(0)

  // 监听 mousemove 事件

  // 不起效！
  return {
    x,
    y
  }
}
```

会编译为：

```ts
return {
  x: x.value,
  y: y.value
}
```

要返回真正的 ref，而不是当时的值。可对返回对象用 `$$()`：

```ts
function useMouse() {
  let x = $ref(0)
  let y = $ref(0)

  // 监听 mousemove 事件

  // 修改后起效
  return $$({
    x,
    y
  })
}
```

### 在已解构的 props 上使用 `$$()` {#using-on-destructured-props}

`$$()` 也适用于已解构的 props。编译器会用 `toRef` 转换：

```ts
const { count } = defineProps<{ count: number }>()

passAsRef($$(count))
```

编译为：

```js
setup(props) {
  const __props_count = toRef(props, 'count')
  passAsRef(__props_count)
}
```

## TypeScript 集成 <sup class="vt-badge ts" /> {#typescript-integration}

Vue 为这些宏提供了类型声明（全局可用），推导符合预期，与标准 TypeScript 语义兼容，现有工具都能用。

宏在任意 JS/TS 文件里合法，不限于单文件组件。

因宏全局可用，需在类型里显式引用（例如在 `env.d.ts`）：

```ts
/// <reference types="vue/macros-global" />
```

若从 `vue/macros` 显式引入宏，则不必全局声明。

## 显式启用 {#explicit-opt-in}

:::danger Core 不再支持
以下内容仅适用于 Vue 3.3 及以下。Vue core 3.4+ 和 `@vitejs/plugin-vue` 5.0+ 已移除，请迁到 [Vue Macros](https://vue-macros.sxzz.moe/features/reactivity-transform.html)。
:::

### Vite {#vite}

- 需要 `@vitejs/plugin-vue@>=2.0.0`
- 作用于单文件组件和 js(x)/ts(x) 文件。会先快速检查是否用到宏，未用的文件无额外开销。
- `reactivityTransform` 现为插件顶层选项（不再在 `script.refSugar` 下），因为对非 SFC 也生效。

```js [vite.config.js]
export default {
  plugins: [
    vue({
      reactivityTransform: true
    })
  ]
}
```

### `vue-cli` {#vue-cli}

- 目前仅单文件组件
- 需要 `vue-loader@>=17.0.0`

```js [vue.config.js]
module.exports = {
  chainWebpack: (config) => {
    config.module
      .rule('vue')
      .use('vue-loader')
      .tap((options) => {
        return {
          ...options,
          reactivityTransform: true
        }
      })
  }
}
```

### 仅用 `webpack` + `vue-loader` {#plain-webpack-vue-loader}

- 目前仅单文件组件
- 需要 `vue-loader@>=17.0.0`

```js [webpack.config.js]
module.exports = {
  module: {
    rules: [
      {
        test: /\.vue$/,
        loader: 'vue-loader',
        options: {
          reactivityTransform: true
        }
      }
    ]
  }
}
```
