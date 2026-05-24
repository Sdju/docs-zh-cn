# 列表渲染 {#list-rendering}

我们可以用 `v-for` 指令，根据数组来渲染列表：

```vue-html
<ul>
  <li v-for="todo in todos" :key="todo.id">
    {{ todo.text }}
  </li>
</ul>
```

这里的 `todo` 是一个局部变量，表示当前正在遍历的数组元素。它只能在 `v-for` 绑定的元素上或内部访问，就像函数作用域一样。

注意：我们给每个 todo 对象设置了唯一的 `id`，并把它作为<a target="_blank" href="/api/built-in-special-attributes.html#key">特殊的 `key` attribute</a> 绑定到每个 `<li>`。`key` 让 Vue 能精确移动每个 `<li>`，匹配数组里对应对象的位置。

更新列表有两种方式：

1. 在源数组上调用[变更方法](https://stackoverflow.com/questions/9009879/which-javascript-array-functions-are-mutating)：

   <div class="composition-api">

   ```js
   todos.value.push(newTodo)
   ```

     </div>
     <div class="options-api">

   ```js
   this.todos.push(newTodo)
   ```

   </div>

2. 用新数组替换原数组：

   <div class="composition-api">

   ```js
   todos.value = todos.value.filter(/* ... */)
   ```

     </div>
     <div class="options-api">

   ```js
   this.todos = this.todos.filter(/* ... */)
   ```

   </div>

这里有一个简单的 todo 列表——试着实现 `addTodo()` 和 `removeTodo()` 的逻辑，让列表正常工作！

关于 `v-for` 的更多细节：<a target="_blank" href="/guide/essentials/list.html">指南 - 列表渲染</a>
