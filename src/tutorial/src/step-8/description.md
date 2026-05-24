# 计算属性 {#computed-property}

让我们在上一步的 todo 列表基础上继续。现在，我们给每个 todo 添加了切换功能。这是通过给每个 todo 对象添加 `done` 属性实现的，并用 `v-model` 绑定到复选框上：

```vue-html{2}
<li v-for="todo in todos">
  <input type="checkbox" v-model="todo.done">
  ...
</li>
```

下一个改进是隐藏已完成的 todo。我们有一个按钮可以切换 `hideCompleted` 状态。但怎么根据状态渲染不同的列表项呢？

<div class="options-api">

这里介绍一个新概念：<a target="_blank" href="/guide/essentials/computed.html">计算属性</a>。我们可以用 `computed` 选项声明一个响应式属性，它的值由其他属性计算而来：

<div class="sfc">

```js
export default {
  // ...
  computed: {
    filteredTodos() {
      // 根据 `this.hideCompleted` 返回过滤后的 todo 项目
    }
  }
}
```

</div>
<div class="html">

```js
createApp({
  // ...
  computed: {
    filteredTodos() {
      // 根据 `this.hideCompleted` 返回过滤后的 todo 项目
    }
  }
})
```

</div>

</div>
<div class="composition-api">

这里介绍一个新 API：<a target="_blank" href="/guide/essentials/computed.html">`computed()`</a>。它可以创建一个计算属性 ref，这个 ref 会根据其他响应式数据动态计算 `.value`：

<div class="sfc">

```js{8-11}
import { ref, computed } from 'vue'

const hideCompleted = ref(false)
const todos = ref([
  /* ... */
])

const filteredTodos = computed(() => {
  // 根据 `todos.value` & `hideCompleted.value`
  // 返回过滤后的 todo 项目
})
```

</div>
<div class="html">

```js{10-13}
import { createApp, ref, computed } from 'vue'

createApp({
  setup() {
    const hideCompleted = ref(false)
    const todos = ref([
      /* ... */
    ])

    const filteredTodos = computed(() => {
      // 根据 `todos.value` & `hideCompleted.value`
      // 返回过滤后的 todo 项目
    })

    return {
      // ...
    }
  }
})
```

</div>

</div>

```diff
- <li v-for="todo in todos">
+ <li v-for="todo in filteredTodos">
```

计算属性会自动跟踪计算时用到的其他响应式状态，把它们收集为依赖。计算结果会被缓存，只有依赖变了才会自动更新。

现在，试着添加 `filteredTodos` 计算属性并实现计算逻辑！如果实现正确，在隐藏已完成项目的状态下勾选一个 todo，它也会马上被隐藏。
