# 模板引用 {#template-refs}

Vue 的声明式渲染帮你少碰 DOM，但有时仍需要直接操作 DOM。可以用特殊的 `ref` attribute：

```vue-html
<input ref="input">
```

`ref` 和 `v-for` 里的 `key` 类似，是一种特殊 attribute。元素或子组件**挂载后**，你能拿到它的引用。比如挂载后让 input 获得焦点，或在元素上初始化第三方库。

## 访问模板引用 {#accessing-the-refs}

<div class="composition-api">

组合式 API 里获取引用，用辅助函数 [`useTemplateRef()`](/api/composition-api-helpers#usetemplateref) <sup class="vt-badge" data-text="3.5+" />：

```vue
<script setup>
import { useTemplateRef, onMounted } from 'vue'

// 第一个参数必须与模板中的 ref 值匹配
const input = useTemplateRef('my-input')

onMounted(() => {
  input.value.focus()
})
</script>

<template>
  <input ref="my-input" />
</template>
```

用 TypeScript 时，IDE 和 `vue-tsc` 会根据模板里 `ref` 对应的元素或组件，自动推断 `input.value` 的类型。

<details>
<summary>3.5 前的用法</summary>

3.5 之前没有 `useTemplateRef()`，需要声明一个和模板里 `ref` **同名**的 ref：

```vue
<script setup>
import { ref, onMounted } from 'vue'

// 声明一个 ref 来存放该元素的引用
// 必须和模板里的 ref 同名
const input = ref(null)

onMounted(() => {
  input.value.focus()
})
</script>

<template>
  <input ref="input" />
</template>
```

没用 `<script setup>` 时，记得从 `setup()` 返回这个 ref：

```js{6}
export default {
  setup() {
    const input = ref(null)
    // ...
    return {
      input
    }
  }
}
```

</details>

</div>
<div class="options-api">

挂载完成后，引用在 `this.$refs` 上：

```vue
<script>
export default {
  mounted() {
    this.$refs.input.focus()
  }
}
</script>

<template>
  <input ref="input" />
</template>
```

</div>

注意：模板引用**只能在组件挂载后**访问。如果在模板的表达式里访问 <span class="options-api">`$refs.input`</span><span class="composition-api">`input`</span>，第一次渲染时是 <span class="options-api">`undefined`</span><span class="composition-api">`null`</span>——因为那时元素还不存在。

<div class="composition-api">

如果要监听模板 ref 的变化，要考虑到值可能是 `null`：

```js
watchEffect(() => {
  if (input.value) {
    input.value.focus()
  } else {
    // 此时还未挂载，或此元素已经被卸载(例如通过 v-if 控制)
  }
})
```

也可参考：[为模板引用标注类型](/guide/typescript/composition-api#typing-template-refs) <sup class="vt-badge ts" />

</div>

## 组件上的 ref {#ref-on-component}

> 本节默认你已读过[组件基础](/guide/essentials/component-basics)；也可以先跳过，以后再回来看。

模板引用也可以用在子组件上。这时拿到的是**组件实例**：

<div class="composition-api">

```vue
<script setup>
import { useTemplateRef, onMounted } from 'vue'
import Child from './Child.vue'

const childRef = useTemplateRef('child')

onMounted(() => {
  // childRef.value 将持有 <Child /> 的实例
})
</script>

<template>
  <Child ref="child" />
</template>
```

<details>
<summary>3.5 前的用法</summary>

```vue
<script setup>
import { ref, onMounted } from 'vue'
import Child from './Child.vue'

const child = ref(null)

onMounted(() => {
  // child.value 是 <Child /> 组件的实例
})
</script>

<template>
  <Child ref="child" />
</template>
```

</details>

</div>
<div class="options-api">

```vue
<script>
import Child from './Child.vue'

export default {
  components: {
    Child
  },
  mounted() {
    // this.$refs.child 是 <Child /> 组件的实例
  }
}
</script>

<template>
  <Child ref="child" />
</template>
```

</div>

子组件用选项式 API <span class="composition-api">或没用 `<script setup>`</span> 时，拿到的实例和子组件的 `this` 一样，父组件能访问子组件的**所有**属性和方法。这样很容易写出紧耦合的父子逻辑，所以**只在真的需要时**才用组件引用。平时优先用 props 和 emit。

<div class="composition-api">

例外：用了 `<script setup>` 的子组件**默认是私有的**，父组件拿不到里面的任何东西，除非子组件用 `defineExpose` 显式暴露：

```vue
<script setup>
import { ref } from 'vue'

const a = 1
const b = ref(2)

// 像 defineExpose 这样的编译器宏不需要导入
defineExpose({
  a,
  b
})
</script>
```

父组件通过模板引用拿到实例时，类型是 `{ a: number, b: number }`（ref 会自动解包，和普通实例一样）。

`defineExpose` 必须在任何 `await` **之前**调用；`await` 之后再暴露的属性和方法访问不到。

TypeScript 用户请参考：[为组件的模板引用标注类型](/guide/typescript/composition-api#typing-component-template-refs) <sup class="vt-badge ts" />

</div>
<div class="options-api">

`expose` 选项可以限制父组件能访问什么：

```js
export default {
  expose: ['publicData', 'publicMethod'],
  data() {
    return {
      publicData: 'foo',
      privateData: 'bar'
    }
  },
  methods: {
    publicMethod() {
      /* ... */
    },
    privateMethod() {
      /* ... */
    }
  }
}
```

上面例子里，父组件通过模板引用只能访问 `publicData` 和 `publicMethod`。

</div>

## `v-for` 中的模板引用 {#refs-inside-v-for}

> 需要 v3.5 及以上版本

<div class="composition-api">

在 `v-for` 里用模板引用时，ref 的值是一个**数组**，挂载后会包含列表里所有对应元素：

```vue
<script setup>
import { ref, useTemplateRef, onMounted } from 'vue'

const list = ref([
  /* ... */
])

const itemRefs = useTemplateRef('items')

onMounted(() => console.log(itemRefs.value))
</script>

<template>
  <ul>
    <li v-for="item in list" ref="items">
      {{ item }}
    </li>
  </ul>
</template>
```

[在演练场中尝试一下](https://play.vuejs.org/#eNp9UsluwjAQ/ZWRLwQpDepyQoDUIg6t1EWUW91DFAZq6tiWF4oU5d87dtgqVRyyzLw3b+aN3bB7Y4ptQDZkI1dZYTw49MFMuBK10dZDAxZXOQSHC6yNLD3OY6zVsw7K4xJaWFldQ49UelxxVWnlPEhBr3GszT6uc7jJ4fazf4KFx5p0HFH+Kme9CLle4h6bZFkfxhNouAIoJVqfHQSKbSkDFnVpMhEpovC481NNVcr3SaWlZzTovJErCqgydaMIYBRk+tKfFLC9Wmk75iyqg1DJBWfRxT7pONvTAZom2YC23QsMpOg0B0l0NDh2YjnzjpyvxLrYOK1o3ckLZ5WujSBHr8YL2gxnw85lxEop9c9TynkbMD/kqy+svv/Jb9wu5jh7s+jQbpGzI+ZLu0byEuHZ+wvt6Ays9TJIYl8A5+i0DHHGjvYQ1JLGPuOlaR/TpRFqvXCzHR2BO5iKg0Zmm/ic0W2ZXrB+Gve2uEt1dJKs/QXbwePE)

<details>
<summary>3.5 前的用法</summary>

3.5 以前没有 `useTemplateRef()`，要声明一个和模板 `ref` 同名的 ref，值必须是数组。

```vue
<script setup>
import { ref, onMounted } from 'vue'

const list = ref([
  /* ... */
])

const itemRefs = ref([])

onMounted(() => console.log(itemRefs.value))
</script>

<template>
  <ul>
    <li v-for="item in list" ref="itemRefs">
      {{ item }}
    </li>
  </ul>
</template>
```

</details>

</div>
<div class="options-api">

在 `v-for` 里用模板引用时，`$refs` 里对应的是数组：

```vue
<script>
export default {
  data() {
    return {
      list: [
        /* ... */
      ]
    }
  },
  mounted() {
    console.log(this.$refs.items)
  }
}
</script>

<template>
  <ul>
    <li v-for="item in list" ref="items">
      {{ item }}
    </li>
  </ul>
</template>
```

[在演练场中尝试一下](https://play.vuejs.org/#eNpFjk0KwjAQha/yCC4Uaou6kyp4DuOi2KkGYhKSiQildzdNa4WQmTc/37xeXJwr35HEUdTh7pXjszT0cdYzWuqaqBm9NEDbcLPeTDngiaM3PwVoFfiI667AvsDhNpWHMQzF+L9sNEztH3C3JlhNpbaPNT9VKFeeulAqplfY5D1p0qurxVQSqel0w5QUUEedY8q0wnvbWX+SYgRAmWxIiuSzm4tBinkc6HvkuSE7TIBKq4lZZWhdLZfE8AWp4l3T)

</div>

注意：ref 数组的顺序**不一定**和源数组一致。

## 函数模板引用 {#function-refs}

除了字符串名字，`ref` 还可以绑成函数，每次组件更新都会调用，第一个参数是元素引用：

```vue-html
<input :ref="(el) => { /* 将 el 赋值给一个数据属性或 ref 变量 */ }">
```

这里要用动态的 `:ref` 才能传函数。元素卸载时函数会再调一次，此时 `el` 是 `null`。也可以绑组件方法，不必写内联函数。
