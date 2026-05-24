---
outline: deep
---

# 响应式基础 {#reactivity-fundamentals}

:::tip API 参考
本页和后面很多章节都会给出选项式 API 和组合式 API 的示例。你当前选中的是 <span class="options-api">选项式 API</span><span class="composition-api">组合式 API</span>。可以用左侧侧边栏顶部的「API 风格偏好」开关切换。
:::

<div class="options-api">

## 声明响应式状态 \* {#declaring-reactive-state}

用选项式 API 时，用 `data` 选项声明响应式状态。它的值应该是一个**返回对象**的函数。Vue 创建组件实例时会调用这个函数，把返回的对象交给响应式系统包装。对象里所有顶层属性都会挂到组件实例上（也就是 `methods` 和生命周期钩子里的 `this`）。

```js{2-6}
export default {
  data() {
    return {
      count: 1
    }
  },

  // `mounted` 是生命周期钩子，之后我们会讲到
  mounted() {
    // `this` 指向当前组件实例
    console.log(this.count) // => 1

    // 数据属性也可以被更改
    this.count = 2
  }
}
```

[在演练场中尝试一下](https://play.vuejs.org/#eNpFUNFqhDAQ/JXBpzsoHu2j3B2U/oYPpnGtoetGkrW2iP/eRFsPApthd2Zndilex7H8mqioimu0wY16r4W+Rx8ULXVmYsVSC9AaNafz/gcC6RTkHwHWT6IVnne85rI+1ZLr5YJmyG1qG7gIA3Yd2R/LhN77T8y9sz1mwuyYkXazcQI2SiHz/7iP3VlQexeb5KKjEKEe2lPyMIxeSBROohqxVO4E6yV6ppL9xykTy83tOQvd7tnzoZtDwhrBO2GYNFloYWLyxrzPPOi44WWLWUt618txvASUhhRCKSHgbZt2scKy7HfCujGOqWL9BVfOgyI=)

这些属性只在实例**第一次**创建时加入，所以要确保它们都在 `data` 返回的对象里。如果值还没准备好，可以先用 `null`、`undefined` 等占位。

你也可以事后往实例上加属性，但这样**不会**触发界面更新。

Vue 内置 API 在实例上用 `$` 开头，内部属性用 `_` 开头。所以 `data` 里不要用 `$` 或 `_` 开头的顶层属性名。

### 响应式代理 vs. 原始值 \* {#reactive-proxy-vs-original}

Vue 3 用 [JavaScript Proxy（代理）](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Proxy) 实现响应式。用过 Vue 2 的话，要注意下面这种情况：

```js
export default {
  data() {
    return {
      someObject: {}
    }
  },
  mounted() {
    const newObject = {}
    this.someObject = newObject

    console.log(newObject === this.someObject) // false
  }
}
```

赋值后再访问 `this.someObject`，拿到的是代理对象，不再是原来的 `newObject`。**和 Vue 2 不同，原始的 `newObject` 不会变成响应式。访问响应式数据时请始终用 `this`。**

</div>

<div class="composition-api">

## 声明响应式状态 \*\* {#declaring-reactive-state-1}

### `ref()` \*\* {#ref}

组合式 API 里，推荐用 [`ref()`](/api/reactivity-core#ref) 声明响应式状态：

```js
import { ref } from 'vue'

const count = ref(0)
```

`ref()` 接收参数，返回一个带 `.value` 属性的 ref 对象：

```js
const count = ref(0)

console.log(count) // { value: 0 }
console.log(count.value) // 0

count.value++
console.log(count.value) // 1
```

> 参考：[为 refs 标注类型](/guide/typescript/composition-api#typing-ref) <sup class="vt-badge ts" />

要在模板里用 ref，需要在 `setup()` 里声明并返回它们：

```js{5,9-11}
import { ref } from 'vue'

export default {
  // `setup` 是一个特殊的钩子，专门用于组合式 API。
  setup() {
    const count = ref(0)

    // 将 ref 暴露给模板
    return {
      count
    }
  }
}
```

```vue-html
<div>{{ count }}</div>
```

注意：模板里用 ref **不用**写 `.value`，会自动解包（见[注意事项](#caveat-when-unwrapping-in-templates)）。

你也可以在事件里直接改 ref：

```vue-html{1}
<button @click="count++">
  {{ count }}
</button>
```

逻辑更复杂时，可以在同一作用域里写改 ref 的函数，和状态一起返回：

```js{7-10,15}
import { ref } from 'vue'

export default {
  setup() {
    const count = ref(0)

    function increment() {
      // 在 JavaScript 中需要 .value
      count.value++
    }

    // 不要忘记同时暴露 increment 函数
    return {
      count,
      increment
    }
  }
}
```

返回的方法可以绑到事件上：

```vue-html{1}
<button @click="increment">
  {{ count }}
</button>
```

[Codepen](https://codepen.io/vuejs-examples/pen/WNYbaqo) 上有一个不用构建工具的例子。

### `<script setup>` \*\* {#script-setup}

在 `setup()` 里手动 return 很多状态和方法会很烦。用[单文件组件 (SFC)](/guide/scaling-up/sfc) 和 `<script setup>` 可以大幅简化：

```vue{1}
<script setup>
import { ref } from 'vue'

const count = ref(0)

function increment() {
  count.value++
}
</script>

<template>
  <button @click="increment">
    {{ count }}
  </button>
</template>
```

[在演练场中尝试一下](https://play.vuejs.org/#eNo9jUEKgzAQRa8yZKMiaNcllvYe2dgwQqiZhDhxE3L3jrW4/DPvv1/UK8Zhz6juSm82uciwIef4MOR8DImhQMIFKiwpeGgEbQwZsoE2BhsyMUwH0d66475ksuwCgSOb0CNx20ExBCc77POase8NVUN6PBdlSwKjj+vMKAlAvzOzWJ52dfYzGXXpjPoBAKX856uopDGeFfnq8XKp+gWq4FAi)

`<script setup>` 里顶层 import 的、声明的变量和函数，模板里都能直接用。可以把它想成：模板和 `<script setup>` 在同一个作用域里。

:::tip
后面组合式 API 的示例大多会用单文件组件 + `<script setup>`，因为多数开发者都这样写。

不用单文件组件也可以，在 [`setup()`](/api/composition-api-setup) 选项里照样能用组合式 API。
:::

### 为什么要使用 ref？ \*\* {#why-refs}

你可能会问：为什么 ref 要带 `.value`，不用普通变量？简单说下 Vue 响应式怎么工作。

模板里用了某个 ref，你又改了它的值，Vue 会检测到并更新 DOM。靠的是**依赖追踪**：组件第一次渲染时，Vue 会记录用到了哪些 ref；ref 一变，就**触发**依赖它的组件重新渲染。

普通 JavaScript 变量没法被「追踪」读写。但对象的 getter/setter 可以拦截属性的读取和赋值。

`.value` 让 Vue 知道 ref 什么时候被读、被写：读的时候做追踪，写的时候触发更新。概念上可以把它想成这样的对象：

```js
// 伪代码，不是真正的实现
const myRef = {
  _value: 0,
  get value() {
    track()
    return this._value
  },
  set value(newValue) {
    this._value = newValue
    trigger()
  }
}
```

ref 还有个好处：传给函数后仍能拿到最新值，响应式连接也不会断。把复杂逻辑抽成可复用代码时很有用。

更细的说明见[深入响应式系统](/guide/extras/reactivity-in-depth)。
</div>

<div class="options-api">

## 声明方法 \* {#declaring-methods}

<VueSchoolLink href="https://vueschool.io/lessons/methods-in-vue-3" title="免费的 Vue.js Methods 课程"/>

给组件加方法用 `methods` 选项，值是一个方法对象：

```js{7-11}
export default {
  data() {
    return {
      count: 0
    }
  },
  methods: {
    increment() {
      this.count++
    }
  },
  mounted() {
    // 在其他方法或是生命周期中也可以调用方法
    this.increment()
  }
}
```

Vue 会给 `methods` 里的方法绑定 `this`，始终指向当前组件实例。这样当事件监听或回调时，`this` 不会丢。`methods` 里**不要**用箭头函数，箭头函数没有自己的 `this`。

```js
export default {
  methods: {
    increment: () => {
      // 反例：无法访问此处的 `this`!
    }
  }
}
```

方法和实例上的其他属性一样，模板里也能访问，常用来绑事件：

```vue-html
<button @click="increment">{{ count }}</button>
```

[在演练场中尝试一下](https://play.vuejs.org/#eNplj9EKwyAMRX8l+LSx0e65uLL9hy+dZlTWqtg4BuK/z1baDgZicsPJgUR2d656B2QN45P02lErDH6c9QQKn10YCKIwAKqj7nAsPYBHCt6sCUDaYKiBS8lpLuk8/yNSb9XUrKg20uOIhnYXAPV6qhbF6fRvmOeodn6hfzwLKkx+vN5OyIFwdENHmBMAfwQia+AmBy1fV8E2gWBtjOUASInXBcxLvN4MLH0BCe1i4Q==)

上面例子里，点击 `<button>` 会调用 `increment`。

</div>

### 深层响应性 {#deep-reactivity}

<div class="options-api">

Vue 里状态默认是**深层响应**的：改嵌套对象或数组里的内容，也会被检测到：

```js
export default {
  data() {
    return {
      obj: {
        nested: { count: 0 },
        arr: ['foo', 'bar']
      }
    }
  },
  methods: {
    mutateDeeply() {
      // 以下都会按照期望工作
      this.obj.nested.count++
      this.obj.arr.push('baz')
    }
  }
}
```

</div>

<div class="composition-api">

Ref 可以存任何类型的值：深层嵌套的对象、数组，还有 `Map` 等内置结构。

Ref 会让里面的值变成深层响应：改嵌套对象或数组，一样能检测到：

```js
import { ref } from 'vue'

const obj = ref({
  nested: { count: 0 },
  arr: ['foo', 'bar']
})

function mutateDeeply() {
  // 以下都会按照期望工作
  obj.value.nested.count++
  obj.value.arr.push('baz')
}
```

非原始值会通过 [`reactive()`](#reactive) 转成响应式代理，后面会讲。

也可以用 [shallow ref](/api/reactivity-advanced#shallowref) 关掉深层响应：浅层 ref 只追踪 `.value` 本身的读写。适合大数据省性能，或状态由外部库管理的情况。

阅读更多：

- [减少大型不可变数据的响应性开销](/guide/best-practices/performance#reduce-reactivity-overhead-for-large-immutable-structures)
- [与外部状态系统集成](/guide/extras/reactivity-in-depth#integration-with-external-state-systems)

</div>

### DOM 更新时机 {#dom-update-timing}

改了响应式状态，DOM 会自动更新。但 DOM **不是**立刻同步改的：Vue 会在下一个 tick 里合并多次修改，每个组件只更新一次。

如果要在 DOM 更新**之后**再跑代码，可以用 [nextTick()](/api/general#nexttick)：

<div class="composition-api">

```js
import { nextTick } from 'vue'

async function increment() {
  count.value++
  await nextTick()
  // 现在 DOM 已经更新了
}
```

</div>
<div class="options-api">

```js
import { nextTick } from 'vue'

export default {
  methods: {
    async increment() {
      this.count++
      await nextTick()
      // 现在 DOM 已经更新了
    }
  }
}
```

</div>

<div class="composition-api">

## `reactive()` \*\* {#reactive}

还可以用 `reactive()` 声明响应式状态。ref 是把值包在特殊对象里，`reactive()` 则是让**对象本身**变成响应式：

```js
import { reactive } from 'vue'

const state = reactive({ count: 0 })
```

> 参考：[为 `reactive()` 标注类型](/guide/typescript/composition-api#typing-reactive) <sup class="vt-badge ts" />

在模板中使用：

```vue-html
<button @click="state.count++">
  {{ state.count }}
</button>
```

响应式对象是 [JavaScript 代理](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy)，用起来和普通对象差不多。区别在于 Vue 能拦截所有属性的读写，做依赖追踪和触发更新。

`reactive()` 会**深层**转换：访问嵌套对象时，里面也会被包一层。`ref()` 的值如果是对象，内部也会走 `reactive()`。和 shallow ref 类似，还有 [`shallowReactive()`](/api/reactivity-advanced#shallowreactive) 可以关掉深层响应。

### Reactive Proxy vs. Original \*\* {#reactive-proxy-vs-original-1}

注意：`reactive()` 返回的是原始对象的 [Proxy](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy)，和原始对象**不是**同一个引用：

```js
const raw = {}
const proxy = reactive(raw)

// 代理对象和原始对象不是全等的
console.log(proxy === raw) // false
```

只有代理对象是响应式的，改原始对象不会触发更新。所以最佳实践是：**只用代理对象，别去改原始对象**。

同一个原始对象多次 `reactive()`，会得到同一个代理；对已存在的代理再 `reactive()`，会返回它自己：

```js
// 在同一个对象上调用 reactive() 会返回相同的代理
console.log(reactive(raw) === proxy) // true

// 在一个代理上调用 reactive() 会返回它自己
console.log(reactive(proxy) === proxy) // true
```

嵌套对象也一样。因为有深层响应，赋进去的嵌套对象也会变成代理：

```js
const proxy = reactive({})

const raw = {}
proxy.nested = raw

console.log(proxy.nested === raw) // false
```

### `reactive()` 的局限性 \*\* {#limitations-of-reactive}

`reactive()` 有一些限制：

1. **值类型有限**：只能用于对象、数组，以及 `Map`、`Set` 等[集合类型](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects#keyed_collections)。不能存 `string`、`number`、`boolean` 等[原始类型](https://developer.mozilla.org/en-US/docs/Glossary/Primitive)。

2. **不能整体替换对象**：响应式靠「访问属性」追踪，所以要一直持有**同一个**响应式对象引用。整体赋值会丢掉和第一次引用的响应式连接：

   ```js
   let state = reactive({ count: 0 })

   // 上面的 ({ count: 0 }) 引用将不再被追踪
   // (响应性连接已丢失！)
   state = reactive({ count: 1 })
   ```

3. **解构会断连**：把响应式对象里的原始类型属性解构出来，或单独传给函数，会丢掉响应式连接：

   ```js
   const state = reactive({ count: 0 })

   // 当解构时，count 已经与 state.count 断开连接
   let { count } = state
   // 不会影响原始的 state
   count++

   // 该函数接收到的是一个普通的数字
   // 并且无法追踪 state.count 的变化
   // 我们必须传入整个对象以保持响应性
   callSomeFunction(state.count)
   ```

因为这些限制，日常更推荐用 `ref()` 声明响应式状态。

## 额外的 ref 解包细节 \*\* {#additional-ref-unwrapping-details}

### 作为 reactive 对象的属性 \*\* {#ref-unwrapping-as-reactive-object-property}

ref 作为 `reactive()` 对象的属性时，读写会自动解包，用起来像普通属性：

```js
const count = ref(0)
const state = reactive({
  count
})

console.log(state.count) // 0

state.count = 1
console.log(count.value) // 1
```

给已有 ref 的属性赋一个新的 ref，会**替换**掉旧的：

```js
const otherCount = ref(2)

state.count = otherCount
console.log(state.count) // 2
// 原始 ref 现在已经和 state.count 失去联系
console.log(count.value) // 1
```

只有嵌套在**深层**响应式对象里才会解包。作为[浅层响应式对象](/api/reactivity-advanced#shallowreactive)的属性时不会解包。

### 数组和集合的注意事项 \*\* {#caveat-in-arrays-and-collections}

和 `reactive()` 对象不同：ref 放在响应式**数组**或 `Map` 等集合里时，**不会**自动解包：

```js
const books = reactive([ref('Vue 3 Guide')])
// 这里需要 .value
console.log(books[0].value)

const map = reactive(new Map([['count', ref(0)]]))
// 这里需要 .value
console.log(map.get('count').value)
```

### 在模板中解包的注意事项 \*\* {#caveat-when-unwrapping-in-templates}

模板里只有**顶层**的 ref 会自动解包。

下面例子里，`count` 和 `object` 是顶层，但 `object.id` 不是：

```js
const count = ref(0)
const object = { id: ref(1) }
```

所以下面这个能按预期工作：

```vue-html
{{ count + 1 }}
```

...但这个**不会**：

```vue-html
{{ object.id + 1 }}
```

渲染结果会是 `[object Object]1`，因为表达式里 `object.id` 没解包，还是 ref。可以把 `id` 解构出来当顶层属性：

```js
const { id } = object
```

```vue-html
{{ id + 1 }}
```

现在会渲染成 `2`。

还有一点：如果 ref 是文本插值（<code v-pre>{{ }}</code>）的**最终值**，会解包，所以下面会渲染成 `1`：

```vue-html
{{ object.id }}
```

这只是文本插值的便利写法，等价于 <code v-pre>{{ object.id.value }}</code>。

</div>

<div class="options-api">

### 有状态方法 \* {#stateful-methods}

有时需要动态创建方法，比如包一层防抖的点击处理：

```js
import { debounce } from 'lodash-es'

export default {
  methods: {
    // 使用 Lodash 的防抖函数
    click: debounce(function () {
      // ... 对点击的响应 ...
    }, 500)
  }
}
```

但组件会被复用时，这样有问题：防抖函数**有状态**，多个实例共用同一个会互相干扰。

让每个实例各自拥有一个防抖函数，可以在 `created` 里创建：

```js
export default {
  created() {
    // 每个实例都有了自己的预置防抖的处理函数
    this.debouncedClick = _.debounce(this.click, 500)
  },
  unmounted() {
    // 最好是在组件卸载时
    // 清除掉防抖计时器
    this.debouncedClick.cancel()
  },
  methods: {
    click() {
      // ... 对点击的响应 ...
    }
  }
}
```

</div>
