# 条件渲染 {#conditional-rendering}

<script setup>
import { ref } from 'vue'
const awesome = ref(true)
</script>

## `v-if` {#v-if}

`v-if` 用来按条件渲染一块内容。只有表达式为真时，这块内容才会渲染。

```vue-html
<h1 v-if="awesome">Vue is awesome!</h1>
```

## `v-else` {#v-else}

也可以用 `v-else` 给 `v-if` 加一个「else 区块」。

```vue-html
<button @click="awesome = !awesome">Toggle</button>

<h1 v-if="awesome">Vue is awesome!</h1>
<h1 v-else>Oh no 😢</h1>
```

<div class="demo">
  <button @click="awesome = !awesome">Toggle</button>
  <h1 v-if="awesome">Vue is awesome!</h1>
  <h1 v-else>Oh no 😢</h1>
</div>

<div class="composition-api">

[在演练场中尝试一下](https://play.vuejs.org/#eNpFjkEOgjAQRa8ydIMulLA1hegJ3LnqBskAjdA27RQXhHu4M/GEHsEiKLv5mfdf/sBOxux7j+zAuCutNAQOyZtcKNkZbQkGsFjBCJXVHcQBjYUSqtTKERR3dLpDyCZmQ9bjViiezKKgCIGwM21BGBIAv3oireBYtrK8ZYKtgmg5BctJ13WLPJnhr0YQb1Lod7JaS4G8eATpfjMinjTphC8wtg7zcwNKw/v5eC1fnvwnsfEDwaha7w==)

</div>
<div class="options-api">

[在演练场中尝试一下](https://play.vuejs.org/#eNpFjj0OwjAMha9iMsEAFWuVVnACNqYsoXV/RJpEqVOQqt6DDYkTcgRSWoplWX7y56fXs6O1u84jixlvM1dbSoXGuzWOIMdCekXQCw2QS5LrzbQLckje6VEJglDyhq1pMAZyHidkGG9hhObRYh0EYWOVJAwKgF88kdFwyFSdXRPBZidIYDWvgqVkylIhjyb4ayOIV3votnXxfwrk2SPU7S/PikfVfsRnGFWL6akCbeD9fLzmK4+WSGz4AA5dYQY=)

</div>

`v-else` 必须紧跟在 `v-if` 或 `v-else-if` 后面，否则不会被识别。

## `v-else-if` {#v-else-if}

`v-else-if` 提供相对 `v-if` 的「else if 区块」，可以连续用多次：

```vue-html
<div v-if="type === 'A'">
  A
</div>
<div v-else-if="type === 'B'">
  B
</div>
<div v-else-if="type === 'C'">
  C
</div>
<div v-else>
  Not A/B/C
</div>
```

和 `v-else` 一样，`v-else-if` 也必须紧跟在 `v-if` 或 `v-else-if` 后面。

## `<template>` 上的 `v-if` {#v-if-on-template}

`v-if` 是指令，必须写在某个元素上。如果要切换的不止一个元素，可以在 `<template>` 上用 `v-if`。它只是不可见的包装器，最终渲染结果里不会包含这个 `<template>` 元素。

```vue-html
<template v-if="ok">
  <h1>Title</h1>
  <p>Paragraph 1</p>
  <p>Paragraph 2</p>
</template>
```

`v-else` 和 `v-else-if` 也可以写在 `<template>` 上。

## `v-show` {#v-show}

另一个按条件显示元素的指令是 `v-show`，用法和 `v-if` 很像：

```vue-html
<h1 v-show="ok">Hello!</h1>
```

区别在于：`v-show` 会保留 DOM 里的元素，只切换 CSS 的 `display` 属性。

`v-show` 不能用在 `<template>` 上，也不能和 `v-else` 一起用。

## `v-if` vs. `v-show` {#v-if-vs-v-show}

`v-if` 是「真正」的条件渲染：切换时，条件区块里的事件监听器和子组件会被销毁并重建。

`v-if` 也是**惰性**的：初次渲染时条件为 false，就什么都不做。条件区块要等到条件第一次变为 true 时才渲染。

相比之下，`v-show` 更简单：不管初始条件如何，元素总会被渲染，只切换 CSS `display`。

总的来说，`v-if` 切换开销更大，`v-show` 初次渲染开销更大。需要频繁切换用 `v-show` 更好；运行时条件很少变，用 `v-if` 更合适。

## `v-if` 和 `v-for` {#v-if-with-v-for}

当 `v-if` 和 `v-for` 在同一元素上时，`v-if` 会先执行。详见[列表渲染指南](list#v-for-with-v-if)。

::: warning 警告
同时使用 `v-if` 和 `v-for` **不推荐**，因为优先级不清晰。详见[列表渲染指南](list#v-for-with-v-if)。
:::
