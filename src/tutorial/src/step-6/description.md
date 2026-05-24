# 条件渲染 {#conditional-rendering}

我们可以用 `v-if` 指令来有条件地渲染元素：

```vue-html
<h1 v-if="awesome">Vue is awesome!</h1>
```

这个 `<h1>` 标签只会在 `awesome` 的值为[真值 (Truthy)](https://developer.mozilla.org/zh-CN/docs/Glossary/Truthy) 时渲染。如果 `awesome` 变成[假值 (Falsy)](https://developer.mozilla.org/zh-CN/docs/Glossary/Falsy)，它会被从 DOM 中移除。

我们也可以用 `v-else` 和 `v-else-if` 来表示其他条件分支：

```vue-html
<h1 v-if="awesome">Vue is awesome!</h1>
<h1 v-else>Oh no 😢</h1>
```

现在，示例同时显示了两个 `<h1>` 标签，按钮也没有作用。试着给它们添加 `v-if` 和 `v-else` 指令，并实现 `toggle()` 方法，这样可以用按钮在它们之间切换。

更多细节请看 `v-if`：<a target="_blank" href="/guide/essentials/conditional.html">指南 - 条件渲染</a>
