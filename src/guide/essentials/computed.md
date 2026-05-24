# 计算属性 {#computed-properties}

<div class="options-api">
  <VueSchoolLink href="https://vueschool.io/lessons/computed-properties-in-vue-3" title="免费的 Vue.js 计算属性课程"/>
</div>

<div class="composition-api">
  <VueSchoolLink href="https://vueschool.io/lessons/vue-fundamentals-capi-computed-properties-in-vue-with-the-composition-api" title="免费的 Vue.js 计算属性课程"/>
</div>

## 基础示例 {#basic-example}

模板里的表达式很好用，但只适合简单操作。模板里逻辑太多，会又乱又难维护。例如，有这样一个带嵌套数组的对象：

<div class="options-api">

```js
export default {
  data() {
    return {
      author: {
        name: 'John Doe',
        books: [
          'Vue 2 - Advanced Guide',
          'Vue 3 - Basic Guide',
          'Vue 4 - The Mystery'
        ]
      }
    }
  }
}
```

</div>
<div class="composition-api">

```js
const author = reactive({
  name: 'John Doe',
  books: [
    'Vue 2 - Advanced Guide',
    'Vue 3 - Basic Guide',
    'Vue 4 - The Mystery'
  ]
})
```

</div>

我们想根据 `author` 有没有书，显示不同信息：

```vue-html
<p>Has published books:</p>
<span>{{ author.books.length > 0 ? 'Yes' : 'No' }}</span>
```

这段模板有点复杂，要花一会儿才能看出它依赖 `author.books`。如果在模板里要算很多次，我们也不想重复写同样代码。

所以更推荐用**计算属性**来写依赖响应式数据的复杂逻辑。下面是改后的例子：

<div class="options-api">

```js
export default {
  data() {
    return {
      author: {
        name: 'John Doe',
        books: [
          'Vue 2 - Advanced Guide',
          'Vue 3 - Basic Guide',
          'Vue 4 - The Mystery'
        ]
      }
    }
  },
  computed: {
    // 一个计算属性的 getter
    publishedBooksMessage() {
      // `this` 指向当前组件实例
      return this.author.books.length > 0 ? 'Yes' : 'No'
    }
  }
}
```

```vue-html
<p>Has published books:</p>
<span>{{ publishedBooksMessage }}</span>
```

[在演练场中尝试一下](https://play.vuejs.org/#eNqFkN1KxDAQhV/l0JsqaFfUq1IquwiKsF6JINaLbDNui20S8rO4lL676c82eCFCIDOZMzkzXxetlUoOjqI0ykypa2XzQtC3ktqC0ydzjUVXCIAzy87OpxjQZJ0WpwxgzlZSp+EBEKylFPGTrATuJcUXobST8sukeA8vQPzqCNe4xJofmCiJ48HV/FfbLLrxog0zdfmn4tYrXirC9mgs6WMcBB+nsJ+C8erHH0rZKmeJL0sot2tqUxHfDONuyRi2p4BggWCr2iQTgGTcLGlI7G2FHFe4Q/xGJoYn8SznQSbTQviTrRboPrHUqoZZ8hmQqfyRmTDFTC1bqalsFBN5183o/3NG33uvoWUwXYyi/gdTEpwK)

这里定义了计算属性 `publishedBooksMessage`。

改 `data` 里 `books` 的值，`publishedBooksMessage` 也会跟着变。

在模板里，计算属性和普通属性用法一样。Vue 会发现 `this.publishedBooksMessage` 依赖 `this.author.books`，所以 `this.author.books` 一变，用到 `this.publishedBooksMessage` 的绑定都会更新。

也可参考：[为计算属性标记类型](/guide/typescript/options-api#typing-computed-properties) <sup class="vt-badge ts" />

</div>

<div class="composition-api">

```vue
<script setup>
import { reactive, computed } from 'vue'

const author = reactive({
  name: 'John Doe',
  books: [
    'Vue 2 - Advanced Guide',
    'Vue 3 - Basic Guide',
    'Vue 4 - The Mystery'
  ]
})

// 一个计算属性 ref
const publishedBooksMessage = computed(() => {
  return author.books.length > 0 ? 'Yes' : 'No'
})
</script>

<template>
  <p>Has published books:</p>
  <span>{{ publishedBooksMessage }}</span>
</template>
```

[在演练场中尝试一下](https://play.vuejs.org/#eNp1kE9Lw0AQxb/KI5dtoTainkoaaREUoZ5EEONhm0ybYLO77J9CCfnuzta0vdjbzr6Zeb95XbIwZroPlMySzJW2MR6OfDB5oZrWaOvRwZIsfbOnCUrdmuCpQo+N1S0ET4pCFarUynnI4GttMT9PjLpCAUq2NIN41bXCkyYxiZ9rrX/cDF/xDYiPQLjDDRbVXqqSHZ5DUw2tg3zP8lK6pvxHe2DtvSasDs6TPTAT8F2ofhzh0hTygm5pc+I1Yb1rXE3VMsKsyDm5JcY/9Y5GY8xzHI+wnIpVw4nTI/10R2rra+S4xSPEJzkBvvNNs310ztK/RDlLLjy1Zic9cQVkJn+R7gIwxJGlMXiWnZEq77orhH3Pq2NH9DjvTfpfSBSbmA==)

这里定义了计算属性 `publishedBooksMessage`。`computed()` 需要传入一个 [getter 函数](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Functions/get#description)，返回**计算属性 ref**。和普通 ref 一样，用 `publishedBooksMessage.value` 读结果。在模板里会自动解包，不用写 `.value`。

计算属性会自动追踪响应式依赖。`publishedBooksMessage` 依赖 `author.books`，所以 `author.books` 一变，用到 `publishedBooksMessage` 的绑定都会更新。

也可参考：[为计算属性标注类型](/guide/typescript/composition-api#typing-computed) <sup class="vt-badge ts" />

</div>

## 计算属性缓存 vs 方法 {#computed-caching-vs-methods}

你可能发现，在表达式里调用函数也能得到和计算属性一样的结果：

```vue-html
<p>{{ calculateBooksMessage() }}</p>
```

<div class="options-api">

```js
// 组件中
methods: {
  calculateBooksMessage() {
    return this.author.books.length > 0 ? 'Yes' : 'No'
  }
}
```

</div>

<div class="composition-api">

```js
// 组件中
function calculateBooksMessage() {
  return author.books.length > 0 ? 'Yes' : 'No'
}
```

</div>

同样的逻辑写成方法也可以，结果一样。区别在于**计算属性会按响应式依赖缓存**。只有依赖变了才会重新算。只要 `author.books` 不变，访问多少次 `publishedBooksMessage` 都直接返回上次结果，不会重复执行 getter。

这也说明下面的计算属性不会更新，因为 `Date.now()` 不是响应式依赖：

<div class="options-api">

```js
computed: {
  now() {
    return Date.now()
  }
}
```

</div>

<div class="composition-api">

```js
const now = computed(() => Date.now())
```

</div>

方法则不同，每次重渲染都会重新执行。

为什么要缓存？比如有个很耗时的计算属性 `list`，要遍历大数组并做很多运算，别的计算属性还依赖它。不缓存就会反复执行 getter，其实没必要。确定不需要缓存时，可以用方法。

## 可写计算属性 {#writable-computed}

计算属性默认只读，改动时会收到运行时警告。少数场景需要可写，可以同时提供 getter 和 setter：

<div class="options-api">

```js
export default {
  data() {
    return {
      firstName: 'John',
      lastName: 'Doe'
    }
  },
  computed: {
    fullName: {
      // getter
      get() {
        return this.firstName + ' ' + this.lastName
      },
      // setter
      set(newValue) {
        // 注意：我们这里使用的是解构赋值语法
        [this.firstName, this.lastName] = newValue.split(' ')
      }
    }
  }
}
```

这时执行 `this.fullName = 'John Doe'`，会调用 setter，`this.firstName` 和 `this.lastName` 也会更新。

</div>

<div class="composition-api">

```vue
<script setup>
import { ref, computed } from 'vue'

const firstName = ref('John')
const lastName = ref('Doe')

const fullName = computed({
  // getter
  get() {
    return firstName.value + ' ' + lastName.value
  },
  // setter
  set(newValue) {
    // 注意：我们这里使用的是解构赋值语法
    [firstName.value, lastName.value] = newValue.split(' ')
  }
})
</script>
```

这时执行 `fullName.value = 'John Doe'`，会调用 setter，`firstName` 和 `lastName` 也会更新。

</div>

## 获取上一个值 {#previous}

- 仅 3.4+ 支持

<p class="options-api">
需要时，可在计算属性 getter 的第二个参数里拿到上一次返回的值：
</p>

<p class="composition-api">
需要时，可在计算属性 getter 的第一个参数里拿到上一次返回的值：
</p>

<div class="options-api">

```js
export default {
  data() {
    return {
      count: 2
    }
  },
  computed: {
    // 这个计算属性在 count 的值小于或等于 3 时，将返回 count 的值。
    // 当 count 的值大于等于 4 时，将会返回满足我们条件的最后一个值
    // 直到 count 的值再次小于或等于 3 为止。
    alwaysSmall(_, previous) {
      if (this.count <= 3) {
        return this.count
      }

      return previous
    }
  }
}
```
</div>

<div class="composition-api">

```vue
<script setup>
import { ref, computed } from 'vue'

const count = ref(2)

// 这个计算属性在 count 的值小于或等于 3 时，将返回 count 的值。
// 当 count 的值大于等于 4 时，将会返回满足我们条件的最后一个值
// 直到 count 的值再次小于或等于 3 为止。
const alwaysSmall = computed((previous) => {
  if (count.value <= 3) {
    return count.value
  }

  return previous
})
</script>
```
</div>

如果你用的是可写计算属性：

<div class="options-api">

```js
export default {
  data() {
    return {
      count: 2
    }
  },
  computed: {
    alwaysSmall: {
      get(_, previous) {
        if (this.count <= 3) {
          return this.count
        }

        return previous;
      },
      set(newValue) {
        this.count = newValue * 2
      }
    }
  }
}
```

</div>
<div class="composition-api">

```vue
<script setup>
import { ref, computed } from 'vue'

const count = ref(2)

const alwaysSmall = computed({
  get(previous) {
    if (count.value <= 3) {
      return count.value
    }

    return previous
  },
  set(newValue) {
    count.value = newValue * 2
  }
})
</script>
```

</div>

## 最佳实践 {#best-practices}

### Getter 不应有副作用 {#getters-should-be-side-effect-free}

计算属性的 getter 只应做计算，不要有副作用，这点很重要。**不要在 getter 里改其他状态、发异步请求或改 DOM**。计算属性描述的是：如何根据别的值算出一个新值。getter 只负责算并返回。后面会讲如何用[侦听器](./watchers)在响应式数据变化时做副作用。

### 避免直接修改计算属性值 {#avoid-mutating-computed-value}

计算属性返回的是派生状态，可以看成“临时快照”：源数据一变，就会生成新快照。改快照没有意义，所以返回值应视为只读，不要直接改——应改它依赖的源数据，让计算重新跑一遍。
