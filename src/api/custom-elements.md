# 自定义元素 API {#custom-elements-api}

## defineCustomElement() {#definecustomelement}

参数与 [`defineComponent`](/api/general.html#definecomponent) 相同，但返回原生[自定义元素](https://developer.mozilla.org/zh-CN/docs/Web/Web_Components/Using_custom_elements)的类构造函数。

- **类型**

  ```ts
  function defineCustomElement(
    component:
      | (ComponentOptions & CustomElementsOptions)
      | ComponentOptions['setup'],
    options?: CustomElementsOptions
  ): {
    new (props?: object): HTMLElement
  }

  interface CustomElementsOptions {
    styles?: string[]

    // 以下选项在 3.5+ 版本中支持
    configureApp?: (app: App) => void
    shadowRoot?: boolean
    nonce?: string
  }
  ```

  > 类型为简化版，便于阅读。

- **详情**

  除了常规组件选项，`defineCustomElement()` 还支持以下自定义元素专用选项：

  - **`styles`**：内联 CSS 字符串数组，会注入到元素的 shadow root。

  - **`configureApp`** <sup class="vt-badge" data-text="3.5+"/>：用于配置自定义元素的 Vue 应用实例。

  - **`shadowRoot`** <sup class="vt-badge" data-text="3.5+"/>：`boolean`，默认 `true`。设为 `false` 则不带 shadow root 渲染。此时 SFC 中的 `<style>` 不再隔离。

  - **`nonce`** <sup class="vt-badge" data-text="3.5+"/>：`string`，若提供，会设置注入 shadow root 的样式标签上的 `nonce` attribute。

  这些选项也可以不写在组件里，而通过第二个参数传入：

  ```js
  import Element from './MyElement.ce.vue'

  defineCustomElement(Element, {
    configureApp(app) {
      // ...
    }
  })
  ```

  返回值是自定义元素构造函数，可用 [`customElements.define()`](https://developer.mozilla.org/zh-CN/docs/Web/API/CustomElementRegistry/define) 注册。

- **示例**

  ```js
  import { defineCustomElement } from 'vue'

  const MyVueElement = defineCustomElement({
    /* 组件选项 */
  })

  // 注册自定义元素
  customElements.define('my-vue-element', MyVueElement)
  ```

- **参考**

  - [指南 - 使用 Vue 构建自定义元素](/guide/extras/web-components#building-custom-elements-with-vue)

  - 使用 SFC 时，`defineCustomElement()` 需要[特殊配置](/guide/extras/web-components#sfc-as-custom-element)。

## useHost() <sup class="vt-badge" data-text="3.5+"/> {#usehost}

组合式 API 辅助函数，返回当前 Vue 自定义元素的宿主元素。

## useShadowRoot() <sup class="vt-badge" data-text="3.5+"/> {#useshadowroot}

组合式 API 辅助函数，返回当前 Vue 自定义元素的 shadow root。

## this.$host <sup class="vt-badge" data-text="3.5+"/> {#this-host}

选项式 API 的 property，暴露当前 Vue 自定义元素的宿主元素。
