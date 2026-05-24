# 组合式 API：生命周期钩子 {#composition-api-lifecycle-hooks}

:::info 使用方式注意
本页列出的 API 都应在组件 `setup()` 阶段**同步**调用。详见[指南 - 生命周期钩子](/guide/essentials/lifecycle)。
:::

## onMounted() {#onmounted}

注册回调，在组件挂载完成后执行。

- **类型**

  ```ts
  function onMounted(callback: () => void, target?: ComponentInternalInstance | null): void
  ```

- **详细信息**

  以下情况视为已挂载：

  - 所有同步子组件都已挂载（不含异步组件或 `<Suspense>` 树内组件）。

  - 组件自身 DOM 树已创建并插入父容器。只有根容器在文档中时，才能保证组件 DOM 也在文档中。

  常用于需要访问已渲染 DOM 的副作用，或在[服务端渲染](/guide/scaling-up/ssr)里确保 DOM 相关代码只在客户端执行。

  **服务端渲染期间不会调用此钩子。**

- **示例**

  通过模板引用访问一个元素：

  ```vue
  <script setup>
  import { ref, onMounted } from 'vue'

  const el = ref()

  onMounted(() => {
    el.value // <div>
  })
  </script>

  <template>
    <div ref="el"></div>
  </template>
  ```

## onUpdated() {#onupdated}

注册回调，在组件因响应式状态变化更新 DOM 之后调用。

- **类型**

  ```ts
  function onUpdated(callback: () => void, target?: ComponentInternalInstance | null): void
  ```

- **详细信息**

  父组件的更新钩子在子组件更新钩子之后调用。

  任意 DOM 更新后都会调用此钩子，可能由不同状态变更引起——多个状态变更可能在同一渲染周期批量执行（出于性能考虑）。若要在特定状态变更后访问更新后的 DOM，请用 [nextTick()](/api/general#nexttick)。

  **服务端渲染期间不会调用此钩子。**

  :::warning
  不要在 updated 钩子里改组件状态，可能导致无限更新循环！
  :::

- **示例**

  访问更新后的 DOM

  ```vue
  <script setup>
  import { ref, onUpdated } from 'vue'

  const count = ref(0)

  onUpdated(() => {
    // 文本内容应该与当前的 `count.value` 一致
    console.log(document.getElementById('count').textContent)
  })
  </script>

  <template>
    <button id="count" @click="count++">{{ count }}</button>
  </template>
  ```

## onUnmounted() {#onunmounted}

注册回调，在组件实例卸载之后调用。

- **类型**

  ```ts
  function onUnmounted(callback: () => void, target?: ComponentInternalInstance | null): void
  ```

- **详细信息**

  以下情况视为已卸载：

  - 所有子组件都已卸载。

  - 所有相关响应式作用（渲染作用以及 `setup()` 里创建的计算属性和侦听器）都已停止。

  可在此手动清理副作用，例如计时器、DOM 事件监听或服务器连接。

  **服务端渲染期间不会调用此钩子。**

- **示例**

  ```vue
  <script setup>
  import { onMounted, onUnmounted } from 'vue'

  let intervalId
  onMounted(() => {
    intervalId = setInterval(() => {
      // ...
    })
  })

  onUnmounted(() => clearInterval(intervalId))
  </script>
  ```

## onBeforeMount() {#onbeforemount}

注册钩子，在组件挂载之前调用。

- **类型**

  ```ts
  function onBeforeMount(callback: () => void, target?: ComponentInternalInstance | null): void
  ```

- **详细信息**

  调用时组件已完成响应式状态设置，但尚未创建 DOM 节点，即将首次渲染 DOM。

  **服务端渲染期间不会调用此钩子。**

## onBeforeUpdate() {#onbeforeupdate}

注册钩子，在组件因响应式状态变化即将更新 DOM 之前调用。

- **类型**

  ```ts
  function onBeforeUpdate(callback: () => void, target?: ComponentInternalInstance | null): void
  ```

- **详细信息**

  可在 Vue 更新 DOM 前访问 DOM 状态，在此钩子中改状态也是安全的。

  **服务端渲染期间不会调用此钩子。**

## onBeforeUnmount() {#onbeforeunmount}

注册钩子，在组件实例卸载之前调用。

- **类型**

  ```ts
  function onBeforeUnmount(callback: () => void, target?: ComponentInternalInstance | null): void
  ```

- **详细信息**

  调用时组件实例仍具备全部功能。

  **服务端渲染期间不会调用此钩子。**

## onErrorCaptured() {#onerrorcaptured}

注册钩子，在捕获到后代组件传递的错误时调用。

- **类型**

  ```ts
  function onErrorCaptured(callback: ErrorCapturedHook): void

  type ErrorCapturedHook = (
    err: unknown,
    instance: ComponentPublicInstance | null,
    info: string
  ) => boolean | void
  ```

- **详细信息**

  可捕获以下来源的错误：

  - 组件渲染
  - 事件处理器
  - 生命周期钩子
  - `setup()` 函数
  - 侦听器
  - 自定义指令钩子
  - 过渡钩子

  钩子接收三个参数：错误对象、触发错误的组件实例，以及说明错误来源的字符串。

  :::tip
  生产环境中，第三个参数 (`info`) 是缩短的错误代码，不是完整字符串。代码与说明的对应关系见[生产环境错误代码参考](/error-reference/#runtime-errors)。
  :::

  可在 `onErrorCaptured()` 里改组件状态，向用户显示错误界面。注意不要让错误状态再次渲染出导致错误的内容，否则可能无限循环。

  返回 `false` 可阻止错误继续向上传递。详见下方规则。

  **错误传递规则**

  - 默认情况下，所有错误都会发送到应用级 [`app.config.errorHandler`](/api/application#app-config-errorhandler)（若已定义），便于统一上报。

  - 若继承链或组件链上有多个 `errorCaptured` 钩子，同一错误会按从底到上的顺序依次调用，类似 DOM 事件冒泡。

  - 若 `errorCaptured` 钩子自身抛出错误，该错误和原错误都会发送到 `app.config.errorHandler`。

  - `errorCaptured` 返回 `false` 可阻止错误继续向上传递，表示「已处理，应忽略」，其他 `errorCaptured` 钩子和 `app.config.errorHandler` 不会再因该错误被调用。

## onRenderTracked() <sup class="vt-badge dev-only" /> {#onrendertracked}

注册调试钩子，在组件渲染过程中追踪到响应式依赖时调用。

**仅在开发模式可用，服务端渲染期间不会调用。**

- **类型**

  ```ts
  function onRenderTracked(callback: DebuggerHook): void

  type DebuggerHook = (e: DebuggerEvent) => void

  type DebuggerEvent = {
    effect: ReactiveEffect
    target: object
    type: TrackOpTypes /* 'get' | 'has' | 'iterate' */
    key: any
  }
  ```

- **参考**[深入响应式系统](/guide/extras/reactivity-in-depth)

## onRenderTriggered() <sup class="vt-badge dev-only" /> {#onrendertriggered}

注册调试钩子，在响应式依赖变化触发组件渲染时调用。

**仅在开发模式可用，服务端渲染期间不会调用。**

- **类型**

  ```ts
  function onRenderTriggered(callback: DebuggerHook): void

  type DebuggerHook = (e: DebuggerEvent) => void

  type DebuggerEvent = {
    effect: ReactiveEffect
    target: object
    type: TriggerOpTypes /* 'set' | 'add' | 'delete' | 'clear' */
    key: any
    newValue?: any
    oldValue?: any
    oldTarget?: Map<any, any> | Set<any>
  }
  ```

- **参考**[深入响应式系统](/guide/extras/reactivity-in-depth)

## onActivated() {#onactivated}

注册回调：若组件是 [`<KeepAlive>`](/api/built-in-components#keepalive) 缓存树的一部分，在组件插入 DOM 时调用。

**服务端渲染期间不会调用。**

- **类型**

  ```ts
  function onActivated(callback: () => void, target?: ComponentInternalInstance | null): void
  ```

- **参考**[指南 - 缓存实例的生命周期](/guide/built-ins/keep-alive#lifecycle-of-cached-instance)

## onDeactivated() {#ondeactivated}

注册回调：若组件是 [`<KeepAlive>`](/api/built-in-components#keepalive) 缓存树的一部分，在组件从 DOM 移除时调用。

**服务端渲染期间不会调用。**

- **类型**

  ```ts
  function onDeactivated(callback: () => void, target?: ComponentInternalInstance | null): void
  ```

- **参考**[指南 - 缓存实例的生命周期](/guide/built-ins/keep-alive#lifecycle-of-cached-instance)

## onServerPrefetch() <sup class="vt-badge" data-text="SSR only" /> {#onserverprefetch}

注册异步函数，在组件于服务端渲染之前调用。

- **类型**

  ```ts
  function onServerPrefetch(callback: () => Promise<any>): void
  ```

- **详细信息**

  若钩子返回 Promise，服务端渲染会等 Promise 完成后再渲染该组件。

  只在服务端渲染中执行，可用于只在服务端抓取数据。

- **示例**

  ```vue
  <script setup>
  import { ref, onServerPrefetch, onMounted } from 'vue'

  const data = ref(null)

  onServerPrefetch(async () => {
    // 组件作为初始请求的一部分被渲染
    // 在服务器上预抓取数据，因为它比在客户端上更快。
    data.value = await fetchOnServer(/* ... */)
  })

  onMounted(async () => {
    if (!data.value) {
      // 如果数据在挂载时为空值，这意味着该组件
      // 是在客户端动态渲染的。将转而执行
      // 另一个客户端侧的抓取请求
      data.value = await fetchOnClient(/* ... */)
    }
  })
  </script>
  ```

- **参考**[服务端渲染](/guide/scaling-up/ssr)
