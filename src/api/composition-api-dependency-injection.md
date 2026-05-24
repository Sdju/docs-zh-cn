# 组合式 API：依赖注入 {#composition-api-dependency-injection}

## provide() {#provide}

提供一个值，供后代组件 inject 使用。

- **类型**

  ```ts
  function provide<T>(key: InjectionKey<T> | string, value: T): void
  ```

- **详细信息**

  `provide()` 接收两个参数：注入 key（字符串或 symbol）和要提供的值。

  使用 TypeScript 时，key 可以是断言为 `InjectionKey` 的 symbol。`InjectionKey` 是 Vue 提供的工具类型，继承自 `Symbol`，用来同步 `provide()` 和 `inject()` 的类型。

  与注册生命周期钩子的 API 一样，`provide()` 必须在组件 `setup()` 阶段同步调用。

- **示例**

  ```vue
  <script setup>
  import { ref, provide } from 'vue'
  import { countSymbol } from './injectionSymbols'

  // 提供静态值
  provide('path', '/project/')

  // 提供响应式的值
  const count = ref(0)
  provide('count', count)

  // 提供时将 Symbol 作为 key
  provide(countSymbol, count)
  </script>
  ```

- **参考**
  - [指南 - 依赖注入](/guide/components/provide-inject)
  - [指南 - 为 provide/inject 标注类型](/guide/typescript/composition-api#typing-provide-inject) <sup class="vt-badge ts" />

## inject() {#inject}

注入祖先组件或整个应用（通过 `app.provide()`）提供的值。

- **类型**

  ```ts
  // 没有默认值
  function inject<T>(key: InjectionKey<T> | string): T | undefined

  // 带有默认值
  function inject<T>(key: InjectionKey<T> | string, defaultValue: T): T

  // 使用工厂函数
  function inject<T>(
    key: InjectionKey<T> | string,
    defaultValue: () => T,
    treatDefaultAsFactory: true
  ): T
  ```

- **详细信息**

  第一个参数是 key。Vue 会沿父组件链查找匹配 key 的值。多个组件提供同一 key 时，离得更近的会覆盖更远的。找不到匹配值时 `inject()` 返回 `undefined`，除非提供了默认值。

  第二个参数可选，是找不到 key 时的默认值。

  第二个参数也可以是工厂函数，用于创建复杂默认值。此时须把第三个参数设为 `true`，表示这是工厂函数而非值本身。

  与注册生命周期钩子类似，`inject()` 必须在组件 `setup()` 阶段同步调用。

  TypeScript 中，key 可以是 `InjectionKey` 类型的 symbol，用来同步 `provide()` 和 `inject()` 的类型。

- **示例**

  假设父组件已 provide 一些值，如前面 `provide()` 示例：

  ```vue
  <script setup>
  import { inject } from 'vue'
  import { countSymbol } from './injectionSymbols'

  // 注入不含默认值的静态值
  const path = inject('path')

  // 注入响应式的值
  const count = inject('count')

  // 通过 Symbol 类型的 key 注入
  const count2 = inject(countSymbol)

  // 注入一个值，若为空则使用提供的默认值
  const bar = inject('path', '/default-path')

  // 注入一个值，若为空则使用提供的函数类型的默认值
  const fn = inject('function', () => {})

  // 注入一个值，若为空则使用提供的工厂函数
  const baz = inject('factory', () => new ExpensiveObject(), true)
  </script>
  ```
  
- **参考**
  - [指南 - 依赖注入](/guide/components/provide-inject)
  - [指南 - 为 provide / inject 标注类型](/guide/typescript/composition-api#typing-provide-inject) <sup class="vt-badge ts" />

## hasInjectionContext() {#has-injection-context}

- 仅在 3.3+ 中支持

若 [inject()](#inject) 在错误位置（如 `setup()` 外）调用也不会触发警告，则返回 `true`。适合库内部使用 `inject()` 而不打扰用户。

- **类型**

  ```ts
  function hasInjectionContext(): boolean
  ```
