# \<script setup> {#script-setup}

`<script setup>` 是在单文件组件 (SFC) 中使用组合式 API 的编译时语法糖。在 SFC 里用组合式 API 时，推荐默认使用它。相比普通 `<script>`，优势如下：

- 更少的样板内容，更简洁的代码。
- 可以用纯 TypeScript 声明 props 和自定义事件。
- 更好的运行时性能（模板编译成同一作用域内的渲染函数，避免渲染上下文代理对象）。
- 更好的 IDE 类型推导（语言服务器需要从代码中提取的类型更少）。

## 基本语法 {#basic-syntax}

启用方式：在 `<script>` 代码块上添加 `setup` attribute：

```vue
<script setup>
console.log('hello script setup')
</script>
```

代码会编译成组件 `setup()` 函数的内容。普通 `<script>` 只在组件首次引入时执行一次；`<script setup>` 会在**每次创建组件实例时执行**。

### 顶层的绑定会被暴露给模板 {#top-level-bindings-are-exposed-to-template}

使用 `<script setup>` 时，其中声明的顶层绑定（变量、函数、import 导入）都能在模板中直接使用：

```vue
<script setup>
// 变量
const msg = 'Hello!'

// 函数
function log() {
  console.log(msg)
}
</script>

<template>
  <button @click="log">{{ msg }}</button>
</template>
```

import 导入的内容同样会暴露。可以在模板中直接使用导入的 helper 函数，无需通过 `methods` 选项暴露：

```vue
<script setup>
import { capitalize } from './helpers'
</script>

<template>
  <div>{{ capitalize('hello') }}</div>
</template>
```

## 响应式 {#reactivity}

响应式状态须用[响应式 API](/api/reactivity-core) 创建。和 `setup()` 返回值一样，ref 在模板中会自动解包：

```vue
<script setup>
import { ref } from 'vue'

const count = ref(0)
</script>

<template>
  <button @click="count++">{{ count }}</button>
</template>
```

## 使用组件 {#using-components}

`<script setup>` 中的值可直接作为自定义组件标签名使用：

```vue
<script setup>
import MyComponent from './MyComponent.vue'
</script>

<template>
  <MyComponent />
</template>
```

这里 `MyComponent` 应理解为引用一个变量。若用过 JSX，心智模型类似。kebab-case 的 `<my-component>` 也能在模板中使用——但建议用 PascalCase 保持一致，也便于区分原生自定义元素。

### 动态组件 {#dynamic-components}

组件通过变量引用而非字符串名注册，在 `<script setup>` 中使用动态组件时，应用动态的 `:is` 绑定：

```vue
<script setup>
import Foo from './Foo.vue'
import Bar from './Bar.vue'
</script>

<template>
  <component :is="Foo" />
  <component :is="someCondition ? Foo : Bar" />
</template>
```

注意组件在三元表达式中作为变量使用。

### 递归组件 {#recursive-components}

单文件组件可通过文件名引用自身。例如 `FooBar.vue` 可在模板中用 `<FooBar/>` 引用自己。

这种方式优先级低于导入的组件。若具名导入与组件自身推导名冲突，可为导入的组件添加别名：

```js
import { FooBar as FooBarChild } from './components'
```

### 命名空间组件 {#namespaced-components}

可用带 `.` 的组件标签，如 `<Foo.Bar>`，引用嵌套在对象属性中的组件。从单个文件导入多个组件时很有用：

```vue
<script setup>
import * as Form from './form-components'
</script>

<template>
  <Form.Input>
    <Form.Label>label</Form.Label>
  </Form.Input>
</template>
```

## 使用自定义指令 {#using-custom-directives}

全局注册的自定义指令正常工作。本地自定义指令在 `<script setup>` 中无需显式注册，但须遵循 `vNameOfDirective` 命名规范：

```vue
<script setup>
const vMyDirective = {
  beforeMount: (el) => {
    // 在元素上做些操作
  }
}
</script>
<template>
  <h1 v-my-directive>This is a Heading</h1>
</template>
```

若指令从别处导入，可重命名以符合命名规范：

```vue
<script setup>
import { myDirective as vMyDirective } from './MyDirective.js'
</script>
```

## defineProps() 和 defineEmits() {#defineprops-defineemits}

声明 `props` 和 `emits` 时，用 `defineProps` 和 `defineEmits` API 可获得完整类型推导。它们在 `<script setup>` 中自动可用：

```vue
<script setup>
const props = defineProps({
  foo: String
})

const emit = defineEmits(['change', 'delete'])
// setup 代码
</script>
```

- `defineProps` 和 `defineEmits` 是只能在 `<script setup>` 中使用的**编译器宏**。无需导入，会随 `<script setup>` 处理过程一同编译掉。

- `defineProps` 接收与 `props` 选项相同的值，`defineEmits` 接收与 `emits` 选项相同的值。

- `defineProps` 和 `defineEmits` 在选项传入后，会提供恰当的类型推导。

- 传入 `defineProps` 和 `defineEmits` 的选项会从 setup 提升到模块作用域。因此不能引用 setup 作用域中的局部变量，否则会编译错误。但*可以*引用导入的绑定，因为它们也在模块作用域内。

### 针对类型的 props/emit 声明<sup class="vt-badge ts" /> {#type-only-props-emit-declarations}

props 和 emit 也可通过给 `defineProps` 和 `defineEmits` 传递纯类型参数来声明：

```ts
const props = defineProps<{
  foo: string
  bar?: number
}>()

const emit = defineEmits<{
  (e: 'change', id: number): void
  (e: 'update', value: string): void
}>()

// 3.3+：另一种更简洁的语法
const emit = defineEmits<{
  change: [id: number] // 具名元组语法
  update: [value: string]
}>()
```

- `defineProps` 或 `defineEmits` 要么用运行时声明，要么用类型声明。两者同时使用会编译报错。

- 使用类型声明时，静态分析会自动生成等效的运行时声明，避免双重声明并确保正确的运行时行为。

  - 开发模式下，编译器会试着从类型推导对应的运行时验证。例如从 `foo: string` 推断出 `foo: String`。若类型引用导入类型，推导结果为 `foo: null`（与 `any` 相等），因为编译器没有外部文件信息。

  - 生产模式下，编译器生成数组格式声明以减小打包体积（props 会编译成 `['foo', 'bar']`）。

- 3.2 及以下版本中，`defineProps()` 的泛型类型参数只能使用类型字面量或本地接口。

  3.3 已解决此限制。最新版 Vue 支持在类型参数位置引用导入和有限的复杂类型。但类型到运行时的转换仍基于 AST，不支持需要实际类型分析的复杂类型（如条件类型）。可在单个 prop 的类型上用条件类型，但不能对整个 props 对象使用。

### 响应式 Props 解构 <sup class="vt-badge" data-text="3.5+" /> {#reactive-props-destructure}

Vue 3.5 及以上版本中，从 `defineProps` 返回值解构出的变量是响应式的。同一 `<script setup>` 块中访问这些变量时，编译器会自动在前面添加 `props.`。

```ts
const { foo } = defineProps(['foo'])

watchEffect(() => {
  // 在 3.5 之前仅运行一次
  // 在 3.5+ 版本中会在 "foo" prop 改变时重新运行
  console.log(foo)
})
```

以上编译成以下等效内容：

```js {5}
const props = defineProps(['foo'])

watchEffect(() => {
  // `foo` 由编译器转换为 `props.foo`
  console.log(props.foo)
})
```

此外，可用 JavaScript 原生默认值语法声明 props 默认值。使用基于类型的 props 声明时特别有用。

```ts
interface Props {
  msg?: string
  labels?: string[]
}

const { msg = 'hello', labels = ['one', 'two'] } = defineProps<Props>()
```

### 使用类型声明时的默认 props 值 <sup class="vt-badge ts" /> {#default-props-values-when-using-type-declaration}

3.5 及以上版本中，使用响应式 Props 解构时可自然声明默认值。3.4 及以下默认未启用响应式 Props 解构。要用基于类型声明的方式声明 props 默认值，须用 `withDefaults` 编译器宏：

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

上面代码会编译为等价的运行时 props `default` 选项。`withDefaults` 还提供默认值的类型检查，并确保返回的 `props` 类型去掉已声明默认值的属性的可选标志。

:::info
使用 `withDefaults` 时，可变引用类型（如数组或对象）的默认值应封装在函数中，以避免意外修改和外部副作用。这样每个组件实例都会获得默认值的独立副本。使用默认值解构时**不**需要这样做。
:::

## defineModel() {#definemodel}

- 仅在 3.4+ 中可用

此宏可声明双向绑定 prop，供父组件通过 `v-model` 使用。[组件 `v-model`](/guide/components/v-model) 指南中有示例。

底层会声明 model prop 和对应的值更新事件。第一个参数是字符串字面量时用作 prop 名称；否则默认为 `"modelValue"`。两种情况下都可再传额外对象，包含 prop 选项和 model ref 的值转换选项。

```js
// 声明 "modelValue" prop，由父组件通过 v-model 使用
const model = defineModel()
// 或者：声明带选项的 "modelValue" prop
const model = defineModel({ type: String })

// 在被修改时，触发 "update:modelValue" 事件
model.value = "hello"

// 声明 "count" prop，由父组件通过 v-model:count 使用
const count = defineModel("count")
// 或者：声明带选项的 "count" prop
const count = defineModel("count", { type: Number, default: 0 })

function inc() {
  // 在被修改时，触发 "update:count" 事件
  count.value++
}
```

:::warning
若 `defineModel` prop 设置了 `default` 值而父组件未提供任何值，会导致父子组件不同步。下例中，父组件的 `myRef` 是 undefined，子组件的 `model` 是 1：

```vue [Child.vue]
<script setup>
const model = defineModel({ default: 1 })
</script>
```

```vue [Parent.vue]
<script setup>
const myRef = ref()
</script>

<template>
  <Child v-model="myRef"></Child>
</template>
```

:::

### 修饰符和转换器 {#modifiers-and-transformers}

要获取 `v-model` 指令使用的修饰符，可解构 `defineModel()` 的返回值：

```js
const [modelValue, modelModifiers] = defineModel()

// 对应 v-model.trim
if (modelModifiers.trim) {
  // ...
}
```

存在修饰符时，可能需要在读取或同步回父组件时转换值。可用 `get` 和 `set` 转换器选项实现：

```js
const [modelValue, modelModifiers] = defineModel({
  // get() 省略了，因为这里不需要它
  set(value) {
    // 如果使用了 .trim 修饰符，则返回裁剪过后的值
    if (modelModifiers.trim) {
      return value.trim()
    }
    // 否则，原样返回
    return value
  }
})
```

### 在 TypeScript 中使用 <sup class="vt-badge ts" /> {#usage-with-typescript}

与 `defineProps` 和 `defineEmits` 一样，`defineModel` 也可接收类型参数来指定 model 值和修饰符的类型：

```ts
const modelValue = defineModel<string>()
//    ^? Ref<string | undefined>

// 用带有选项的默认 model，设置 required 去掉了可能的 undefined 值
const modelValue = defineModel<string>({ required: true })
//    ^? Ref<string>

const [modelValue, modifiers] = defineModel<string, "trim" | "uppercase">()
//                 ^? Record<'trim' | 'uppercase', true | undefined>
```

## defineExpose() {#defineexpose}

使用 `<script setup>` 的组件**默认关闭**——通过模板引用或 `$parent` 链获取的公开实例，**不会**暴露 `<script setup>` 中声明的任何绑定。

可用 `defineExpose` 编译器宏显式指定要暴露的属性：

```vue
<script setup>
import { ref } from 'vue'

const a = 1
const b = ref(2)

defineExpose({
  a,
  b
})
</script>
```

父组件通过模板引用获取当前组件实例时，得到的实例形如 `{ a: number, b: number }`（ref 会像普通实例中一样自动解包）

## defineOptions() {#defineoptions}

- 仅在 3.3+ 中支持

此宏可直接在 `<script setup>` 中声明组件选项，无需单独的 `<script>` 块：

```vue
<script setup>
defineOptions({
  inheritAttrs: false,
  customOptions: {
    /* ... */
  }
})
</script>
```

- 这是宏定义，选项会提升到模块作用域，无法访问 `<script setup>` 中非字面常数的局部变量。

## defineSlots() <sup class="vt-badge ts"/> {#defineslots}

- 仅在 3.3+ 中支持

此宏为 IDE 提供插槽名称和 props 类型检查的类型提示。

`defineSlots()` 只接受类型参数，没有运行时参数。类型参数应为类型字面量，属性键是插槽名称，值类型是插槽函数。函数第一个参数是插槽期望接收的 props，其类型用于模板中的插槽 props。返回类型目前被忽略，可以是 `any`，将来可能用于检查插槽内容。

它还返回 `slots` 对象，等同于 setup 上下文中暴露或由 `useSlots()` 返回的 `slots` 对象。

```vue
<script setup lang="ts">
const slots = defineSlots<{
  default(props: { msg: string }): any
}>()
</script>
```

## `useSlots()` 和 `useAttrs()` {#useslots-useattrs}

在 `<script setup>` 中使用 `slots` 和 `attrs` 较少见，模板中可直接通过 `$slots` 和 `$attrs` 访问。确有需要时，可分别用 `useSlots` 和 `useAttrs`：

```vue
<script setup>
import { useSlots, useAttrs } from 'vue'

const slots = useSlots()
const attrs = useAttrs()
</script>
```

`useSlots` 和 `useAttrs` 是运行时函数，返回值分别与 `setupContext.slots` 和 `setupContext.attrs` 等价。也可在普通组合式 API 中使用。

## 与普通的 `<script>` 一起使用 {#usage-alongside-normal-script}

`<script setup>` 可与普通 `<script>` 一起使用。普通 `<script>` 适用于：

- 声明 `<script setup>` 无法声明的选项，如 `inheritAttrs` 或插件自定义选项（3.3+ 可用 [`defineOptions`](/api/sfc-script-setup#defineoptions) 替代）。
- 声明模块的具名导出 (named exports)。
- 运行只需在模块作用域执行一次的副作用，或创建单例对象。

```vue
<script>
// 普通 <script>，在模块作用域下执行 (仅一次)
runSideEffectOnce()

// 声明额外的选项
export default {
  inheritAttrs: false,
  customOptions: {}
}
</script>

<script setup>
// 在 setup() 作用域中执行 (对每个实例皆如此)
</script>
```

同一组件中 `<script setup>` 与 `<script>` 结合使用，仅支持上述情况。具体来说：

- **不要**为已可用 `<script setup>` 定义的选项使用单独的 `<script>`，如 `props` 和 `emits`。
- `<script setup>` 中创建的变量不会添加到组件实例，无法从选项式 API 访问。强烈不建议这样混合 API。

若遇到以上不支持的场景，建议改用显式 [`setup()`](/api/composition-api-setup) 函数，而非 `<script setup>`。

## 顶层 `await` {#top-level-await}

`<script setup>` 中可使用顶层 `await`，代码会编译成 `async setup()`：

```vue
<script setup>
const post = await fetch(`/api/post/1`).then((r) => r.json())
</script>
```

await 表达式会自动编译成在 `await` 之后保留当前组件实例上下文的格式。

:::warning 注意
`async setup()` 须与 [`Suspense`](/guide/built-ins/suspense.html) 组合使用，该特性目前仍处于实验阶段。我们计划在未来版本完善并编写文档——若现在感兴趣，可参考其[测试](https://github.com/vuejs/core/blob/main/packages/runtime-core/__tests__/components/Suspense.spec.ts)了解工作方式。
:::

## 导入语句 {#imports-statements}

Vue 中的导入语句遵循 [ECMAScript 模块规范](https://nodejs.org/api/esm.html)。还可使用构建工具配置中定义的别名：

```vue
<script setup>
import { ref } from 'vue'
import { componentA } from './Components'
import { componentB } from '@/Components'
import { componentC } from '~/Components'
</script>
```

## 泛型 <sup class="vt-badge ts" /> {#generics}

可用 `<script>` 标签上的 `generic` 属性声明泛型类型参数：

```vue
<script setup lang="ts" generic="T">
defineProps<{
  items: T[]
  selected: T
}>()
</script>
```

`generic` 的值与 TypeScript 中 `<...>` 之间的参数列表相同。例如，可用多个参数、`extends` 约束、默认类型和引用导入的类型：

```vue
<script
  setup
  lang="ts"
  generic="T extends string | number, U extends Item"
>
import type { Item } from './types'
defineProps<{
  id: T
  list: U[]
}>()
</script>
```

无法自动推断泛型组件的具体类型时，可用 `@vue-generic` 指令显式指定：

```vue
<template>
  <!-- @vue-generic {import('@/api').Actor} -->
  <ApiSelect v-model="peopleIds" endpoint="/api/actors" id-prop="actorId" />

  <!-- @vue-generic {import('@/api').Genre} -->
  <ApiSelect v-model="genreIds" endpoint="/api/genres" id-prop="genreId" />
</template>
```

在 `ref` 中使用泛型组件引用时，须用 [`vue-component-type-helpers`](https://www.npmjs.com/package/vue-component-type-helpers) 库，因为 `InstanceType` 在此场景下不起作用。

```vue
<script
  setup
  lang="ts"
>
import componentWithoutGenerics from '../component-without-generics.vue';
import genericComponent from '../generic-component.vue';

import type { ComponentExposed } from 'vue-component-type-helpers';

// 适用于没有泛型的组件
ref<InstanceType<typeof componentWithoutGenerics>>();

ref<ComponentExposed<typeof genericComponent>>();
```

## 限制 {#restrictions}

- 由于模块执行语义差异，`<script setup>` 中的代码依赖 SFC 上下文。移到外部 `.js` 或 `.ts` 文件会让开发者和工具感到混乱。因此 **`<script setup>`** 不能与 `src` attribute 一起使用。
- `<script setup>` 不支持 DOM 内根组件模板。([相关讨论](https://github.com/vuejs/core/issues/8391))
