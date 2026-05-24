# 组件注册 {#component-registration}

> 建议先阅读[组件基础](/guide/essentials/component-basics)。如果还不熟悉组件，请先看完那一章。

<VueSchoolLink href="https://vueschool.io/lessons/vue-3-global-vs-local-vue-components" title="免费的 Vue.js 组件注册课程"/>

使用 Vue 组件前需要先**注册**，这样 Vue 才能在模板里找到对应的组件实现。注册有两种方式：**全局注册**和**局部注册**。

## 全局注册 {#global-registration}

可以用 [Vue 应用实例](/guide/essentials/application)的 `.component()` 方法，让组件在整个应用中都能使用：

```js
import { createApp } from 'vue'

const app = createApp({})

app.component(
  // 注册的名字
  'MyComponent',
  // 组件的实现
  {
    /* ... */
  }
)
```

如果使用单文件组件，你可以注册被导入的 `.vue` 文件：

```js
import MyComponent from './App.vue'

app.component('MyComponent', MyComponent)
```

`.component()` 方法可以被链式调用：

```js
app
  .component('ComponentA', ComponentA)
  .component('ComponentB', ComponentB)
  .component('ComponentC', ComponentC)
```

全局注册的组件，可以在本应用任意组件的模板里使用：

```vue-html
<!-- 这在当前应用的任意组件中都可用 -->
<ComponentA/>
<ComponentB/>
<ComponentC/>
```

子组件里也能用这些全局组件，也就是说，上面三个组件还可以在彼此内部使用。

## 局部注册 {#local-registration}

全局注册虽然方便，但有几个缺点：

1. 全局注册后，即使某个组件从未被使用，打包时也可能无法自动移除（也叫 “tree-shaking”）。只要全局注册过，它就可能出现在最终的 JS 文件里。

2. 在大型项目里，全局注册会让组件之间的依赖关系不够清晰。父组件用到子组件时，不容易找到子组件写在哪里。这和滥用全局变量类似，长期维护会更困难。

相比之下，**局部注册**需要在父组件里显式导入，并且只能在这个父组件里使用。好处是依赖关系更清楚，也更利于 tree-shaking。

<div class="composition-api">

在带 `<script setup>` 的单文件组件里，导入的组件可以直接在模板里用，不用再注册：

```vue
<script setup>
import ComponentA from './ComponentA.vue'
</script>

<template>
  <ComponentA />
</template>
```

如果没有用 `<script setup>`，就要用 `components` 选项显式注册：

```js
import ComponentA from './ComponentA.js'

export default {
  components: {
    ComponentA
  },
  setup() {
    // ...
  }
}
```

</div>
<div class="options-api">

局部注册需要使用 `components` 选项：

```vue
<script>
import ComponentA from './ComponentA.vue'

export default {
  components: {
    ComponentA
  }
}
</script>

<template>
  <ComponentA />
</template>
```

</div>

`components` 里每个属性的 **key** 就是注册名，**value** 是对应的组件。上面例子用了 ES2015 的简写，等价于：

```js
export default {
  components: {
    ComponentA: ComponentA
  }
  // ...
}
```

请注意：**局部注册的组件在后代组件中<i>不能</i>使用**。上面例子里，`ComponentA` 只在当前组件可用，子组件或更深层组件里都不能直接用。

## 组件名格式 {#component-name-casing}

本指南里，组件名注册推荐使用 **PascalCase**，原因如下：

1. PascalCase 是合法的 JavaScript 标识符，导入和注册都方便，IDE 也更好补全。

2. 模板里写 `<PascalCase />` 一眼就能看出是 Vue 组件，而不是原生 HTML。也能和自定义元素（web components）区分开。

在单文件组件和内联字符串模板里，都推荐用 PascalCase。但在 DOM 内模板里不能用 PascalCase 标签名，详见 [DOM 内模板解析注意事项](/guide/essentials/component-basics#in-dom-template-parsing-caveats)。

为方便起见，Vue 也支持在模板里用 kebab-case 标签，对应 PascalCase 注册的组件。例如注册名为 `MyComponent` 的组件，在模板（或 Vue 渲染的 HTML）里可以写 `<MyComponent>` 或 `<my-component>`。这样同一套注册代码可以配合不同来源的模板使用。
