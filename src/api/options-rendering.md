# 渲染选项 {#options-rendering}

## template {#template}

声明组件的字符串模板。

- **类型**

  ```ts
  interface ComponentOptions {
    template?: string
  }
  ```

- **详细信息**

  `template` 选项提供的模板会在运行时即时编译。这要求使用带模板编译器的 Vue 构建版本。文件名带 `runtime` 的版本**不含**模板编译器，例如 `vue.runtime.esm-bundler.js`。详见[构建文件指南](https://github.com/vuejs/core/tree/main/packages/vue#which-dist-file-to-use)。

  如果字符串以 `#` 开头，会当作 `querySelector` 选择器，用选中元素的 `innerHTML` 作为模板。这样可以用原生 `<template>` 元素写源模板。

  如果同时有 `render` 选项，`template` 会被忽略。

  如果根组件没有 `template` 或 `render`，Vue 会尝试用挂载元素的 `innerHTML` 作为模板。

  :::warning 安全性注意
  只使用可信的模板来源。不要把用户提供的内容直接当模板。详见[安全指南](/guide/best-practices/security#rule-no-1-never-use-non-trusted-templates)。
  :::

## render {#render}

用代码创建组件虚拟 DOM 树的函数。

- **类型**

  ```ts
  interface ComponentOptions {
    render?(this: ComponentPublicInstance) => VNodeChild
  }

  type VNodeChild = VNodeChildAtom | VNodeArrayChildren

  type VNodeChildAtom =
    | VNode
    | string
    | number
    | boolean
    | null
    | undefined
    | void

  type VNodeArrayChildren = (VNodeArrayChildren | VNodeChildAtom)[]
  ```

- **详细信息**

  `render` 是字符串模板的替代方案，可以用 JavaScript 完全编程式地声明渲染输出。

  单文件组件等预编译模板会在构建时编译成 `render`。如果同时有 `render` 和 `template`，`render` 优先级更高。

- **参考**
  - [渲染机制](/guide/extras/rendering-mechanism)
  - [渲染函数](/guide/extras/render-function)

## compilerOptions {#compileroptions}

配置组件模板的运行时编译器选项。

- **类型**

  ```ts
  interface ComponentOptions {
    compilerOptions?: {
      isCustomElement?: (tag: string) => boolean
      whitespace?: 'condense' | 'preserve' // 默认：'condense'
      delimiters?: [string, string] // 默认：['{{', '}}']
      comments?: boolean // 默认：false
    }
  }
  ```

- **详细信息**

  这个选项只在完整构建版本（可在浏览器中编译模板的 `vue.js`）下有效。选项和应用级 [app.config.compilerOptions](/api/application#app-config-compileroptions) 相同，但对当前组件优先级更高。

- **参考** [app.config.compilerOptions](/api/application#app-config-compileroptions)

## slots<sup class="vt-badge ts"/> {#slots}

- 仅在 Vue 3.3+ 中支持。

一个在渲染函数中以编程方式使用插槽时辅助类型推断的选项。

- **详情**

  该选项的运行时值不会被使用。实际类型应通过 `SlotsType` 类型辅助工具进行类型转换来声明：

  ```ts
  import { SlotsType } from 'vue'

  defineComponent({
    slots: Object as SlotsType<{
      default: { foo: string; bar: number }
      item: { data: number }
    }>,
    setup(props, { slots }) {
      expectType<
        undefined | ((scope: { foo: string; bar: number }) => any)
      >(slots.default)
      expectType<undefined | ((scope: { data: number }) => any)>(
        slots.item
      )
    }
  })
  ```
