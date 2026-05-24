# Teleport {#teleport}

`<Teleport>` 是内置组件，可以把组件里的一部分模板「传送」到当前 DOM 结构之外去渲染。

## 基本用法 {#basic-usage}

有时模板在逻辑上属于某个组件，但从整页来看，又应该渲染到别处，甚至 Vue 应用外面。

最常见的是全屏模态框：按钮和弹层最好写在同一个组件里（都和开关状态有关），但这样会渲染在 DOM 很深的位置，CSS 很难写。

例如：

```vue-html
<div class="outer">
  <h3>Tooltips with Vue 3 Teleport</h3>
  <div>
    <MyModal />
  </div>
</div>
```

下面看 `<MyModal>` 的实现：

<div class="composition-api">

```vue
<script setup>
import { ref } from 'vue'

const open = ref(false)
</script>

<template>
  <button @click="open = true">Open Modal</button>

  <div v-if="open" class="modal">
    <p>Hello from the modal!</p>
    <button @click="open = false">Close</button>
  </div>
</template>

<style scoped>
.modal {
  position: fixed;
  z-index: 999;
  top: 20%;
  left: 50%;
  width: 300px;
  margin-left: -150px;
}
</style>
```

</div>
<div class="options-api">

```vue
<script>
export default {
  data() {
    return {
      open: false
    }
  }
}
</script>

<template>
  <button @click="open = true">Open Modal</button>

  <div v-if="open" class="modal">
    <p>Hello from the modal!</p>
    <button @click="open = false">Close</button>
  </div>
</template>

<style scoped>
.modal {
  position: fixed;
  z-index: 999;
  top: 20%;
  left: 50%;
  width: 300px;
  margin-left: -150px;
}
</style>
```

</div>

组件里有一个 `<button>` 打开模态框，还有一个 class 为 `.modal` 的 `<div>` 放内容和关闭按钮。

直接这样用时，可能遇到这些问题：

- `position: fixed` 要相对窗口定位，要求祖先元素没有 `transform`、`perspective` 或 `filter`。给 `<div class="outer">` 做 `transform` 动画时，可能把模态框布局弄乱。

- 模态框的 `z-index` 受父容器限制。别的元素如果叠在 `<div class="outer">` 上且层级更高，会盖住模态框。

`<Teleport>` 可以避开这些 DOM 结构问题。用 `<Teleport>` 改写 `<MyModal>`：

```vue-html{3,8}
<button @click="open = true">Open Modal</button>

<Teleport to="body">
  <div v-if="open" class="modal">
    <p>Hello from the modal!</p>
    <button @click="open = false">Close</button>
  </div>
</Teleport>
```

`<Teleport>` 用 `to` prop 指定目标。`to` 可以是 CSS 选择器字符串，或 DOM 元素对象。上面代码的意思是：把下面这段模板**挂到 `body` 下**。

点下面按钮，再在开发者工具的 `<body>` 里可以看到模态框：

<script setup>
import { ref } from 'vue'
const open = ref(false)
</script>

<div class="demo">
  <button @click="open = true">Open Modal</button>
  <ClientOnly>
    <Teleport to="body">
      <div v-if="open" class="demo modal-demo">
        <p style="margin-bottom:20px">Hello from the modal!</p>
        <button @click="open = false">Close</button>
      </div>
    </Teleport>
  </ClientOnly>
</div>

<style>
.modal-demo {
  position: fixed;
  z-index: 999;
  top: 20%;
  left: 50%;
  width: 300px;
  margin-left: -150px;
  background-color: var(--vt-c-bg);
  padding: 30px;
  border-radius: 8px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
}
</style>

`<Teleport>` 也可以和 [`<Transition>`](./transition) 一起用，做带动画的模态框。见[这个示例](/examples/#modal)。

:::tip
`<Teleport>` 挂载时，`to` 指向的目标必须已经在 DOM 里。最好放在整个 Vue 应用 DOM 树外面。如果目标也是 Vue 渲染的，要先挂载目标，再挂载 `<Teleport>`。
:::

## 搭配组件使用 {#using-with-components}

`<Teleport>` 只改 DOM 渲染位置，不改组件之间的逻辑关系。`<Teleport>` 里包的组件，在逻辑上仍是外层组件的子组件，props 和事件照常工作。

父组件的 provide/inject 也照常。在 Vue Devtools 里，子组件仍显示在父组件下面，而不是显示在 DOM 实际挂载的位置。

## 禁用 Teleport {#disabling-teleport}

有时需要按情况关掉 `<Teleport>`。例如桌面端当浮层，移动端当行内内容。可以给 `<Teleport>` 动态传 `disabled`：

```vue-html
<Teleport :disabled="isMobile">
  ...
</Teleport>
```

再动态更新 `isMobile` 即可。

## 多个 Teleport 共享目标 {#multiple-teleports-on-the-same-target}

可复用的 `<Modal>` 可能同时有多个实例。多个 `<Teleport>` 可以挂到同一个目标上，按挂载顺序依次追加，后挂的在后面。

例如：

```vue-html
<Teleport to="#modals">
  <div>A</div>
</Teleport>
<Teleport to="#modals">
  <div>B</div>
</Teleport>
```

渲染的结果为：

```html
<div id="modals">
  <div>A</div>
  <div>B</div>
</div>
```

## 延迟解析的 Teleport <sup class="vt-badge" data-text="3.5+" /> {#deferred-teleport}

Vue 3.5+ 可用 `defer` prop，推迟解析 Teleport 目标，等应用其他部分先挂载。这样可以把组件树后面才渲染的容器当作目标：

```vue-html
<Teleport defer to="#late-div">...</Teleport>

<!-- 稍后出现于模板中的某处 -->
<div id="late-div"></div>
```

注意：目标必须和 Teleport 在同一轮挂载/更新里出现。如果 `<div>` 晚一秒才挂上，Teleport 仍会报错。`defer` 的思路类似 `mounted` 钩子。

---

**参考**

- [`<Teleport>` API 参考](/api/built-in-components#teleport)
- [在 SSR 中处理 Teleports](/guide/scaling-up/ssr#teleports)
