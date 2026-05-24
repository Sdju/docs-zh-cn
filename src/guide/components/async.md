# 异步组件 {#async-components}

## 基本用法 {#basic-usage}

大型项目里，可以把应用拆成更小的块，需要时再从服务器加载组件。Vue 提供 [`defineAsyncComponent`](/api/general#defineasynccomponent) 来实现：

```js
import { defineAsyncComponent } from 'vue'

const AsyncComp = defineAsyncComponent(() => {
  return new Promise((resolve, reject) => {
    // ...从服务器获取组件
    resolve(/* 获取到的组件 */)
  })
})
// ... 像使用其他一般组件一样使用 `AsyncComp`
```

`defineAsyncComponent` 接收一个返回 Promise 的加载函数。拿到组件定义后，应调用 Promise 的 `resolve`。加载失败可调用 `reject(reason)`。

[ES 模块动态导入](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/import) 也返回 Promise，所以常和 `defineAsyncComponent` 一起用。Vite、Webpack 等构建工具支持这种写法（并会作为代码分割点），也可用来导入 Vue 单文件组件：

```js
import { defineAsyncComponent } from 'vue'

const AsyncComp = defineAsyncComponent(() =>
  import('./components/MyComponent.vue')
)
```

得到的 `AsyncComp` 是外层包装组件：只有需要渲染时，才会执行加载内部组件的函数。它会把收到的 props 和插槽传给内部组件，因此可以用异步包装组件替换原组件，同时实现按需加载。

和普通组件一样，异步组件可以用 `app.component()` [全局注册](/guide/components/registration#global-registration)：

```js
app.component('MyComponent', defineAsyncComponent(() =>
  import('./components/MyComponent.vue')
))
```

<div class="options-api">

也可以在[局部注册](/guide/components/registration#local-registration)时使用 `defineAsyncComponent`：

```vue
<script>
import { defineAsyncComponent } from 'vue'

export default {
  components: {
    AdminPage: defineAsyncComponent(() =>
      import('./components/AdminPageComponent.vue')
    )
  }
}
</script>

<template>
  <AdminPage />
</template>
```

</div>

<div class="composition-api">

也可以在父组件里直接定义：

```vue
<script setup>
import { defineAsyncComponent } from 'vue'

const AdminPage = defineAsyncComponent(() =>
  import('./components/AdminPageComponent.vue')
)
</script>

<template>
  <AdminPage />
</template>
```

</div>

## 加载与错误状态 {#loading-and-error-states}

异步加载难免有加载中和失败状态，`defineAsyncComponent()` 的高级选项可以处理这些状态：

```js
const AsyncComp = defineAsyncComponent({
  // 加载函数
  loader: () => import('./Foo.vue'),

  // 加载异步组件时使用的组件
  loadingComponent: LoadingComponent,
  // 展示加载组件前的延迟时间，默认为 200ms
  delay: 200,

  // 加载失败后展示的组件
  errorComponent: ErrorComponent,
  // 如果提供了一个 timeout 时间限制，并超时了
  // 也会显示这里配置的报错组件，默认值是：Infinity
  timeout: 3000
})
```

如果提供了 loading 组件，会在内部组件加载期间先显示它。默认有 200ms 延迟再显示 loading 组件——网络快时，加载和切换太快可能闪烁，略延迟体验更好。

如果提供了 error 组件，加载函数返回的 Promise 失败时会渲染它。还可以设置 `timeout`，超时也会显示 error 组件。

## 惰性激活 <sup class="vt-badge" data-text="3.5+" /> {#lazy-hydration}

> 只有在使用[服务端渲染](/guide/scaling-up/ssr)时，本节才适用。

Vue 3.5+ 中，异步组件可以通过激活策略控制何时 hydrate。

- Vue 提供若干内置激活策略，需分别导入，未使用时可 tree-shake。

- 设计保持在底层，保证灵活。以后可以在其上增加编译器语法糖，或在 Nuxt 等上层方案中实现。

### 在空闲时进行激活 {#hydrate-on-idle}

通过 `requestIdleCallback` 激活：

```js
import { defineAsyncComponent, hydrateOnIdle } from 'vue'

const AsyncComp = defineAsyncComponent({
  loader: () => import('./Comp.vue'),
  hydrate: hydrateOnIdle(/* 传递可选的最大超时 */)
})
```

### 在可见时激活 {#hydrate-on-visible}

元素进入视口时，通过 `IntersectionObserver` 激活。

```js
import { defineAsyncComponent, hydrateOnVisible } from 'vue'

const AsyncComp = defineAsyncComponent({
  loader: () => import('./Comp.vue'),
  hydrate: hydrateOnVisible()
})
```

可传入侦听器选项：

```js
hydrateOnVisible({ rootMargin: '100px' })
```

### 在媒体查询匹配时进行激活 {#hydrate-on-media-query}

指定媒体查询匹配时激活。

```js
import { defineAsyncComponent, hydrateOnMediaQuery } from 'vue'

const AsyncComp = defineAsyncComponent({
  loader: () => import('./Comp.vue'),
  hydrate: hydrateOnMediaQuery('(max-width:500px)')
})
```

### 交互时激活 {#hydrate-on-interaction}

在组件元素上触发指定事件时激活。激活完成后，触发激活的事件会重放。

```js
import { defineAsyncComponent, hydrateOnInteraction } from 'vue'

const AsyncComp = defineAsyncComponent({
  loader: () => import('./Comp.vue'),
  hydrate: hydrateOnInteraction('click')
})
```

也可以是多个事件类型：

```js
hydrateOnInteraction(['wheel', 'mouseover'])
```

### 自定义策略 {#custom-strategy}

```ts
import { defineAsyncComponent, type HydrationStrategy } from 'vue'

const myStrategy: HydrationStrategy = (hydrate, forEachElement) => {
  // forEachElement 是一个遍历组件未激活的 DOM 中所有根元素的辅助函数，
  // 因为根元素可能是一个片段而非单个元素
  forEachElement(el => {
    // ...
  })
  // 准备好时调用 `hydrate`
  hydrate()
  return () => {
    // 如必要，返回一个销毁函数
  }
}

const AsyncComp = defineAsyncComponent({
  loader: () => import('./Comp.vue'),
  hydrate: myStrategy
})
```

## 搭配 Suspense 使用 {#using-with-suspense}

异步组件可以和内置的 `<Suspense>` 一起用。关于 `<Suspense>` 与异步组件的交互，见 [`<Suspense>`](/guide/built-ins/suspense) 章节。
