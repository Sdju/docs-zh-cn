# 全局 API：常规 {#global-api-general}

## version {#version}

返回当前使用的 Vue 版本。

- **类型** `string`

- **示例**

  ```js
  import { version } from 'vue'

  console.log(version)
  ```

## nextTick() {#nexttick}

等待下一次 DOM 更新完成。

- **类型**

  ```ts
  function nextTick(callback?: () => void): Promise<void>
  ```

- **详细信息**

  在 Vue 里修改响应式状态后，DOM 不会马上更新，而是先放进队列，等到下一个「tick」再一起更新。这样每个组件无论改了多少次状态，都只更新一次 DOM。

  状态改完后可以马上调用 `nextTick()`，等 DOM 更新完成。可以传回调，也可以 `await` 返回的 Promise。

- **示例**

  <div class="composition-api">

  ```vue
  <script setup>
  import { ref, nextTick } from 'vue'

  const count = ref(0)

  async function increment() {
    count.value++

    // DOM 还未更新
    console.log(document.getElementById('counter').textContent) // 0

    await nextTick()
    // DOM 此时已经更新
    console.log(document.getElementById('counter').textContent) // 1
  }
  </script>

  <template>
    <button id="counter" @click="increment">{{ count }}</button>
  </template>
  ```

  </div>
  <div class="options-api">

  ```vue
  <script>
  import { nextTick } from 'vue'

  export default {
    data() {
      return {
        count: 0
      }
    },
    methods: {
      async increment() {
        this.count++

        // DOM 还未更新
        console.log(document.getElementById('counter').textContent) // 0

        await nextTick()
        // DOM 此时已经更新
        console.log(document.getElementById('counter').textContent) // 1
      }
    }
  }
  </script>

  <template>
    <button id="counter" @click="increment">{{ count }}</button>
  </template>
  ```

  </div>

- **参考** [`this.$nextTick()`](/api/component-instance#nexttick)

## defineComponent() {#definecomponent}

定义 Vue 组件时用于 TypeScript 类型推导的辅助函数。

- **类型**

  ```ts
  // 选项语法
  function defineComponent(
    component: ComponentOptions
  ): ComponentConstructor

  // 函数语法 (需要 3.3+)
  function defineComponent(
    setup: ComponentOptions['setup'],
    extraOptions?: ComponentOptions
  ): () => any
  ```

  > 为便于阅读，类型已简化。

- **详细信息**

  第一个参数是组件选项对象。返回值就是该选项对象本身——运行时不会做额外处理，只用于类型推导。

  返回值的类型较特殊：是构造函数类型，实例类型由选项推断。这样在 TSX 里当标签用时也能获得类型推导。

  可以从 `defineComponent()` 的返回类型提取组件实例类型（与选项里 `this` 的类型相同）：

  ```ts
  const Foo = defineComponent(/* ... */)

  type FooInstance = InstanceType<typeof Foo>
  ```

  ### 函数签名 {#function-signature}

  - 仅在 3.3+ 中支持

  `defineComponent()` 还有另一种签名，适合配合组合式 API 和[渲染函数或 JSX](/guide/extras/render-function.html) 使用。

  这时不传选项对象，而是传一个函数。用法与组合式 API 的 [`setup()`](/api/composition-api-setup.html#composition-api-setup) 相同：接收 props 和 setup 上下文，返回渲染函数（可用 `h()` 或 JSX）：

  ```js
  import { ref, h } from 'vue'

  const Comp = defineComponent(
    (props) => {
      // 就像在 <script setup> 中一样使用组合式 API
      const count = ref(0)

      return () => {
        // 渲染函数或 JSX
        return h('div', count.value)
      }
    },
    // 其他选项，例如声明 props 和 emits。
    {
      props: {
        /* ... */
      }
    }
  )
  ```

  这种签名主要用于 TypeScript（尤其是 TSX），因为支持泛型：

  ```tsx
  const Comp = defineComponent(
    <T extends string | number>(props: { msg: T; list: T[] }) => {
      // 就像在 <script setup> 中一样使用组合式 API
      const count = ref(0)

      return () => {
        // 渲染函数或 JSX
        return <div>{count.value}</div>
      }
    },
    // 目前仍然需要手动声明运行时的 props
    {
      props: ['msg', 'list']
    }
  )
  ```

  未来计划提供 Babel 插件，自动推断并注入运行时 props（类似单文件组件里的 `defineProps`），这样就不必手写运行时 props 声明。

  ### webpack Treeshaking 的注意事项 {#note-on-webpack-treeshaking}

  `defineComponent()` 是函数调用，部分构建工具（如 webpack）可能认为它有副作用，导致未使用的组件无法被 tree-shake。

  可在调用前加 `/*#__PURE__*/` 注释，告诉 webpack 可以安全 tree-shake：

  ```js
  export default /*#__PURE__*/ defineComponent(/* ... */)
  ```

  若使用 Vite，一般不必加注释：底层 Rollup 能判断 `defineComponent()` 无副作用。

- **参考**[指南 - 配合 TypeScript 使用 Vue](/guide/typescript/overview#general-usage-notes)

## defineAsyncComponent() {#defineasynccomponent}

定义异步组件，运行时再懒加载。参数可以是异步加载函数，或带更多选项的配置对象。

- **类型**

  ```ts
  function defineAsyncComponent(
    source: AsyncComponentLoader | AsyncComponentOptions
  ): Component

  type AsyncComponentLoader = () => Promise<Component>

  interface AsyncComponentOptions {
    loader: AsyncComponentLoader
    loadingComponent?: Component
    errorComponent?: Component
    delay?: number
    timeout?: number
    suspensible?: boolean
    onError?: (
      error: Error,
      retry: () => void,
      fail: () => void,
      attempts: number
    ) => any
  }
  ```

- **参考**[指南 - 异步组件](/guide/components/async)
