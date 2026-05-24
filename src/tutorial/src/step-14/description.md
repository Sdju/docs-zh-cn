# 插槽 {#slots}

除了通过 props 传数据，父组件还可以通过**插槽** (slots) 把模板片段传给子组件：

<div class="sfc">

```vue-html
<ChildComp>
  This is some slot content!
</ChildComp>
```

</div>
<div class="html">

```vue-html
<child-comp>
  This is some slot content!
</child-comp>
```

</div>

在子组件里，可以用 `<slot>` 元素作为插槽出口 (slot outlet)，渲染父组件传来的插槽内容 (slot content)：

<div class="sfc">

```vue-html
<!-- 在子组件的模板中 -->
<slot/>
```

</div>
<div class="html">

```vue-html
<!-- 在子组件的模板中 -->
<slot></slot>
```

</div>

`<slot>` 插口里的内容会被当作「默认」内容：父组件没有传插槽内容时会显示它：

```vue-html
<slot>Fallback content</slot>
```

现在我们没有给 `<ChildComp>` 传插槽内容，所以你会看到默认内容。让我们用父组件的 `msg` 状态，给子组件提供一些插槽内容吧。
