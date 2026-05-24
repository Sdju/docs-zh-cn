---
outline: deep
---

# 编译时标志 {#compile-time-flags}

:::tip
编译时标志仅在使用 Vue 的 `esm-bundler` 构建版本时生效 (即 `vue/dist/vue.esm-bundler.js`)。
:::

带构建步骤使用 Vue 时，可以配置编译时标志来启用或禁用特定功能。禁用的功能可通过 tree-shaking 从最终打包结果中移除。

即使不配置这些标志，Vue 也能正常工作。但建议始终配置，以便尽可能移除不需要的功能。

配置方法见[配置指南](#configuration-guides)。

## `__VUE_OPTIONS_API__` {#VUE_OPTIONS_API}

- **默认值：**`true`

  启用/禁用选项式 API 支持。禁用可减小打包体积，但若第三方库依赖选项式 API，可能影响兼容性。

## `__VUE_PROD_DEVTOOLS__` {#VUE_PROD_DEVTOOLS}

- **默认值：**`false`

  在生产环境启用/禁用开发者工具支持。启用会增加打包体积，建议仅在调试时开启。

## `__VUE_PROD_HYDRATION_MISMATCH_DETAILS__` {#VUE_PROD_HYDRATION_MISMATCH_DETAILS}

- **默认值：**`false`

  启用/禁用生产环境构建下激活 (hydration) 不匹配的详细警告。启用会增加打包体积，建议仅在调试时开启。

- 仅在 3.4+ 中可用

## 配置指南 {#configuration-guides}

### Vite {#vite}

`@vitejs/plugin-vue` 会自动为这些标志提供默认值。要更改默认值，请使用 Vite 的 [`define` 配置项](https://vitejs.dev/config/shared-options.html#define)：

```js [vite.config.js]
import { defineConfig } from 'vite'

export default defineConfig({
  define: {
    // 启用生产环境构建下激活不匹配的详细警告
    __VUE_PROD_HYDRATION_MISMATCH_DETAILS__: 'true'
  }
})
```

### vue-cli {#vue-cli}

`@vue/cli-service` 会自动为部分标志提供默认值。要配置或修改：

```js [vue.config.js]
module.exports = {
  chainWebpack: (config) => {
    config.plugin('define').tap((definitions) => {
      Object.assign(definitions[0], {
        __VUE_OPTIONS_API__: 'true',
        __VUE_PROD_DEVTOOLS__: 'false',
        __VUE_PROD_HYDRATION_MISMATCH_DETAILS__: 'false'
      })
      return definitions
    })
  }
}
```

### webpack {#webpack}

使用 webpack 的 [DefinePlugin](https://webpack.js.org/plugins/define-plugin/) 定义这些标志：

```js [webpack.config.js]
module.exports = {
  // ...
  plugins: [
    new webpack.DefinePlugin({
      __VUE_OPTIONS_API__: 'true',
      __VUE_PROD_DEVTOOLS__: 'false',
      __VUE_PROD_HYDRATION_MISMATCH_DETAILS__: 'false'
    })
  ]
}
```

### Rollup {#rollup}

使用 [@rollup/plugin-replace](https://github.com/rollup/plugins/tree/master/packages/replace) 定义这些标志：

```js [rollup.config.js]
import replace from '@rollup/plugin-replace'

export default {
  plugins: [
    replace({
      __VUE_OPTIONS_API__: 'true',
      __VUE_PROD_DEVTOOLS__: 'false',
      __VUE_PROD_HYDRATION_MISMATCH_DETAILS__: 'false'
    })
  ]
}
```
