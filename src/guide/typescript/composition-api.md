# TypeScript 与组合式 API {#typescript-with-composition-api}

<ScrimbaLink href="https://scrimba.com/links/vue-ts-composition-api" title="Free Vue.js TypeScript with Composition API Lesson" type="scrimba">
  观看 Scrimba 的互动视频课程
</ScrimbaLink>

> 本章假定你已读过[搭配 TypeScript 使用 Vue](./overview) 概览。

## 为组件的 props 标注类型 {#typing-component-props}

### 使用 `<script setup>` {#using-script-setup}

用 `<script setup>` 时，`defineProps()` 可从参数推导类型：

```vue
<script setup lang="ts">
const props = defineProps({
  foo: { type: String, required: true },
  bar: Number
})

props.foo // string
props.bar // number | undefined
</script>
```

这叫「运行时声明」：传给 `defineProps()` 的参数会当作运行时 `props` 选项。

更常见的是用泛型直接写 props 类型：

```vue
<script setup lang="ts">
const props = defineProps<{
  foo: string
  bar?: number
}>()
</script>
```

这叫「基于类型的声明」。编译器会尽量从类型参数推出等价的运行时选项；上面第二个例子编译出的运行时选项与第一个一致。

两种声明二选一，不能混用。

也可把 props 类型抽到单独 interface：

```vue
<script setup lang="ts">
interface Props {
  foo: string
  bar?: number
}

const props = defineProps<Props>()
</script>
```

`Props` 从别的文件导入也一样，需要把 TypeScript 作为 Vue 的 peer dependency。

```vue
<script setup lang="ts">
import type { Props } from './foo'

const props = defineProps<Props>()
</script>
```

#### 语法限制 {#syntax-limitations}

3.2 及以下，`defineProps()` 的泛型只能是类型字面量或本地 interface。

3.3 起支持导入类型和有限复杂类型。但类型到运行时的转换仍基于 AST，条件类型等需要真实类型分析的场景还不支持——可用于单个 prop，不能用于整个 props 对象。

### Props 解构默认值 {#props-default-values}

基于类型声明时，不能直接写 prop 默认值。可用[响应式 Props 解构](/guide/components/props#reactive-props-destructure)解决。 <sup class="vt-badge" data-text="3.5+" />：

```ts
interface Props {
  msg?: string
  labels?: string[]
}

const { msg = 'hello', labels = ['one', 'two'] } = defineProps<Props>()
```

3.4 及以下默认不开启响应式 Props 解构。也可用 `withDefaults` 宏：

```ts
interface Props {
  msg?: string
  labels?: string[]
}

const props = withDefaults(defineProps<Props>(), {
  msg: 'hello',
  labels: () => ['one', 'two']
})
```

会编译成等价的运行时 `default`。`withDefaults` 还会检查默认值类型，并从返回的 props 类型里去掉已有默认值的属性的可选标记。

:::info
用 `withDefaults` 时，数组、对象等可变默认值应包在函数里，避免被共享或意外修改，让每个实例拿到自己的副本。用解构时**不必**这样包。
:::

### 非 `<script setup>` 场景下 {#without-script-setup}

不用 `<script setup>` 时，要用 `defineComponent()` 才能推导 props。传给 `setup()` 的 `props` 类型来自 `props` 选项。

```ts
import { defineComponent } from 'vue'

export default defineComponent({
  props: {
    message: String
  },
  setup(props) {
    props.message // <-- 类型：string
  }
})
```

### 复杂的 prop 类型 {#complex-prop-types}

基于类型声明时，prop 可以像普通类型一样写复杂类型：

```vue
<script setup lang="ts">
interface Book {
  title: string
  author: string
  year: number
}

const props = defineProps<{
  book: Book
}>()
</script>
```

运行时声明可用 `PropType` 工具类型：

```ts
import type { PropType } from 'vue'

const props = defineProps({
  book: Object as PropType<Book>
})
```

其工作方式与直接指定 `props` 选项基本相同：

```ts
import { defineComponent } from 'vue'
import type { PropType } from 'vue'

export default defineComponent({
  props: {
    book: Object as PropType<Book>
  }
})
```

`props` 选项多用于 Options API，更细的示例见[选项式 API 与 TypeScript](/guide/typescript/options-api#typing-component-props)，同样适用于 `defineProps()` 的运行时声明。

## 为组件的 emits 标注类型 {#typing-component-emits}

`<script setup>` 里 `emit` 可用运行时或类型声明标注：

```vue
<script setup lang="ts">
// 运行时
const emit = defineEmits(['change', 'update'])

// 基于选项
const emit = defineEmits({
  change: (id: number) => {
    // 返回 `true` 或 `false`
    // 表明验证通过或失败
  },
  update: (value: string) => {
    // 返回 `true` 或 `false`
    // 表明验证通过或失败
  }
})

// 基于类型
const emit = defineEmits<{
  (e: 'change', id: number): void
  (e: 'update', value: string): void
}>()

// 3.3+: 可选的、更简洁的语法
const emit = defineEmits<{
  change: [id: number]
  update: [value: string]
}>()
</script>
```

类型参数两种写法：

1. 可调用类型，写成带[调用签名](https://www.typescriptlang.org/docs/handbook/2/functions.html#call-signatures)的类型字面量，作为返回的 `emit` 类型。
2. 对象字面量：键为事件名，值为参数数组/元组类型。上面用具名元组，每个参数可有名字。

基于类型声明能更细地约束事件参数。

不用 `<script setup>` 时，`defineComponent()` 也可从 `emits` 推导 `setup` 里 `emit` 的类型：

```ts
import { defineComponent } from 'vue'

export default defineComponent({
  emits: ['change'],
  setup(props, { emit }) {
    emit('change') // <-- 类型检查 / 自动补全
  }
})
```

## 为 `ref()` 标注类型 {#typing-ref}

ref 会根据初始化时的值推导其类型：

```ts
import { ref } from 'vue'

// 推导出的类型：Ref<number>
const year = ref(2020)

// => TS Error: Type 'string' is not assignable to type 'number'.
year.value = '2020'
```

有时要给 ref 内的值指定更复杂类型，可用 `Ref`：

```ts
import { ref } from 'vue'
import type { Ref } from 'vue'

const year: Ref<string | number> = ref('2020')

year.value = 2020 // 成功！
```

或在 `ref()` 上传泛型，覆盖默认推导：

```ts
// 得到的类型：Ref<string | number>
const year = ref<string | number>('2020')

year.value = 2020 // 成功！
```

有泛型但没有初始值时，类型会包含 `undefined`：

```ts
// 推导得到的类型：Ref<number | undefined>
const n = ref<number>()
```

## 为 `reactive()` 标注类型 {#typing-reactive}

`reactive()` 也会隐式地从它的参数中推导类型：

```ts
import { reactive } from 'vue'

// 推导得到的类型：{ title: string }
const book = reactive({ title: 'Vue 3 指引' })
```

要给 `reactive` 变量显式标类型，可用 interface：

```ts
import { reactive } from 'vue'

interface Book {
  title: string
  year?: number
}

const book: Book = reactive({ title: 'Vue 3 指引' })
```

:::tip
不推荐使用 `reactive()` 的泛型参数，因为处理了深层次 ref 解包的返回值与泛型参数的类型不同。
:::

## 为 `computed()` 标注类型 {#typing-computed}

`computed()` 会自动从其计算函数的返回值上推导出类型：

```ts
import { ref, computed } from 'vue'

const count = ref(0)

// 推导得到的类型：ComputedRef<number>
const double = computed(() => count.value * 2)

// => TS Error: Property 'split' does not exist on type 'number'
const result = double.value.split('')
```

你还可以通过泛型参数显式指定类型：

```ts
const double = computed<number>(() => {
  // 若返回值不是 number 类型则会报错
})
```

## 为事件处理函数标注类型 {#typing-event-handlers}

处理原生 DOM 事件时，应给事件处理函数的参数标类型。例如：

```vue
<script setup lang="ts">
function handleChange(event) {
  // `event` 隐式地标注为 `any` 类型
  console.log(event.target.value)
}
</script>

<template>
  <input type="text" @change="handleChange" />
</template>
```

不标注时 `event` 为 `any`；`tsconfig.json` 里 `"strict": true` 或 `"noImplicitAny": true` 时会报错。建议显式标注；访问 `event` 属性时可能还要类型断言：

```ts
function handleChange(event: Event) {
  console.log((event.target as HTMLInputElement).value)
}
```

## 为 provide / inject 标注类型 {#typing-provide-inject}

provide / inject 常在不同组件间使用。要给注入值标类型，可用继承自 `Symbol` 的泛型 `InjectionKey`，在提供方和消费方之间对齐类型：

```ts
import { provide, inject } from 'vue'
import type { InjectionKey } from 'vue'

const key = Symbol() as InjectionKey<string>

provide(key, 'foo') // 若提供的是非字符串值会导致错误

const foo = inject(key) // foo 的类型：string | undefined
```

建议把注入 key 的类型放在单独文件，供多组件导入。

字符串 key 时，注入值类型为 `unknown`，需用泛型显式声明：

```ts
const foo = inject<string>('foo') // 类型：string | undefined
```

注入值仍可能是 `undefined`——无法保证提供方一定在运行时 provide。

提供默认值后可去掉 `undefined`：

```ts
const foo = inject<string>('foo', 'bar') // 类型：string
```

确定一定会提供时，也可断言：

```ts
const foo = inject('foo') as string
```

## 为模板引用标注类型 {#typing-template-refs}

Vue 3.5 与 @vue/language-tools 2.1 起，单文件组件里 `useTemplateRef()` 可根据匹配的 `ref` attribute 所在元素**自动推断**类型。

无法自动推断时，可用泛型显式标注：

```ts
const el = useTemplateRef<HTMLInputElement>('el')
```

<details>
<summary>3.5 前的用法</summary>

需用泛型 + 初始值 `null` 创建模板 ref：

```vue
<script setup lang="ts">
import { ref, onMounted } from 'vue'

const el = ref<HTMLInputElement | null>(null)

onMounted(() => {
  el.value?.focus()
})
</script>

<template>
  <input ref="el" />
</template>
```

</details>

DOM 接口可参考 [MDN](https://developer.mozilla.org/zh-CN/docs/Web/HTML/Element/input#technical_summary) 等文档。

严格类型安全下，访问 `el.value` 应用可选链或类型守卫：挂载前为 `null`，`v-if` 卸载元素时也可能变 `null`。

## 为组件模板引用标注类型 {#typing-component-template-refs}

Vue 3.5 与 @vue/language-tools 2.1 起，单文件组件里 `useTemplateRef()` 也可按匹配的 `ref` attribute **自动推断**类型。

无法自动推断时（非 SFC、动态组件等），可用泛型显式标注。

获取导入组件的实例类型：先用 `typeof` 取组件类型，再用 `InstanceType` 提取实例类型：

```vue{6,7} [App.vue]
<script setup lang="ts">
import { useTemplateRef } from 'vue'
import Foo from './Foo.vue'
import Bar from './Bar.vue'

type FooType = InstanceType<typeof Foo>
type BarType = InstanceType<typeof Bar>

const compRef = useTemplateRef<FooType | BarType>('comp')
</script>

<template>
  <component :is="Math.random() > 0.5 ? Foo : Bar" ref="comp" />
</template>
```

拿不到具体类型或不关心时，可用 `ComponentPublicInstance`，只含各组件共有属性（如 `$el`）。

```ts
import { useTemplateRef } from 'vue'
import type { ComponentPublicInstance } from 'vue'

const child = useTemplateRef<ComponentPublicInstance>('child')
```

如果引用的组件是一个[泛型组件](/guide/typescript/overview.html#generic-components)，例如 `MyGenericModal`：

```vue [MyGenericModal.vue]
<script setup lang="ts" generic="ContentType extends string | number">
import { ref } from 'vue'

const content = ref<ContentType | null>(null)

const open = (newContent: ContentType) => (content.value = newContent)

defineExpose({
  open
})
</script>
```

需用 [`vue-component-type-helpers`](https://www.npmjs.com/package/vue-component-type-helpers) 的 `ComponentExposed`，`InstanceType` 对泛型组件无效。

```vue [App.vue]
<script setup lang="ts">
import { useTemplateRef } from 'vue'
import MyGenericModal from './MyGenericModal.vue'
import type { ComponentExposed } from 'vue-component-type-helpers'

const modal =
  useTemplateRef<ComponentExposed<typeof MyGenericModal>>('modal')

const openModal = () => {
  modal.value?.open('newValue')
}
</script>
```

`@vue/language-tools` 2.1+ 可自动推导静态模板 ref，上面写法多在特殊场景才需要。

## 为自定义全局指令添加类型 {#typing-global-custom-directives}

扩展 `ComponentCustomProperties` 可为 `app.directive()` 注册的全局指令提供类型提示和检查：

```ts [src/directives/highlight.ts]
import type { Directive } from 'vue'

export type HighlightDirective = Directive<HTMLElement, string>

declare module 'vue' {
  export interface ComponentCustomProperties {
    // 使用 v 作为前缀 (v-highlight)
    vHighlight: HighlightDirective
  }
}

export default {
  mounted: (el, binding) => {
    el.style.backgroundColor = binding.value
  }
} satisfies HighlightDirective
```

```ts [main.ts]
import highlight from './directives/highlight'
// ...其它代码
const app = createApp(App)
app.directive('highlight', highlight)
```

在组件中使用

```vue [App.vue]
<template>
  <p v-highlight="'blue'">This sentence is important!</p>
</template>
```
