# 侦听器 {#watchers}

有时我们需要在数据变化时执行一些「副作用」——比如，数字变了就输出到控制台。我们可以用侦听器来实现：

<div class="composition-api">

```js
import { ref, watch } from 'vue'

const count = ref(0)

watch(count, (newCount) => {
  // 没错，console.log() 是一个副作用
  console.log(`new count is: ${newCount}`)
})
```

`watch()` 可以直接侦听一个 ref。只要 `count` 的值变了，就会触发回调。`watch()` 也可以侦听其他类型的数据源——更多细节请看<a target="_blank" href="/guide/essentials/watchers.html">指南 - 侦听器</a>。

</div>
<div class="options-api">

```js
export default {
  data() {
    return {
      count: 0
    }
  },
  watch: {
    count(newCount) {
      // 没错，console.log() 是一个副作用
      console.log(`new count is: ${newCount}`)
    }
  }
}
```

这里，我们用 `watch` 选项来侦听 `count` 属性的变化。当 `count` 改变时，侦听回调会被调用，并接收新值作为参数。更多细节请看<a target="_blank" href="/guide/essentials/watchers.html">指南 - 侦听器</a>。

</div>

比控制台输出更实际的例子是：ID 变了就去抓取新数据。右边的例子就是这样一个组件。组件挂载时，会从模拟 API 抓取 todo 数据。还有一个按钮可以改变要抓取的 todo ID。现在，试着实现一个侦听器，让组件在按钮被点击时抓取新的 todo 项目。
