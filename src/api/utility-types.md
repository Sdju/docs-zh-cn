# TypeScript 工具类型 {#utility-types}

:::info
本页只列出部分常用工具类型及其用法。完整导出类型见[源代码](https://github.com/vuejs/core/blob/main/packages/runtime-core/src/index.ts#L131)。
:::

## PropType\<T> {#proptype-t}

在用运行时 props 声明时，为 prop 标注更复杂的类型。

- **示例**

  ```ts
  import type { PropType } from 'vue'

  interface Book {
    title: string
    author: string
    year: number
  }

  export default {
    props: {
      book: {
        // 提供一个比 `Object` 更具体的类型
        type: Object as PropType<Book>,
        required: true
      }
    }
  }
  ```

- **参考**[指南 - 为组件 props 标注类型](/guide/typescript/options-api#typing-component-props)

## MaybeRef\<T> {#mayberef}

- 仅在 3.3+ 版本中支持。

`T | Ref<T>` 的别名。适合标注[组合式函数](/guide/reusability/composables.html)的参数。

## MaybeRefOrGetter\<T> {#maybereforgetter}

- 仅在 3.3+ 版本中支持。

`T | Ref<T> | (() => T)` 的别名。适合标注[组合式函数](/guide/reusability/composables.html)的参数。

## ExtractPropTypes\<T> {#extractproptypes}

从运行时 props 选项对象中提取 props 类型。提取的是内部类型——组件收到的是解析后的 props。因此 boolean 类型和带默认值的 props 即使非必需，也总是有值。

要提取外部类型（父组件可传入的 props），请用 [`ExtractPublicPropTypes`](#extractpublicproptypes)。

- **示例**

  ```ts
  const propsOptions = {
    foo: String,
    bar: Boolean,
    baz: {
      type: Number,
      required: true
    },
    qux: {
      type: Number,
      default: 1
    }
  } as const

  type Props = ExtractPropTypes<typeof propsOptions>
  // {
  //   foo?: string,
  //   bar: boolean,
  //   baz: number,
  //   qux: number
  // }
  ```

## ExtractPublicPropTypes\<T> {#extractpublicproptypes}

- 仅在 3.3+ 版本中支持。

从运行时 props 选项对象中提取 prop。提取的是外部类型——父组件可传入的 props。

- **示例**

  ```ts
  const propsOptions = {
    foo: String,
    bar: Boolean,
    baz: {
      type: Number,
      required: true
    },
    qux: {
      type: Number,
      default: 1
    }
  } as const

  type Props = ExtractPublicPropTypes<typeof propsOptions>
  // {
  //   foo?: string,
  //   bar?: boolean,
  //   baz: number,
  //   qux?: number
  // }
  ```

## ComponentCustomProperties {#componentcustomproperties}

增强组件实例类型，以支持自定义全局属性。

- **示例**

  ```ts
  import axios from 'axios'

  declare module 'vue' {
    interface ComponentCustomProperties {
      $http: typeof axios
      $translate: (key: string) => string
    }
  }
  ```

  :::tip
  类型扩展须放在模块 `.ts` 或 `.d.ts` 文件中。详见[类型扩展指南](/guide/typescript/options-api#augmenting-global-properties)。
  :::

- **参考**[指南 - 扩展全局属性](/guide/typescript/options-api#augmenting-global-properties)

## ComponentCustomOptions {#componentcustomoptions}

扩展组件选项类型，以支持自定义选项。

- **示例**

  ```ts
  import { Route } from 'vue-router'

  declare module 'vue' {
    interface ComponentCustomOptions {
      beforeRouteEnter?(to: any, from: any, next: () => void): void
    }
  }
  ```

  :::tip
  类型扩展须放在模块 `.ts` 或 `.d.ts` 文件中。详见[类型扩展指南](/guide/typescript/options-api#augmenting-global-properties)。
  :::

- **参考**[指南 - 扩展自定义选项](/guide/typescript/options-api#augmenting-custom-options)

## ComponentCustomProps {#componentcustomprops}

扩展全局可用的 TSX props，使 TSX 元素可以使用未在组件选项中定义的 props。

- **示例**

  ```ts
  declare module 'vue' {
    interface ComponentCustomProps {
      hello?: string
    }
  }

  export {}
  ```

  ```tsx
  // 现在即使没有在组件选项上定义过 hello 这个 prop 也依然能通过类型检查了
  <MyComponent hello="world" />
  ```

  :::tip
  类型扩展须放在模块 `.ts` 或 `.d.ts` 文件中。详见[类型扩展指南](/guide/typescript/options-api#augmenting-global-properties)。
  :::

## CSSProperties {#cssproperties}

扩展样式属性绑定允许的值类型。

- **示例**

允许任意自定义 CSS 属性：

  ```ts
  declare module 'vue' {
    interface CSSProperties {
      [key: `--${string}`]: string
    }
  }
  ```

  ```tsx
  <div style={ { '--bg-color': 'blue' } }>
  ```

  ```html
  <div :style="{ '--bg-color': 'blue' }"></div>
  ```

:::tip
类型增强须放在模块 `.ts` 或 `.d.ts` 文件中。详见[类型增强指南](/guide/typescript/options-api#augmenting-global-properties)。
:::

:::info 参考
SFC 的 `<style>` 标签支持通过 `v-bind` CSS 函数将 CSS 值与组件状态关联，无需类型扩展即可使用自定义属性。

- [CSS 中的 v-bind()](/api/sfc-css-features#v-bind-in-css)
:::
