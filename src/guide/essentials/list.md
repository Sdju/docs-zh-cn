# 列表渲染 {#list-rendering}

## `v-for` {#v-for}

用 `v-for` 指令可以按数组渲染列表。`v-for` 的值要用 `item in items` 这种写法：`items` 是源数据数组，`item` 是每项的**别名**：

<div class="composition-api">

```js
const items = ref([{ message: 'Foo' }, { message: 'Bar' }])
```

</div>

<div class="options-api">

```js
data() {
  return {
    items: [{ message: 'Foo' }, { message: 'Bar' }]
  }
}
```

</div>

```vue-html
<li v-for="item in items">
  {{ item.message }}
</li>
```

在 `v-for` 块里可以访问父作用域的属性和变量。`v-for` 还可以用第二个参数表示当前项的索引。

<div class="composition-api">

```js
const parentMessage = ref('Parent')
const items = ref([{ message: 'Foo' }, { message: 'Bar' }])
```

</div>
<div class="options-api">

```js
data() {
  return {
    parentMessage: 'Parent',
    items: [{ message: 'Foo' }, { message: 'Bar' }]
  }
}
```

</div>

```vue-html
<li v-for="(item, index) in items">
  {{ parentMessage }} - {{ index }} - {{ item.message }}
</li>
```

<script setup>
const parentMessage = 'Parent'
const items = [{ message: 'Foo' }, { message: 'Bar' }]
</script>
<div class="demo">
  <li v-for="(item, index) in items">
    {{ parentMessage }} - {{ index }} - {{ item.message }}
  </li>
</div>

<div class="composition-api">

[在演练场中尝试一下](https://play.vuejs.org/#eNpdTsuqwjAQ/ZVDNlFQu5d64bpwJ7g3LopOJdAmIRlFCPl3p60PcDWcM+eV1X8Iq/uN1FrV6RxtYCTiW/gzzvbBR0ZGpBYFbfQ9tEi1ccadvUuM0ERyvKeUmithMyhn+jCSev4WWaY+vZ7HjH5Sr6F33muUhTR8uW0ThTuJua6mPbJEgGSErmEaENedxX3Z+rgxajbEL2DdhR5zOVOdUSIEDOf8M7IULCHsaPgiMa1eK4QcS6rOSkhdfapVeQLQEWnH)

</div>
<div class="options-api">

[在演练场中尝试一下](https://play.vuejs.org/#eNpVTssKwjAQ/JUllyr0cS9V0IM3wbvxEOxWAm0a0m0phPy7m1aqhpDsDLMz48XJ2nwaUZSiGp5OWzpKg7PtHUGNjRpbAi8NQK1I7fbrLMkhjc5EJAn4WOXQ0BWHQb2whOS24CSN6qjXhN1Qwt1Dt2kufZ9ASOGXOyvH3GMNCdGdH75VsZVjwGa2VYQRUdVqmLKmdwcpdjEnBW1qnPf8wZIrBQujoff/RSEEyIDZZeGLeCn/dGJyCSlazSZVsUWL8AYme21i)

</div>

`v-for` 变量的作用域和下面这段 JavaScript 很像：

```js
const parentMessage = 'Parent'
const items = [
  /* ... */
]

items.forEach((item, index) => {
  // 可以访问外层的 `parentMessage`
  // 而 `item` 和 `index` 只在这个作用域可用
  console.log(parentMessage, item.message, index)
})
```

注意 `v-for` 和 `forEach` 回调的参数写法是对应的。定义 `v-for` 的变量别名时也可以用解构，就像函数参数解构一样：

```vue-html
<li v-for="{ message } in items">
  {{ message }}
</li>

<!-- 有 index 索引时 -->
<li v-for="({ message }, index) in items">
  {{ message }} {{ index }}
</li>
```

多层嵌套 `v-for` 时，作用域规则和函数类似：每个 `v-for` 作用域都能访问父级作用域：

```vue-html
<li v-for="item in items">
  <span v-for="childItem in item.children">
    {{ item.message }} {{ childItem }}
  </span>
</li>
```

也可以用 `of` 代替 `in` 作为分隔符，更接近 JavaScript 的迭代器写法：

```vue-html
<div v-for="item of items"></div>
```

## `v-for` 与对象 {#v-for-with-an-object}

也可以用 `v-for` 遍历对象的所有属性。遍历顺序和对该对象调用 `Object.values()` 的结果一致。

<div class="composition-api">

```js
const myObject = reactive({
  title: 'How to do lists in Vue',
  author: 'Jane Doe',
  publishedAt: '2016-04-10'
})
```

</div>
<div class="options-api">

```js
data() {
  return {
    myObject: {
      title: 'How to do lists in Vue',
      author: 'Jane Doe',
      publishedAt: '2016-04-10'
    }
  }
}
```

</div>

```vue-html
<ul>
  <li v-for="value in myObject">
    {{ value }}
  </li>
</ul>
```

第二个参数可以是属性名（例如 key）：

```vue-html
<li v-for="(value, key) in myObject">
  {{ key }}: {{ value }}
</li>
```

第三个参数表示位置索引：

```vue-html
<li v-for="(value, key, index) in myObject">
  {{ index }}. {{ key }}: {{ value }}
</li>
```

<div class="composition-api">

[在演练场中尝试一下](https://play.vuejs.org/#eNo9jjFvgzAQhf/KE0sSCQKpqg7IqRSpQ9WlWycvBC6KW2NbcKaNEP+9B7Tx4nt33917Y3IKYT9ESspE9XVnAqMnjuFZO9MG3zFGdFTVbAbChEvnW2yE32inXe1dz2hv7+dPqhnHO7kdtQPYsKUSm1f/DfZoPKzpuYdx+JAL6cxUka++E+itcoQX/9cO8SzslZoTy+yhODxlxWN2KMR22mmn8jWrpBTB1AZbMc2KVbTyQ56yBkN28d1RJ9uhspFSfNEtFf+GfnZzjP/oOll2NQPjuM4xTftZyIaU5VwuN0SsqMqtWZxUvliq/J4jmX4BTCp08A==)

</div>
<div class="options-api">

[在演练场中尝试一下](https://play.vuejs.org/#eNo9T8FqwzAM/RWRS1pImnSMHYI3KOwwdtltJ1/cRqXe3Ng4ctYS8u+TbVJjLD3rPelpLg7O7aaARVeI8eS1ozc54M1ZT9DjWQVDMMsBoFekNtucS/JIwQ8RSQI+1/vX8QdP1K2E+EmaDHZQftg/IAu9BaNHGkEP8B2wrFYxgAp0sZ6pn2pAeLepmEuSXDiy7oL9gduXT+3+pW6f631bZoqkJY/kkB6+onnswoDw6owijIhEMByjUBgNU322/lUWm0mZgBX84r1ifz3ettHmupYskjbanedch2XZRcAKTnnvGVIPBpkqGqPTJNGkkaJ5+CiWf4KkfBs=)

</div>

## 在 `v-for` 里使用范围值 {#v-for-with-a-range}

`v-for` 可以直接写一个整数。这时模板会按 `1...n` 的范围重复渲染。

```vue-html
<span v-for="n in 10">{{ n }}</span>
```

注意这里 `n` 从 `1` 开始，不是 `0`。

## `<template>` 上的 `v-for` {#v-for-on-template}

和在模板上用 `v-if` 类似，也可以在 `<template>` 上用 `v-for` 渲染多个元素。例如：

```vue-html
<ul>
  <template v-for="item in items">
    <li>{{ item.msg }}</li>
    <li class="divider" role="presentation"></li>
  </template>
</ul>
```

## `v-for` 与 `v-if` {#v-for-with-v-if}

当它们写在同一个节点上时，`v-if` 优先级高于 `v-for`。这样 `v-if` 的条件里访问不到 `v-for` 作用域里的变量别名：

```vue-html
<!--
 这会抛出一个错误，因为属性 todo 此时
 没有在该实例上定义
-->
<li v-for="todo in todos" v-if="!todo.isComplete">
  {{ todo.name }}
</li>
```

在外面包一层 `<template>`，把 `v-for` 写在这层上可以解决这个问题（也更易读）：

```vue-html
<template v-for="todo in todos">
  <li v-if="!todo.isComplete">
    {{ todo.name }}
  </li>
</template>
```

:::warning 注意
同时用 `v-if` 和 `v-for` **不推荐**，因为优先级不够清楚。

常见有两种写法：

- 过滤列表项（例如 `v-for="user in users" v-if="user.isActive"`）。这时可以用计算属性代替 `users`，返回过滤后的列表（例如 `activeUsers`）。

- 避免渲染本应隐藏的列表（例如 `v-for="user in users" v-if="shouldShowUsers"`）。这时把 `v-if` 写到容器元素上（如 `ul`、`ol`）。
:::

## 通过 key 管理状态 {#maintaining-state-with-key}

Vue 默认用「就地更新」策略更新 `v-for` 渲染的列表。数据顺序改变时，Vue 不会移动 DOM 元素，而是原地更新每个元素，让它们仍在原来的索引位置渲染。

默认模式很高效，但**只适用于列表渲染结果不依赖子组件状态或临时 DOM 状态（例如表单输入值）的情况**。

要让 Vue 跟踪每个节点的标识、复用和重新排序已有元素，需要给每个元素对应的块设置唯一的 `key` attribute：

```vue-html
<div v-for="item in items" :key="item.id">
  <!-- 内容 -->
</div>
```

使用 `<template v-for>` 时，要把 `key` 写在这个 `<template>` 容器上：

```vue-html
<template v-for="todo in todos" :key="todo.name">
  <li>{{ todo.name }}</li>
</template>
```

:::tip 注意
这里的 `key` 是通过 `v-bind` 绑定的特殊 attribute。不要和[在 `v-for` 中使用对象](#v-for-with-an-object)里说的对象属性名搞混。
:::

只要可行，建议给 `v-for` 加上 `key` attribute，除非迭代的 DOM 很简单（例如没有组件、没有带状态的 DOM 元素），或者你故意用默认行为来提升性能。

`key` 的值应是基础类型，例如字符串或 number。不要用对象作为 `v-for` 的 key。更多细节见 [`key` API 文档](/api/built-in-special-attributes#key)。

## 组件上使用 `v-for` {#v-for-with-a-component}

> 这一节默认你已了解[组件](/guide/essentials/component-basics)，也可以先跳过，之后再回来看。

可以直接在组件上用 `v-for`，和普通元素一样（别忘了加 `key`）：

```vue-html
<MyComponent v-for="item in items" :key="item.id" />
```

但这不会自动把数据传给组件，因为组件有独立的作用域。要把迭代得到的数据传给组件，还需要传 props：

```vue-html
<MyComponent
  v-for="(item, index) in items"
  :item="item"
  :index="index"
  :key="item.id"
/>
```

不自动把 `item` 注入组件，是为了避免组件和 `v-for` 绑得太紧。明确数据来源后，组件更容易在其他场景复用。

<div class="composition-api">

这里有一个简单的 [Todo List 例子](https://play.vuejs.org/#eNp1U8Fu2zAM/RXCGGAHTWx02ylwgxZYB+ywYRhyq3dwLGYRYkuCJTsZjPz7KMmK3ay9JBQfH/meKA/Rk1Jp32G0jnJdtVwZ0Gg6tSkEb5RsDQzQ4h4usG9lAzGVxldoK5n8ZrAZsTQLCduRygAKUUmhDQg8WWyLZwMPtmESx4sAGkL0mH6xrMH+AHC2hvuljw03Na4h/iLBHBAY1wfUbsTFVcwoH28o2/KIIDuaQ0TTlvrwNu/TDe+7PDlKXZ6EZxTiN4kuRI3W0dk4u4yUf7bZfScqw6WAkrEf3m+y8AOcw7Qv6w5T1elDMhs7Nbq7e61gdmme60SQAvgfIhExiSSJeeb3SBukAy1D1aVBezL5XrYN9Csp1rrbNdykqsUehXkookl0EVGxlZHX5Q5rIBLhNHFlbRD6xBiUzlOeuZJQz4XqjI+BxjSSYe2pQWwRBZizV01DmsRWeJA1Qzv0Of2TwldE5hZRlVd+FkbuOmOksJLybIwtkmfWqg+7qz47asXpSiaN3lxikSVwwfC8oD+/sEnV+oh/qcxmU85mebepgLjDBD622Mg+oDrVquYVJm7IEu4XoXKTZ1dho3gnmdJhedEymn9ab3ysDPdc4M9WKp28xE5JbB+rzz/Trm3eK3LAu8/E7p2PNzYM/i3ChR7W7L7hsSIvR7L2Aal1EhqTp80vF95sw3WcG7r8A0XaeME=)，演示如何用 `v-for` 渲染组件列表，并给每个实例传入不同数据。

</div>
<div class="options-api">

这里有一个简单的 [Todo List 例子](https://play.vuejs.org/#eNqNVE2PmzAQ/SsjVIlEm4C27Qmx0a7UVuqhPVS5lT04eFKsgG2BSVJF+e8d2xhIu10tihR75s2bNx9wiZ60To49RlmUd2UrtNkUUjRatQa2iquvBhvYt6qBOEmDwQbEhQQoJJ4dlOOe9bWBi7WWiuIlStNlcJlYrivr5MywxdIDAVo0fSvDDUDiyeK3eDYZxLGLsI8hI7H9DHeYQuwjeAb3I9gFCFMjUXxSYCoELroKO6fZP17Mf6jev0i1ZQcE1RtHaFrWVW/l+/Ai3zd1clQ1O8k5Uzg+j1HUZePaSFwfvdGhfNIGTaW47bV3Mc6/+zZOfaaslegS18ZE9121mIm0Ep17ynN3N5M8CB4g44AC4Lq8yTFDwAPNcK63kPTL03HR6EKboWtm0N5MvldtA8e1klnX7xphEt3ikTbpoYimsoqIwJY0r9kOa6Ag8lPeta2PvE+cA3M7k6cOEvBC6n7UfVw3imPtQ8eiouAW/IY0mElsiZWqOdqkn5NfCXxB5G6SJRvj05By1xujpJWUp8PZevLUluqP/ajPploLasmk0Re3sJ4VCMnxvKQ//0JMqrID/iaYtSaCz+xudsHjLpPzscVGHYO3SzpdixIXLskK7pcBucnTUdgg3kkmcxhetIrmH4ebr8m/n4jC6FZp+z7HTlLsVx1p4M7odcXPr6+Lnb8YOne5+C2F6/D6DH2Hx5JqOlCJ7yz7IlBTbZsf7vjXVBzjvLDrH5T0lgo=)，演示如何用 `v-for` 渲染组件列表，并给每个实例传入不同数据。

</div>

## 数组变化侦测 {#array-change-detection}

### 变更方法 {#mutation-methods}

Vue 能侦听响应式数组的变更方法，并在调用时触发更新。这些变更方法包括：

- `push()`
- `pop()`
- `shift()`
- `unshift()`
- `splice()`
- `sort()`
- `reverse()`

### 替换一个数组 {#replacing-an-array}

变更方法会修改原数组。还有一些不可变 (immutable) 方法，例如 `filter()`、`concat()` 和 `slice()`，它们不改原数组，而是**返回新数组**。遇到这类方法时，要把旧数组替换成新数组：

<div class="composition-api">

```js
// `items` 是一个数组的 ref
items.value = items.value.filter((item) => item.message.match(/Foo/))
```

</div>
<div class="options-api">

```js
this.items = this.items.filter((item) => item.message.match(/Foo/))
```

</div>

你可能担心 Vue 会丢掉现有 DOM、重新渲染整个列表——其实不会。Vue 会尽量复用 DOM 元素，所以即使用另一个有部分重叠项的新数组替换，通常仍然很高效。

## 展示过滤或排序后的结果 {#displaying-filtered-sorted-results}

有时只想显示过滤或排序后的数组，又不想改动原始数据。这时可以用计算属性返回过滤或排序后的结果。

例如：

<div class="composition-api">

```js
const numbers = ref([1, 2, 3, 4, 5])

const evenNumbers = computed(() => {
  return numbers.value.filter((n) => n % 2 === 0)
})
```

</div>
<div class="options-api">

```js
data() {
  return {
    numbers: [1, 2, 3, 4, 5]
  }
},
computed: {
  evenNumbers() {
    return this.numbers.filter(n => n % 2 === 0)
  }
}
```

</div>

```vue-html
<li v-for="n in evenNumbers">{{ n }}</li>
```

如果计算属性不方便（例如在多层嵌套 `v-for` 里），可以用下面的方法：

<div class="composition-api">

```js
const sets = ref([
  [1, 2, 3, 4, 5],
  [6, 7, 8, 9, 10]
])

function even(numbers) {
  return numbers.filter((number) => number % 2 === 0)
}
```

</div>
<div class="options-api">

```js
data() {
  return {
    sets: [[ 1, 2, 3, 4, 5 ], [6, 7, 8, 9, 10]]
  }
},
methods: {
  even(numbers) {
    return numbers.filter(number => number % 2 === 0)
  }
}
```

</div>

```vue-html
<ul v-for="numbers in sets">
  <li v-for="n in even(numbers)">{{ n }}</li>
</ul>
```

在计算属性里用 `reverse()` 和 `sort()` 时要小心：它们会修改原数组，计算函数里不应这样做。调用前先复制一份原数组：

```diff
- return numbers.reverse()
+ return [...numbers].reverse()
```
