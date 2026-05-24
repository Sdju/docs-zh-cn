---
outline: deep
---

<script setup>
import SpreadSheet from './demos/SpreadSheet.vue'
</script>

# 深入响应式系统 {#reactivity-in-depth}

Vue 最标志性的功能之一，是低侵入性的响应式系统。组件状态由响应式 JavaScript 对象组成；一改它们，视图就会自动更新。这让状态管理更简单直观，但了解它如何工作也很重要，能帮你避开常见坑。下面深入 Vue 响应式系统的一些底层细节。

## 什么是响应性 {#what-is-reactivity}

「响应式」这个词很常见，但具体指什么？本质上，它是一种编程范式：用声明式的方式处理变化。最典型的例子之一是 Excel 表格：

<SpreadSheet />

单元格 A2 用公式 `= A0 + A1` 定义（点 A2 可查看或编辑公式），所以结果是 3。若改 A0 或 A1，A2 会自动更新。

JavaScript 默认不是这样。用 JavaScript 写类似逻辑：

```js
let A0 = 1
let A1 = 2
let A2 = A0 + A1

console.log(A2) // 3

A0 = 2
console.log(A2) // 仍然是 3
```

改 `A0` 后，`A2` 不会自动更新。

要在 JavaScript 里实现类似效果，先把会重新计算 `A2` 的代码包进函数：

```js
let A2

function update() {
  A2 = A0 + A1
}
```

先约定几个术语：

- `update()` 会产生**副作用**（简称**作用** effect），因为它会改程序状态。

- `A0`、`A1` 是这次作用的**依赖** (dependency)，因为计算要用到它们。这次作用也可以说是这些依赖的**订阅者** (subscriber)。

我们需要一个「魔法函数」：当 `A0` 或 `A1`（**依赖**）变化时，就调用 `update()`（产生**作用**）。

```js
whenDepsChange(update)
```

`whenDepsChange()` 要做三件事：

1. **追踪读取**：变量被读时记下来。例如算 `A0 + A1` 时，`A0` 和 `A1` 都会被读到。

2. **建立订阅**：若变量在当前运行的副作用里被读取，就把该副作用记为该变量的订阅者。例如 `update()` 执行时访问了 `A0`、`A1`，那第一次跑完后，`update()` 就应成为 `A0`、`A1` 的订阅者。

3. **探测变化**：变量被改时，通知所有订阅它的副作用重新执行。例如给 `A0` 赋新值后，应触发相关副作用。

## Vue 中的响应性是如何工作的 {#how-reactivity-works-in-vue}

无法直接追踪上面例子里的局部变量读写——原生 JavaScript 没有这种机制。**但**可以追踪**对象属性**的读写。

JavaScript 里劫持 property 访问主要有两种方式：[getter](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/get#description) / [setter](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/set#description) 和 [Proxy](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy)。Vue 2 用 getter / setter 是为了兼容旧浏览器；Vue 3 用 Proxy 做响应式对象，getter / setter 主要留给 ref。下面用伪代码说明它们如何工作：

```js{4,9,17,22}
function reactive(obj) {
  return new Proxy(obj, {
    get(target, key) {
      track(target, key)
      return target[key]
    },
    set(target, key, value) {
      target[key] = value
      trigger(target, key)
    }
  })
}

function ref(value) {
  const refObject = {
    get value() {
      track(refObject, 'value')
      return value
    },
    set value(newValue) {
      value = newValue
      trigger(refObject, 'value')
    }
  }
  return refObject
}
```

:::tip
这里和下面的代码片段用最简形式说明核心概念，省略了很多细节和边界情况。
:::

上面代码对应基础章节里 [`reactive()` 的局限性](/guide/essentials/reactivity-fundamentals#limitations-of-reactive)：

- 把响应式对象的属性赋给或解构到本地变量后，访问/改这个变量**不会**再触发源对象上的 get / set 代理，所以不是响应式的。注意：这只影响变量绑定——若变量指向对象等非原始值，改对象本身仍是响应式的。

- `reactive()` 返回的代理用起来像原对象，但用 `===` 仍能区分它们。

`track()` 里会检查当前是否有正在运行的副作用。若有，就找到存该属性所有订阅者的 Set，把当前副作用加进去。

```js
// 这会在一个副作用就要运行之前被设置
// 我们会在后面处理它
let activeEffect

function track(target, key) {
  if (activeEffect) {
    const effects = getSubscribersForProperty(target, key)
    effects.add(activeEffect)
  }
}
```

副作用订阅存在全局的 `WeakMap<target, Map<key, Set<effect>>>` 里。第一次追踪某属性时若没有对应 Set，会在这里新建——`getSubscribersForProperty()` 就干这个（细节略）。

`trigger()` 会再查出该属性的所有订阅副作用，并执行它们：

```js
function trigger(target, key) {
  const effects = getSubscribersForProperty(target, key)
  effects.forEach((effect) => effect())
}
```

回到 `whenDepsChange()`：

```js
function whenDepsChange(update) {
  const effect = () => {
    activeEffect = effect
    update()
    activeEffect = null
  }
  effect()
}
```

它把原来的 `update` 包进副作用函数。跑真正更新前，外层函数会先把自己设为当前活跃副作用，这样更新期间的 `track()` 都能指向它。

至此，我们有了一个能自动追踪依赖、依赖一变就重跑的副作用，叫**响应式副作用**。

Vue 提供 [`watchEffect()`](/api/reactivity-core#watcheffect) 来创建这类副作用，用法和上面的 `whenDepsChange()` 很像。用真实 API 改写例子：

```js
import { ref, watchEffect } from 'vue'

const A0 = ref(0)
const A1 = ref(1)
const A2 = ref()

watchEffect(() => {
  // 追踪 A0 和 A1
  A2.value = A0.value + A1.value
})

// 将触发副作用
A0.value = 2
```

用响应式副作用去改 ref 不是最优做法，用计算属性更直观：

```js
import { ref, computed } from 'vue'

const A0 = ref(0)
const A1 = ref(1)
const A2 = computed(() => A0.value + A1.value)

A0.value = 2
```

内部 `computed` 用响应式副作用管理失效和重算。

响应式副作用最常见的用途？更新 DOM。下面是一个简单的「响应式渲染」：

```js
import { ref, watchEffect } from 'vue'

const count = ref(0)

watchEffect(() => {
  document.body.innerHTML = `Count is: ${count.value}`
})

// 更新 DOM
count.value++
```

这和 Vue 组件同步状态与 DOM 的方式很像：每个组件实例用一个响应式副作用来渲染和更新 DOM。当然 Vue 比 `innerHTML` 高效得多，详见[渲染机制](./rendering-mechanism)。

<div class="options-api">

`ref()`、`computed()`、`watchEffect()` 都属于组合式 API。若你只用选项式 API，要知道组合式 API 更贴近 Vue 底层响应式系统；Vue 3 的选项式 API 就建立在组合式 API 之上。对组件实例 (`this`) 的属性访问会走 getter / setter 追踪，`watch`、`computed` 等选项内部也调用对应的组合式 API。

</div>

## 运行时 vs. 编译时响应性 {#runtime-vs-compile-time-reactivity}

Vue 响应式系统基本是**运行时**的：追踪和触发都在浏览器里完成。好处是不需要构建步骤、边界情况相对少；代价是受 JavaScript 语法限制，需要 ref 这类「值容器」。

有些框架（如 [Svelte](https://svelte.dev/)）用**编译时**响应式绕过限制：分析并转换代码来模拟响应式。编译器可以改 JavaScript 语义——例如自动注入依赖分析、在访问本地变量时触发作用。代价是必须走构建，且相当于造了一种「长得像 JS、编译后不一样」的语言。

Vue 团队曾用实验功能[响应性语法糖](/guide/extras/reactivity-transform)探索过，但因[这些原因](https://github.com/vuejs/rfcs/discussions/369#discussioncomment-5059028)认为不适合放进核心。

## 响应性调试 {#reactivity-debugging}

Vue 能自动追踪依赖，但有时你想确切知道追踪了什么，或是什么触发了组件重渲染。

### 组件调试钩子 {#component-debugging-hooks}

组件渲染时可用 <span class="options-api">`renderTracked`</span><span class="composition-api">`onRenderTracked`</span> 看用了哪些依赖，用 <span class="options-api">`renderTriggered`</span><span class="composition-api">`onRenderTriggered`</span> 看哪个依赖触发了更新。钩子会收到调试事件，内含相关依赖信息。建议在回调里写 `debugger`，在开发者工具里交互查看：

<div class="composition-api">

```vue
<script setup>
import { onRenderTracked, onRenderTriggered } from 'vue'

onRenderTracked((event) => {
  debugger
})

onRenderTriggered((event) => {
  debugger
})
</script>
```

</div>
<div class="options-api">

```js
export default {
  renderTracked(event) {
    debugger
  },
  renderTriggered(event) {
    debugger
  }
}
```

</div>

:::tip
组件调试钩子仅会在开发模式下工作
:::

调试事件对象的类型定义：

<span id="debugger-event"></span>

```ts
type DebuggerEvent = {
  effect: ReactiveEffect
  target: object
  type:
    | TrackOpTypes /* 'get' | 'has' | 'iterate' */
    | TriggerOpTypes /* 'set' | 'add' | 'delete' | 'clear' */
  key: any
  newValue?: any
  oldValue?: any
  oldTarget?: Map<any, any> | Set<any>
}
```

### 计算属性调试 {#computed-debugging}

<!-- TODO options API equivalent -->

`computed()` 可传第二个参数：包含 `onTrack`、`onTrigger` 的对象：

- `onTrack`：响应式属性或 ref 被追踪为依赖时调用。
- `onTrigger`：依赖变更触发重算时调用。

二者格式与组件调试钩子相同，接收[相同格式](#debugger-event)的调试事件：

```js
const plusOne = computed(() => count.value + 1, {
  onTrack(e) {
    // 当 count.value 被追踪为依赖时触发
    debugger
  },
  onTrigger(e) {
    // 当 count.value 被更改时触发
    debugger
  }
})

// 访问 plusOne，会触发 onTrack
console.log(plusOne.value)

// 更改 count.value，应该会触发 onTrigger
count.value++
```

:::tip
计算属性的 `onTrack` 和 `onTrigger` 选项仅会在开发模式下工作。
:::

### 侦听器调试 {#watcher-debugging}

<!-- TODO options API equivalent -->

侦听器也支持 `onTrack`、`onTrigger`，用法类似 `computed()`：

```js
watch(source, callback, {
  onTrack(e) {
    debugger
  },
  onTrigger(e) {
    debugger
  }
})

watchEffect(callback, {
  onTrack(e) {
    debugger
  },
  onTrigger(e) {
    debugger
  }
})
```

:::tip
侦听器的 `onTrack` 和 `onTrigger` 选项仅会在开发模式下工作。
:::

## 与外部状态系统集成 {#integration-with-external-state-systems}

Vue 通过把普通对象深度转成响应式代理实现响应式。有些场景不需要深度转换，和外部状态库集成时甚至要避免（例如对方也用 Proxy）。

常见做法：把外部状态放进 [`shallowRef`](/api/reactivity-advanced#shallowref)。浅层 ref 只有访问 `.value` 本身才算响应式，不关心 `.value` 内部。外部状态变了，就替换整个 `.value` 来触发更新。

### 不可变数据 {#immutable-data}

做撤销/重做时，常要对编辑中的状态做快照。状态树很大时，Vue 的可变响应式不太合适——每次更新都序列化整棵树，CPU 和内存开销都很大。

[不可变数据结构](https://en.wikipedia.org/wiki/Persistent_data_structure)从不改原对象，而是建新对象、复用未变部分。JS 里用法很多，推荐 [Immer](https://immerjs.github.io/immer/) 配 Vue：写法仍像可变数据，底层是不可变的。

用简单组合式函数集成 Immer：

```js
import { produce } from 'immer'
import { shallowRef } from 'vue'

export function useImmer(baseState) {
  const state = shallowRef(baseState)
  const update = (updater) => {
    state.value = produce(state.value, updater)
  }

  return [state, update]
}
```

[在演练场中尝试一下](https://play.vuejs.org/#eNp9VMFu2zAM/RXNl6ZAYnfoTlnSdRt66DBsQ7vtEuXg2YyjRpYEUU5TBPn3UZLtuE1RH2KLfCIfycfsk8/GpNsGkmkyw8IK4xiCa8wVV6I22jq2Zw3CbV2DZQe2srpmZ2km/PmMK8a4KrRCxxbCQY1j1pgyd3DrD0s27++OFh689z/0OOEkTBlPvkNuFfvbAE/Gra/UilzOko0Mh2A+ufcHwd9ij8KtWUjwMsAqlxgjcLU854qrVaMKJ7RiTleVDBRHQpWwO4/xB8xHoRg2v+oyh/MioJepT0ClvTsxhnSUi1LOsthN6iMdCGgkBacTY7NGhjd9ScG2k5W2c56M9rG6ceBPdbOWm1AxO0/a+uiZFjJHpFv7Fj10XhdSFBtyntTJkzaxf/ZtQnYguoFNJkUkmAWGs2xAm47onqT/jPWHxjjYuUkJhba57+yUSaFg4tZWN9X6Y9eIcC8ZJ1FQkzo36QNqRZILQXjroAqnXb+9LQzVD3vtnMFpljXKbKq00HWU3/X7i/QivcxKgS5aUglVXjxNAGvK8KnWZSNJWa0KDoGChzmk3L28jSVcQX1o1d1puwfgOpdSP97BqsfQxhCCK9gFTC+tXu7/coR7R71rxRWXBL2FpHOMOAAeYVGJhBvFL3s+kGKIkW5zSfKfd+RHA2u3gzZEpML9y9JS06YtAq5DLFmOMWXsjkM6rET1YjzUcSMk2J/G1/h8TKGOb8HmV7bdQbqzhmLziv0Bd3Govywg2O1x8Umvua3ARffN/Q/S1sDZDfMN5x2glo3nGGFfGlUS7QEusL0NcxWq+o03OwcKu6Ke/+fwhIb89Y3Sj3Qv0w+9xg7/AWfvyMs=)

### 状态机 {#state-machines}

[状态机](https://en.wikipedia.org/wiki/Finite-state_machine)描述应用所有可能状态，以及状态之间如何转换。简单组件可能用不上，但复杂状态流会更稳、更好管。

[XState](https://xstate.js.org/) 是 JS 里常用的状态机库，集成示例：

```js
import { createMachine, interpret } from 'xstate'
import { shallowRef } from 'vue'

export function useMachine(options) {
  const machine = createMachine(options)
  const state = shallowRef(machine.initialState)
  const service = interpret(machine)
    .onTransition((newState) => (state.value = newState))
    .start()
  const send = (event) => service.send(event)

  return [state, send]
}
```

[在演练场中尝试一下](https://play.vuejs.org/#eNp1U81unDAQfpWRL7DSFqqqUiXEJumhyqVVpDa3ugcKZtcJjC1syEqId8/YBu/uIRcEM9/P/DGz71pn0yhYwUpTD1JbMMKO+o6j7LUaLMwwGvGrqk8SBSzQDqqHJMv7EMleTMIRgGOt0Fj4a2xlxZ5EsPkHhytuOjucbApIrDoeO5HsfQCllVVHUYlVbeW0xr2OKcCzHCwkKQAK3fP56fHx5w/irSyqbfFMgA+h0cKBHZYey45jmYfeqWv6sKLXHbnTF0D5f7RWITzUnaxfD5y5ztIkSCY7zjwKYJ5DyVlf2fokTMrZ5sbZDu6Bs6e25QwK94b0svgKyjwYkEyZR2e2Z2H8n/pK04wV0oL8KEjWJwxncTicnb23C3F2slabIs9H1K/HrFZ9HrIPX7Mv37LPuTC5xEacSfa+V83YEW+bBfleFkuW8QbqQZDEuso9rcOKQQ/CxosIHnQLkWJOVdept9+ijSA6NEJwFGePaUekAdFwr65EaRcxu9BbOKq1JDqnmzIi9oL0RRDu4p1u/ayH9schrhlimGTtOLGnjeJRAJnC56FCQ3SFaYriLWjA4Q7SsPOp6kYnEXMbldKDTW/ssCFgKiaB1kusBWT+rkLYjQiAKhkHvP2j3IqWd5iMQ+M=)

### RxJS {#rxjs}

[RxJS](https://rxjs.dev/) 处理异步事件流。[VueUse](https://vueuse.org/) 的 [`@vueuse/rxjs`](https://vueuse.org/rxjs/readme.html) 可把 RxJS 流接到 Vue 响应式系统。

## 与信号 (signal) 的联系 {#connection-to-signals}

不少框架引入了类似 Vue 组合式 API 里 ref 的响应式基础类型，叫「信号」(signal)：

- [Solid 信号](https://www.solidjs.com/docs/latest/api#createsignal)
- [Angular 信号](https://angular.dev/guide/signals)
- [Preact 信号](https://preactjs.com/guide/v10/signals/)
- [Qwik 信号](https://qwik.builder.io/docs/components/state/#usesignal)

本质上，信号和 Vue 的 ref 一样：访问时追踪依赖，变更时触发副作用的值容器。这类范式在前端并不新，十多年前就有 [Knockout observables](https://knockoutjs.com/documentation/observables.html)、[Meteor Tracker](https://docs.meteor.com/api/tracker.html) 等。Vue 选项式 API 和 React 的 [MobX](https://mobx.js.org/) 也基于同样原则，只是把基础类型藏在对象属性后面。

信号不必和细粒度订阅/更新绑定，但现在常和这类渲染模型一起讨论。Vue 用虚拟 DOM，目前[靠编译器做类似优化](/guide/extras/rendering-mechanism#compiler-informed-virtual-dom)。我们也在探索受 Solid 启发的 [Vapor Mode](https://github.com/vuejs/core-vapor)：更少依赖虚拟 DOM，更多用内置响应式系统。

### API 设计权衡 {#api-design-trade-offs}

Preact、Qwik 的信号和 Vue [shallowRef](/api/reactivity-advanced#shallowref) 很像，都通过 `.value` 改值。下面重点说 Solid 和 Angular。

#### Solid Signals {#solid-signals}

Solid 的 `createSignal()` API 设计强调了读/写隔离。信号通过一个只读的 getter 和另一个单独的 setter 暴露：

```js
const [count, setCount] = createSignal(0)

count() // 访问值
setCount(1) // 更新值
```

`count` 可以只传 getter、不传 setter，这样状态就不会被意外改掉。语法更长，是否值得看项目和个人偏好；喜欢这种风格的话，在 Vue 里很容易仿写：

```js
import { shallowRef, triggerRef } from 'vue'

export function createSignal(value, options) {
  const r = shallowRef(value)
  const get = () => r.value
  const set = (v) => {
    r.value = typeof v === 'function' ? v(r.value) : v
    if (options?.equals === false) triggerRef(r)
  }
  return [get, set]
}
```

[在演练场中尝试一下](https://play.vuejs.org/#eNpdUk1TgzAQ/Ss7uQAjgr12oNXxH+ix9IAYaDQkMV/qMPx3N6G0Uy9Msu/tvn2PTORJqcI7SrakMp1myoKh1qldI9iopLYwQadpa+krG0TLYYZeyxGSojSSs/d7E8vFh0ka0YhOCmPh0EknbB4mPYfTEeqbIelD1oiqXPRQCS+WjoojAW8A1Wmzm1A39KYZzHNVYiUib85aKeCx46z7rBuySqQe6h14uINN1pDIBWACVUcqbGwtl17EqvIiR3LyzwcmcXFuTi3n8vuF9jlYzYaBajxfMsDcomv6E/m9E51luN2NV99yR3OQKkAmgykss+SkMZerxMLEZFZ4oBYJGAA600VEryAaD6CPaJwJKwnr9ldR2WMedV1Dsi6WwB58emZlsAV/zqmH9LzfvqBfruUmNvZ4QN7VearjenP4aHwmWsABt4x/+tiImcx/z27Jqw==)

#### Angular 信号 {#angular-signals}

Angular 正在换掉脏检查，改用自家响应式基础类型。信号 API 大致如下：

```js
const count = signal(0)

count() // 访问值
count.set(1) // 设置值
count.update((v) => v + 1) // 通过前值更新
```

在 Vue 里也可以轻松仿造这个 API：

```js
import { shallowRef } from 'vue'

export function signal(initialValue) {
  const r = shallowRef(initialValue)
  const s = () => r.value
  s.set = (value) => {
    r.value = value
  }
  s.update = (updater) => {
    r.value = updater(r.value)
  }
  return s
}
```

[在演练场中尝试一下](https://play.vuejs.org/#eNp9Ul1v0zAU/SuWX9ZCSRh7m9IKGHuAB0AD8WQJZclt6s2xLX+ESlH+O9d2krbr1Df7nnPu17k9/aR11nmgt7SwleHaEQvO6w2TvNXKONITyxtZihWpVKu9g5oMZGtUS66yvJSNF6V5lyjZk71ikslKSeuQ7qUj61G+eL+cgFr5RwGITAkXiyVZb5IAn2/IB+QWeeoHO8GPg1aL0gH+CCl215u7mJ3bW9L3s3IYihyxifMlFRpJqewL1qN3TknysRK8el4zGjNlXtdYa9GFrjryllwvGY18QrisDLQgXZTnSX8pF64zzD7pDWDghbbI5/Hoip7tFL05eLErhVD/HmB75Edpyd8zc9DUaAbso3TrZeU4tjfawSV3vBR/SuFhSfrQUXLHBMvmKqe8A8siK7lmsi5gAbJhWARiIGD9hM7BIfHSgjGaHljzlDyGF2MEPQs6g5dpcAIm8Xs+2XxODTgUn0xVYdJ5RxPhKOd4gdMsA/rgLEq3vEEHlEQPYrbgaqu5APNDh6KWUTyuZC2jcWvfYswZD6spXu2gen4l/mT3Icboz3AWpgNGZ8yVBttM8P2v77DH9wy2qvYC2RfAB7BK+NBjon32ssa2j3ix26/xsrhsftv7vQNpp6FCo4E5RD6jeE93F0Y/tHuT3URd2OLwHyXleRY=)

和 Vue ref 比，Solid、Angular 的 getter 风格在组件里各有取舍：

- 读值用 `()` 比 `.value` 略省事，写值更啰嗦；
- 没有 ref 解包：处处用 `()` 读值，访问方式一致，原始信号也能直接当 prop 往下传。

哪种风格更好，很大程度因人而异。这里主要是说明不同 API 的相似点和取舍，以及 Vue 很灵活——不必死守现有 API，需要时可以自己封装响应式基础类型。
