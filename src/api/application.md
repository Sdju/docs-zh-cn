# 应用实例 API {#application-api}

## createApp() {#createapp}

创建一个应用实例。

- **类型**

  ```ts
  function createApp(rootComponent: Component, rootProps?: object): App
  ```

- **详细信息**

  第一个参数是根组件。第二个参数可选，用来传给根组件 props。

- **示例**

  可以直接内联根组件：

  ```js
  import { createApp } from 'vue'

  const app = createApp({
    /* 根组件选项 */
  })
  ```

  也可以使用从别处导入的组件：

  ```js
  import { createApp } from 'vue'
  import App from './App.vue'

  const app = createApp(App)
  ```

- **参考**[指南 - 创建一个 Vue 应用实例](/guide/essentials/application)

## createSSRApp() {#createssrapp}

以 [SSR 激活](/guide/scaling-up/ssr#client-hydration)模式创建一个应用实例。用法与 `createApp()` 完全相同。

## app.mount() {#app-mount}

将应用实例挂载在一个容器元素中。

- **类型**

  ```ts
  interface App {
    mount(rootContainer: Element | string): ComponentPublicInstance
  }
  ```

- **详细信息**

  参数可以是 DOM 元素，或 CSS 选择器（会用匹配到的第一个元素）。返回根组件实例。

  如果组件有模板或渲染函数，会替换容器里已有的 DOM 节点。否则，在运行时编译器可用时，会用容器元素的 `innerHTML` 作为模板。

  在 SSR 激活模式下，会激活容器里已有的 DOM 节点。如果出现[激活不匹配](/guide/scaling-up/ssr#hydration-mismatch)，现有 DOM 会被修改，以匹配客户端实际渲染结果。

  每个应用实例只能调用一次 `mount()`。

- **示例**

  ```js
  import { createApp } from 'vue'
  const app = createApp(/* ... */)

  app.mount('#app')
  ```

  也可以挂载到一个实际的 DOM 元素。

  ```js
  app.mount(document.body.firstChild)
  ```

## app.unmount() {#app-unmount}

卸载已挂载的应用实例。卸载时会触发组件树里所有组件的卸载生命周期钩子。

- **类型**

  ```ts
  interface App {
    unmount(): void
  }
  ```

## app.onUnmount() <sup class="vt-badge" data-text="3.5+" /> {#app-onunmount}

注册一个回调函数，在应用卸载时调用。

- **类型**

  ```ts
  interface App {
    onUnmount(callback: () => any): void
  }
  ```

## app.component() {#app-component}

同时传入组件名字符串和定义，会注册全局组件；只传名字，则返回该名字已注册的组件（如果有）。

- **类型**

  ```ts
  interface App {
    component(name: string): Component | undefined
    component(name: string, component: Component): this
  }
  ```

- **示例**

  ```js
  import { createApp } from 'vue'

  const app = createApp({})

  // 注册一个选项对象
  app.component('MyComponent', {
    /* ... */
  })

  // 得到一个已注册的组件
  const MyComponent = app.component('MyComponent')
  ```

- **参考**[组件注册](/guide/components/registration)

## app.directive() {#app-directive}

同时传入名字和指令定义，会注册全局指令；只传名字，则返回该名字已注册的指令（如果有）。

- **类型**

  ```ts
  interface App {
    directive(name: string): Directive | undefined
    directive(name: string, directive: Directive): this
  }
  ```

- **示例**

  ```js
  import { createApp } from 'vue'

  const app = createApp({
    /* ... */
  })

  // 注册(对象形式的指令)
  app.directive('myDirective', {
    /* 自定义指令钩子 */
  })

  // 注册(函数形式的指令)
  app.directive('myDirective', () => {
    /* ... */
  })

  // 得到一个已注册的指令
  const myDirective = app.directive('myDirective')
  ```

- **参考**[自定义指令](/guide/reusability/custom-directives)

## app.use() {#app-use}

安装一个[插件](/guide/reusability/plugins)。

- **类型**

  ```ts
  interface App {
    use(plugin: Plugin, ...options: any[]): this
  }
  ```

- **详细信息**

  第一个参数是插件本身，第二个参数可选，用来传给插件选项。

  插件可以是有 `install()` 方法的对象，也可以直接是一个函数（会当作 `install()` 使用）。`app.use()` 的第二个参数会传给插件的 `install()`。

  同一个插件即使多次调用 `app.use()`，也只会安装一次。

- **示例**

  ```js
  import { createApp } from 'vue'
  import MyPlugin from './plugins/MyPlugin'

  const app = createApp({
    /* ... */
  })

  app.use(MyPlugin)
  ```

- **参考**[插件](/guide/reusability/plugins)

## app.mixin() {#app-mixin}

应用全局 mixin（作用于整个应用）。全局 mixin 会影响应用里每个组件实例。

:::warning 不推荐
Vue 3 仍支持 Mixins，主要是为了兼容旧代码和生态里的库。新项目应尽量避免 mixin，尤其是全局 mixin。

要复用逻辑，推荐用[组合式函数](/guide/reusability/composables)。
:::

- **类型**

  ```ts
  interface App {
    mixin(mixin: ComponentOptions): this
  }
  ```

## app.provide() {#app-provide}

提供一个值，供应用里所有后代组件通过 inject 使用。

- **类型**

  ```ts
  interface App {
    provide<T>(key: InjectionKey<T> | symbol | string, value: T): this
  }
  ```

- **详细信息**

  第一个参数是注入的 key，第二个参数是要提供的值。返回应用实例本身。

- **示例**

  ```js
  import { createApp } from 'vue'

  const app = createApp(/* ... */)

  app.provide('message', 'hello')
  ```

  在应用的某个组件中：

  <div class="composition-api">

  ```js
  import { inject } from 'vue'

  export default {
    setup() {
      console.log(inject('message')) // 'hello'
    }
  }
  ```

  </div>
  <div class="options-api">

  ```js
  export default {
    inject: ['message'],
    created() {
      console.log(this.message) // 'hello'
    }
  }
  ```

  </div>

- **参考**
  - [依赖注入](/guide/components/provide-inject)
  - [应用层 Provide](/guide/components/provide-inject#app-level-provide)
  - [app.runWithContext()](#app-runwithcontext)

## app.runWithContext() {#app-runwithcontext}

- 仅在 3.3+ 中支持

以当前应用为注入上下文，执行回调函数。

- **类型**

  ```ts
  interface App {
    runWithContext<T>(fn: () => T): T
  }
  ```

- **详情**

  接收一个回调并立即执行。在回调同步执行期间，即使没有活跃的组件实例，`inject()` 也能从当前应用提供的值里查找。回调的返回值也会一并返回。

- **示例**

  ```js
  import { inject } from 'vue'

  app.provide('id', 1)

  const injected = app.runWithContext(() => {
    return inject('id')
  })

  console.log(injected) // 1
  ```

## app.version {#app-version}

返回当前应用使用的 Vue 版本号。[插件](/guide/reusability/plugins)里常用，可以根据版本执行不同逻辑。

- **类型**

  ```ts
  interface App {
    version: string
  }
  ```

- **示例**

  在一个插件中对版本作判断：

  ```js
  export default {
    install(app) {
      const version = Number(app.version.split('.')[0])
      if (version < 3) {
        console.warn('This plugin requires Vue 3')
      }
    }
  }
  ```

- **参考**[全局 API - version](/api/general#version)

## app.config {#app-config}

每个应用实例都有 `config` 对象，用来配置应用。挂载前可以修改这些属性（下面列出各项说明）。

```js
import { createApp } from 'vue'

const app = createApp(/* ... */)

console.log(app.config)
```

## app.config.errorHandler {#app-config-errorhandler}

为应用内未捕获的错误指定全局处理函数。

- **类型**

  ```ts
  interface AppConfig {
    errorHandler?: (
      err: unknown,
      instance: ComponentPublicInstance | null,
      // `info` 是一个 Vue 特定的错误信息
      // 例如：错误是在哪个生命周期的钩子上抛出的
      info: string
    ) => void
  }
  ```

- **详细信息**

  错误处理器接收三个参数：错误对象、触发错误的组件实例，以及说明错误来源的字符串。

  它可以捕获以下来源的错误：

  - 组件渲染器
  - 事件处理器
  - 生命周期钩子
  - `setup()` 函数
  - 侦听器
  - 自定义指令钩子
  - 过渡 (Transition) 钩子

  :::tip
  生产环境中，第三个参数 (`info`) 是缩短的错误代码，不是完整字符串。代码与说明的对应关系见[生产环境错误代码参考](/error-reference/#runtime-errors)。
  :::

- **示例**

  ```js
  app.config.errorHandler = (err, instance, info) => {
    // 处理错误，例如：报告给一个服务
  }
  ```

## app.config.warnHandler {#app-config-warnhandler}

为 Vue 运行时警告指定自定义处理函数。

- **类型**

  ```ts
  interface AppConfig {
    warnHandler?: (
      msg: string,
      instance: ComponentPublicInstance | null,
      trace: string
    ) => void
  }
  ```

- **详细信息**

  警告处理器接收三个参数：警告信息、来源组件实例、组件追踪字符串。

  可以用来过滤特定警告，减少控制台输出。所有 Vue 警告都应在开发阶段解决，因此建议只在调试时过滤部分警告，调试完就移除。

  :::tip
  警告只在开发环境显示，生产环境会忽略此配置。
  :::

- **示例**

  ```js
  app.config.warnHandler = (msg, instance, trace) => {
    // `trace` 是组件层级结构的追踪
  }
  ```

## app.config.performance {#app-config-performance}

设为 `true` 后，可在浏览器开发工具的「性能/时间线」页追踪组件初始化、编译、渲染和 patch 的性能。只在开发模式且浏览器支持 [performance.mark](https://developer.mozilla.org/en-US/docs/Web/API/Performance/mark) 时生效。

- **类型**：`boolean`

- **参考**[指南 - 性能](/guide/best-practices/performance)

## app.config.compilerOptions {#app-config-compileroptions}

配置运行时编译器选项。这里的值会在浏览器内编译模板时使用，并影响该应用所有组件。也可以在每个组件上通过 [`compilerOptions` 选项](/api/options-rendering#compileroptions)覆盖。

::: warning 重要
此配置只在完整构建版（浏览器里能编译模板的 `vue.js`）中可用。若使用构建工具且是仅运行时版本，编译器选项需通过构建工具传给 `@vue/compiler-dom`。

- `vue-loader`：[通过 `compilerOptions` loader 选项传递](https://vue-loader.vuejs.org/zh/options.html#compileroptions)。详见[在 `vue-cli` 中如何配置](https://cli.vuejs.org/zh/guide/webpack.html#%E4%BF%AE%E6%94%B9-loader-%E9%80%89%E9%A1%B9)。

- `vite`：[通过 `@vitejs/plugin-vue` 选项传递](https://github.com/vitejs/vite-plugin-vue/tree/main/packages/plugin-vue#options)。
:::

### app.config.compilerOptions.isCustomElement {#app-config-compileroptions-iscustomelement}

指定检查方法，用来识别原生自定义元素。

- **类型** `(tag: string) => boolean`

- **详细信息**

  若标签应视为原生自定义元素，返回 `true`。匹配到的标签会按原生元素渲染，而不是解析为 Vue 组件。

  原生 HTML 和 SVG 标签不必在此函数里匹配，Vue 解析器会自动识别。

- **示例**

  ```js
  // 将所有标签前缀为 `ion-` 的标签视为自定义元素
  app.config.compilerOptions.isCustomElement = (tag) => {
    return tag.startsWith('ion-')
  }
  ```

- **参考** [Vue 与 Web Components](/guide/extras/web-components)

### app.config.compilerOptions.whitespace {#app-config-compileroptions-whitespace}

调整模板里空格的处理方式。

- **类型** `'condense' | 'preserve'`

- **默认** `'condense'`

- **详细信息**

  Vue 会压缩或去掉模板中的空格，让输出更高效。默认策略是 `'condense'`，行为如下：

  1. 元素开头和结尾的空格会压缩成一个空格。
  2. 含换行的元素之间的空白会被删除。
  3. 文本节点里连续空白会压缩成一个空格。

  设为 `'preserve'` 会禁用 (2) 和 (3)。

- **示例**

  ```js
  app.config.compilerOptions.whitespace = 'preserve'
  ```

### app.config.compilerOptions.delimiters {#app-config-compileroptions-delimiters}

调整模板内文本插值的分隔符。

- **类型** `[string, string]`

- **默认** `{{ "['\u007b\u007b', '\u007d\u007d']" }}`

- **详细信息**

  常用于避免与同样使用 mustache 语法的服务端框架冲突。

- **示例**

  ```js
  // 分隔符改为 ES6 模板字符串样式
  app.config.compilerOptions.delimiters = ['${', '}']
  ```

### app.config.compilerOptions.comments {#app-config-compileroptions-comments}

调整模板中 HTML 注释的处理方式。

- **类型** `boolean`

- **默认** `false`

- **详细信息**

  默认情况下，生产环境会移除所有注释。设为 `true` 会强制生产环境也保留注释。开发环境注释始终保留。通常在与依赖 HTML 注释的其他库一起使用时需要此项。

- **示例**

  ```js
  app.config.compilerOptions.comments = true
  ```

## app.config.globalProperties {#app-config-globalproperties}

注册全局属性，应用内所有组件实例都能访问。

- **类型**

  ```ts
  interface AppConfig {
    globalProperties: Record<string, any>
  }
  ```

- **详细信息**

  这是 Vue 2 里 `Vue.prototype` 的替代写法（Vue 3 已移除 `Vue.prototype`）。全局属性应谨慎使用。

  若全局属性与组件自身属性同名，组件自身属性优先。

- **用法**

  ```js
  app.config.globalProperties.msg = 'hello'
  ```

  这样 `msg` 在任意组件模板里可用，也可通过组件实例的 `this` 访问：

  ```js
  export default {
    mounted() {
      console.log(this.msg) // 'hello'
    }
  }
  ```

- **参考**[指南 - 扩展全局属性](/guide/typescript/options-api#augmenting-global-properties) <sup class="vt-badge ts" />

## app.config.optionMergeStrategies {#app-config-optionmergestrategies}

定义自定义组件选项的合并策略。

- **类型**

  ```ts
  interface AppConfig {
    optionMergeStrategies: Record<string, OptionMergeFunction>
  }

  type OptionMergeFunction = (to: unknown, from: unknown) => any
  ```

- **详细信息**

  部分插件或库会通过全局 mixin 注入自定义组件选项。当同一选项来自多个来源（如 mixin 或继承）时，可能需要特殊合并策略。

  可在 `app.config.optionMergeStrategies` 里，以选项名为 key 注册合并函数。

  合并函数接收父实例和子实例上该选项的值，作为第一、第二个参数。

- **示例**

  ```js
  const app = createApp({
    // 自身的选项
    msg: 'Vue',
    // 来自 mixin 的选项
    mixins: [
      {
        msg: 'Hello '
      }
    ],
    mounted() {
      // 在 this.$options 上暴露被合并的选项
      console.log(this.$options.msg)
    }
  })

  // 为 `msg` 定义一个合并策略函数
  app.config.optionMergeStrategies.msg = (parent, child) => {
    return (parent || '') + (child || '')
  }

  app.mount('#app')
  // 打印 'Hello Vue'
  ```

- **参考**[组件实例 - `$options`](/api/component-instance#options)

## app.config.idPrefix <sup class="vt-badge" data-text="3.5+" /> {#app-config-idprefix}

配置本应用中 [useId()](/api/composition-api-helpers.html#useid) 生成的所有 ID 的前缀。

- **类型** `string`

- **默认值** `undefined`

- **示例**

  ```js
  app.config.idPrefix = 'myApp'
  ```

  ```js
  // 在组件中：
  const id1 = useId() // 'myApp:0'
  const id2 = useId() // 'myApp:1'
  ```

## app.config.throwUnhandledErrorInProduction <sup class="vt-badge" data-text="3.5+" /> {#app-config-throwunhandlederrorinproduction}

强制在生产模式下抛出未处理的错误。

- **类型** `boolean`

- **默认值** `false`

- **详情**

  默认情况下，Vue 应用里抛出但未显式处理的错误，在开发和生产环境行为不同：

  - 开发环境：错误会被抛出，应用可能崩溃，方便你在开发时发现并修复。

  - 生产环境：错误只打印到控制台，减少对用户的影响，但可能让错误监控服务抓不到只在生产出现的错误。

  将 `app.config.throwUnhandledErrorInProduction` 设为 `true` 后，生产环境也会抛出未处理的错误。
