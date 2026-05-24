# Emits {#emits}

除了接收 props，子组件还可以向父组件触发事件：

<div class="composition-api">
<div class="sfc">

```vue
<script setup>
// 声明触发的事件
const emit = defineEmits(['response'])

// 带参数触发
emit('response', 'hello from child')
</script>
```

</div>

<div class="html">

```js
export default {
  // 声明触发的事件
  emits: ['response'],
  setup(props, { emit }) {
    // 带参数触发
    emit('response', 'hello from child')
  }
}
```

</div>

</div>

<div class="options-api">

```js
export default {
  // 声明触发的事件
  emits: ['response'],
  created() {
    // 带参数触发
    this.$emit('response', 'hello from child')
  }
}
```

</div>

<span class="options-api">`this.$emit()`</span><span class="composition-api">`emit()`</span> 的第一个参数是事件名称。其他参数都会传给事件监听器。

父组件可以用 `v-on` 监听子组件触发的事件——这里的处理函数接收子组件传来的额外参数，并把它赋值给本地状态：

<div class="sfc">

```vue-html
<ChildComp @response="(msg) => childMsg = msg" />
```

</div>
<div class="html">

```vue-html
<child-comp @response="(msg) => childMsg = msg"></child-comp>
```

</div>

现在在编辑器里自己试试吧。
