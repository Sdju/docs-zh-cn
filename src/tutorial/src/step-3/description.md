# Attribute 绑定 {#attribute-bindings}

在 Vue 里，mustache 语法（双大括号）只能做文本插值。要给 attribute 绑定动态值，需要用 `v-bind` 指令：

```vue-html
<div v-bind:id="dynamicId"></div>
```

**指令**是以 `v-` 开头的特殊 attribute。它们是 Vue 模板语法的一部分。和文本插值一样，指令的值是可以访问组件状态的 JavaScript 表达式。`v-bind` 和指令语法的完整说明，请看<a target="_blank" href="/guide/essentials/template-syntax.html">指南 - 模板语法</a>。

冒号后面的部分（`:id`）是指令的「参数」。这里，元素的 `id` attribute 会和组件状态里的 `dynamicId` 保持同步。

因为 `v-bind` 很常用，它有简写语法：

```vue-html
<div :id="dynamicId"></div>
```

现在，试着给这个 `<h1>` 添加动态的 `class` 绑定。用 `titleClass` 的<span class="options-api">数据属性</span><span class="composition-api"> ref </span>作为值。如果绑定正确，文字会变成红色。
