# 侦听器 {#watchers}

## 基本示例 {#basic-example}

计算属性可以声明式地算出衍生值。但有时需要在状态变化时执行「副作用」：例如改 DOM，或根据异步结果改另一处状态。

<div class="options-api">

在选项式 API 中，可以用 [`watch` 选项](/api/options-state#watch)，在响应式属性变化时执行函数。

```js
export default {
  data() {
    return {
      question: '',
      answer: 'Questions usually contain a question mark. ;-)',
      loading: false
    }
  },
  watch: {
    // 每当 question 改变时，这个函数就会执行
    question(newQuestion, oldQuestion) {
      if (newQuestion.includes('?')) {
        this.getAnswer()
      }
    }
  },
  methods: {
    async getAnswer() {
      this.loading = true
      this.answer = 'Thinking...'
      try {
        const res = await fetch('https://yesno.wtf/api')
        this.answer = (await res.json()).answer
      } catch (error) {
        this.answer = 'Error! Could not reach the API. ' + error
      } finally {
        this.loading = false
      }
    }
  }
}
```

```vue-html
<p>
  Ask a yes/no question:
  <input v-model="question" :disabled="loading" />
</p>
<p>{{ answer }}</p>
```

[在演练场中尝试一下](https://play.vuejs.org/#eNp9VE1v2zAM/SucLnaw1D70lqUbsiKH7rB1W4++aDYdq5ElTx9xgiD/fbT8lXZFAQO2+Mgn8pH0mW2aJjl4ZCu2trkRjfucKTw22jgosOReOjhnCqDgjseL/hvAoPNGjSeAvx6tE1qtIIqWo5Er26Ih088BteCt51KeINfKcaGAT5FQc7NP4NPNYiaQmhdC7VZQcmlxMF+61yUcWu7yajVmkabQVqjwgGZmzSuudmiX4CphofQqD+ZWSAnGqz5y9I4VtmOuS9CyGA9T3QCihGu3RKhc+gJtHH2JFld+EG5Mdug2QYZ4MSKhgBd11OgqXdipEm5PKoer0Jk2kA66wB044/EF1GtOSPRUCbUnryRJosnFnK4zpC5YR7205M9bLhyUSIrGUeVcY1dpekKrdNK6MuWNiKYKXt8V98FElDxbknGxGLCpZMi7VkGMxmjzv0pz1tvO4QPcay8LULoj5RToKoTN40MCEXyEQDJTl0KFmXpNOqsUxudN+TNFzzqdJp8ODutGcod0Alg34QWwsXsaVtIjVXqe9h5bC9V4B4ebWhco7zI24hmDVSEs/yOxIPOQEFnTnjzt2emS83nYFrhcevM6nRJhS+Ys9aoUu6Av7WqoNWO5rhsh0fxownplbBqhjJEmuv0WbN2UDNtDMRXm+zfsz/bY2TL2SH1Ec8CMTZjjhqaxh7e/v+ORvieQqvaSvN8Bf6HV0veSdG5fvSoo7Su/kO1D3f13SKInuz06VHYsahzzfl0yRj+s+3dKn9O9TW7HPrPLP624lFU=)

`watch` 选项也支持用 `.` 分隔的路径作为键：

```js
export default {
  watch: {
    // 注意：只能是简单的路径，不支持表达式。
    'some.nested.key'(newValue) {
      // ...
    }
  }
}
```

</div>

<div class="composition-api">

在组合式 API 中，可以用 [`watch` 函数](/api/reactivity-core#watch)，在响应式状态变化时执行回调：

```vue
<script setup>
import { ref, watch } from 'vue'

const question = ref('')
const answer = ref('Questions usually contain a question mark. ;-)')
const loading = ref(false)

// 可以直接侦听一个 ref
watch(question, async (newQuestion, oldQuestion) => {
  if (newQuestion.includes('?')) {
    loading.value = true
    answer.value = 'Thinking...'
    try {
      const res = await fetch('https://yesno.wtf/api')
      answer.value = (await res.json()).answer
    } catch (error) {
      answer.value = 'Error! Could not reach the API. ' + error
    } finally {
      loading.value = false
    }
  }
})
</script>

<template>
  <p>
    Ask a yes/no question:
    <input v-model="question" :disabled="loading" />
  </p>
  <p>{{ answer }}</p>
</template>
```

[在演练场中尝试一下](https://play.vuejs.org/#eNp9U8Fy0zAQ/ZVFF9tDah96C2mZ0umhHKBAj7oIe52oUSQjyXEyGf87KytyoDC9JPa+p+e3b1cndtd15b5HtmQrV1vZeXDo++6Wa7nrjPVwAovtAgbh6w2M0Fqzg4xOZFxzXRvtPPzq0XlpNNwEbp5lRUKEdgPaVP925jnoXS+UOgKxvJAaxEVjJ+y2hA9XxUVFGdFIvT7LtEI5JIzrqjrbGozdOmikxdqTKqmIQOV6gvOkvQDhjrqGXOOQvCzAqCa9FHBzCyeuAWT7F6uUulZ9gy7PPmZFETmQjJV7oXoke972GJHY+Axkzxupt4FalhRcYHh7TDIQcqA+LTriikFIDy0G59nG+84tq+qITpty8G0lOhmSiedefSaPZ0mnfHFG50VRRkbkj1BPceVorbFzF/+6fQj4O7g3vWpAm6Ao6JzfINw9PZaQwXuYNJJuK/U0z1nxdTLT0M7s8Ec/I3WxquLS0brRi8ddp4RHegNYhR0M/Du3pXFSAJU285osI7aSuus97K92pkF1w1nCOYNlI534qbCh8tkOVasoXkV1+sjplLZ0HGN5Vc1G2IJ5R8Np5XpKlK7J1CJntdl1UqH92k0bzdkyNc8ZRWGGz1MtbMQi1esN1tv/1F/cIdQ4e6LJod0jZzPmhV2jj/DDjy94oOcZpK57Rew3wO/ojOpjJIH2qdcN2f6DN7l9nC47RfTsHg4etUtNpZUeJz5ndPPv32j9Yve6vE6DZuNvu1R2Tg==)

### 侦听数据源类型 {#watch-source-types}

`watch` 的第一个参数可以是多种「数据源」：ref（含计算属性）、响应式对象、[getter 函数](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Functions/get#description)，或多个数据源组成的数组：

```js
const x = ref(0)
const y = ref(0)

// 单个 ref
watch(x, (newX) => {
  console.log(`x is ${newX}`)
})

// getter 函数
watch(
  () => x.value + y.value,
  (sum) => {
    console.log(`sum of x + y is: ${sum}`)
  }
)

// 多个来源组成的数组
watch([x, () => y.value], ([newX, newY]) => {
  console.log(`x is ${newX} and y is ${newY}`)
})
```

注意：不能直接侦听响应式对象的属性值，例如：

```js
const obj = reactive({ count: 0 })

// 错误，因为 watch() 得到的参数是一个 number
watch(obj.count, (count) => {
  console.log(`Count is: ${count}`)
})
```

这时要用返回该属性的 getter 函数：

```js
// 提供一个 getter 函数
watch(
  () => obj.count,
  (count) => {
    console.log(`Count is: ${count}`)
  }
)
```

</div>

## 深层侦听器 {#deep-watchers}

<div class="options-api">

`watch` 默认是浅层侦听：只有属性被赋新值时才触发回调，嵌套属性变化不会触发。要侦听所有嵌套变更，需要深层侦听器：

```js
export default {
  watch: {
    someObject: {
      handler(newValue, oldValue) {
        // 注意：在嵌套的变更中，
        // 只要没有替换对象本身，
        // 那么这里的 `newValue` 和 `oldValue` 相同
      },
      deep: true
    }
  }
}
```

</div>

<div class="composition-api">

给 `watch()` 传入响应式对象时，会隐式创建深层侦听器——所有嵌套变更都会触发回调：

```js
const obj = reactive({ count: 0 })

watch(obj, (newValue, oldValue) => {
  // 在嵌套的属性变更时触发
  // 注意：`newValue` 此处和 `oldValue` 是相等的
  // 因为它们是同一个对象！
})

obj.count++
```

相比之下，返回响应式对象的 getter 函数，只有返回不同对象时才会触发回调：

```js
watch(
  () => state.someObject,
  () => {
    // 仅当 state.someObject 被替换时触发
  }
)
```

也可以给上面的例子显式加 `deep` 选项，强制变成深层侦听器：

```js
watch(
  () => state.someObject,
  (newValue, oldValue) => {
    // 注意：`newValue` 此处和 `oldValue` 是相等的
    // *除非* state.someObject 被整个替换了
  },
  { deep: true }
)
```

</div>

在 Vue 3.5+ 中，`deep` 还可以是数字，表示最大遍历深度——Vue 会遍历对象嵌套属性的层数。

:::warning 谨慎使用
深度侦听要遍历对象里所有嵌套属性，用在大型数据结构上开销很大。请只在必要时使用，并注意性能。
:::

## 即时回调的侦听器 {#eager-watchers}

`watch` 默认懒执行：只有数据源变化时才跑回调。但有些场景希望在创建侦听器时立刻执行一次，例如先请求初始数据，状态变化后再重新请求。

<div class="options-api">

可以用带 `handler` 和 `immediate: true` 的对象声明侦听器，让回调立刻执行：

```js
export default {
  // ...
  watch: {
    question: {
      handler(newQuestion) {
        // 在组件实例创建时会立即调用
      },
      // 强制立即执行回调
      immediate: true
    }
  }
  // ...
}
```

回调第一次执行在 `created` 钩子之前。此时 Vue 已处理 `data`、`computed` 和 `methods`，所以第一次调用时这些属性都可用。

</div>

<div class="composition-api">

可以传入 `immediate: true`，让侦听器回调立刻执行：

```js
watch(
  source,
  (newValue, oldValue) => {
    // 立即执行，且当 `source` 改变时再次执行
  },
  { immediate: true }
)
```

</div>

## 一次性侦听器 {#once-watchers}

- 仅支持 3.4 及以上版本

被侦听源每次变化都会执行回调。如果只想触发一次，请用 `once: true` 选项。

<div class="options-api">

```js
export default {
  watch: {
    source: {
      handler(newValue, oldValue) {
        // 当 `source` 变化时，仅触发一次
      },
      once: true
    }
  }
}
```

</div>

<div class="composition-api">

```js
watch(
  source,
  (newValue, oldValue) => {
    // 当 `source` 变化时，仅触发一次
  },
  { once: true }
)
```

</div>

<div class="composition-api">

## `watchEffect()` \*\* {#watcheffect}

侦听器回调里常会用到和源相同的响应式状态。例如下面这段代码，在 `todoId` 引用变化时用侦听器加载远程资源：

```js
const todoId = ref(1)
const data = ref(null)

watch(
  todoId,
  async () => {
    const response = await fetch(
      `https://jsonplaceholder.typicode.com/todos/${todoId.value}`
    )
    data.value = await response.json()
  },
  { immediate: true }
)
```

注意这里 `todoId` 用了两次：一次作源，一次在回调里。

可以用 [`watchEffect` 函数](/api/reactivity-core#watcheffect) 简化上面的代码。`watchEffect()` 会自动跟踪回调里的响应式依赖。上面的侦听器可以写成：

```js
watchEffect(async () => {
  const response = await fetch(
    `https://jsonplaceholder.typicode.com/todos/${todoId.value}`
  )
  data.value = await response.json()
})
```

这个例子里，回调会立刻执行，不必设 `immediate: true`。执行时会自动把 `todoId.value` 当作依赖（类似计算属性）。`todoId.value` 一变，回调会再跑。有了 `watchEffect()`，不必再把 `todoId` 明确当作源传入。

可参考[这个例子](/examples/#fetching-data)里 `watchEffect` 和响应式数据请求的写法。

只有一个依赖时，`watchEffect()` 优势不大。依赖很多时，它能省掉手动维护依赖列表。若要侦听嵌套结构里的几个属性，`watchEffect()` 可能比深度侦听更合适——它只跟踪回调里用到的属性，不会递归跟踪全部属性。

:::tip
`watchEffect` 只在**同步**执行期间追踪依赖。异步回调里，只有第一个 `await` 之前访问到的属性会被追踪。
:::

### `watch` vs. `watchEffect` {#watch-vs-watcheffect}

`watch` 和 `watchEffect` 都能响应式地执行带副作用的回调。主要区别在于如何追踪依赖：

- `watch` 只追踪明确指定的数据源，不追踪回调里访问的其他内容；只有数据源真的变了才触发。`watch` 不会在副作用里追踪依赖，因此能更精确地控制回调触发时机。

- `watchEffect` 在副作用执行期间追踪依赖，同步执行时会自动追踪访问到的所有响应式属性。写法更方便、代码更短，但依赖关系有时不够直观。

</div>

## 副作用清理 {#side-effect-cleanup}

有时会在侦听器里执行副作用，例如异步请求：

<div class="composition-api">

```js
watch(id, (newId) => {
  fetch(`/api/${newId}`).then(() => {
    // 回调逻辑
  })
})
```

</div>
<div class="options-api">

```js
export default {
  watch: {
    id(newId) {
      fetch(`/api/${newId}`).then(() => {
        // 回调逻辑
      })
    }
  }
}
```

</div>

但如果请求完成前 `id` 又变了呢？上一个请求完成时，仍会用已过时的 ID 触发回调。理想情况是 `id` 变新值时取消旧请求。

可以用 [`onWatcherCleanup()`](/api/reactivity-core#onwatchercleanup) <sup class="vt-badge" data-text="3.5+" /> API 注册清理函数，在侦听器失效、准备重新运行前调用：

<div class="composition-api">

```js {10-13}
import { watch, onWatcherCleanup } from 'vue'

watch(id, (newId) => {
  const controller = new AbortController()

  fetch(`/api/${newId}`, { signal: controller.signal }).then(() => {
    // 回调逻辑
  })

  onWatcherCleanup(() => {
    // 终止过期请求
    controller.abort()
  })
})
```

</div>
<div class="options-api">

```js {12-15}
import { onWatcherCleanup } from 'vue'

export default {
  watch: {
    id(newId) {
      const controller = new AbortController()

      fetch(`/api/${newId}`, { signal: controller.signal }).then(() => {
        // 回调逻辑
      })

      onWatcherCleanup(() => {
        // 终止过期请求
        controller.abort()
      })
    }
  }
}
```

</div>

注意：`onWatcherCleanup` 仅 Vue 3.5+ 支持，且必须在 `watchEffect` 或 `watch` 回调的同步执行期间调用，不能在异步函数里 `await` 之后调用。

也可以把 `onCleanup` 作为第三个参数传给侦听器回调<span class="composition-api">，或作为 `watchEffect` 回调的第一个参数</span>：

<div class="composition-api">

```js
watch(id, (newId, oldId, onCleanup) => {
  // ...
  onCleanup(() => {
    // 清理逻辑
  })
})

watchEffect((onCleanup) => {
  // ...
  onCleanup(() => {
    // 清理逻辑
  })
})
```

</div>
<div class="options-api">

```js
export default {
  watch: {
    id(newId, oldId, onCleanup) {
      // ...
      onCleanup(() => {
        // 清理逻辑
      })
    }
  }
}
```

</div>

这在 3.5 之前可用。通过参数传入的 `onCleanup` 和侦听器实例绑定，不受 `onWatcherCleanup` 的同步限制。

## 回调的触发时机 {#callback-flush-timing}

修改响应式状态时，可能同时触发组件更新和侦听器回调。

和组件更新类似，用户创建的侦听器回调也会批量处理，避免重复调用。例如同步往被侦听的数组里 push 一千项，通常不希望侦听器触发一千次。

默认情况下，侦听器回调在父组件更新（如有）**之后**、本组件 DOM 更新**之前**执行。因此在回调里访问本组件 DOM 时，DOM 还是更新前的状态。

### Post Watchers {#post-watchers}

如果要在 Vue 更新 DOM **之后**再访问，需要设 `flush: 'post'` 选项：

<div class="options-api">

```js{6}
export default {
  // ...
  watch: {
    key: {
      handler() {},
      flush: 'post'
    }
  }
}
```

</div>

<div class="composition-api">

```js{2,6}
watch(source, callback, {
  flush: 'post'
})

watchEffect(callback, {
  flush: 'post'
})
```

后置刷新的 `watchEffect()` 有别名 `watchPostEffect()`：

```js
import { watchPostEffect } from 'vue'

watchPostEffect(() => {
  /* 在 Vue 更新后执行 */
})
```

</div>

### 同步侦听器 {#sync-watchers}

也可以创建同步触发的侦听器，在 Vue 做任何更新之前就触发：

<div class="options-api">

```js{6}
export default {
  // ...
  watch: {
    key: {
      handler() {},
      flush: 'sync'
    }
  }
}
```

</div>

<div class="composition-api">

```js{2,6}
watch(source, callback, {
  flush: 'sync'
})

watchEffect(callback, {
  flush: 'sync'
})
```

同步触发的 `watchEffect()` 有个更方便的别名 `watchSyncEffect()`：

```js
import { watchSyncEffect } from 'vue'

watchSyncEffect(() => {
  /* 在响应式数据变化时同步执行 */
})
```

</div>

:::warning 谨慎使用
同步侦听器不做批处理，响应式数据一变就触发。适合监视简单布尔值，但应避免用在可能连续同步修改的数据源（如数组）上。
:::

<div class="options-api">

## `this.$watch()` \* {#this-watch}

也可以用组件实例的 [`$watch()` 方法](/api/component-instance#watch)命令式创建侦听器：

```js
export default {
  created() {
    this.$watch('question', (newQuestion) => {
      // ...
    })
  }
}
```

适合在特定条件下创建侦听器，或只侦听用户交互。也可以提前停止侦听器。

</div>

## 停止侦听器 {#stopping-a-watcher}

<div class="options-api">

用 `watch` 选项或 `$watch()` 创建的侦听器，会在宿主组件卸载时自动停止。多数情况下不必手动停止。

少数情况需要在卸载前停止，可调用 `$watch()` 返回的函数：

```js
const unwatch = this.$watch('foo', callback)

// ...当该侦听器不再需要时
unwatch()
```

</div>

<div class="composition-api">

在 `setup()` 或 `<script setup>` 里用同步语句创建的侦听器，会自动绑定到宿主组件，卸载时自动停止。多数情况下不必手动停止。

关键一点：侦听器必须用**同步**语句创建。若在异步回调里创建，不会绑定到当前组件，必须手动停止，否则可能内存泄漏。例如：

```vue
<script setup>
import { watchEffect } from 'vue'

// 它会自动停止
watchEffect(() => {})

// ...这个则不会！
setTimeout(() => {
  watchEffect(() => {})
}, 100)
</script>
```

手动停止侦听器时，调用 `watch` 或 `watchEffect` 返回的函数：

```js
const unwatch = watchEffect(() => {})

// ...当该侦听器不再需要时
unwatch()
```

需要异步创建侦听器的情况很少，尽量同步创建。若要等异步数据，可以用条件式侦听：

```js
// 需要异步请求得到的数据
const data = ref(null)

watchEffect(() => {
  if (data.value) {
    // 数据加载后执行某些操作...
  }
})
```

</div>

<!-- zhlint disabled -->
