# 生命周期选项 {#options-lifecycle}

:::info 参考
生命周期钩子的通用用法，请看[指南 - 生命周期钩子](/guide/essentials/lifecycle)
:::

## beforeCreate {#beforecreate}

组件实例初始化完成后立即调用。

- **类型**

  ```ts
  interface ComponentOptions {
    beforeCreate?(this: ComponentPublicInstance): void
  }
  ```

- **详细信息**

  实例初始化完成、props 解析后立即调用。

  接着 props 会变成响应式属性，`data()` 和 `computed` 等选项也开始处理。

  注意：组合式 API 的 `setup()` 会在所有选项式 API 钩子之前调用，`beforeCreate()` 也一样。

## created {#created}

组件处理完所有与状态相关的选项后调用。

- **类型**

  ```ts
  interface ComponentOptions {
    created?(this: ComponentPublicInstance): void
  }
  ```

- **详细信息**

  调用时，响应式数据、计算属性、方法和侦听器都已就绪。但挂载还没开始，`$el` 还不可用。

## beforeMount {#beforemount}

组件挂载之前调用。

- **类型**

  ```ts
  interface ComponentOptions {
    beforeMount?(this: ComponentPublicInstance): void
  }
  ```

- **详细信息**

  调用时，响应式状态已设置好，但 DOM 节点还没创建，即将首次渲染 DOM。

  **服务端渲染时不会调用。**

## mounted {#mounted}

组件挂载之后调用。

- **类型**

  ```ts
  interface ComponentOptions {
    mounted?(this: ComponentPublicInstance): void
  }
  ```

- **详细信息**

  满足以下条件时，组件视为已挂载：

  - 所有同步子组件都已挂载（不含异步组件或 `<Suspense>` 树内的组件）

  - 自身 DOM 树已创建并插入父容器。注意：只有根容器在文档中时，才能保证组件 DOM 树也在文档中。

  常用于需要访问已渲染 DOM 的副作用，或在 [SSR](/guide/scaling-up/ssr) 中确保 DOM 相关代码只在客户端执行。

  **服务端渲染时不会调用。**

## beforeUpdate {#beforeupdate}

响应式状态变更导致 DOM 更新之前调用。

- **类型**

  ```ts
  interface ComponentOptions {
    beforeUpdate?(this: ComponentPublicInstance): void
  }
  ```

- **详细信息**

  可以在 Vue 更新 DOM 前访问 DOM 状态。在这个钩子里改状态也是安全的。

  **服务端渲染时不会调用。**

## updated {#updated}

响应式状态变更导致 DOM 更新之后调用。

- **类型**

  ```ts
  interface ComponentOptions {
    updated?(this: ComponentPublicInstance): void
  }
  ```

- **详细信息**

  父组件的 updated 钩子在子组件之后调用。

  任意 DOM 更新后都会调用，可能由不同状态变更引起。如果要在特定状态变更后访问更新后的 DOM，用 [nextTick()](/api/general#nexttick)。

  **服务端渲染时不会调用。**

  :::warning
  不要在 updated 钩子里改组件状态，可能导致无限更新循环！
  :::

## beforeUnmount {#beforeunmount}

组件实例卸载之前调用。

- **类型**

  ```ts
  interface ComponentOptions {
    beforeUnmount?(this: ComponentPublicInstance): void
  }
  ```

- **详细信息**

  调用时，组件实例仍保留全部功能。

  **服务端渲染时不会调用。**

## unmounted {#unmounted}

组件实例卸载之后调用。

- **类型**

  ```ts
  interface ComponentOptions {
    unmounted?(this: ComponentPublicInstance): void
  }
  ```

- **详细信息**

  满足以下条件时，组件视为已卸载：

  - 所有子组件都已卸载

  - 所有相关响应式作用（渲染作用以及 `setup()` 时创建的计算属性和侦听器）都已停止

  可以在这里手动清理副作用，比如计时器、DOM 事件监听器或服务器连接。

  **服务端渲染时不会调用。**

## errorCaptured {#errorcaptured}

捕获到后代组件传递的错误时调用。

- **类型**

  ```ts
  interface ComponentOptions {
    errorCaptured?(
      this: ComponentPublicInstance,
      err: unknown,
      instance: ComponentPublicInstance | null,
      info: string
    ): boolean | void
  }
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

  三个参数：错误对象、触发错误的组件实例、说明错误来源的字符串。

  :::tip
  生产环境中，第三个参数 (`info`) 是缩短的错误代码，不是完整字符串。映射见[生产环境错误代码参考](/error-reference/#runtime-errors)。
  :::

  可以在 `errorCaptured()` 中改组件状态，向用户显示错误。但不要渲染导致本次错误的内容，否则可能无限循环。

  返回 `false` 可阻止错误继续向上传递。详见下方规则。

  **错误传递规则**

  - 默认所有错误都会发送到应用级 [`app.config.errorHandler`](/api/application#app-config-errorhandler)（如果已定义），方便统一上报。

  - 继承链或组件链上有多个 `errorCaptured` 钩子时，同一错误会按从底到上的顺序依次调用，类似 DOM 事件冒泡。

  - 如果 `errorCaptured` 钩子本身抛出错误，该错误和原错误都会发送到 `app.config.errorHandler`。

  - 返回 `false` 表示错误已处理、应忽略，会阻止其他 `errorCaptured` 钩子或 `app.config.errorHandler` 因该错误被调用。

  **错误捕获注意事项**

  - 使用异步 `setup()`（顶层 `await`）的组件，即使 `setup()` 抛出错误，Vue 仍会尝试渲染模板。渲染时可能访问失败上下文中不存在的属性，导致更多错误。捕获这类错误时，要同时准备捕获异步 `setup()` 和渲染过程的错误。

  - <sup class="vt-badge" data-text="SSR only"></sup>在 `<Suspense>` 的父组件中替换出错的子组件，会导致 SSR 激活不匹配。更好的做法：把可能出错的逻辑从子组件 `setup()` 抽成独立函数，在父组件 `setup()` 里 `try/catch`，再按需渲染子组件。

## renderTracked <sup class="vt-badge dev-only" /> {#rendertracked}

组件渲染作用追踪到响应式依赖后调用。

**仅在开发模式可用，服务端渲染时不调用。**

- **类型**

  ```ts
  interface ComponentOptions {
    renderTracked?(this: ComponentPublicInstance, e: DebuggerEvent): void
  }

  type DebuggerEvent = {
    effect: ReactiveEffect
    target: object
    type: TrackOpTypes /* 'get' | 'has' | 'iterate' */
    key: any
  }
  ```

- **参考**[深入响应式系统](/guide/extras/reactivity-in-depth)

## renderTriggered <sup class="vt-badge dev-only" /> {#rendertriggered}

响应式依赖触发组件重新渲染后调用。

**仅在开发模式可用，服务端渲染时不调用。**

- **类型**

  ```ts
  interface ComponentOptions {
    renderTriggered?(this: ComponentPublicInstance, e: DebuggerEvent): void
  }

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

## activated {#activated}

若组件是 [`<KeepAlive>`](/api/built-in-components#keepalive) 缓存树的一部分，插入 DOM 时调用。

**服务端渲染时不会调用。**

- **类型**

  ```ts
  interface ComponentOptions {
    activated?(this: ComponentPublicInstance): void
  }
  ```

- **参考**[指南 - 被缓存实例的生命周期](/guide/built-ins/keep-alive#lifecycle-of-cached-instance)

## deactivated {#deactivated}

若组件是 [`<KeepAlive>`](/api/built-in-components#keepalive) 缓存树的一部分，从 DOM 移除时调用。

**服务端渲染时不会调用。**

- **类型**

  ```ts
  interface ComponentOptions {
    deactivated?(this: ComponentPublicInstance): void
  }
  ```

- **参考**[指南 - 被缓存实例的生命周期](/guide/built-ins/keep-alive#lifecycle-of-cached-instance)

## serverPrefetch <sup class="vt-badge" data-text="SSR only" /> {#serverprefetch}

组件在服务端渲染前需要完成的异步函数。

- **类型**

  ```ts
  interface ComponentOptions {
    serverPrefetch?(this: ComponentPublicInstance): Promise<any>
  }
  ```

- **详细信息**

  如果返回 Promise，服务端渲染会等 Promise 完成后再渲染该组件。

  只在服务端渲染中执行，可用于只在服务端做的数据抓取。

- **示例**

  ```js
  export default {
    data() {
      return {
        data: null
      }
    },
    async serverPrefetch() {
      // 组件会作为初次请求的一部分被渲染
      // 会在服务端预抓取数据，因为这比客户端更快
      this.data = await fetchOnServer(/* ... */)
    },
    async mounted() {
      if (!this.data) {
        // 如果数据在挂载时是 null，这意味着这个组件
        // 是在客户端动态渲染的，请另外执行一个
        // 客户端请求作为替代
        this.data = await fetchOnClient(/* ... */)
      }
    }
  }
  ```

- **参考**[服务端渲染](/guide/scaling-up/ssr)
