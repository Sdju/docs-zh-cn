---
outline: deep
---

# Suspense {#suspense}

:::warning 实验性功能
`<Suspense>` 仍是实验性功能，将来可能调整，API 在稳定前也可能变。
:::

`<Suspense>` 是内置组件，用来统一处理组件树里的异步依赖。可以在上层等下面多个嵌套异步都完成，等待期间显示加载状态。

## 异步依赖 {#async-dependencies}

要理解 `<Suspense>` 解决什么问题，先看这样的组件树：

```
<Suspense>
└─ <Dashboard>
   ├─ <Profile>
   │  └─ <FriendStatus> (组件有异步的 setup())
   └─ <Content>
      ├─ <ActivityFeed> (异步组件)
      └─ <Stats> (异步组件)
```

这棵树里有多层组件，渲染前要先等异步数据。没有 `<Suspense>` 时，每层都要自己处理加载、报错、完成。最坏时页面上会先后出现好几个转圈加载，内容也分批出来。

有了 `<Suspense>`，可以在顶层统一显示「加载中」或失败状态，等整棵子树需要的异步都就绪。

`<Suspense>` 能等的异步依赖有两类：

1. 带异步 `setup()` 的组件（含 `<script setup>` 里顶层 `await` 的组件）。

2. [异步组件](/guide/components/async)。

### `async setup()` {#async-setup}

组合式 API 中组件的 `setup()` 钩子可以是异步的：

```js
export default {
  async setup() {
    const res = await fetch(...)
    const posts = await res.json()
    return {
      posts
    }
  }
}
```

在 `<script setup>` 里写顶层 `await`，组件会自动变成异步依赖：

```vue
<script setup>
const res = await fetch(...)
const posts = await res.json()
</script>

<template>
  {{ posts }}
</template>
```

### 异步组件 {#async-components}

异步组件默认是<strong>suspensible</strong>的：上层有 `<Suspense>` 时，会由它接管加载状态，组件自己的 loading、error、delay、timeout 等选项会被忽略。

设 `suspensible: false` 可以不交给 `Suspense`，由组件自己管加载状态。

## 加载中状态 {#loading-state}

`<Suspense>` 有两个插槽：`#default` 和 `#fallback`。每个插槽只能有**一个**直接子节点。能显示默认内容时就显示 `#default`，否则显示 `#fallback`。

```vue-html
<Suspense>
  <!-- 具有深层异步依赖的组件 -->
  <Dashboard />

  <!-- 在 #fallback 插槽中显示 “正在加载中” -->
  <template #fallback>
    Loading...
  </template>
</Suspense>
```

首次渲染时，`<Suspense>` 先在内存里渲染 `#default` 的内容。若遇到异步依赖，就进入**挂起**，此时显示 `#fallback`。全部异步完成后进入**完成**，显示 `#default`。

若首次渲染没有异步依赖，会直接进入完成状态。

进入完成后，只有 `#default` 的根节点被换掉时才会再次挂起。子树里新增的更深层异步**不会**让 `<Suspense>` 重新挂起。

再次挂起时，不会马上切到 `#fallback`，而是先继续显示旧的 `#default` 内容。可用 `timeout` prop 控制：等待新内容超过 `timeout` 毫秒后，才切到 `#fallback`。`timeout` 为 `0` 时，一换内容就立刻显示 `#fallback`。

## 事件 {#events}

`<Suspense>` 会触发三个事件：`pending`、`resolve`、`fallback`。进入挂起时触发 `pending`；`#default` 拿到新内容时触发 `resolve`；显示 `#fallback` 时触发 `fallback`。

例如，加载新组件时可以在页面上方显示加载指示器。

## 错误处理 {#error-handling}

`<Suspense>` 本身还不处理错误。可在父组件里用 [`errorCaptured`](/api/options-lifecycle#errorcaptured) 或 [`onErrorCaptured()`](/api/composition-api-lifecycle#onerrorcaptured) 捕获异步错误。

## 和其他组件结合 {#combining-with-other-components}

`<Suspense>` 常与 [`<Transition>`](./transition)、[`<KeepAlive>`](./keep-alive) 等一起用，嵌套顺序要对，才能都正常工作。

它们也常和 [Vue Router](https://router.vuejs.org/zh/) 的 `<RouterView>` 搭配。

下面是一种常见嵌套方式；不需要的组件可以删掉：

```vue-html
<RouterView v-slot="{ Component }">
  <template v-if="Component">
    <Transition mode="out-in">
      <KeepAlive>
        <Suspense>
          <!-- 主要内容 -->
          <component :is="Component"></component>

          <!-- 加载中状态 -->
          <template #fallback>
            正在加载...
          </template>
        </Suspense>
      </KeepAlive>
    </Transition>
  </template>
</RouterView>
```

Vue Router 的[懒加载路由](https://router.vuejs.org/zh/guide/advanced/lazy-loading.html)用动态 import，和异步组件不同，目前不会触发 `<Suspense>`。但路由组件下面仍可以有异步子组件，那些子组件可以触发 `<Suspense>`。

## 嵌套使用 {#nested-suspense}

- 仅在 3.3+ 支持

有多个嵌套异步组件时（常见于布局路由），例如：

```vue-html
<Suspense>
  <component :is="DynamicAsyncOuter">
    <component :is="DynamicAsyncInner" />
  </component>
</Suspense>
```

外层 `<Suspense>` 会等子树里所有异步。换 `DynamicAsyncOuter` 时正常等待；但只换 `DynamicAsyncInner` 时，内层会先变成空节点，直到解析完（不会保留旧内容或 `#fallback`）。

可以嵌套 `<Suspense>` 来解决：

```vue-html
<Suspense>
  <component :is="DynamicAsyncOuter">
    <Suspense suspensible> <!-- 像这样 -->
      <component :is="DynamicAsyncInner" />
    </Suspense>
  </component>
</Suspense>
```

不设 `suspensible` 时，内层 `<Suspense>` 会被外层当成同步组件，有自己的 `#fallback`。两个 `Dynamic` 同时变时，可能出现空节点和多次更新，体验不好。

设 `suspensible` 后，异步处理和事件都交给外层 `<Suspense>`，内层只多一道解析边界。

---

**参考**

- [`<Suspense>` API 参考](/api/built-in-components#suspense)
