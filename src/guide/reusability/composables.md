# 组合式函数 {#composables}

<script setup>
import { useMouse } from './mouse'
const { x, y } = useMouse()
</script>

:::tip
本章默认你已了解组合式 API 的基础。若你目前只会选项式 API，请先用左侧边栏上方的切换按钮切到组合式 API，再读[响应性基础](/guide/essentials/reactivity-fundamentals)和[生命周期钩子](/guide/essentials/lifecycle)两章。
:::

## 什么是“组合式函数”？ {#what-is-a-composable}

在 Vue 里，「组合式函数」(Composables) 指用组合式 API 封装、复用**有状态逻辑**的函数。

做前端时，常要把同一段逻辑多处使用。比如在不同页面格式化日期，可以抽一个日期格式化函数。它处理的是**无状态逻辑**：传入参数，马上返回结果。这类工具库很多，例如 [lodash](https://lodash.com/)、[date-fns](https://date-fns.org/)，你可能已经用过。

**有状态逻辑**则管理会随时间变化的状态。典型例子是跟踪鼠标在页面上的位置；实际项目里还可能是触摸手势、数据库连接状态等。

## 鼠标跟踪器示例 {#mouse-tracker-example}

若直接在组件里用组合式 API 做鼠标跟踪，代码大致如下：

```vue [MouseComponent.vue]
<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const x = ref(0)
const y = ref(0)

function update(event) {
  x.value = event.pageX
  y.value = event.pageY
}

onMounted(() => window.addEventListener('mousemove', update))
onUnmounted(() => window.removeEventListener('mousemove', update))
</script>

<template>Mouse position is at: {{ x }}, {{ y }}</template>
```

若要在多个组件里复用同样逻辑，可以把它抽成组合式函数，放到单独文件里：

```js [mouse.js]
import { ref, onMounted, onUnmounted } from 'vue'

// 按照惯例，组合式函数名以“use”开头
export function useMouse() {
  // 被组合式函数封装和管理的状态
  const x = ref(0)
  const y = ref(0)

  // 组合式函数可以随时更改其状态。
  function update(event) {
    x.value = event.pageX
    y.value = event.pageY
  }

  // 一个组合式函数也可以挂靠在所属组件的生命周期上
  // 来启动和卸载副作用
  onMounted(() => window.addEventListener('mousemove', update))
  onUnmounted(() => window.removeEventListener('mousemove', update))

  // 通过返回值暴露所管理的状态
  return { x, y }
}
```

组件里这样用：

```vue [MouseComponent.vue]
<script setup>
import { useMouse } from './mouse.js'

const { x, y } = useMouse()
</script>

<template>Mouse position is at: {{ x }}, {{ y }}</template>
```

<div class="demo">
  Mouse position is at: {{ x }}, {{ y }}
</div>

[在演练场中尝试一下](https://play.vuejs.org/#eNqNkj1rwzAQhv/KocUOGKVzSAIdurVjoQUvJj4XlfgkJNmxMfrvPcmJkkKHLrbu69H7SlrEszFyHFDsxN6drDIeHPrBHGtSvdHWwwKDwzfNHwjQWd1DIbd9jOW3K2qq6aTJxb6pgpl7Dnmg3NS0365YBnLgsTfnxiNHACvUaKe80gTKQeN3sDAIQqjignEhIvKYqMRta1acFVrsKtDEQPLYxuU7cV8Msmg2mdTilIa6gU5p27tYWKKq1c3ENphaPrGFW25+yMXsHWFaFlfiiOSvFIBJjs15QJ5JeWmaL/xYS/Mfpc9YYrPxl52ULOpwhIuiVl9k07Yvsf9VOY+EtizSWfR6xKK6itgkvQ/+fyNs6v4XJXIsPwVL+WprCiL8AEUxw5s=)

可见，核心逻辑没变：只是挪到外部函数里，并返回要暴露的状态。组合式函数里同样能用所有[组合式 API](/api/#composition-api)。这样 `useMouse()` 就能在任意组件里复用。

还可以把多个组合式函数嵌套使用：一个函数里可以调用别的组合式函数。就像用多个小组件拼成应用一样，也能用多个小逻辑单元拼成复杂逻辑。组合式 API 这个名字正是来自这种「组合」方式。

例如，添加和移除 DOM 事件监听器也可以封装成组合式函数：

```js [event.js]
import { onMounted, onUnmounted } from 'vue'

export function useEventListener(target, event, callback) {
  // 如果你想的话，
  // 也可以用字符串形式的 CSS 选择器来寻找目标 DOM 元素
  onMounted(() => target.addEventListener(event, callback))
  onUnmounted(() => target.removeEventListener(event, callback))
}
```

有了它，`useMouse()` 可以写得更短：

```js{2,8-11} [mouse.js]
import { ref } from 'vue'
import { useEventListener } from './event'

export function useMouse() {
  const x = ref(0)
  const y = ref(0)

  useEventListener(window, 'mousemove', (event) => {
    x.value = event.pageX
    y.value = event.pageY
  })

  return { x, y }
}
```

:::tip
每次在某个组件里调用 `useMouse()`，都会得到独立的 `x`、`y`，互不影响。若要在组件之间共享状态，请看[状态管理](/guide/scaling-up/state-management)。
:::

## 异步状态示例 {#async-state-example}

`useMouse()` 没有参数。下面看一个需要传参的例子：异步请求时，通常要区分加载中、成功、失败等状态。

```vue
<script setup>
import { ref } from 'vue'

const data = ref(null)
const error = ref(null)

fetch('...')
  .then((res) => res.json())
  .then((json) => (data.value = json))
  .catch((err) => (error.value = err))
</script>

<template>
  <div v-if="error">Oops! Error encountered: {{ error.message }}</div>
  <div v-else-if="data">
    Data loaded:
    <pre>{{ data }}</pre>
  </div>
  <div v-else>Loading...</div>
</template>
```

每个要拉数据的组件都写一遍会很烦。可以抽成组合式函数：

```js [fetch.js]
import { ref } from 'vue'

export function useFetch(url) {
  const data = ref(null)
  const error = ref(null)

  fetch(url)
    .then((res) => res.json())
    .then((json) => (data.value = json))
    .catch((err) => (error.value = err))

  return { data, error }
}
```

组件里只需：

```vue
<script setup>
import { useFetch } from './fetch.js'

const { data, error } = useFetch('...')
</script>
```

### 接收响应式状态 {#accepting-reactive-state}

上面的 `useFetch()` 只接收固定的 URL 字符串，所以只会请求一次。若 URL 变了要重新请求，就要把响应式状态传进组合式函数，让它根据传入的状态创建侦听器来执行请求。

例如，可以让 `useFetch()` 接收 ref：

```js
const url = ref('/initial-url')

const { data, error } = useFetch(url)

// 这将会重新触发 fetch
url.value = '/new-url'
```

或者接收一个 [getter 函数](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Functions/get#description)：

```js
// 当 props.id 改变时重新 fetch
const { data, error } = useFetch(() => `/posts/${props.id}`)
```

可以用 [`watchEffect()`](/api/reactivity-core.html#watcheffect) 和 [`toValue()`](/api/reactivity-utilities.html#tovalue) 改写实现：

```js{7,12} [fetch.js]
import { ref, watchEffect, toValue } from 'vue'

export function useFetch(url) {
  const data = ref(null)
  const error = ref(null)

  const fetchData = () => {
    // reset state before fetching..
    data.value = null
    error.value = null

    fetch(toValue(url))
      .then((res) => res.json())
      .then((json) => (data.value = json))
      .catch((err) => (error.value = err))
  }

  watchEffect(() => {
    fetchData()
  })

  return { data, error }
}
```

`toValue()` 是 3.3 新增的 API，用来把 ref 或 getter 转成普通值：参数是 ref 就取 `.value`；是函数就执行并返回结果；否则原样返回。用法类似 [`unref()`](/api/reactivity-utilities.html#unref)，但对函数会多执行一步。

注意：`toValue(url)` 要写在 `watchEffect` 回调**里面**，这样规范化时访问到的响应式依赖才会被侦听器收集。

改版后的 `useFetch()` 可接收字符串、ref 或 getter。`watchEffect` 会立刻执行，并跟踪 `toValue(url)` 里用到的依赖。若没有依赖（例如 url 已是字符串），effect 只跑一次；有依赖时，依赖一变就会重新请求。

下面是[更新后的 `useFetch()`](https://play.vuejs.org/#eNp9Vdtu20YQ/ZUpUUA0qpAOjL4YktCbC7Rom8BN8sSHrMihtfZql9iLZEHgv2dml6SpxMiDIWkuZ+acmR2fs1+7rjgEzG6zlaut7Dw49KHbVFruO2M9nMFiu4Ta7LvgsYEeWmv2sKCkxSwoOPwTfb2b/EU5mopHR5GVro12HrbC4UerYA2Lnfeduy3LR2d0p0SNO6MatIU/dbI2DRZUtPSmMa4kgJQuG8qkjvLF28XVaAwRb2wxz69gvZkK/UQ5xUGogBQ/ZpyhEV4sAa01lnpeTwRyApsFWvT2RO6Eea40THBMgfq6NLwlS1/pVZnUJB3ph8c98fNIvwD+MaKBzkQut2xYbYP3RsPhTWvsusokSA0/Vxn8UitZP7GFSX/+8Sz7z1W2OZ9BQt+vypQXS1R+1cgDQciW4iMrimR0wu8270znfoC7SBaJWdAeLTa3QFgxuNijc+IBIy5PPyYOjU19RDEI954/Z/UptKTy6VvqA5XD1AwLTTl/0Aco4s5lV51F5sG+VJJ+v4qxYbmkfiiKYvSvyknPbJnNtoyW+HJpj4Icd22LtV+CN5/ikC4XuNL4HFPaoGsvie3FIqSJp1WIzabl00HxkoyetEVfufhv1kAu3EnX8z0CKEtKofcGzhMb2CItAELL1SPlFMV1pwVj+GROc/vWPoc26oDgdxhfSArlLnbWaBOcOoEzIP3CgbeifqLXLRyICaDBDnVD+3KC7emCSyQ4sifspOx61Hh4Qy/d8BsaOEdkYb1sZS2FoiJKnIC6FbqhsaTVZfk8gDgK6cHLPZowFGUzAQTNWl/BUSrFbzRYHXmSdeAp28RMsI0fyFDaUJg9Spd0SbERZcvZDBRleCPdQMCPh8ARwdRRnBCTjGz5WkT0i0GlSMqixTR6VKyHmmWEHIfV+naSOETyRx8vEYwMv7pa8dJU+hU9Kz2t86ReqjcgaTzCe3oGpEOeD4uyJOcjTXe+obScHwaAi82lo9dC/q/wuyINjrwbuC5uZrS4WAQeyTN9ftOXIVwy537iecoX92kR4q/F1UvqIMsSbq6vo5XF6ekCeEcTauVDFJpuQESvMv53IBXadx3r4KqMrt0w0kwoZY5/R5u3AZejvd5h/fSK/dE9s63K3vN7tQesssnnhX1An9x3//+Hz/R9cu5NExRFf8d5zyIF7jGF/RZ0Q23P4mK3f8XLRmfhg7t79qjdSIobjXLE+Cqju/b7d6i/tHtT3MQ8VrH/Ahstp5A=)（示例里加了延迟和随机错误，方便演示）。

## 约定和最佳实践 {#conventions-and-best-practices}

### 命名 {#naming}

组合式函数一般用驼峰命名，并以 `use` 开头。

### 输入参数 {#input-arguments}

组合式函数可以接收 ref 或 getter 作为参数，即使逻辑本身不依赖它们的响应性。若函数可能给别人用，建议兼容「传 ref/getter」和「传普通值」两种情况，可用 [`toValue()`](/api/reactivity-utilities#tovalue) 统一处理：

```js
import { toValue } from 'vue'

function useFeature(maybeRefOrGetter) {
  // 如果 maybeRefOrGetter 是一个 ref 或 getter，
  // 将返回它的规范化值。
  // 否则原样返回。
  const value = toValue(maybeRefOrGetter)
}
```

若组合式函数在 ref 或 getter 上会创建响应式 effect，要保证依赖能被正确追踪：用 `watch()` 显式监视 ref/getter，或在 `watchEffect()` 里调用 `toValue()`。

[前面的 `useFetch()` 实现](#accepting-reactive-state)就是同时支持 ref、getter 和普通值的例子。

### 返回值 {#return-values}

组合式函数里我们常用 `ref()` 而不是 `reactive()`。推荐始终返回一个**普通对象**（里面放多个 ref），这样在组件里解构后仍能保持响应性：

```js
// x 和 y 是两个 ref
const { x, y } = useMouse()
```

若直接返回 `reactive()` 对象，在组件里解构时会断开与组合式函数内部状态的响应式链接；用 ref 则不会。

若更喜欢用 `mouse.x` 这种属性写法，可以把返回值再包一层 `reactive()`，其中的 ref 会自动解包，例如：

```js
const mouse = reactive(useMouse())
// mouse.x 链接到了原来的 x ref
console.log(mouse.x)
```

```vue-html
Mouse position is at: {{ mouse.x }}, {{ mouse.y }}
```

### 副作用 {#side-effects}

组合式函数里可以执行副作用（例如添加 DOM 监听、发请求），但要注意：

- 若使用[服务端渲染](/guide/scaling-up/ssr) (SSR)，DOM 相关副作用应放在 `onMounted()` 等挂载后才执行的钩子里。这些钩子只在浏览器运行，能保证能访问 DOM。

- 在 `onUnmounted()` 里清理副作用。例如加了事件监听，就要在卸载时移除（`useMouse()` 就是这样）。也可以像 `useEventListener()` 那样，再抽一个组合式函数自动处理。

### 使用限制 {#usage-restrictions}

组合式函数只能在 `<script setup>` 或 `setup()` 里调用，且在这些上下文中只能**同步**调用。有时也可以在 `onMounted()` 等生命周期钩子里调用。

这些限制是为了让 Vue 知道当前是哪个组件实例，从而：

1. 把生命周期钩子挂到该实例上

2. 把计算属性和侦听器挂到该实例上，组件卸载时一并停止，避免内存泄漏

:::tip
`<script setup>` 是唯一在 `await` **之后**还能调用组合式函数的地方。编译器会在异步结束后自动恢复当前组件实例。
:::

## 通过抽取组合式函数改善代码结构 {#extracting-composables-for-code-organization}

抽组合式函数不只是为了复用，也是为了整理代码。组件变复杂后，单文件会很难读。组合式 API 允许你按逻辑块拆成更小的函数：

```vue
<script setup>
import { useFeatureA } from './featureA.js'
import { useFeatureB } from './featureB.js'
import { useFeatureC } from './featureC.js'

const { foo, bar } = useFeatureA()
const { baz } = useFeatureB(foo)
const { qux } = useFeatureC(baz)
</script>
```

可以把这些组合式函数看成组件内部、能互相传参协作的「小服务」。

## 在选项式 API 中使用组合式函数 {#using-composables-in-options-api}

用选项式 API 时，组合式函数要在 `setup()` 里调用，并把返回值从 `setup()` 返回，模板和 `this` 才能用到：

```js
import { useMouse } from './mouse.js'
import { useFetch } from './fetch.js'

export default {
  setup() {
    const { x, y } = useMouse()
    const { data, error } = useFetch('...')
    return { x, y, data, error }
  },
  mounted() {
    // setup() 暴露的属性可以在通过 `this` 访问到
    console.log(this.x)
  }
  // ...其他选项
}
```

## 与其他模式的比较 {#comparisons-with-other-techniques}

### 和 Mixin 的对比 {#vs-mixins}

用过 Vue 2 的话，可能对 [mixins](/api/options-composition#mixins) 很熟悉——它也能把逻辑抽成可复用单元。但 mixin 有三个明显问题：

1. **数据来源不清楚**：多个 mixin 混用时，很难看出某个数据来自哪个 mixin，排查行为也费劲。所以我们推荐组合式函数用 ref + 解构：在使用的组件里一眼能看出每个值从哪来。

2. **命名冲突**：不同作者的 mixin 可能注册同名属性。组合式函数解构时可以重命名，避免键名冲突。

3. **隐式耦合**：多个 mixin 往往靠共享属性名互相配合，耦合很隐蔽。组合式函数则可以把一个的返回值传给另一个，像普通函数一样显式传参。

因此在 Vue 3 中不再推荐 mixin，保留它主要是为了迁移旧项目和照顾老用户。

### 和无渲染组件的对比 {#vs-renderless-components}

插槽一章讲过基于作用域插槽的[无渲染组件](/guide/components/slots#renderless-components)，也曾用它实现同样的鼠标跟踪示例。

组合式函数的主要优势是不会多创建组件实例。无渲染组件在全应用使用时，额外实例会带来可观的性能开销。

纯逻辑复用优先用组合式函数；要同时复用逻辑和视图布局时，再用无渲染组件。

### 和 React Hooks 的对比 {#vs-react-hooks}

有 React 经验的话，会觉得组合式函数很像自定义 React hooks。组合式 API 确实受 React hooks 启发，组合能力也相近。但 Vue 的组合式函数建立在细粒度响应式系统上，与 React hooks 的执行模型本质不同。详见[组合式 API 的常见问题](/guide/extras/composition-api-faq#comparison-with-react-hooks)。

## 延伸阅读 {#further-reading}

- [深入响应性原理](/guide/extras/reactivity-in-depth)：了解响应式系统的底层机制。
- [状态管理](/guide/scaling-up/state-management)：在多个组件间共享状态。
- [测试组合式函数](/guide/scaling-up/testing#testing-composables)：如何为组合式函数写单元测试。
- [VueUse](https://vueuse.org/)：常用的 Vue 组合式函数库，源码也值得阅读。
