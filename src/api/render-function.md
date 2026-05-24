# 渲染函数 API {#render-function-apis}

## h() {#h}

创建虚拟 DOM 节点 (vnode)。

- **类型**

  ```ts
  // 完整参数签名
  function h(
    type: string | Component,
    props?: object | null,
    children?: Children | Slot | Slots
  ): VNode

  // 省略 props
  function h(type: string | Component, children?: Children | Slot): VNode

  type Children = string | number | boolean | VNode | null | Children[]

  type Slot = () => Children

  type Slots = { [name: string]: Slot }
  ```

  > 为了便于阅读，对类型进行了简化。

- **详细信息**

  第一个参数可以是字符串（原生元素）或 Vue 组件定义。第二个参数是 prop，第三个参数是子节点。

  创建组件 vnode 时，子节点须以插槽函数传递。若组件只有默认槽，可传单个插槽函数；否则须以插槽函数对象传递。

  为方便阅读，子节点不是插槽对象时可省略 prop 参数。

- **示例**

  创建原生元素：

  ```js
  import { h } from 'vue'

  // 除了 type 外，其他参数都是可选的
  h('div')
  h('div', { id: 'foo' })

  // attribute 和 property 都可以用于 prop
  // Vue 会自动选择正确的方式来分配它
  h('div', { class: 'bar', innerHTML: 'hello' })

  // class 与 style 可以像在模板中一样
  // 用数组或对象的形式书写
  h('div', { class: [foo, { bar }], style: { color: 'red' } })

  // 事件监听器应以 onXxx 的形式书写
  h('div', { onClick: () => {} })

  // children 可以是一个字符串
  h('div', { id: 'foo' }, 'hello')

  // 没有 prop 时可以省略不写
  h('div', 'hello')
  h('div', [h('span', 'hello')])

  // children 数组可以同时包含 vnode 和字符串
  h('div', ['hello', h('span', 'hello')])
  ```

  创建组件：

  ```js
  import Foo from './Foo.vue'

  // 传递 prop
  h(Foo, {
    // 等价于 some-prop="hello"
    someProp: 'hello',
    // 等价于 @update="() => {}"
    onUpdate: () => {}
  })

  // 传递单个默认插槽
  h(Foo, () => 'default slot')

  // 传递具名插槽
  // 注意，需要使用 `null` 来避免
  // 插槽对象被当作是 prop
  h(MyComponent, null, {
    default: () => 'default slot',
    foo: () => h('div', 'foo'),
    bar: () => [h('span', 'one'), h('span', 'two')]
  })
  ```

- **参考**[指南 - 渲染函数 - 创建 VNode](/guide/extras/render-function#creating-vnodes)

## mergeProps() {#mergeprops}

合并多个 props 对象，用于处理含特定 props 参数的情况。

- **类型**

  ```ts
  function mergeProps(...args: object[]): object
  ```

- **详细信息**

  `mergeProps()` 会合并以下特定 props 参数：

  - `class`
  - `style`
  - `onXxx` 事件监听器——多个同名监听器会合并为一个数组。

  若只需覆盖而非合并，可用原生 object spread 语法。

- **示例**

  ```js
  import { mergeProps } from 'vue'

  const one = {
    class: 'foo',
    onClick: handlerA
  }

  const two = {
    class: { bar: true },
    onClick: handlerB
  }

  const merged = mergeProps(one, two)
  /**
   {
     class: 'foo bar',
     onClick: [handlerA, handlerB]
   }
   */
  ```

## cloneVNode() {#clonevnode}

克隆一个 vnode。

- **类型**

  ```ts
  function cloneVNode(vnode: VNode, extraProps?: object): VNode
  ```

- **详细信息**

  返回克隆的 vnode，可在原有基础上添加额外 prop。

  Vnode 创建后不可修改，不应直接改已有 vnode 的 prop，而应用不同/额外的 prop 克隆它。

  Vnode 有特殊内部属性，克隆不像 object spread 那样简单。`cloneVNode()` 处理了大部分内部逻辑。

- **示例**

  ```js
  import { h, cloneVNode } from 'vue'

  const original = h('div')
  const cloned = cloneVNode(original, { id: 'foo' })
  ```

## isVNode() {#isvnode}

判断一个值是否为 vnode 类型。

- **类型**

  ```ts
  function isVNode(value: unknown): boolean
  ```

## resolveComponent() {#resolvecomponent}

按名称手动解析已注册的组件。

- **类型**

  ```ts
  function resolveComponent(name: string): Component | string
  ```

- **详细信息**

  **备注：若可以直接引入组件，则无需使用此方法。**

  要从正确的组件上下文解析，`resolveComponent()` 须在<span class="composition-api"> `setup()` 或</span>渲染函数内调用。

  若组件未找到，会抛出运行时警告，并返回组件名字符串。

- **示例**

  <div class="composition-api">

  ```js
  import { h, resolveComponent } from 'vue'

  export default {
    setup() {
      const ButtonCounter = resolveComponent('ButtonCounter')

      return () => {
        return h(ButtonCounter)
      }
    }
  }
  ```

  </div>
  <div class="options-api">

  ```js
  import { h, resolveComponent } from 'vue'

  export default {
    render() {
      const ButtonCounter = resolveComponent('ButtonCounter')
      return h(ButtonCounter)
    }
  }
  ```

  </div>

- **参考**[指南 - 渲染函数 - 组件](/guide/extras/render-function#components)

## resolveDirective() {#resolvedirective}

按名称手动解析已注册的指令。

- **类型**

  ```ts
  function resolveDirective(name: string): Directive | undefined
  ```

- **详细信息**

  **备注：若可以直接引入指令，则无需使用此方法。**

  要从正确的组件上下文解析，`resolveDirective()` 须在<span class="composition-api"> `setup()` 或</span>渲染函数内调用。

  若指令未找到，会抛出运行时警告，并返回 `undefined`。

- **参考**[指南 - 渲染函数 - 自定义指令](/guide/extras/render-function#custom-directives)

## withDirectives() {#withdirectives}

给 vnode 添加自定义指令。

- **类型**

  ```ts
  function withDirectives(
    vnode: VNode,
    directives: DirectiveArguments
  ): VNode

  // [Directive, value, argument, modifiers]
  type DirectiveArguments = Array<
    | [Directive]
    | [Directive, any]
    | [Directive, any, string]
    | [Directive, any, string, DirectiveModifiers]
  >
  ```

- **详细信息**

  用自定义指令包装现有 vnode。第二个参数是指令数组。每个指令也可写为 `[Directive, value, argument, modifiers]` 形式。不需要时可省略数组尾部元素。

- **示例**

  ```js
  import { h, withDirectives } from 'vue'

  // 一个自定义指令
  const pin = {
    mounted() {
      /* ... */
    },
    updated() {
      /* ... */
    }
  }

  // <div v-pin:top.animate="200"></div>
  const vnode = withDirectives(h('div'), [
    [pin, 200, 'top', { animate: true }]
  ])
  ```

- **参考**[指南 - 渲染函数 - 自定义指令](/guide/extras/render-function#custom-directives)

## withModifiers() {#withmodifiers}

向事件处理函数添加内置 [`v-on` 修饰符](/guide/essentials/event-handling#event-modifiers)。

- **类型**

  ```ts
  function withModifiers(fn: Function, modifiers: ModifierGuardsKeys[]): Function
  ```

- **示例**

  ```js
  import { h, withModifiers } from 'vue'

  const vnode = h('button', {
    // 等价于 v-on:click.stop.prevent
    onClick: withModifiers(() => {
      // ...
    }, ['stop', 'prevent'])
  })
  ```

- **参考**[指南 - 渲染函数 - 事件修饰符](/guide/extras/render-function#event-modifiers)
