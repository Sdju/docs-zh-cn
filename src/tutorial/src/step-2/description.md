# 声明式渲染 {#declarative-rendering}

<div class="sfc">

你在编辑器里看到的是一个 Vue 单文件组件 (Single-File Component，缩写为 SFC)。单文件组件用来组织代码：同一个组件的 HTML、CSS 和 JavaScript 都放在 `.vue` 文件里，可以复用。

</div>

Vue 的核心功能是**声明式渲染**：Vue 在 HTML 上加了模板语法。你可以用 JavaScript 里的状态来描述 HTML 应该长什么样。状态变了，HTML 会自动更新。

<div class="composition-api">

会触发更新的状态叫做**响应式**的。我们可以用 Vue 的 `reactive()` API 来声明响应式状态。`reactive()` 创建的对象是 JavaScript [Proxy](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy)，用起来和普通对象一样：

```js
import { reactive } from 'vue'

const counter = reactive({
  count: 0
})

console.log(counter.count) // 0
counter.count++
```

`reactive()` 只适用于对象（包括数组，以及 `Map`、`Set` 等内置类型）。另一个 API `ref()` 可以接收任何类型的值。`ref` 会返回一个包裹对象，内部值放在 `.value` 属性里。

```js
import { ref } from 'vue'

const message = ref('Hello World!')

console.log(message.value) // "Hello World!"
message.value = 'Changed'
```

`reactive()` 和 `ref()` 的更多细节，请看<a target="_blank" href="/guide/essentials/reactivity-fundamentals.html">指南 - 响应式基础</a>。

<div class="sfc">

在组件的 `<script setup>` 里声明的响应式状态，可以直接在模板里用。下面用双花括号语法，根据 `counter` 对象和 `message` ref 的值来渲染动态文本：

</div>

<div class="html">

传给 `createApp()` 的对象是一个 Vue 组件。组件状态应该在 `setup()` 函数里声明，并用一个对象返回。

```js{2,5}
setup() {
  const counter = reactive({ count: 0 })
  const message = ref('Hello World!')
  return {
    counter,
    message
  }
}
```

返回对象里的属性可以在模板里用。下面用双花括号语法，根据 `message` 的值来渲染动态文本：

</div>

```vue-html
<h1>{{ message }}</h1>
<p>Count is: {{ counter.count }}</p>
```

注意：模板里访问 `message` ref 时不需要 `.value`，它会自动解包，用起来更简单。

</div>

<div class="options-api">

会触发更新的状态叫做**响应式**的。在 Vue 里，响应式状态保存在组件中。<span class="html">示例代码里，传给 `createApp()` 的对象就是一个组件。</span>

我们可以用 `data` 组件选项来声明响应式状态。它应该是一个返回对象的函数：

<div class="sfc">

```js{3-5}
export default {
  data() {
    return {
      message: 'Hello World!'
    }
  }
}
```

</div>
<div class="html">

```js{3-5}
createApp({
  data() {
    return {
      message: 'Hello World!'
    }
  }
})
```

</div>

`message` 属性可以在模板里用。下面用双花括号语法，根据 `message` 的值来渲染动态文本：

```vue-html
<h1>{{ message }}</h1>
```

</div>

双花括号里不只能写变量名或路径——也可以写任何有效的 JavaScript 表达式。

```vue-html
<h1>{{ message.split('').reverse().join('') }}</h1>
```

<div class="composition-api">

现在，试着自己创建一些响应式状态，用它给模板里的 `<h1>` 渲染动态文本。

</div>

<div class="options-api">

现在，试着自己创建一个数据属性，用它给模板里的 `<h1>` 渲染动态文本。

</div>
