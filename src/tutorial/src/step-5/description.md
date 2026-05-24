# 表单绑定 {#form-bindings}

我们可以同时用 `v-bind` 和 `v-on`，在表单输入元素上创建双向绑定：

```vue-html
<input :value="text" @input="onInput">
```

<div class="options-api">

```js
methods: {
  onInput(e) {
    // v-on 处理函数会接收原生 DOM 事件
    // 作为其参数。
    this.text = e.target.value
  }
}
```

</div>

<div class="composition-api">

```js
function onInput(e) {
  // v-on 处理函数会接收原生 DOM 事件
  // 作为其参数。
  text.value = e.target.value
}
```

</div>

试着在文本框里输入——你会看到 `<p>` 里的文本也跟着更新。

为了简化双向绑定，Vue 提供了 `v-model` 指令。它其实是上面这些操作的语法糖：

```vue-html
<input v-model="text">
```

`v-model` 会把绑定的值和 `<input>` 的值自动同步，这样就不用再写事件处理函数了。

`v-model` 不只支持文本输入框，也支持多选框、单选框、下拉框等。更多细节请看<a target="_blank" href="/guide/essentials/forms.html">指南 - 表单绑定</a>。

现在，试着用 `v-model` 重构代码吧。
