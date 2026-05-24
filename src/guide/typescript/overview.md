---
outline: deep
---

# 搭配 TypeScript 使用 Vue {#using-vue-with-typescript}

TypeScript 等类型系统能在编译时通过静态分析发现很多常见错误，减少生产环境运行时错误，重构大项目时也更有把握。IDE 里基于类型的自动补全还能提升开发效率。

Vue 本身用 TypeScript 编写，对 TypeScript 是一等公民支持。所有 Vue 官方库都自带类型声明，开箱即用。

## 项目配置 {#project-setup}

官方脚手架 [`create-vue`](https://github.com/vuejs/create-vue) 可搭建基于 [Vite](https://cn.vitejs.dev/)、开箱即用的 TypeScript Vue 项目。

### 总览 {#overview}

在 Vite 配置里，开发服务器和打包器只对 TypeScript 做语法转译，不做类型检查，这样即使用 TypeScript，Vite 开发服务器也能保持很快。

- 开发阶段建议依赖良好的 [IDE 配置](#ide-support) 获得即时类型错误反馈。

- 单文件组件可用 [`vue-tsc`](https://github.com/vuejs/language-tools/tree/master/packages/tsc) 在命令行做类型检查和生成声明文件。`vue-tsc` 封装了 TypeScript 的 `tsc`，用法基本一致，除 TS 文件外还支持 Vue 单文件组件。可在开 Vite 开发服务器的同时以侦听模式跑 `vue-tsc`，或用 [vite-plugin-checker](https://vite-plugin-checker.netlify.app/) 等在独立 worker 里做静态检查的插件。

- Vue CLI 也支持 TypeScript，但已不推荐。详见[下方说明](#note-on-vue-cli-and-ts-loader)。

### IDE 支持 {#ide-support}

- 强烈推荐 [Visual Studio Code](https://code.visualstudio.com/) (VS Code)，内置 TypeScript 支持好。

  - [Vue - Official](https://marketplace.visualstudio.com/items?itemName=Vue.volar)（原 Volar）是官方 VS Code 扩展，为 Vue 单文件组件提供 TypeScript 支持及其他能力。

    :::tip
    Vue - Official 取代了 Vue 2 的 [Vetur](https://marketplace.visualstudio.com/items?itemName=octref.vetur)。若已装 Vetur，请在 Vue 3 项目里禁用它。
    :::

- [WebStorm](https://www.jetbrains.com/webstorm/) 对 TypeScript 和 Vue 开箱即用。其他 JetBrains IDE 也可通过[免费插件](https://plugins.jetbrains.com/plugin/9442-vue-js)支持。从 2023.2 起，WebStorm 和 Vue 插件内置 Vue 语言服务器；可在 设置 > 语言和框架 > TypeScript > Vue 下让所有 TypeScript 版本使用 Volar。默认 Volar 用于 TypeScript 5.0 及以上。

### 配置 `tsconfig.json` {#configuring-tsconfig-json}

`create-vue` 项目自带预配置的 `tsconfig.json`，底层配置来自 [`@vue/tsconfig`](https://github.com/vuejs/tsconfig)。项目内用 [Project References](https://www.typescriptlang.org/docs/handbook/project-references.html) 保证不同环境代码类型正确（例如应用代码和测试代码的全局变量不同）。

手动配置 `tsconfig.json` 时注意：

- [`compilerOptions.isolatedModules`](https://www.typescriptlang.org/tsconfig#isolatedModules) 应设为 `true`，因为 Vite 用 [esbuild](https://esbuild.github.io/) 转译 TypeScript，受单文件转译限制。[`compilerOptions.verbatimModuleSyntax`](https://www.typescriptlang.org/tsconfig#verbatimModuleSyntax) 是 `isolatedModules` 的超集，也是好选择——[`@vue/tsconfig`](https://github.com/vuejs/tsconfig) 就用它。

- 若用选项式 API，需将 [`compilerOptions.strict`](https://www.typescriptlang.org/tsconfig#strict) 设为 `true`（或至少开启 [`compilerOptions.noImplicitThis`](https://www.typescriptlang.org/tsconfig#noImplicitThis)），才能检查组件选项里 `this` 的类型；否则 `this` 会是 `any`。

- 若在构建工具里配置了路径别名（如 `create-vue` 默认的 `@/*`），需用 [`compilerOptions.paths`](https://www.typescriptlang.org/tsconfig#paths) 为 TypeScript 再配一遍。

- 若在 Vue 里用 TSX，将 [`compilerOptions.jsx`](https://www.typescriptlang.org/tsconfig#jsx) 设为 `"preserve"`，[`compilerOptions.jsxImportSource`](https://www.typescriptlang.org/tsconfig#jsxImportSource) 设为 `"vue"`。

参考：

- [官方 TypeScript 编译选项文档](https://www.typescriptlang.org/docs/handbook/compiler-options.html)
- [esbuild TypeScript 编译注意事项](https://esbuild.github.io/content-types/#typescript-caveats)

### 关于 Vue CLI 和 `ts-loader` {#note-on-vue-cli-and-ts-loader}

像 Vue CLI 这样基于 webpack 的项目，常在模块编译时顺带做类型检查，例如用 `ts-loader`。但这不是理想方案：类型系统需要了解整个模块关系，而 loader 只适合单模块编译，不适合要全局信息的工作。因此会有：

- `ts-loader` 只能检查它之前 loader 转译后的代码，和 IDE 或 `vue-tsc` 基于源码的报错不一致。

- 类型检查可能很慢。和代码转换在同一线程/进程里会明显拖慢构建。

- IDE 里已在单独进程做类型检查，构建里再做一遍降低体验，性价比不高。

若用 Vue CLI 跑 Vue 3 + TypeScript，强烈建议迁到 Vite。我们也在为 CLI 开发只做 TS 语法转译的选项，以便改用 `vue-tsc` 做类型检查。

## 常见使用说明 {#general-usage-notes}

### `defineComponent()` {#definecomponent}

要让 TypeScript 正确推导组件选项里的类型，需通过全局 API [`defineComponent()`](/api/general#definecomponent) 定义组件：

```ts
import { defineComponent } from 'vue'

export default defineComponent({
  // 启用了类型推导
  props: {
    name: String,
    msg: { type: String, required: true }
  },
  data() {
    return {
      count: 1
    }
  },
  mounted() {
    this.name // 类型：string | undefined
    this.msg // 类型：string
    this.count // 类型：number
  }
})
```

未配合 `<script setup>` 使用组合式 API 时，`defineComponent()` 也支持推导传给 `setup()` 的 prop：

```ts
import { defineComponent } from 'vue'

export default defineComponent({
  // 启用了类型推导
  props: {
    message: String
  },
  setup(props) {
    props.message // 类型：string | undefined
  }
})
```

参考：

- [webpack Treeshaking 的注意事项](/api/general#note-on-webpack-treeshaking)
- [对 `defineComponent` 的类型测试](https://github.com/vuejs/core/blob/main/packages-private/dts-test/defineComponent.test-d.tsx)

:::tip
`defineComponent()` 也支持对纯 JavaScript 组件做类型推导。
:::

### 在单文件组件中的用法 {#usage-in-single-file-components}

在单文件组件里用 TypeScript，给 `<script>` 加 `lang="ts"`。有 `lang="ts"` 时，模板内表达式会有更严格的类型检查。

```vue
<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  data() {
    return {
      count: 1
    }
  }
})
</script>

<template>
  <!-- 启用了类型检查和自动补全 -->
  {{ count.toFixed(2) }}
</template>
```

`lang="ts"` 也可用于 `<script setup>`：

```vue
<script setup lang="ts">
// 启用了 TypeScript
import { ref } from 'vue'

const count = ref(1)
</script>

<template>
  <!-- 启用了类型检查和自动补全 -->
  {{ count.toFixed(2) }}
</template>
```

### 模板中的 TypeScript {#typescript-in-templates}

使用 `<script lang="ts">` 或 `<script setup lang="ts">` 后，`<template>` 绑定表达式也支持 TypeScript，适合在模板里做类型转换。

假想例子：

```vue
<script setup lang="ts">
let x: string | number = 1
</script>

<template>
  <!-- 出错，因为 x 可能是字符串 -->
  {{ x.toFixed(2) }}
</template>
```

可用内联类型断言：

```vue{6}
<script setup lang="ts">
let x: string | number = 1
</script>

<template>
  {{ (x as number).toFixed(2) }}
</template>
```

:::tip
若用 Vue CLI 或基于 webpack 的配置，模板内表达式的 TypeScript 需要 `vue-loader@^16.8.0`。
:::

### 使用 TSX {#usage-with-tsx}

Vue 也支持用 JSX / TSX 写组件。详见[渲染函数 & JSX](/guide/extras/render-function.html#jsx-tsx)。

## 泛型组件 {#generic-components}

泛型组件有两种用法：

- 单文件组件：[在 `<script setup>` 上使用 `generic` 属性](/api/sfc-script-setup.html#generics)
- 渲染函数 / JSX 组件：[`defineComponent()` 的函数签名](/api/general.html#function-signature)

## 特定 API 的使用指南 {#api-specific-recipes}

- [TS 与组合式 API](./composition-api)
- [TS 与选项式 API](./options-api)
