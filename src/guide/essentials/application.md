# 创建一个 Vue 应用 {#creating-a-vue-application}

## 应用实例 {#the-application-instance}

每个 Vue 应用都用 [`createApp`](/api/application#createapp) 函数创建一个新的**应用实例**：

```js
import { createApp } from 'vue'

const app = createApp({
  /* 根组件选项 */
})
```

## 根组件 {#the-root-component}

传给 `createApp` 的对象其实是一个组件。每个应用都需要一个「根组件」，其他组件都是它的子组件。

如果用单文件组件，可以从另一个文件导入根组件。

```js
import { createApp } from 'vue'
// 从一个单文件组件中导入根组件
import App from './App.vue'

const app = createApp(App)
```

本指南里很多例子只有一个组件，但真实应用通常是一棵组件树。比如，一个待办事项 (Todos) 应用的组件树可能是：

```
App (root component)
├─ TodoList
│  └─ TodoItem
│     ├─ TodoDeleteButton
│     └─ TodoEditButton
└─ TodoFooter
   ├─ TodoClearButton
   └─ TodoStatistics
```

后面会讲怎么定义和组合多个组件。现在先关注：一个组件内部发生了什么。

## 挂载应用 {#mounting-the-app}

应用实例要调用 `.mount()` 才会渲染。这个方法接收一个「容器」参数，可以是 DOM 元素，也可以是 CSS 选择器字符串：

```html
<div id="app"></div>
```

```js
app.mount('#app')
```

根组件的内容会渲染到容器里。容器本身**不算**应用的一部分。

`.mount()` 应该在所有应用配置和资源注册完成后再调用。还要注意：和其他注册方法不同，它返回的是根组件实例，不是应用实例。

### DOM 中的根组件模板 {#in-dom-root-component-template}

根组件的模板通常在组件里，也可以直接写在挂载容器的 HTML 里：

```html
<div id="app">
  <button @click="count++">{{ count }}</button>
</div>
```

```js
import { createApp } from 'vue'

const app = createApp({
  data() {
    return {
      count: 0
    }
  }
})

app.mount('#app')
```

如果根组件没有 `template` 选项，Vue 会自动用容器的 `innerHTML` 作为模板。

DOM 内模板常用于[不用构建步骤](/guide/quick-start.html#using-vue-from-cdn)的 Vue 应用，也可以和服务端框架一起用——根模板可能由服务器生成。

## 应用配置 {#app-configurations}

应用实例有 `.config` 对象，可以配置应用级选项。比如定义应用级错误处理器，捕获所有子组件的错误：

```js
app.config.errorHandler = (err) => {
  /* 处理错误 */
}
```

应用实例还提供方法，注册应用里可用的资源，比如注册组件：

```js
app.component('TodoDeleteButton', TodoDeleteButton)
```

这样 `TodoDeleteButton` 在应用任何地方都能用。后面会讲组件和其他资源的注册。完整 API 见 [API 参考](/api/application)。

请在挂载应用实例**之前**完成所有应用配置！

## 多个应用实例 {#multiple-application-instances}

一个页面可以有多个应用实例。`createApp` API 允许在同一页面创建多个 Vue 应用，每个应用有自己的配置和全局资源：

```js
const app1 = createApp({
  /* ... */
})
app1.mount('#container-1')

const app2 = createApp({
  /* ... */
})
app2.mount('#container-2')
```

如果你用 Vue 增强服务端渲染的 HTML，只想控制页面里的一小块，不要把一个 Vue 应用挂到整个页面上。应该创建多个小应用，分别挂到需要的元素上。

<!-- zhlint disabled -->
