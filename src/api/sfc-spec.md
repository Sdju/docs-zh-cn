# 单文件组件语法定义 {#sfc-syntax-specification}

## 总览 {#overview}

Vue 单文件组件 (SFC) 通常使用 `*.vue` 扩展名，是一种类似 HTML 的自定义文件格式，用于定义 Vue 组件。语法上兼容 HTML。

每个 `*.vue` 文件由三种顶层语言块构成：`<template>`、`<script>` 和 `<style>`，以及一些自定义块：

```vue
<template>
  <div class="example">{{ msg }}</div>
</template>

<script>
export default {
  data() {
    return {
      msg: 'Hello world!'
    }
  }
}
</script>

<style>
.example {
  color: red;
}
</style>

<custom1>
  This could be e.g. documentation for the component.
</custom1>
```

## 相应语言块 {#language-blocks}

### `<template>` {#template}

- 每个 `*.vue` 文件最多包含一个顶层 `<template>` 块。

- 块内容会被提取并传给 `@vue/compiler-dom`，预编译为 JavaScript 渲染函数，附在导出组件上作为 `render` 选项。

### `<script>` {#script}

- 每个 `*.vue` 文件最多包含一个 `<script>` 块。([`<script setup>`](/api/sfc-script-setup) 除外)

- 脚本块作为 ES 模块执行。

- **默认导出**应为 Vue 组件选项对象，可以是对象字面量或 [defineComponent](/api/general#definecomponent) 的返回值。

### `<script setup>` {#script-setup}

- 每个 `*.vue` 文件最多包含一个 `<script setup>`。(不含普通 `<script>`)

- 脚本块会预处理为组件的 `setup()` 函数，即**每个组件实例**都会执行。`<script setup>` 中的顶层绑定自动暴露给模板。详见 [`<script setup>` 文档](/api/sfc-script-setup)。

### `<style>` {#style}

- 每个 `*.vue` 文件可包含多个 `<style>` 标签。

- `<style>` 可用 `scoped` 或 `module` attribute（见[单文件组件样式功能](/api/sfc-css-features)）封装当前组件样式。不同封装模式的多个 `<style>` 标签可混用。

### 自定义块 {#custom-blocks}

`*.vue` 文件中可添加项目所需的自定义块，例如写文档的 `<docs>` 块。常见用例：

- [Gridsome：`<page-query>`](https://gridsome.org/docs/querying-data/)
- [vite-plugin-vue-gql：`<gql>`](https://github.com/wheatjs/vite-plugin-vue-gql)
- [vue-i18n：`<i18n>`](https://github.com/intlify/bundle-tools/tree/main/packages/unplugin-vue-i18n#i18n-custom-block)

自定义块的处理依赖工具链。要在构建中集成自定义块，见[单文件组件自定义块集成工具链指南](/guide/scaling-up/tooling#sfc-custom-block-integrations)。

## 自动名称推导 {#automatic-name-inference}

SFC 在以下场景会根据**文件名**自动推导组件名：

- 开发警告需要格式化组件名时；
- DevTools 中观察组件时；
- 递归组件自引用时。例如 `FooBar.vue` 可在模板中用 `<FooBar/>` 引用自身。(同名时) 优先级低于明确注册/导入的组件。

## 预处理器 {#pre-processors}

代码块可用 `lang` attribute 声明预处理器语言，最常见是在 `<script>` 中使用 TypeScript：

```vue-html
<script lang="ts">
  // use TypeScript
</script>
```

`lang` 可用于任意块，例如在 `<style>` 中使用 [Sass](https://sass-lang.com/)，或在 `<template>` 中使用 [Pug](https://pugjs.org/api/getting-started.html)：

```vue-html
<template lang="pug">
p {{ msg }}
</template>

<style lang="scss">
  $primary-color: #333;
  body {
    color: $primary-color;
  }
</style>
```

不同预处理器的集成因工具链而异，详见相应文档：

- [Vite](https://cn.vitejs.dev/guide/features.html#css-pre-processors)
- [Vue CLI](https://cli.vuejs.org/zh/guide/css.html#%E9%A2%84%E5%A4%84%E7%90%86%E5%99%A8)
- [webpack + vue-loader](https://vue-loader.vuejs.org/zh/guide/pre-processors.html#%E4%BD%BF%E7%94%A8%E9%A2%84%E5%A4%84%E7%90%86%E5%99%A8)

## `src` 导入 {#src-imports}

若希望将 `*.vue` 组件分散到多个文件，可为语块使用 `src` attribute 导入外部文件：

```vue
<template src="./template.html"></template>
<style src="./style.css"></style>
<script src="./script.js"></script>
```

`src` 导入与 JS 模块导入遵循相同的路径解析规则：

- 相对路径须以 `./` 开头
- 也可从 npm 依赖导入资源

```vue
<!-- 从所安装的 "todomvc-app-css" npm 包中导入一个文件 -->
<style src="todomvc-app-css/index.css" />
```

`src` 导入也适用于自定义语块：

```vue
<unit-test src="./unit-test.js">
</unit-test>
```

:::warning 注意
在 `src` 中使用别名时，不要以 `~` 开头，后面的内容会被解释为模块请求。这意味着可以引用 node 模块中的资源：
```vue
<img src="~some-npm-package/foo.png">
```
:::

## 注释 {#comments}

每个语块中可按相应语言（HTML、CSS、JavaScript、Pug 等）的语法写注释。顶层注释请用 HTML 语法 `<!-- comment contents here -->`
