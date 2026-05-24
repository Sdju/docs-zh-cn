# Vue 与 Web Components {#vue-and-web-components}

[Web Components](https://developer.mozilla.org/en-US/docs/Web/Web_Components) 是一组浏览器原生 API，用来创建可复用的自定义元素 (custom elements)。

Vue 和 Web Components 互补。Vue 对使用、创建自定义元素支持很好——无论把自定义元素放进现有 Vue 应用，还是用 Vue 构建并发布自定义元素，都很方便。

## 在 Vue 中使用自定义元素 {#using-custom-elements-in-vue}

Vue [在 Custom Elements Everywhere 测试里满分](https://custom-elements-everywhere.com/libraries/vue/results/results.html)。在 Vue 里用自定义元素，体验和原生 HTML 标签差不多，但要注意：

### 跳过组件解析 {#skipping-component-resolution}

默认 Vue 会把非原生 HTML 标签先当 Vue 组件解析，解析失败才当自定义元素，开发时可能报「解析组件失败」。要让 Vue 把某些标签当自定义元素、跳过组件解析，可设 [`compilerOptions.isCustomElement`](/api/application#app-config-compileroptions)。

有构建工具时，应在构建配置里传这个选项（编译时选项）。

#### 浏览器内编译时的示例配置 {#example-in-browser-config}

```js
// 仅在浏览器内编译时才会工作
// 如果使用了构建工具，请看下面的配置示例
app.config.compilerOptions.isCustomElement = (tag) => tag.includes('-')
```

#### Vite 示例配置 {#example-vite-config}

```js [vite.config.js]
import vue from '@vitejs/plugin-vue'

export default {
  plugins: [
    vue({
      template: {
        compilerOptions: {
          // 将所有带短横线的标签名都视为自定义元素
          isCustomElement: (tag) => tag.includes('-')
        }
      }
    })
  ]
}
```

#### Vue CLI 示例配置 {#example-vue-cli-config}

```js [vue.config.js]
module.exports = {
  chainWebpack: (config) => {
    config.module
      .rule('vue')
      .use('vue-loader')
      .tap((options) => ({
        ...options,
        compilerOptions: {
          // 将所有以 ion- 开头的标签都视为自定义元素
          isCustomElement: (tag) => tag.startsWith('ion-')
        }
      }))
  }
}
```

### 传递 DOM 属性 {#passing-dom-properties}

DOM attribute 只能是字符串，复杂数据要走 DOM 对象属性。给自定义元素设 props 时，Vue 3 用 `in` 检查该 key 是否已在 DOM 对象上；若存在，优先设成 DOM 属性。自定义元素若遵循[最佳实践](https://web.dev/custom-elements-best-practices/)，多数情况不用操心这个。

少数情况必须用 DOM 属性传值，但元素未正确定义/反射该属性（`in` 失败）。可用 `v-bind` 的 `.prop` 修饰符强制设为 DOM 属性：

```vue-html
<my-element :user.prop="{ name: 'jack' }"></my-element>

<!-- 等价简写 -->
<my-element .user="{ name: 'jack' }"></my-element>
```

## 使用 Vue 构建自定义元素 {#building-custom-elements-with-vue}

自定义元素可在任意框架甚至无框架环境使用。终端用户技术栈不一，或想把应用与组件实现解耦时，很合适。

### defineCustomElement {#definecustomelement}

[`defineCustomElement`](/api/custom-elements#definecustomelement) 的用法和 [`defineComponent`](/api/general#definecomponent) 几乎一样，参数相同，但返回继承 `HTMLElement` 的自定义元素构造器：

```vue-html
<my-vue-element></my-vue-element>
```

```js
import { defineCustomElement } from 'vue'

const MyVueElement = defineCustomElement({
  // 这里是同平常一样的 Vue 组件选项
  props: {},
  emits: {},
  template: `...`,

  // defineCustomElement 特有的：注入进 shadow root 的 CSS
  styles: [`/* inlined css */`]
})

// 注册自定义元素
// 注册之后，所有此页面中的 `<my-vue-element>` 标签
// 都会被升级
customElements.define('my-vue-element', MyVueElement)

// 你也可以编程式地实例化元素：
// (必须在注册之后)
document.body.appendChild(
  new MyVueElement({
    // 初始化 props (可选)
  })
)
```

#### 生命周期 {#lifecycle}

- 首次 [`connectedCallback`](https://developer.mozilla.org/en-US/docs/Web/Web_Components/Using_custom_elements#using_the_lifecycle_callbacks) 时，Vue 会在 shadow root 里挂载组件实例。

- `disconnectedCallback` 后，Vue 在微任务里检查元素是否还在文档中：

  - 还在 → 视为 DOM 移动，保留实例；

  - 不在 → 视为移除，销毁实例。

#### Props {#props}

- `props` 选项声明的 prop 都会成为自定义元素上的属性。Vue 会自动决定反射为 attribute 还是 DOM 属性。

  - attribute 会按需转成对应属性类型。

  - `string`、`boolean`、`number` 等基础类型会反射为 attribute。

- 作为 attribute 传入时（始终是字符串），Vue 会把声明为 `Boolean`、`Number` 的 prop 转成期望类型。例如：

  ```js
  props: {
    selected: Boolean,
    index: Number
  }
  ```

  并以下面这样的方式使用自定义元素：

  ```vue-html
  <my-element selected index="1"></my-element>
  ```

  组件里 `selected` 为 `true`（boolean），`index` 为 `1`（number）。

#### 事件 {#events}

`this.$emit` 或 setup 里的 `emit` 触发的事件，会以 [CustomEvent](https://developer.mozilla.org/en-US/docs/Web/Events/Creating_and_triggering_events#adding_custom_data_%E2%80%93_customevent) 从自定义元素派发。额外参数会放在 CustomEvent 的 `detail` 里。

#### 插槽 {#slots}

组件内仍用 `<slot/>` 渲染插槽。但在最终自定义元素上，只能用[原生插槽语法](https://developer.mozilla.org/en-US/docs/Web/Web_Components/Using_templates_and_slots)：

- 不支持[作用域插槽](/guide/components/slots#scoped-slots)。

- 当传递具名插槽时，应使用 `slot` attribute 而不是 `v-slot` 指令：

  ```vue-html
  <my-element>
    <div slot="named">hello</div>
  </my-element>
  ```

#### 依赖注入 {#provide-inject}

[Provide / Inject](/guide/components/provide-inject#provide-inject) 及[组合式 API](/api/composition-api-dependency-injection#provide) 在 Vue 自定义元素里可用，但依赖**只在自定义元素之间**传递。Vue 自定义元素无法 inject 普通 Vue 组件 provide 的值。

#### 应用级配置 <sup class="vt-badge" data-text="3.5+" /> {#app-level-config}

用 `configureApp` 配置自定义元素的应用实例：

```js
defineCustomElement(MyComponent, {
  configureApp(app) {
    app.config.errorHandler = (err) => {
      /* ... */
    }
  }
})
```

### 将单文件组件编译为自定义元素 {#sfc-as-custom-element}

`defineCustomElement` 可配单文件组件 (SFC)。默认工具链会把 SFC 的 `<style>` 抽到单独 CSS 文件；写自定义元素时通常要改成注入 shadow root。

官方 SFC 工具链支持「自定义元素模式」导入单文件组件（需 `@vitejs/plugin-vue@^1.4.0` 或 `vue-loader@^16.5.0`）。该模式下会把 `<style>` 内联成 CSS 字符串，挂到组件的 `styles` 选项；`defineCustomElement` 会用它，在初始化时注入 shadow root。

开启方式：组件文件以 `.ce.vue` 结尾：

```js
import { defineCustomElement } from 'vue'
import Example from './Example.ce.vue'

console.log(Example.styles) // ["/* 内联 css */"]

// 转换为自定义元素构造器
const ExampleElement = defineCustomElement(Example)

// 注册
customElements.define('my-example', ExampleElement)
```

若要自定义哪些文件按自定义元素处理（例如所有 SFC 都当自定义元素），给构建插件传 `customElement` 选项：

- [@vitejs/plugin-vue](https://github.com/vitejs/vite-plugin-vue/tree/main/packages/plugin-vue#using-vue-sfcs-as-custom-elements)
- [vue-loader](https://github.com/vuejs/vue-loader/tree/next#v16-only-options)

### 基于 Vue 构建自定义元素库 {#tips-for-a-vue-custom-elements-library}

用 Vue 构建的自定义元素依赖 Vue 运行时，基础体积约 16kb，随功能增加。只做一个元素时，Vue 未必划算，可考虑原生 JS、[petite-vue](https://github.com/vuejs/petite-vue) 等更小方案。若要做一组逻辑复杂的元素，这点体积通常值得——每个组件代码更少，元素越多越划算。

宿主应用也用 Vue 时，可把构建里的 Vue **externalize**，与宿主共用一份运行时。

建议按元素分别导出构造器，方便按需导入、用自定义标签注册；也可导出 `register()` 批量注册。入口示例：

```js [elements.js]

import { defineCustomElement } from 'vue'
import Foo from './MyFoo.ce.vue'
import Bar from './MyBar.ce.vue'

const MyFoo = defineCustomElement(Foo)
const MyBar = defineCustomElement(Bar)

// 分别导出元素
export { MyFoo, MyBar }

export function register() {
  customElements.define('my-foo', MyFoo)
  customElements.define('my-bar', MyBar)
}
```

消费者在 Vue 里使用：

```vue
<script setup>
import { register } from 'path/to/elements.js'
register()
</script>

<template>
  <my-foo ...>
    <my-bar ...></my-bar>
  </my-foo>
</template>
```

或在 JSX 等其它框架里用自定义标签名：

```jsx
import { MyFoo, MyBar } from 'path/to/elements.js'

customElements.define('some-foo', MyFoo)
customElements.define('some-bar', MyBar)

export function MyComponent() {
  return <>
    <some-foo ... >
      <some-bar ... ></some-bar>
    </some-foo>
  </>
}
```

### 基于 Vue 的 Web Components 和 TypeScript {#web-components-and-typescript}

写 Vue SFC 时，常要给组件（含自定义元素）加[类型检查](/guide/scaling-up/tooling.html#typescript)。

自定义元素用原生 API 全局注册，Vue 模板里默认无类型推断。给 Vue 自定义元素加类型可扩展 [`GlobalComponents`](https://github.com/vuejs/language-tools/blob/master/packages/vscode-vue/README.md#usage)（JSX 用 [`JSX.IntrinsicElements`](https://www.typescriptlang.org/docs/handbook/jsx.html#intrinsic-elements)，从略）。

用 Vue 创建自定义元素并声明类型：

```typescript
import { defineCustomElement } from 'vue'

// 导入 Vue 组件。
import SomeComponent from './src/components/SomeComponent.ce.vue'

// 将 Vue 组件转为自定义元素类。
export const SomeElement = defineCustomElement(SomeComponent)

// 记得在浏览器中注册元素类。
customElements.define('some-element', SomeElement)

// 将新元素类型添加到 Vue 的 GlobalComponents 类型中。
declare module 'vue' {
  interface GlobalComponents {
    // 请务必在此处输入 Vue 组件类型
    // (SomeComponent，*而不是* SomeElement)。
    // 自定义元素的名称中需要连字符，
    // 因此请在此处使用连字符元素名称。
    'some-element': typeof SomeComponent
  }
}
```

## 非 Vue Web Components 和 TypeScript {#non-vue-web-components-and-typescript}

下面是在 SFC 里给**非 Vue 构建**的自定义元素做类型检查的推荐做法。

:::tip 注意
只是一种可行方式，具体因自定义元素所用框架而异。
:::

假设 `some-lib` 发布了一个带类型化属性和事件的自定义元素：

```ts [some-lib/src/SomeElement.ts]
// 定义一个带有类型化 JS 属性的类
export class SomeElement extends HTMLElement {
  foo: number = 123
  bar: string = 'blah'

  lorem: boolean = false

  // 这个方法不应该暴露给模板类型
  someMethod() {
    /* ... */
  }

  // ... 省略实现细节 ...
  // ... 假设元素会分派名为 "apple-fell" 的事件 ...
}

customElements.define('some-element', SomeElement)

// 这是一个包含 SomeElement 属性列表的类型定义
// 这些属性将用于框架模板 (如 Vue SFC 模板 的类型检查
// 其他属性将不会暴露
export type SomeElementAttributes = 'foo' | 'bar'

// 定义 SomeElement 分派的事件类型
export type SomeElementEvents = {
  'apple-fell': AppleFellEvent
}

export class AppleFellEvent extends Event {
  /* ... 省略细节 ... */
}
```

实现细节略。重点是提供 prop 类型和事件类型。

再写一个类型工具，方便在 Vue 里注册自定义元素类型：

```ts [some-lib/src/DefineCustomElement.ts]
// 我们可以为每个需要定义的元素重复使用这个类型助手
type DefineCustomElement<
  ElementType extends HTMLElement,
  Events extends EventMap = {},
  SelectedAttributes extends keyof ElementType = keyof ElementType
> = new () => ElementType & {

  // 使用 $props 定义暴露给模板类型检查的属性
  // Vue 特别从 `$props` 类型读取属性定义
  // 请注意，我们将元素的属性与全局 HTML 属性和 Vue 的特殊属性结合在一起
  /** @deprecated 不要在自定义元素引用上使用 $props 属性，
    这仅用于模板属性类型检查 */
  $props: HTMLAttributes &
    Partial<Pick<ElementType, SelectedAttributes>> &
    PublicProps

  // 使用 $emit 专门定义事件类型
  // Vue 特别从 `$emit` 类型读取事件类型
  // 请注意，`$emit` 期望我们将 `Events` 映射到特定格式
  /** @deprecated 不要在自定义元素引用上使用 $emit 属性，
    这仅用于模板属性类型检查 */
  $emit: VueEmit<Events>
}

type EventMap = {
  [event: string]: Event
}

// 这将 EventMap 映射到 Vue 的 $emit 类型期望的格式
type VueEmit<T extends EventMap> = EmitFn<{
  [K in keyof T]: (event: T[K]) => void
}>
```

:::tip 注意
`$props`、`$emit` 标为 deprecated，避免在自定义元素 `ref` 上误用——它们只用于模板类型检查，实例上并不存在。
:::

用该工具，可控制 Vue 模板里暴露哪些 JS 属性并做类型检查：

```ts [some-lib/src/SomeElement.vue.ts]
import {
  SomeElement,
  SomeElementAttributes,
  SomeElementEvents
} from './SomeElement.js'
import type { Component } from 'vue'
import type { DefineCustomElement } from './DefineCustomElement'

// 将新元素类型添加到 Vue 的 GlobalComponents 类型中
declare module 'vue' {
  interface GlobalComponents {
    'some-element': DefineCustomElement<
      SomeElement,
      SomeElementAttributes,
      SomeElementEvents
    >
  }
}
```

若 `some-lib` 把 TS 构建到 `dist/`，用户可这样导入并在 SFC 中使用：

```vue [SomeElementImpl.vue]
<script setup lang="ts">
// 这将创建并在浏览器中注册元素
import 'some-lib/dist/SomeElement.js'

// 使用 TypeScript 和 Vue 的用户应另外导入 Vue 特定的类型定义
//(使用其他框架的用户可以导入其他框架特定的类型定义)

import type {} from 'some-lib/dist/SomeElement.vue.js'

import { useTemplateRef, onMounted } from 'vue'

const el = useTemplateRef('el')

onMounted(() => {
  console.log(
    el.value!.foo,
    el.value!.bar,
    el.value!.lorem,
    el.value!.someMethod()
  )

  // 不要使用这些属性，它们是 `undefined` 
  // IDE 会将它们显示为删除线
  el.$props
  el.$emit
})
</script>

<template>
  <!-- 现在我们可以使用这个元素，并进行类型检查： -->
  <some-element
    ref="el"
    :foo="456"
    :blah="'hello'"
    @apple-fell="
      (event) => {
        // 这里 `event` 的类型被推断为 `AppleFellEvent`
      }
    "
  ></some-element>
</template>
```

元素没有类型定义时，可手动声明属性和事件类型：

```vue [SomeElementImpl.vue]
<script setup lang="ts">
// 假设 `some-lib` 是纯 JavaScript，没有类型定义，并且 TypeScript 无法推断类型：

import { SomeElement } from 'some-lib'

// 我们将使用之前相同的类型助手
import { DefineCustomElement } from './DefineCustomElement'

type SomeElementProps = { foo?: number; bar?: string }
type SomeElementEvents = { 'apple-fell': AppleFellEvent }
interface AppleFellEvent extends Event {
  /* ... */
}

// 将新元素类型添加到 Vue 的 GlobalComponents 类型中
declare module 'vue' {
  interface GlobalComponents {
    'some-element': DefineCustomElement<
      SomeElementProps,
      SomeElementEvents
    >
  }
}

// ... 与之前相同，使用元素引用 ...
</script>

<template>
  <!-- ... 与之前相同，在模板中使用元素 ... -->
</template>
```

自定义元素库作者不要自动导出某框架的类型定义（例如别和主入口一起从 `index.ts` 导出），否则用户可能遇到意外的模块扩展错误。让用户按需导入对应框架的类型文件即可。

## Web Components vs. Vue Components {#web-components-vs-vue-components}

有人认为应全用自定义元素、不用框架组件，好让应用「永不过时」。这种想法过于简单。

自定义元素和 Vue 组件有重叠：都能做可复用组件、传数据、发事件、管生命周期。但 Web Components API 更底层。做真实应用还需要很多平台未覆盖的能力：

- 声明式、高效的模板系统；

- 响应式状态管理，便于抽逻辑、复用；

- 高性能 SSR 与客户端 hydrate，对 SEO、[LCP 等核心指标](https://web.dev/vitals/) 很重要。原生自定义元素 SSR 常在 Node 里模拟 DOM 再序列化；Vue SSR 尽量编译成字符串拼接，更高效。

Vue 组件模型在设计时就考虑了这些点，整体更内聚。

团队技术够强时，或许能在自定义元素上自建同等能力，但要长期维护「内部框架」，也失去 Vue 等成熟生态。

也有框架以自定义元素为组件基础，但仍要自带专有方案解决上面问题——用它们就要接受这些技术选型。宣传「永不过时」也不能保证以后不用重构。

自定义元素还有这些限制：

- **贪婪 (eager) 插槽求值**影响组合。Vue [作用域插槽](/guide/components/slots#scoped-slots) 很强，原生插槽贪婪求值，自定义元素做不到；接收方也无法控制插槽内容何时创建。

- 用 shadow DOM 做局部 CSS 时，样式往往要嵌进 JS，运行时注入 shadow root，SSR 会重复很多 style 标签。虽有[平台提案](https://github.com/whatwg/html/pull/4898/)，通用支持与生产/SSR 性能仍不完善。Vue 单文件组件自带 [CSS 作用域](/api/sfc-css-features)，还能抽到独立 CSS 文件。

Vue 会跟进 Web 标准，平台能力够用就采用；目标是「好用、现在就能用」——对原生能力保持审慎，不成熟时选更合适的方案。
