# TypeScript 与选项式 API {#typescript-with-options-api}

> 本章假定你已读过[搭配 TypeScript 使用 Vue](./overview) 概览。

:::tip
Vue 支持在选项式 API 里用 TypeScript，但有 TS 时更推荐组合式 API——类型推导更简单、可靠。
:::

## 为组件的 props 标注类型 {#typing-component-props}

选项式 API 里要给 props 做类型推导，需用 `defineComponent()` 包装组件。Vue 才能根据 `props` 及 `required: true`、`default` 等选项推导类型：

```ts
import { defineComponent } from 'vue'

export default defineComponent({
  // 启用了类型推导
  props: {
    name: String,
    id: [Number, String],
    msg: { type: String, required: true },
    metadata: null
  },
  mounted() {
    this.name // 类型：string | undefined
    this.id // 类型：number | string | undefined
    this.msg // 类型：string
    this.metadata // 类型：any
  }
})
```

运行时 `props` 选项只能用构造函数标类型，无法直接写嵌套对象、函数签名等复杂类型。

复杂类型用 `PropType`：

```ts
import { defineComponent } from 'vue'
import type { PropType } from 'vue'

interface Book {
  title: string
  author: string
  year: number
}

export default defineComponent({
  props: {
    book: {
      // 提供相对 `Object` 更确定的类型
      type: Object as PropType<Book>,
      required: true
    },
    // 也可以标记函数
    callback: Function as PropType<(id: number) => void>
  },
  mounted() {
    this.book.title // string
    this.book.year // number

    // TS Error: argument of type 'string' is not
    // assignable to parameter of type 'number'
    this.callback?.('123')
  }
})
```

### 注意事项 {#caveats}

TypeScript 低于 `4.7` 时，prop 的 `validator` 和 `default` 若用函数，请用箭头函数：

```ts
import { defineComponent } from 'vue'
import type { PropType } from 'vue'

interface Book {
  title: string
  year?: number
}

export default defineComponent({
  props: {
    bookA: {
      type: Object as PropType<Book>,
      // 如果你的 TypeScript 版本低于 4.7，确保使用箭头函数
      default: () => ({
        title: 'Arrow Function Expression'
      }),
      validator: (book: Book) => !!book.title
    }
  }
})
```

这样可避免 TypeScript 按函数内环境错误推导 `this`。这是旧版[设计限制](https://github.com/microsoft/TypeScript/issues/38845)，[TypeScript 4.7](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-4-7.html#improved-function-inference-in-objects-and-methods) 已改进。

## 为组件的 emits 标注类型 {#typing-component-emits}

`emits` 可用对象声明事件及参数类型。触发未声明的事件会报类型错误：

```ts
import { defineComponent } from 'vue'

export default defineComponent({
  emits: {
    addBook(payload: { bookName: string }) {
      // 执行运行时校验
      return payload.bookName.length > 0
    }
  },
  methods: {
    onSubmit() {
      this.$emit('addBook', {
        bookName: 123 // 类型错误
      })

      this.$emit('non-declared-event') // 类型错误
    }
  }
})
```

## 为计算属性标记类型 {#typing-computed-properties}

计算属性一般按返回值自动推导类型：

```ts
import { defineComponent } from 'vue'

export default defineComponent({
  data() {
    return {
      message: 'Hello!'
    }
  },
  computed: {
    greeting() {
      return this.message + '!'
    }
  },
  mounted() {
    this.greeting // 类型：string
  }
})
```

有时需显式标注返回类型以约束实现：

```ts
import { defineComponent } from 'vue'

export default defineComponent({
  data() {
    return {
      message: 'Hello!'
    }
  },
  computed: {
    // 显式标注返回类型
    greeting(): string {
      return this.message + '!'
    },

    // 标注一个可写的计算属性
    greetingUppercased: {
      get(): string {
        return this.greeting.toUpperCase()
      },
      set(newValue: string) {
        this.message = newValue.toUpperCase()
      }
    }
  }
})
```

循环引用导致 TS 无法推导时，可能必须显式标注。

## 为事件处理函数标注类型 {#typing-event-handlers}

处理原生 DOM 事件时，应给事件处理函数的参数标类型。例如：

```vue
<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  methods: {
    handleChange(event) {
      // `event` 隐式地标注为 `any` 类型
      console.log(event.target.value)
    }
  }
})
</script>

<template>
  <input type="text" @change="handleChange" />
</template>
```

无类型时 `event` 为 `any`。`tsconfig.json` 里 `"strict": true` 或 `"noImplicitAny": true` 时会报错。建议显式标注；访问 `event` 属性时可能还要断言：

```ts
import { defineComponent } from 'vue'

export default defineComponent({
  methods: {
    handleChange(event: Event) {
      console.log((event.target as HTMLInputElement).value)
    }
  }
})
```

## 扩展全局属性 {#augmenting-global-properties}

有些插件通过 [`app.config.globalProperties`](/api/application#app-config-globalproperties) 挂全局属性，例如 `this.$http`、`this.$translate`。Vue 提供可 [TypeScript 模块扩展](https://www.typescriptlang.org/docs/handbook/declaration-merging.html#module-augmentation) 的 `ComponentCustomProperties`：

```ts
import axios from 'axios'

declare module 'vue' {
  interface ComponentCustomProperties {
    $http: typeof axios
    $translate: (key: string) => string
  }
}
```

参考：

- [对组件类型扩展的 TypeScript 单元测试](https://github.com/vuejs/core/blob/main/packages-private/dts-test/componentTypeExtensions.test-d.tsx)

### 类型扩展的位置 {#type-augmentation-placement}

扩展可放在 `.ts` 或项目级 `*.d.ts` 里，并确保 `tsconfig.json` 包含该文件。库作者应在 `package.json` 的 `types` 里列出。

要正确做模块扩展，文件须是 [TypeScript 模块](https://www.typescriptlang.org/docs/handbook/modules.html)——至少有一个顶层 `import` 或 `export`（哪怕是 `export {}`）。放在模块外会**覆盖**原类型，而不是扩展：

```ts
// 不工作，将覆盖原始类型。
declare module 'vue' {
  interface ComponentCustomProperties {
    $translate: (key: string) => string
  }
}
```

```ts
// 正常工作。
export {}

declare module 'vue' {
  interface ComponentCustomProperties {
    $translate: (key: string) => string
  }
}
```

## 扩展自定义选项 {#augmenting-custom-options}

`vue-router` 等插件会提供自定义选项，如 `beforeRouteEnter`：

```ts
import { defineComponent } from 'vue'

export default defineComponent({
  beforeRouteEnter(to, from, next) {
    // ...
  }
})
```

无类型标注时参数会是 `any`。可扩展 `ComponentCustomOptions`：

```ts
import { Route } from 'vue-router'

declare module 'vue' {
  interface ComponentCustomOptions {
    beforeRouteEnter?(to: Route, from: Route, next: () => void): void
  }
}
```

`beforeRouteEnter` 就会有正确类型。这只是示例——`vue-router` 等完备库通常已在自带类型里扩展。

自定义选项扩展与全局属性扩展受[同样限制](#type-augmentation-placement)。

参考：

- [对组件类型扩展的 TypeScript 单元测试](https://github.com/vuejs/core/blob/main/packages-private/dts-test/componentTypeExtensions.test-d.tsx)

<!-- zhlint disabled -->

## Typing Global Custom Directives {#typing-global-custom-directives}

See: [Typing Custom Global Directives](/guide/typescript/composition-api#typing-global-custom-directives) <sup class="vt-badge ts" />
