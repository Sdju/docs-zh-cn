# 组件实例 {#component-instance}

:::info
本页描述组件公共实例（即 `this`）上暴露的内置属性和方法。

除 `$data` 下的嵌套属性外，本页所有属性都是只读的。
:::

## $data {#data}

[`data`](./options-state#data) 选项函数返回的对象，会被组件设为响应式。组件实例会代理对其数据对象属性的访问。

- **类型**

  ```ts
  interface ComponentPublicInstance {
    $data: object
  }
  ```

## $props {#props}

组件当前已解析的 props 对象。

- **类型**

  ```ts
  interface ComponentPublicInstance {
    $props: object
  }
  ```

- **详细信息**

  只包含通过 [`props`](./options-state#props) 声明的 props。组件实例会代理对其 props 对象属性的访问。

## $el {#el}

组件实例管理的 DOM 根节点。

- **类型**

  ```ts
  interface ComponentPublicInstance {
    $el: any
  }
  ```

- **详细信息**

  组件[挂载完成 (mounted)](./options-lifecycle#mounted) 之前，`$el` 为 `undefined`。

  - 单根元素组件：`$el` 指向根元素
  - 以文本节点为根的组件：`$el` 指向该文本节点
  - 多根元素组件：`$el` 是占位 DOM 节点，Vue 用它跟踪组件在 DOM 中的位置（文本节点或 SSR 激活时的注释节点）

  :::tip
  为保持一致，推荐用[模板引用](/guide/essentials/template-refs)直接访问元素，而不是依赖 `$el`。
  :::

## $options {#options}

实例化当前组件时使用的已解析组件选项。

- **类型**

  ```ts
  interface ComponentPublicInstance {
    $options: ComponentOptions
  }
  ```

- **详细信息**

  `$options` 暴露当前组件的已解析选项，可能是以下来源的合并结果：

  - 全局 mixin
  - 组件 `extends` 的基组件
  - 组件级 mixin

  常用于支持自定义组件选项：

  ```js
  const app = createApp({
    customOption: 'foo',
    created() {
      console.log(this.$options.customOption) // => 'foo'
    }
  })
  ```

- **参考** [`app.config.optionMergeStrategies`](/api/application#app-config-optionmergestrategies)

## $parent {#parent}

当前组件的父组件实例；如果是顶层组件，则为 `null`。

- **类型**

  ```ts
  interface ComponentPublicInstance {
    $parent: ComponentPublicInstance | null
  }
  ```

## $root {#root}

当前组件树的根组件实例。没有父组件时，值就是自身。

- **类型**

  ```ts
  interface ComponentPublicInstance {
    $root: ComponentPublicInstance
  }
  ```

## $slots {#slots}

父组件传入的[插槽](/guide/components/slots)对象。

- **类型**

  ```ts
  interface ComponentPublicInstance {
    $slots: { [name: string]: Slot }
  }

  type Slot = (...args: any[]) => VNode[]
  ```

- **详细信息**

  常用于手写[渲染函数](/guide/extras/render-function)，也可用来检测是否有插槽。

  每个插槽在 `this.$slots` 上是一个函数，返回 vnode 数组，key 对应插槽名。默认插槽为 `this.$slots.default`。

  如果是[作用域插槽](/guide/components/slots#scoped-slots)，传给插槽函数的参数可作为插槽 prop。

- **参考**[渲染函数 - 渲染插槽](/guide/extras/render-function#rendering-slots)

## $refs {#refs}

通过[模板引用](/guide/essentials/template-refs)注册的 DOM 元素和组件实例。

- **类型**

  ```ts
  interface ComponentPublicInstance {
    $refs: { [name: string]: Element | ComponentPublicInstance | null }
  }
  ```

- **参考**

  - [模板引用](/guide/essentials/template-refs)
  - [特殊 Attribute - ref](./built-in-special-attributes.md#ref)

## $attrs {#attrs}

包含组件所有透传 attributes 的对象。

- **类型**

  ```ts
  interface ComponentPublicInstance {
    $attrs: object
  }
  ```

- **详细信息**

  [透传 Attributes](/guide/components/attrs) 是父组件传入、但未被子组件声明为 props 或自定义事件的 attributes 和事件处理函数。

  默认情况下，单根组件的 `$attrs` 会自动继承到根元素；多根组件不会。可通过 [`inheritAttrs`](./options-misc#inheritattrs) 显式关闭。

- **参考**

  - [透传 Attribute](/guide/components/attrs)

## $watch() {#watch}

命令式创建侦听器的 API。

- **类型**

  ```ts
  interface ComponentPublicInstance {
    $watch(
      source: string | (() => any),
      callback: WatchCallback,
      options?: WatchOptions
    ): StopHandle
  }

  type WatchCallback<T> = (
    value: T,
    oldValue: T,
    onCleanup: (cleanupFn: () => void) => void
  ) => void

  interface WatchOptions {
    immediate?: boolean // default: false
    deep?: boolean // default: false
    flush?: 'pre' | 'post' | 'sync' // default: 'pre'
    onTrack?: (event: DebuggerEvent) => void
    onTrigger?: (event: DebuggerEvent) => void
  }

  type StopHandle = () => void
  ```

- **详细信息**

  第一个参数是侦听来源：组件属性名字符串、点分隔路径字符串，或 [getter 函数](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Functions/get#description)。

  第二个参数是回调，接收新值和旧值。

  - **`immediate`**：创建时是否立即触发。第一次调用时旧值为 `undefined`。
  - **`deep`**：侦听来源是对象时，是否深度遍历，深层变更也会触发。详见[深层侦听器](/guide/essentials/watchers#deep-watchers)。
  - **`flush`**：回调刷新时机。详见[回调刷新时机](/guide/essentials/watchers#callback-flush-timing)和 [`watchEffect()`](/api/reactivity-core#watcheffect)。
  - **`onTrack / onTrigger`**：调试侦听器依赖。详见[侦听器调试](/guide/extras/reactivity-in-depth#watcher-debugging)。

- **示例**

  侦听属性名：

  ```js
  this.$watch('a', (newVal, oldVal) => {})
  ```

  侦听点分隔路径：

  ```js
  this.$watch('a.b', (newVal, oldVal) => {})
  ```

  复杂表达式用 getter 函数：

  ```js
  this.$watch(
    // 每一次这个 `this.a + this.b` 表达式生成一个
    // 不同的结果，处理函数都会被调用
    // 这就好像我们在侦听一个计算属性
    // 而不定义计算属性本身。
    () => this.a + this.b,
    (newVal, oldVal) => {}
  )
  ```

  停止侦听：

  ```js
  const unwatch = this.$watch('a', cb)

  // 之后……
  unwatch()
  ```

- **参考**
  - [选项 - `watch`](/api/options-state#watch)
  - [指南 - 侦听器](/guide/essentials/watchers)

## $emit() {#emit}

在当前组件触发自定义事件。额外参数会传给事件监听器的回调。

- **类型**

  ```ts
  interface ComponentPublicInstance {
    $emit(event: string, ...args: any[]): void
  }
  ```

- **示例**

  ```js
  export default {
    created() {
      // 仅触发事件
      this.$emit('foo')
      // 带有额外的参数
      this.$emit('bar', 1, 2, 3)
    }
  }
  ```

- **参考**

  - [组件 - 事件](/guide/components/events)
  - [`emits` 选项](./options-state#emits)

## $forceUpdate() {#forceupdate}

强制组件重新渲染。

- **类型**

  ```ts
  interface ComponentPublicInstance {
    $forceUpdate(): void
  }
  ```

- **详细信息**

  Vue 有全自动响应性系统，这个方法很少需要。可能需要的情况是：用高阶响应式 API 显式创建了非响应式组件状态。

## $nextTick() {#nexttick}

绑定在实例上的 [`nextTick()`](./general#nexttick) 函数。

- **类型**

  ```ts
  interface ComponentPublicInstance {
    $nextTick(callback?: (this: ComponentPublicInstance) => void): Promise<void>
  }
  ```

- **详细信息**

  和全局 `nextTick()` 的唯一区别：传给 `this.$nextTick()` 的回调会绑定当前组件实例的 `this`。

- **参考** [`nextTick()`](./general#nexttick)
