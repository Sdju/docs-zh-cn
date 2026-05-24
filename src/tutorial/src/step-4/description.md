# 事件监听 {#event-listeners}

我们可以用 `v-on` 指令监听 DOM 事件：

```vue-html
<button v-on:click="increment">{{ count }}</button>
```

因为很常用，`v-on` 也有简写语法：

```vue-html
<button @click="increment">{{ count }}</button>
```

<div class="options-api">

这里，`increment` 引用的是用 `methods` 选项声明的函数：

<div class="sfc">

```js{7-12}
export default {
  data() {
    return {
      count: 0
    }
  },
  methods: {
    increment() {
      // 更新组件状态
      this.count++
    }
  }
}
```

</div>
<div class="html">

```js{7-12}
createApp({
  data() {
    return {
      count: 0
    }
  },
  methods: {
    increment() {
      // 更新组件状态
      this.count++
    }
  }
})
```

</div>

在方法里，我们可以用 `this` 访问组件实例。组件实例会暴露 `data` 里声明的数据属性。改这些属性的值，就能更新组件状态。

</div>

<div class="composition-api">

<div class="sfc">

这里，`increment` 引用的是在 `<script setup>` 里声明的函数：

```vue{6-9}
<script setup>
import { ref } from 'vue'

const count = ref(0)

function increment() {
  // 更新组件状态
  count.value++
}
</script>
```

</div>

<div class="html">

这里，`increment` 引用的是从 `setup()` 返回的方法：

```js{$}
setup() {
  const count = ref(0)

  function increment(e) {
    // 更新组件状态
    count.value++
  }

  return {
    count,
    increment
  }
}
```

</div>

在函数里，我们可以通过修改 ref 来更新组件状态。

</div>

事件处理函数也可以用内联表达式，还可以用修饰符简化常见任务。这些细节请看<a target="_blank" href="/guide/essentials/event-handling.html">指南 - 事件处理</a>。

现在，试着自己实现 `increment` <span class="options-api">方法</span><span class="composition-api">函数</span>，并用 `v-on` 把它绑定到按钮上。
