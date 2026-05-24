# 生命周期和模板引用 {#lifecycle-and-template-refs}

到目前为止，Vue 帮我们处理了所有 DOM 更新，这靠响应式和声明式渲染。但有时我们仍需要手动操作 DOM。

这时要用**模板引用**——也就是指向模板里某个 DOM 元素的 ref。我们需要通过<a target="_blank" href="/api/built-in-special-attributes.html#ref">这个特殊的 `ref` attribute</a> 来实现：

```vue-html
<p ref="pElementRef">hello</p>
```

<div class="composition-api">

要访问这个引用，我们需要声明<span class="html">并暴露</span>一个同名的 ref：

<div class="sfc">

```js
const pElementRef = ref(null)
```

</div>
<div class="html">

```js
setup() {
  const pElementRef = ref(null)

  return {
    pElementRef
  }
}
```

</div>

注意：这个 ref 用 `null` 初始化。因为当 <span class="sfc">`<script setup>`</span><span class="html">`setup()`</span> 执行时，DOM 元素还不存在。模板引用 ref 只能在组件**挂载**后访问。

要在挂载后执行代码，我们可以用 `onMounted()` 函数：

<div class="sfc">

```js
import { onMounted } from 'vue'

onMounted(() => {
  // 此时组件已经挂载。
})
```

</div>
<div class="html">

```js
import { onMounted } from 'vue'

createApp({
  setup() {
    onMounted(() => {
      // 此时组件已经挂载。
    })
  }
})
```

</div>
</div>

<div class="options-api">

这个元素会作为 `this.$refs.pElementRef` 暴露在 `this.$refs` 上。不过，你只能在组件**挂载**之后访问它。

要在挂载后执行代码，我们可以用 `mounted` 选项：

<div class="sfc">

```js
export default {
  mounted() {
    // 此时组件已经挂载。
  }
}
```

</div>
<div class="html">

```js
createApp({
  mounted() {
    // 此时组件已经挂载。
  }
})
```

</div>

</div>

这叫做**生命周期钩子**——它让我们注册一个在组件特定生命周期调用的回调函数。还有其他钩子，比如 <span class="options-api">`created` 和 `updated`</span><span class="composition-api">`onUpdated` 和 `onUnmounted`</span>。更多细节请看<a target="_blank" href="/guide/essentials/lifecycle.html#lifecycle-diagram">生命周期图示</a>。

现在，试着添加一个 <span class="options-api">`mounted`</span><span class="composition-api">`onMounted`</span> 钩子，然后通过 <span class="options-api">`this.$refs.pElementRef`</span><span class="composition-api">`pElementRef.value`</span> 访问 `<p>`，并直接对它做 DOM 操作（例如修改它的 `textContent`）。
