# 模板语法 {#template-syntax}

<ScrimbaLink href="https://scrimba.com/links/vue-template-syntax" title="Free Vue.js Template Syntax Lesson" type="scrimba">
  观看 Scrimba 的互动视频课程
</ScrimbaLink>

Vue 用基于 HTML 的模板语法，让你声明式地把组件实例的数据绑定到 DOM 上。所有 Vue 模板都是合法的 HTML，规范浏览器和 HTML 解析器都能解析。

底层会把模板编译成优化过的 JavaScript。配合响应式系统，状态变化时 Vue 会算出最少要更新的组件，并只做必要的 DOM 操作。

如果你熟悉虚拟 DOM，更喜欢直接用 JavaScript，可以用 JSX [直接手写渲染函数](/guide/extras/render-function)，不用模板。但这样得不到和模板同等级别的编译时优化。

## 文本插值 {#text-interpolation}

最基本的数据绑定是文本插值，用「Mustache」语法（双大括号）：

```vue-html
<span>Message: {{ msg }}</span>
```

双大括号会替换成[组件实例里](/guide/essentials/reactivity-fundamentals#declaring-reactive-state) `msg` 的值，`msg` 一变也会跟着更新。

## 原始 HTML {#raw-html}

双大括号只当纯文本，不会当成 HTML。要插入 HTML，用 [`v-html` 指令](/api/built-in-directives#v-html)：

```vue-html
<p>Using text interpolation: {{ rawHtml }}</p>
<p>Using v-html directive: <span v-html="rawHtml"></span></p>
```

<script setup>
  const rawHtml = '<span style="color: red">This should be red.</span>'
</script>

<div class="demo">
  <p>Using text interpolation: {{ rawHtml }}</p>
  <p>Using v-html directive: <span v-html="rawHtml"></span></p>
</div>

这里是一个新概念：`v-html` 这种带 `v-` 前缀的 attribute 叫**指令**。指令是 Vue 提供的特殊 attribute，会给 DOM 加上响应式行为。这里的意思是：在当前组件实例上，让这个元素的 innerHTML 和 `rawHtml` 保持同步。

`span` 里的内容会被 `rawHtml` 的值替换（当作纯 HTML，不走数据绑定）。不能用 `v-html` 来拼模板，Vue 不是字符串模板引擎。做 UI 复用和组合，应该用组件。

:::warning 安全警告
在网站上动态渲染任意 HTML 很危险，容易造成 [XSS 漏洞](https://zh.wikipedia.org/wiki/%E8%B7%A8%E7%B6%B2%E7%AB%99%E6%8C%87%E4%BB%A4%E7%A2%BC)。只在内容可信时用 `v-html`，**永远不要**用用户提供的 HTML。
:::

## Attribute 绑定 {#attribute-bindings}

双大括号不能用在 HTML attributes 里。要响应式绑定 attribute，用 [`v-bind` 指令](/api/built-in-directives#v-bind)：

```vue-html
<div v-bind:id="dynamicId"></div>
```

`v-bind` 会让元素的 `id` attribute 和组件的 `dynamicId` 保持一致。绑定值是 `null` 或 `undefined` 时，该 attribute 会从渲染结果里去掉。

### 简写 {#shorthand}

`v-bind` 很常用，所以有简写：

```vue-html
<div :id="dynamicId"></div>
```

以 `:` 开头的 attribute 看起来有点特别，但名字合法，支持 Vue 的浏览器都能正确解析。它们也不会出现在最终渲染的 DOM 里。简写是可选的，了解用途后你会更常用它。

> 后面的示例都会用简写，实际开发里也更常见。

### 同名简写 {#same-name-shorthand}

- 仅支持 3.4 版本及以上

如果 attribute 名和要绑定的 JavaScript 变量同名，可以省略值：

```vue-html
<!-- 与 :id="id" 相同 -->
<div :id></div>

<!-- 这也同样有效 -->
<div v-bind:id></div>
```

这和 JavaScript 里声明对象时的属性简写类似。注意：只有 Vue 3.4 及以上才支持。

### 布尔型 Attribute {#boolean-attributes}

[布尔型 attribute](https://developer.mozilla.org/zh-CN/docs/Web/HTML/Attributes#%E5%B8%83%E5%B0%94%E5%80%BC%E5%B1%9E%E6%80%A7) 根据 true / false 决定要不要出现在元素上。[`disabled`](https://developer.mozilla.org/en-US/docs/Web/HTML/Attributes/disabled) 最常见。

`v-bind` 在这里行为稍有不同：

```vue-html
<button :disabled="isButtonDisabled">Button</button>
```

当 `isButtonDisabled` 为[真值](https://developer.mozilla.org/en-US/docs/Glossary/Truthy)或空字符串（即 `<button disabled="">`）时，元素会有 `disabled` attribute。其他[假值](https://developer.mozilla.org/en-US/docs/Glossary/Falsy)时会被去掉。

### 动态绑定多个值 {#dynamically-binding-multiple-attributes}

如果你有一个包含多个 attribute 的 JavaScript 对象：

<div class="composition-api">

```js
const objectOfAttrs = {
  id: 'container',
  class: 'wrapper',
  style: 'background-color:green'
}
```

</div>
<div class="options-api">

```js
data() {
  return {
    objectOfAttrs: {
      id: 'container',
      class: 'wrapper'
    }
  }
}
```

</div>

用不带参数的 `v-bind`，可以一次绑到单个元素上：

```vue-html
<div v-bind="objectOfAttrs"></div>
```

## 使用 JavaScript 表达式 {#using-javascript-expressions}

前面我们只绑了简单的属性名。其实 Vue 在所有数据绑定里都支持完整的 JavaScript 表达式：

```vue-html
{{ number + 1 }}

{{ ok ? 'YES' : 'NO' }}

{{ message.split('').reverse().join('') }}

<div :id="`list-${id}`"></div>
```

这些表达式都会当作 JavaScript，在当前组件实例的作用域里执行。

在 Vue 模板里，JavaScript 表达式可以用在：

- 文本插值（双大括号）里
- 任何 Vue 指令（以 `v-` 开头的特殊 attribute）的值里

### 仅支持表达式 {#expressions-only}

每个绑定只支持**一个表达式**，也就是能求出值的 JavaScript 代码。简单判断：能不能合法地写在 `return` 后面。

所以下面这些都**无效**：

```vue-html
<!-- 这是一个语句，而非表达式 -->
{{ var a = 1 }}

<!-- 条件控制也不支持，请使用三元表达式 -->
{{ if (ok) { return message } }}
```

### 调用函数 {#calling-functions}

绑定表达式里可以调用组件暴露的方法：

```vue-html
<time :title="toTitleDate(date)" :datetime="date">
  {{ formatDate(date) }}
</time>
```

:::tip
绑定里的方法在组件每次更新时都会重新调用，所以**不要**产生副作用，比如改数据或触发异步操作。
:::

### 受限的全局访问 {#restricted-globals-access}

模板里的表达式在沙盒里运行，只能访问[有限的全局对象列表](https://github.com/vuejs/core/blob/main/packages/shared/src/globalsAllowList.ts#L3)。列表里有常用的内置全局对象，比如 `Math` 和 `Date`。

不在列表里的全局对象不能在模板表达式里用，比如挂在 `window` 上的自定义属性。你也可以在 [`app.config.globalProperties`](/api/application#app-config-globalproperties) 上显式添加，供所有 Vue 表达式使用。

## 指令 Directives {#directives}

指令是带 `v-` 前缀的特殊 attribute。Vue 提供很多[内置指令](/api/built-in-directives)，包括上面的 `v-bind` 和 `v-html`。

多数指令的值应是 JavaScript 表达式（少数例外，后面会讲 `v-for`、`v-on` 和 `v-slot`）。指令会在表达式变化时响应式地更新 DOM。例如 [`v-if`](/api/built-in-directives#v-if)：

```vue-html
<p v-if="seen">Now you see me</p>
```

这里 `v-if` 会根据 `seen` 的真假来移除或插入这个 `<p>` 元素。

### 参数 Arguments {#arguments}

有些指令需要「参数」，在指令名后面用冒号隔开。例如用 `v-bind` 响应式更新 HTML attribute：

```vue-html
<a v-bind:href="url"> ... </a>

<!-- 简写 -->
<a :href="url"> ... </a>
```

这里的 `href` 是参数，告诉 `v-bind` 把表达式 `url` 的值绑到元素的 `href` attribute 上。简写里，参数前面的部分（如 `v-bind:`）会缩成 `:`。

另一个是 `v-on`，用来监听 DOM 事件：

```vue-html
<a v-on:click="doSomething"> ... </a>

<!-- 简写 -->
<a @click="doSomething"> ... </a>
```

这里的参数是要监听的事件名：`click`。`v-on` 的简写是 `@`。事件处理后面还会细讲。

### 动态参数 {#dynamic-arguments}

参数也可以用 JavaScript 表达式，写在方括号里：

```vue-html
<!--
注意，参数表达式有一些约束，
参见下面“动态参数值的限制”与“动态参数语法的限制”章节的解释
-->
<a v-bind:[attributeName]="url"> ... </a>

<!-- 简写 -->
<a :[attributeName]="url"> ... </a>
```

`attributeName` 会作为 JavaScript 表达式执行，结果用作最终参数。比如组件有数据 `attributeName`，值为 `"href"`，那这个绑定就等价于 `v-bind:href`。

同样，可以把函数绑到动态事件名上：

```vue-html
<a v-on:[eventName]="doSomething"> ... </a>

<!-- 简写 -->
<a @[eventName]="doSomething"> ... </a>
```

例如 `eventName` 为 `"focus"` 时，`v-on:[eventName]` 就等价于 `v-on:focus`。

#### 动态参数值的限制 {#dynamic-argument-value-constraints}

动态参数表达式的值应是字符串，或 `null`。`null` 表示显式移除绑定。其他非字符串值会触发警告。

#### 动态参数语法的限制 {#dynamic-argument-syntax-constraints}

动态参数表达式在语法上有限制，比如空格和引号在 HTML attribute 名里不合法。例如：

```vue-html
<!-- 这会触发一个编译器警告 -->
<a :['foo' + bar]="value"> ... </a>
```

如果要传复杂的动态参数，建议用[计算属性](computed)代替复杂表达式。计算属性是 Vue 的基础概念，后面会讲。

使用 DOM 内嵌模板（直接写在 HTML 文件里的模板）时，名称里避免大写字母，因为浏览器会强制转成小写：

```vue-html
<a :[someAttr]="value"> ... </a>
```

上面的例子在 DOM 内嵌模板里会变成 `:[someattr]`。如果组件属性是 `someAttr` 而不是 `someattr`，代码就不会按预期工作。单文件组件里的模板**不受**此限制。

### 修饰符 Modifiers {#modifiers}

修饰符是以点开头的特殊后缀，表示指令要以特殊方式绑定。例如 `.prevent` 会告诉 `v-on` 对触发的事件调用 `event.preventDefault()`：

```vue-html
<form @submit.prevent="onSubmit">...</form>
```

后面讲 [`v-on`](./event-handling#event-modifiers) 和 [`v-model`](./forms#modifiers) 时，还会看到更多修饰符例子。

最后，这里是指令语法的完整示意：

![指令语法图](./images/directive.png)

<!-- https://www.figma.com/file/BGWUknIrtY9HOmbmad0vFr/Directive -->

<!-- zhlint disabled -->
