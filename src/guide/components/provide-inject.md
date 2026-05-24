# 依赖注入 {#provide-inject}

> 建议先阅读[组件基础](/guide/essentials/component-basics)。如果还不熟悉组件，请先看完那一章。

## Prop 逐级透传问题 {#prop-drilling}

通常从父组件向子组件传数据用 [props](/guide/components/props)。但如果组件树很深，某个深层子组件需要很远祖先的数据，只用 props 就要一层层往下传，很麻烦：

![Prop 逐级透传的过程图示](./images/prop-drilling.png)

<!-- https://www.figma.com/file/yNDTtReM2xVgjcGVRzChss/prop-drilling -->

注意：中间的 `<Footer>` 可能根本用不到这些 props，但为了 `<DeepChild>` 能访问，仍要定义并继续传递。链路很长时，还会影响更多中间组件。这叫 **prop 逐级透传**，一般应尽量避免。

`provide` 和 `inject` 可以解决这个问题 <sup>[[1]](#footnote-1)</sup>。父组件作为**依赖提供者**，任意深度的后代都可以**注入**父组件沿整条链路提供的依赖。

![Provide/inject 模式](./images/provide-inject.png)

<!-- https://www.figma.com/file/PbTJ9oXis5KUawEOWdy2cE/provide-inject -->

## Provide (提供) {#provide}

<div class="composition-api">

要给后代提供数据，使用 [`provide()`](/api/composition-api-dependency-injection#provide)：

```vue
<script setup>
import { provide } from 'vue'

provide(/* 注入名 */ 'message', /* 值 */ 'hello!')
</script>
```

如果不用 `<script setup>`，请确保 `provide()` 在 `setup()` 里**同步**调用：

```js
import { provide } from 'vue'

export default {
  setup() {
    provide(/* 注入名 */ 'message', /* 值 */ 'hello!')
  }
}
```

`provide()` 有两个参数。第一个是**注入名**，可以是字符串或 `Symbol`，后代用这个名字查找值。一个组件可以多次调用 `provide()`，用不同注入名提供不同值。

第二个参数是要提供的值，可以是任意类型，也可以是响应式状态（例如 ref）：

```js
import { ref, provide } from 'vue'

const count = ref(0)
provide('key', count)
```

提供响应式状态后，后代可以和提供者保持响应式联系。

</div>

<div class="options-api">

要给后代提供数据，使用 [`provide`](/api/options-composition#provide) 选项：

```js
export default {
  provide: {
    message: 'hello!'
  }
}
```

`provide` 对象上每个属性的 key 是注入名，value 是要提供的数据。

如果要提供依赖当前组件实例的状态（例如 `data()` 里的数据），可以用函数形式的 `provide`：

```js{7-12}
export default {
  data() {
    return {
      message: 'hello!'
    }
  },
  provide() {
    // 使用函数的形式，可以访问到 `this`
    return {
      message: this.message
    }
  }
}
```

但这样**不会**让注入保持响应式。响应式用法见后文[和响应式数据配合使用](#working-with-reactivity)。

</div>

## 应用层 Provide {#app-level-provide}

除了在单个组件里提供，也可以在整个应用层面提供：

```js
import { createApp } from 'vue'

const app = createApp({})

app.provide(/* 注入名 */ 'message', /* 值 */ 'hello!')
```

应用级提供的数据，应用内所有组件都可以注入。写[插件](/guide/reusability/plugins)时特别有用，因为插件通常不用组件形式提供值。

## Inject (注入) {#inject}

<div class="composition-api">

要注入上层提供的数据，使用 [`inject()`](/api/composition-api-dependency-injection#inject)：

```vue
<script setup>
import { inject } from 'vue'

const message = inject('message')
</script>
```

如果多个祖先提供了相同键，会取**离当前组件最近**的那个。

如果提供的是 ref，注入得到的是 ref 对象本身，**不会**自动解包成内部值。这样注入方仍能通过 ref 与提供方保持响应式。

[带响应性的 provide + inject 完整示例](https://play.vuejs.org/#eNqFUUFugzAQ/MrKF1IpxfeIVKp66Kk/8MWFDXYFtmUbpArx967BhURRU9/WOzO7MzuxV+fKcUB2YlWovXYRAsbBvQije2d9hAk8Xo7gvB11gzDDxdseCuIUG+ZN6a7JjZIvVRIlgDCcw+d3pmvTglz1okJ499I0C3qB1dJQT9YRooVaSdNiACWdQ5OICj2WwtTWhAg9hiBbhHNSOxQKu84WT8LkNQ9FBhTHXyg1K75aJHNUROxdJyNSBVBp44YI43NvG+zOgmWWYGt7dcipqPhGZEe2ef07wN3lltD+lWN6tNkV/37+rdKjK2rzhRTt7f3u41xhe37/xJZGAL2PLECXa9NKdD/a6QTTtGnP88LgiXJtYv4BaLHhvg==)

同样，不用 `<script setup>` 时，`inject()` 要在 `setup()` 里同步调用：

```js
import { inject } from 'vue'

export default {
  setup() {
    const message = inject('message')
    return { message }
  }
}
```

</div>

<div class="options-api">

要注入上层提供的数据，用 [`inject`](/api/options-composition#inject) 选项声明：

```js
export default {
  inject: ['message'],
  created() {
    console.log(this.message) // injected value
  }
}
```

注入会在组件自身状态**之前**解析，所以可以在 `data()` 里用到注入的值：

```js
export default {
  inject: ['message'],
  data() {
    return {
      // 基于注入值的初始数据
      fullMessage: this.message
    }
  }
}
```

多个祖先提供相同键时，同样取最近的父级。

[完整的 provide + inject 示例](https://play.vuejs.org/#eNqNkcFqwzAQRH9l0EUthOhuRKH00FO/oO7B2JtERZaEvA4F43+vZCdOTAIJCImRdpi32kG8h7A99iQKobs6msBvpTNt8JHxcTC2wS76FnKrJpVLZelKR39TSUO7qreMoXRA7ZPPkeOuwHByj5v8EqI/moZeXudCIBL30Z0V0FLXVXsqIA9krU8R+XbMR9rS0mqhS4KpDbZiSgrQc5JKQqvlRWzEQnyvuc9YuWbd4eXq+TZn0IvzOeKr8FvsNcaK/R6Ocb9Uc4FvefpE+fMwP0wH8DU7wB77nIo6x6a2hvNEME5D0CpbrjnHf+8excI=)

### 注入别名 \* {#injection-aliasing}

用数组形式 `inject` 时，注入名会作为同名 key 挂到实例上。上面提供的是 `"message"`，访问时用 `this.message`。

如果想用不同的本地名字，可以用对象形式：

```js
export default {
  inject: {
    /* 本地属性名 */ localMessage: {
      from: /* 注入来源名 */ 'message'
    }
  }
}
```

这里把注入名 `"message"` 映射为本地属性 `this.localMessage`。

</div>

### 注入默认值 {#injection-default-values}

默认情况下，`inject` 假定注入名会被某个祖先提供。如果没有任何组件提供，会抛出运行时警告。

如果注入时**不要求**一定有提供者，可以声明默认值，和 props 类似：

<div class="composition-api">

```js
// 如果没有祖先组件提供 "message"
// `value` 会是 "这是默认值"
const value = inject('message', '这是默认值')
```

有时默认值需要调用函数或 `new` 一个类。为避免用不到默认值时也做昂贵计算或产生副作用，可以用工厂函数：

```js
const value = inject('key', () => new ExpensiveClass(), true)
```

第三个参数表示默认值应按工厂函数处理。

</div>

<div class="options-api">

```js
export default {
  // 当声明注入的默认值时
  // 必须使用对象形式
  inject: {
    message: {
      from: 'message', // 当与原注入名同名时，这个属性是可选的
      default: 'default value'
    },
    user: {
      // 对于非基础类型数据，如果创建开销比较大，或是需要确保每个组件实例
      // 需要独立数据的，请使用工厂函数
      default: () => ({ name: 'John' })
    }
  }
}
```

</div>

## 和响应式数据配合使用 {#working-with-reactivity}

<div class="composition-api">

提供 / 注入响应式数据时，**建议把状态变更尽量放在提供方组件里**。这样声明和修改都在同一处，更好维护。

有时需要在注入方修改数据。推荐在提供方声明并提供一个修改方法：

```vue{7-9,13}
<!-- 在供给方组件内 -->
<script setup>
import { provide, ref } from 'vue'

const location = ref('North Pole')

function updateLocation() {
  location.value = 'South Pole'
}

provide('location', {
  location,
  updateLocation
})
</script>
```

```vue{5}
<!-- 在注入方组件 -->
<script setup>
import { inject } from 'vue'

const { location, updateLocation } = inject('location')
</script>

<template>
  <button @click="updateLocation">{{ location }}</button>
</template>
```

如果希望注入方不能改提供的数据，可以用 [`readonly()`](/api/reactivity-core#readonly) 包装：

```vue
<script setup>
import { ref, provide, readonly } from 'vue'

const count = ref(0)
provide('read-only-count', readonly(count))
</script>
```

</div>

<div class="options-api">

要让注入方和提供方保持响应式，提供方可以用 [computed()](/api/reactivity-core#computed) 提供计算属性：

```js{12}
import { computed } from 'vue'

export default {
  data() {
    return {
      message: 'hello!'
    }
  },
  provide() {
    return {
      // 显式提供一个计算属性
      message: computed(() => this.message)
    }
  }
}
```

[带响应性的 provide + inject 完整示例](https://play.vuejs.org/#eNqNUctqwzAQ/JVFFyeQxnfjBEoPPfULqh6EtYlV9EKWTcH43ytZtmPTQA0CsdqZ2dlRT16tPXctkoKUTeWE9VeqhbLGeXirheRwc0ZBds7HKkKzBdBDZZRtPXIYJlzqU40/I4LjjbUyIKmGEWw0at8UgZrUh1PscObZ4ZhQAA596/RcAShsGnbHArIapTRBP74O8Up060wnOO5QmP0eAvZyBV+L5jw1j2tZqsMp8yWRUHhUVjKPoQIohQ460L0ow1FeKJlEKEnttFweijJfiORElhCf5f3umObb0B9PU/I7kk17PJj7FloN/2t7a2Pj/Zkdob+x8gV8ZlMs2de/8+14AXwkBngD9zgVqjg2rNXPvwjD+EdlHilrn8MvtvD1+Q==)

`computed()` 常用于组合式 API，也可配合选项式 API。更多见[响应式基础](/guide/essentials/reactivity-fundamentals)和[计算属性](/guide/essentials/computed)。

</div>

## 使用 Symbol 作注入名 {#working-with-symbol-keys}

前面用字符串作注入名。大型应用依赖很多，或写组件库时，建议用 [Symbol](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Symbol) 作注入名，避免冲突。

推荐在单独文件里导出这些 Symbol：

```js [keys.js]
export const myInjectionKey = Symbol()
```

<div class="composition-api">

```js
// 在供给方组件中
import { provide } from 'vue'
import { myInjectionKey } from './keys.js'

provide(myInjectionKey, { 
  /* 要提供的数据 */
})
```

```js
// 注入方组件
import { inject } from 'vue'
import { myInjectionKey } from './keys.js'

const injected = inject(myInjectionKey)
```

TypeScript 用户请参考：[为 Provide / Inject 标注类型](/guide/typescript/composition-api#typing-provide-inject) <sup class="vt-badge ts" />

</div>

<div class="options-api">

```js
// 在供给方组件中
import { myInjectionKey } from './keys.js'

export default {
  provide() {
    return {
      [myInjectionKey]: {
        /* 要提供的数据 */
      }
    }
  }
}
```

```js
// 注入方组件
import { myInjectionKey } from './keys.js'

export default {
  inject: {
    injected: { from: myInjectionKey }
  }
}
```

</div>

<small>

__译者注__

<a id="footnote-1"></a>[1] 在本章及后续章节中，“**提供**”将成为对应 Provide 的一个专有概念

</small>
