# 内置的特殊 Attributes {#built-in-special-attributes}

## key {#key}

`key` 这个特殊 attribute 帮助 Vue 虚拟 DOM 在比较新旧节点时识别 vnode。

- **预期**：`number | string | symbol`

- **详细信息**

  没有 key 时，Vue 会尽量少移动元素，尽量就地更新/复用同类型元素。有 key 时，会按 key 变化重排元素，并移除/销毁 key 已不存在的元素。

  同一父元素下的子元素 key 必须**唯一**，重复 key 会导致渲染异常。

  最常见用法是与 `v-for` 结合：

  ```vue-html
  <ul>
    <li v-for="item in items" :key="item.id">...</li>
  </ul>
  ```

  也可用来强制替换元素/组件，而不是复用。常见场景：

  - 在合适时机触发组件生命周期钩子
  - 触发过渡

  举例来说：

  ```vue-html
  <transition>
    <span :key="text">{{ text }}</span>
  </transition>
  ```

  当 `text` 变化时，`<span>` 会被替换而不是更新，因此 transition 会触发。

- **参考**[指南 - 列表渲染 - 通过 `key` 管理状态](/guide/essentials/list#maintaining-state-with-key)

## ref {#ref}

用于注册[模板引用](/guide/essentials/template-refs)。

- **预期**：`string | Function`

- **详细信息**

  `ref` 用来注册元素或子组件的引用。

  选项式 API 中，引用存在组件的 `this.$refs` 里：

  ```vue-html
  <!-- 存储为 this.$refs.p -->
  <p ref="p">hello</p>
  ```

  组合式 API 中，引用存在与名字匹配的 ref 里：

  ```vue
  <script setup>
  import { useTemplateRef } from 'vue'

  const pRef = useTemplateRef('p')
  </script>

  <template>
    <p ref="p">hello</p>
  </template>
  ```

  用于普通 DOM 元素时，引用就是元素本身；用于子组件时，引用是子组件实例。

  `ref` 也可接收函数，完全控制引用存放位置：

  ```vue-html
  <ChildComponent :ref="(el) => child = el" />
  ```

  注意：ref 在渲染时创建，组件挂载后才能访问。

  `this.$refs` 不是响应式的，不要在模板里用它做数据绑定。

- **参考**
  - [指南 - 模板引用](/guide/essentials/template-refs)
  - [指南 - 为模板引用标注类型](/guide/typescript/composition-api#typing-template-refs) <sup class="vt-badge ts" />
  - [指南 - 为组件模板引用标注类型](/guide/typescript/composition-api#typing-component-template-refs) <sup class="vt-badge ts" />

## is {#is}

用于绑定[动态组件](/guide/essentials/component-basics#dynamic-components)。

- **预期**：`string | Component`

- **用于原生元素**

  - 仅在 3.1+ 中支持

  当 `is` 用于原生 HTML 元素时，会被当作 [Customized built-in element](https://html.spec.whatwg.org/multipage/custom-elements.html#custom-elements-customized-builtin-example)（原生 Web 平台特性）。

  但有时你需要 Vue 用组件替换原生元素，如 [DOM 内模板解析注意事项](/guide/essentials/component-basics#in-dom-template-parsing-caveats) 所述。可在 `is` 值前加 `vue:` 前缀，Vue 会把它渲染为 Vue 组件：

  ```vue-html
  <table>
    <tr is="vue:my-row-component"></tr>
  </table>
  ```

- **参考**

  - [内置特殊元素 - `<component>`](/api/built-in-special-elements#component)
  - [动态组件](/guide/essentials/component-basics#dynamic-components)
