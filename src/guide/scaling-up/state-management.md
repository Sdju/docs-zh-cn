# 状态管理 {#state-management}

## 什么是状态管理？ {#what-is-state-management}

每个 Vue 组件实例本来就在管理自己的响应式状态。看一个简单的计数器：

<div class="composition-api">

```vue
<script setup>
import { ref } from 'vue'

// 状态
const count = ref(0)

// 动作
function increment() {
  count.value++
}
</script>

<!-- 视图 -->
<template>{{ count }}</template>
```

</div>
<div class="options-api">

```vue
<script>
export default {
  // 状态
  data() {
    return {
      count: 0
    }
  },
  // 动作
  methods: {
    increment() {
      this.count++
    }
  }
}
</script>

<!-- 视图 -->
<template>{{ count }}</template>
```

</div>

这个组件可以分成三部分：

- **状态**：驱动应用的数据
- **视图**：用声明式方式展示状态
- **交互**：用户操作视图，从而改变状态

“单向数据流”可以概括成下图：

<p style="text-align: center">
  <img alt="state flow diagram" src="./images/state-flow.png" width="252px" style="margin: 40px auto">
</p>

但当**多个组件要共享同一份状态**时，事情会变复杂：

1. 多个视图可能依赖同一份状态
2. 不同视图里的操作也可能要改同一份状态

**情况 1**：可以把共享状态“提升”到共同祖先，再用 props 往下传。组件树很深时，代码会很快变乱，还会出现 [Prop 逐级透传](/guide/components/provide-inject#prop-drilling) 问题。

**情况 2**：有人会用模板 ref 拿父/子实例，或用事件去同步多份状态副本。这些做法都不稳，后期很难维护。

更直接的做法：把共享状态抽出来，放到一个全局单例里。整棵组件树就像一个大“视图”，任意组件都能读状态或触发更新。

## 用响应式 API 做简单状态管理 {#simple-state-management-with-reactivity-api}

<div class="options-api">

在选项式 API 里，响应用 `data()` 声明。内部会用 [`reactive()`](/api/reactivity-core#reactive) 把 `data()` 的返回值变成响应式对象。

</div>

如果要在多个组件之间共享状态，可以用 [`reactive()`](/api/reactivity-core#reactive) 创建一个响应式对象，并在多个组件里导入：

```js [store.js]
import { reactive } from 'vue'

export const store = reactive({
  count: 0
})
```

<div class="composition-api">

```vue [ComponentA.vue]
<script setup>
import { store } from './store.js'
</script>

<template>From A: {{ store.count }}</template>
```

```vue [ComponentB.vue]
<script setup>
import { store } from './store.js'
</script>

<template>From B: {{ store.count }}</template>
```

</div>
<div class="options-api">

```vue [ComponentA.vue]
<script>
import { store } from './store.js'

export default {
  data() {
    return {
      store
    }
  }
}
</script>

<template>From A: {{ store.count }}</template>
```

```vue [ComponentB.vue]
<script>
import { store } from './store.js'

export default {
  data() {
    return {
      store
    }
  }
}
</script>

<template>From B: {{ store.count }}</template>
```

</div>

`store` 一变，`<ComponentA>` 和 `<ComponentB>` 的视图都会更新。数据源变成了一份。

但这也意味着：任何导入 `store` 的组件都能直接改它：

```vue-html{2}
<template>
  <button @click="store.count++">
    From B: {{ store.count }}
  </button>
</template>
```

小项目也许还能接受，但长期维护时，全局状态谁都能改并不理想。更好的做法是：在 store 上定义方法，用名字表达“要做什么”：

```js{5-7} [store.js]
import { reactive } from 'vue'

export const store = reactive({
  count: 0,
  increment() {
    this.count++
  }
})
```

```vue-html{2}
<template>
  <button @click="store.increment()">
    From B: {{ store.count }}
  </button>
</template>
```

<div class="composition-api">

[在演练场中尝试一下](https://play.vuejs.org/#eNrNkk1uwyAQha8yYpNEiUzXllPVrtRTeJNSqtLGgGBsVbK4ewdwnT9FWWSTFczwmPc+xMhqa4uhl6xklRdOWQQvsbfPrVadNQ7h1dCqpcYaPp3pYFHwQyteXVxKm0tpM0krnm3IgAqUnd3vUFIFUB1Z8bNOkzoVny+wDTuNcZ1gBI/GSQhzqlQX3/5Gng81pA1t33tEo+FF7JX42bYsT1BaONlRguWqZZMU4C261CWMk3EhTK8RQphm8Twse/BscoUsvdqDkTX3kP3nI6aZwcmdQDUcMPJPabX8TQphtCf0RLqd1csxuqQAJTxtYnEUGtIpAH4pn1Ou17FDScOKhT+QNAVM)

</div>
<div class="options-api">

[在演练场中尝试一下](https://play.vuejs.org/#eNrdU8FqhDAU/JVHLruyi+lZ3FIt9Cu82JilaTWR5CkF8d8bE5O1u1so9FYQzAyTvJnRTKTo+3QcOMlIbpgWPT5WUnS90gjPyr4ll1jAWasOdim9UMum3a20vJWWqxSgkvzTyRt+rocWYVpYFoQm8wRsJh+viHLBcyXtk9No2ALkXd/WyC0CyDfW6RVTOiancQM5ku+x7nUxgUGlOcwxn8Ppu7HJ7udqaqz3SYikOQ5aBgT+OA9slt9kasToFnb5OiAqCU+sFezjVBHvRUimeWdT7JOKrFKAl8VvYatdI6RMDRJhdlPtWdQf5mdQP+SHdtyX/IftlH9pJyS1vcQ2NK8ZivFSiL8BsQmmpMG1s1NU79frYA1k8OD+/I3pUA6+CeNdHg6hmoTMX9pPSnk=)

</div>

:::tip
这里的点击处理用了 `store.increment()`，并带括号。它不是组件 methods 里的方法，调用时要保证 `this` 指向 store。
:::

除了用单个 `reactive` 对象当 store，你还可以用 `ref()`、`computed()`，或通过[组合式函数](/guide/reusability/composables)返回全局状态：

```js
import { ref } from 'vue'

// 全局状态，创建在模块作用域下
const globalCount = ref(1)

export function useCount() {
  // 局部状态，每个组件都会创建
  const localCount = ref(1)

  return {
    globalCount,
    localCount
  }
}
```

Vue 的响应式系统和组件层是解耦的，所以用法很灵活。

## SSR 相关细节 {#ssr-considerations}

如果要做[服务端渲染 (SSR)](./ssr)，store 作为跨请求共享的单例可能出问题。详见 SSR 章节里的[跨请求状态污染](./ssr#cross-request-state-pollution)。

## Pinia {#pinia}

上面的手写方案适合简单场景。大型项目通常还要考虑：

- 团队协作约定
- 与 Vue DevTools 集成（时间轴、组件检查、时间旅行调试）
- 模块热更新 (HMR)
- 服务端渲染支持

[Pinia](https://pinia.vuejs.org/zh/) 由 Vue 核心团队维护，满足这些需求，支持 Vue 2 和 Vue 3。

老项目可能更熟悉 [Vuex](https://vuex.vuejs.org/zh/)——Vue 之前的官方状态库。Pinia 能承担同样职责且体验更好，Vuex 已进入维护模式：仍可用，但不再加新功能。新项目建议用 Pinia。

Pinia 最初是为了探索 Vuex 5，吸收了很多团队对下一代 Vuex 的想法。后来发现 Pinia 已经覆盖了大部分目标，于是成为新的官方推荐。

相比 Vuex，Pinia API 更直接，支持组合式风格，TypeScript 类型推导也更完善。
