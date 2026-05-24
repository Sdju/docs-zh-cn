# 插件 {#plugins}

## 介绍 {#introduction}

插件 (Plugins) 用来给 Vue 应用添加全局能力。安装方式如下：

```js
import { createApp } from 'vue'

const app = createApp({})

app.use(myPlugin, {
  /* 可选的选项 */
})
```

插件可以是一个带 `install()` 方法的对象，也可以直接是安装函数。`install` 会收到[应用实例](/api/application)和 `app.use()` 传入的选项：

```js
const myPlugin = {
  install(app, options) {
    // 配置此应用
  }
}
```

插件没有固定边界，常见用途包括：

1. 用 [`app.component()`](/api/application#app-component) 和 [`app.directive()`](/api/application#app-directive) 注册全局组件或自定义指令。

2. 用 [`app.provide()`](/api/application#app-provide) 提供可在全应用[注入](/guide/components/provide-inject)的资源。

3. 往 [`app.config.globalProperties`](/api/application#app-config-globalproperties) 上挂全局属性或方法。

4. 同时包含以上几类的功能库（例如 [vue-router](https://github.com/vuejs/vue-router-next)）。

## 编写一个插件 {#writing-a-plugin}

下面通过写一个简单的 `i18n`（[国际化 (Internationalization)](https://en.wikipedia.org/wiki/Internationalization_and_localization) 缩写）插件，了解如何编写 Vue 插件。

先创建插件对象。建议放在单独文件里导出，便于维护：

```js [plugins/i18n.js]
export default {
  install: (app, options) => {
    // 在这里编写插件代码
  }
}
```

我们需要一个翻译函数：接收用 `.` 分隔的 `key` 字符串，在用户提供的字典里查对应文案。期望在模板里这样用：

```vue-html
<h1>{{ $translate('greetings.hello') }}</h1>
```

要让任意模板都能调用，可在插件里把它挂到 `app.config.globalProperties`：

```js{3-10} [plugins/i18n.js]
export default {
  install: (app, options) => {
    // 注入一个全局可用的 $translate() 方法
    app.config.globalProperties.$translate = (key) => {
      // 获取 `options` 对象的深层属性
      // 使用 `key` 作为索引
      return key.split('.').reduce((o, i) => {
        if (o) return o[i]
      }, options)
    }
  }
}
```

`$translate` 收到如 `greetings.hello` 的 key，在字典里查找并返回译文。

字典在 `app.use()` 时作为第二个参数传入：

```js
import i18nPlugin from './plugins/i18n'

app.use(i18nPlugin, {
  greetings: {
    hello: 'Bonjour!'
  }
})
```

于是模板里的 `$translate('greetings.hello')` 运行时会变成 `Bonjour!`。

TypeScript 用户请参考：[扩展全局属性](/guide/typescript/options-api#augmenting-global-properties) <sup class="vt-badge ts" />

:::tip
全局属性别加太多：多个插件各挂一堆全局属性，应用会很难读懂和维护。
:::

### 插件中的 Provide / Inject {#provide-inject-with-plugins}

插件里也可以用 `provide`，让使用者通过 inject 拿到数据。例如把整个翻译字典 `options` provide 出去，任意组件都能 inject 使用：

```js{3} [plugins/i18n.js]
export default {
  install: (app, options) => {
    app.provide('i18n', options)
  }
}
```

组件里用 key `i18n` inject 即可访问插件传入的选项对象。

<div class="composition-api">

```vue{4}
<script setup>
import { inject } from 'vue'

const i18n = inject('i18n')

console.log(i18n.greetings.hello)
</script>
```

</div>
<div class="options-api">

```js{2}
export default {
  inject: ['i18n'],
  created() {
    console.log(this.i18n.greetings.hello)
  }
}
```

</div>

### 为 NPM 打包

若要打包发布给别人用，可参考 [Vite 库模式](https://vitejs.dev/guide/build.html#library-mode)。
