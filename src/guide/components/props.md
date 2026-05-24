# Props {#props}

> 建议先阅读[组件基础](/guide/essentials/component-basics)。如果还不熟悉组件，请先看完那一章。

<!--<div class="options-api">
  <VueSchoolLink href="https://vueschool.io/lessons/vue-3-reusable-components-with-props" title="Free Vue.js Props Lesson"/>
</div>-->

## Props 声明 {#props-declaration}

组件需要**显式声明**接受的 Props，Vue 才能区分：哪些是 Props，哪些是[透传](/guide/components/attrs) attribute。

<div class="composition-api">

带 `<script setup>` 的单文件组件里，用 `defineProps()` 宏声明 Props：

```vue
<script setup>
const props = defineProps(['foo'])

console.log(props.foo)
</script>
```

没有 `<script setup>` 时，用 [`props`](/api/options-state#props) 选项声明：

```js
export default {
  props: ['foo'],
  setup(props) {
    // setup() 接收 props 作为第一个参数
    console.log(props.foo)
  }
}
```

`defineProps()` 的参数和 `props` 选项写法相同，底层都是 props 选项。

</div>

<div class="options-api">

需要用 [`props`](/api/options-state#props) 选项定义：

```js
export default {
  props: ['foo'],
  created() {
    // props 会暴露到 `this` 上
    console.log(this.foo)
  }
}
```

</div>

除了字符串数组，也可以用对象形式声明 Props：

<div class="options-api">

```js
export default {
  props: {
    title: String,
    likes: Number
  }
}
```

</div>
<div class="composition-api">

```js
// 使用 <script setup>
defineProps({
  title: String,
  likes: Number
})
```

```js
// 非 <script setup>
export default {
  props: {
    title: String,
    likes: Number
  }
}
```

</div>

对象形式里，每个 key 是 prop 名，value 是类型构造函数。例如要求 `number` 类型，就写 `Number`。

对象声明还能当作文档；别人传错类型时，控制台会警告。更多见后文 [Prop 校验](#prop-validation)。

<div class="options-api">

TypeScript 用户请参考：[为组件 Props 标注类型](/guide/typescript/options-api#typing-component-props) <sup class="vt-badge ts" />

</div>

<div class="composition-api">

搭配 TypeScript 和 `<script setup>` 时，也可以用类型标注声明 Props：

```vue
<script setup lang="ts">
defineProps<{
  title?: string
  likes?: number
}>()
</script>
```

类型声明细节见[组件 Props 类型标注](/guide/typescript/composition-api#typing-component-props)。<sup class="vt-badge ts" />

</div>

<div class="composition-api">

## 响应式 Props 解构 <sup class="vt-badge" data-text="3.5+" /> \*\* {#reactive-props-destructure}

Vue 通过**访问属性**来追踪依赖。例如在计算属性或侦听器里读 `props.foo`，`foo` 会被记为依赖。

因此下面这段代码：

```js
const { foo } = defineProps(['foo'])

watchEffect(() => {
  // 在 3.5 之前只运行一次
  // 在 3.5+ 中在 "foo" prop 变化时重新执行
  console.log(foo)
})
```

3.4 及以下：`foo` 解构后是常量，不会随 prop 更新。3.5+：在同一 `<script setup>` 里访问解构变量时，编译器会自动加上 `props.` 前缀。上面代码等价于：

```js {5}
const props = defineProps(['foo'])

watchEffect(() => {
  // `foo` 由编译器转换为 `props.foo`
  console.log(props.foo)
})
```

还可以用 JavaScript 默认值语法设置 prop 默认值，配合类型声明时很方便。

```ts
const { foo = 'hello' } = defineProps<{ foo?: string }>()
```

若希望在 IDE 里区分解构的 props 和普通变量，可在 Vue 的 VSCode 扩展里开启解构 props 的内联提示。

### 将解构的 props 传递到函数中 {#passing-destructured-props-into-functions}

把解构的 prop 直接传给函数时，例如：

```js
const { foo } = defineProps(['foo'])

watch(foo, /* ... */)
```

这样**不会**按预期工作，因为等价于 `watch(props.foo, ...)`——传的是值，不是响应式数据源。编译器会检测并警告。

监听普通 prop 用 `watch(() => props.foo, ...)`；解构的 prop 用 getter 包一层：

```js
watch(() => foo, /* ... */)
```

需要把解构的 prop 传给外部函数并保持响应性时，也推荐这样写：

```js
useComposable(() => foo)
```

外部函数通过调用 getter（或用 [toValue](/api/reactivity-utilities.html#tovalue) 规范化）追踪 prop 变化，例如在计算属性或侦听器的 getter 里。

</div>

## 传递 prop 的细节 {#prop-passing-details}

### Prop 名字格式 {#prop-name-casing}

prop 名较长时，推荐 **camelCase**：是合法 JS 标识符，模板里可直接用，作对象 key 时也不用加引号。

<div class="composition-api">

```js
defineProps({
  greetingMessage: String
})
```

</div>
<div class="options-api">

```js
export default {
  props: {
    greetingMessage: String
  }
}
```

</div>

```vue-html
<span>{{ greetingMessage }}</span>
```

向子组件传 Props 时，理论上也可以用 camelCase（[DOM 内模板](/guide/essentials/component-basics#in-dom-template-parsing-caveats) 除外），但为和 HTML attribute 一致，模板里通常写 **kebab-case**：

```vue-html
<MyComponent greeting-message="hello" />
```

组件名推荐 [PascalCase](/guide/components/registration#component-name-casing)，便于区分 Vue 组件和原生标签。传 Props 时用 camelCase 优势不大，因此更推荐贴近 HTML 的 kebab-case 写法。

### 静态 vs. 动态 Props {#static-vs-dynamic-props}

前面见过很多**静态**传 Props 的例子：

```vue-html
<BlogPost title="My journey with Vue" />
```

也可以用 `v-bind` 或缩写 `:` **动态**绑定：

```vue-html
<!-- 根据一个变量的值动态传入 -->
<BlogPost :title="post.title" />

<!-- 根据一个更复杂表达式的值动态传入 -->
<BlogPost :title="post.title + ' by ' + post.author.name" />
```

### 传递不同的值类型 {#passing-different-value-types}

上面例子传的是字符串，但 Props **可以传任意类型**的值。

#### Number {#number}

```vue-html
<!-- 虽然 `42` 是个常量，我们还是需要使用 v-bind -->
<!-- 因为这是一个 JavaScript 表达式而不是一个字符串 -->
<BlogPost :likes="42" />

<!-- 根据一个变量的值动态传入 -->
<BlogPost :likes="post.likes" />
```

#### Boolean {#boolean}

```vue-html
<!-- 仅写上 prop 但不传值，会隐式转换为 `true` -->
<BlogPost is-published />

<!-- 虽然 `false` 是静态的值，我们还是需要使用 v-bind -->
<!-- 因为这是一个 JavaScript 表达式而不是一个字符串 -->
<BlogPost :is-published="false" />

<!-- 根据一个变量的值动态传入 -->
<BlogPost :is-published="post.isPublished" />
```

#### Array {#array}

```vue-html
<!-- 虽然这个数组是个常量，我们还是需要使用 v-bind -->
<!-- 因为这是一个 JavaScript 表达式而不是一个字符串 -->
<BlogPost :comment-ids="[234, 266, 273]" />

<!-- 根据一个变量的值动态传入 -->
<BlogPost :comment-ids="post.commentIds" />
```

#### Object {#object}

```vue-html
<!-- 虽然这个对象字面量是个常量，我们还是需要使用 v-bind -->
<!-- 因为这是一个 JavaScript 表达式而不是一个字符串 -->
<BlogPost
  :author="{
    name: 'Veronica',
    company: 'Veridian Dynamics'
  }"
 />

<!-- 根据一个变量的值动态传入 -->
<BlogPost :author="post.author" />
```

### 使用一个对象绑定多个 prop {#binding-multiple-properties-using-an-object}

要把对象的所有属性一次性当作 Props 传入，可用[无参数的 `v-bind`](/guide/essentials/template-syntax#dynamically-binding-multiple-attributes)（只写 `v-bind`，不写 `:prop-name`）。例如有对象 `post`：

<div class="options-api">

```js
export default {
  data() {
    return {
      post: {
        id: 1,
        title: 'My Journey with Vue'
      }
    }
  }
}
```

</div>
<div class="composition-api">

```js
const post = {
  id: 1,
  title: 'My Journey with Vue'
}
```

</div>

以及下面的模板：

```vue-html
<BlogPost v-bind="post" />
```

等价于：

```vue-html
<BlogPost :id="post.id" :title="post.title" />
```

## 单向数据流 {#one-way-data-flow}

所有 Props 都遵循**单向数据流**：父组件更新后，Props 会同步到子组件，子组件不应反向改父组件状态，否则数据流会很难维护。

父组件每次更新，子组件的 Props 都会变成最新值，因此**不要**在子组件里直接改 prop。若修改，Vue 会在控制台警告：

<div class="composition-api">

```js
const props = defineProps(['foo'])

// ❌ 警告！prop 是只读的！
props.foo = 'bar'
```

</div>
<div class="options-api">

```js
export default {
  props: ['foo'],
  created() {
    // ❌ 警告！prop 是只读的！
    this.foo = 'bar'
  }
}
```

</div>

想改 prop 时，常见有两种情况：

1. **prop 只作初始值，子组件之后要当本地数据用**。应新建本地数据，用 prop 作初始值：

   <div class="composition-api">

   ```js
   const props = defineProps(['initialCounter'])

   // 计数器只是将 props.initialCounter 作为初始值
   // 像下面这样做就使 prop 和后续更新无关了
   const counter = ref(props.initialCounter)
   ```

   </div>
   <div class="options-api">

   ```js
   export default {
     props: ['initialCounter'],
     data() {
       return {
         // 计数器只是将 this.initialCounter 作为初始值
         // 像下面这样做就使 prop 和后续更新无关了
         counter: this.initialCounter
       }
     }
   }
   ```

   </div>

2. **需要对 prop 做转换**。应基于 prop 写**计算属性**：

   <div class="composition-api">

   ```js
   const props = defineProps(['size'])

   // 该 prop 变更时计算属性也会自动更新
   const normalizedSize = computed(() => props.size.trim().toLowerCase())
   ```

   </div>
   <div class="options-api">

   ```js
   export default {
     props: ['size'],
     computed: {
       // 该 prop 变更时计算属性也会自动更新
       normalizedSize() {
         return this.size.trim().toLowerCase()
       }
     }
   }
   ```

   </div>

### 更改对象 / 数组类型的 props {#mutating-object-array-props}

对象或数组作为 Props 传入时，子组件不能改 prop 绑定本身，但**可以**改对象/数组内部的值——因为 JS 按引用传递，Vue 很难低成本阻止。

这样改会让子组件在不明显的情况下影响父组件状态，数据流更难懂。一般应避免；除非父子设计上就要紧耦合。多数情况应[抛出事件](/guide/components/events)让父组件改数据。

## Prop 校验 {#prop-validation}

Vue 支持对 Props 做更细的校验。例如类型不对时，控制台会警告，写给别人用的组件时很有用。

校验写在 <span class="composition-api">`defineProps()`</span><span class="options-api">`props` 选项</span> 的对象里，例如：

<div class="composition-api">

```js
defineProps({
  // 基础类型检查
  // (给出 `null` 和 `undefined` 值则会跳过任何类型检查)
  propA: Number,
  // 多种可能的类型
  propB: [String, Number],
  // 必传，且为 String 类型
  propC: {
    type: String,
    required: true
  },
  // 必传但可为 null 的字符串
  propD: {
    type: [String, null],
    required: true
  },
  // Number 类型的默认值
  propE: {
    type: Number,
    default: 100
  },
  // 对象类型的默认值
  propF: {
    type: Object,
    // 对象或数组的默认值
    // 必须从一个工厂函数返回。
    // 该函数接收组件所接收到的原始 prop 作为参数。
    default(rawProps) {
      return { message: 'hello' }
    }
  },
  // 自定义类型校验函数
  // 在 3.4+ 中完整的 props 作为第二个参数传入
  propG: {
    validator(value, props) {
      // The value must match one of these strings
      return ['success', 'warning', 'danger'].includes(value)
    }
  },
  // 函数类型的默认值
  propH: {
    type: Function,
    // 不像对象或数组的默认，这不是一个
    // 工厂函数。这会是一个用来作为默认值的函数
    default() {
      return 'Default function'
    }
  }
})
```

:::tip
`defineProps()` 的参数**不能**引用 `<script setup>` 里其他变量——编译时整个表达式会移到外部函数中。
:::

</div>
<div class="options-api">

```js
export default {
  props: {
    // 基础类型检查
    // (给出 `null` 和 `undefined` 值则会跳过任何类型检查)
    propA: Number,
    // 多种可能的类型
    propB: [String, Number],
    // 必传，且为 String 类型
    propC: {
      type: String,
      required: true
    },
    // 必传但可为 null 的字符串
    propD: {
      type: [String, null],
      required: true
    },
    // Number 类型的默认值
    propE: {
      type: Number,
      default: 100
    },
    // 对象类型的默认值
    propF: {
      type: Object,
      // 对象或者数组应当用工厂函数返回。
      // 工厂函数会收到组件所接收的原始 props
      // 作为参数
      default(rawProps) {
        return { message: 'hello' }
      }
    },
    // 自定义类型校验函数
    // 在 3.4+ 中完整的 props 作为第二个参数传入
    propG: {
      validator(value, props) {
        // The value must match one of these strings
        return ['success', 'warning', 'danger'].includes(value)
      }
    },
    // 函数类型的默认值
    propH: {
      type: Function,
      // 不像对象或数组的默认，这不是一个
      // 工厂函数。这会是一个用来作为默认值的函数
      default() {
        return 'Default function'
      }
    }
  }
}
```

</div>

补充说明：

- 默认所有 prop 都是可选的，除非写了 `required: true`。

- 除 `Boolean` 外，未传的可选 prop 默认为 `undefined`。

- 未传的 `Boolean` prop 会变成 `false`；可通过 `default` 修改，例如 `default: undefined` 会和非布尔 prop 行为一致。

- 声明了 `default` 时，prop 解析为 `undefined`（未传或显式传 `undefined`）都会用默认值。

校验失败时，开发模式下控制台会警告。

<div class="composition-api">

若使用[基于类型的 prop 声明](/api/sfc-script-setup#type-only-props-emit-declarations) <sup class="vt-badge ts" />，Vue 会尽量在运行时按类型做校验。例如 `defineProps<{ msg: string }>` 会编译为 `{ msg: { type: String, required: true }}`。

</div>
<div class="options-api">

::: tip 注意
prop 校验在组件实例创建**之前**执行，因此 `default` 或 `validator` 里不能用 `data`、`computed` 等实例属性。
:::

</div>

### 运行时类型检查 {#runtime-type-checks}

校验里的 `type` 可以是这些原生构造函数：

- `String`
- `Number`
- `Boolean`
- `Array`
- `Object`
- `Date`
- `Function`
- `Symbol`
- `Error`

`type` 也可以是自定义类或构造函数，Vue 用 `instanceof` 检查。例如：

```js
class Person {
  constructor(firstName, lastName) {
    this.firstName = firstName
    this.lastName = lastName
  }
}
```

你可以将其作为一个 prop 的类型：

<div class="composition-api">

```js
defineProps({
  author: Person
})
```

</div>
<div class="options-api">

```js
export default {
  props: {
    author: Person
  }
}
```

</div>

Vue 用 `instanceof Person` 检查 `author` 是否为 `Person` 的实例。

### 可为 null 的类型 {#nullable-type}

必传但允许 `null` 时，用包含 `null` 的数组写法：

<div class="composition-api">

```js
defineProps({
  id: {
    type: [String, null],
    required: true
  }
})
```

</div>
<div class="options-api">

```js
export default {
  props: {
    id: {
      type: [String, null],
      required: true
    }
  }
}
```

</div>

若 `type` 只写 `null`（不用数组），则允许任意类型。

## Boolean 类型转换 {#boolean-casting}

为贴近原生 boolean attribute 的行为，`Boolean` 类型的 Props 有特殊转换规则。例如 `<MyComponent>` 声明：

<div class="composition-api">

```js
defineProps({
  disabled: Boolean
})
```

</div>
<div class="options-api">

```js
export default {
  props: {
    disabled: Boolean
  }
}
```

</div>

该组件可以被这样使用：

```vue-html
<!-- 等同于传入 :disabled="true" -->
<MyComponent disabled />

<!-- 等同于传入 :disabled="false" -->
<MyComponent />
```

prop 允许多种类型时，`Boolean` 转换规则同样生效。但若同时允许 `String` 和 `Boolean`，有个边界情况：**只有** `Boolean` 写在 `String` **前面**时，才按 Boolean 规则转换：

<div class="composition-api">

```js
// disabled 将被转换为 true
defineProps({
  disabled: [Boolean, Number]
})

// disabled 将被转换为 true
defineProps({
  disabled: [Boolean, String]
})

// disabled 将被转换为 true
defineProps({
  disabled: [Number, Boolean]
})

// disabled 将被解析为空字符串 (disabled="")
defineProps({
  disabled: [String, Boolean]
})
```

</div>
<div class="options-api">

```js
// disabled 将被转换为 true
export default {
  props: {
    disabled: [Boolean, Number]
  }
}

// disabled 将被转换为 true
export default {
  props: {
    disabled: [Boolean, String]
  }
}

// disabled 将被转换为 true
export default {
  props: {
    disabled: [Number, Boolean]
  }
}

// disabled 将被解析为空字符串 (disabled="")
export default {
  props: {
    disabled: [String, Boolean]
  }
}
```

</div>
