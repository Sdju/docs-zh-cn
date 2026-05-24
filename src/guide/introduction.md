---
footer: false
---

# 简介 {#introduction}

:::info 你正在阅读的是 Vue 3 的文档！

- Vue 2 已在 **2023 年 12 月 31 日**停止维护。详见 [Vue 2 终止支持 (EOL)](https://v2.cn.vuejs.org/eol/)。
- 想从 Vue 2 升级？请看[迁移指南](https://v3-migration.vuejs.org/)。
:::

<style src="@theme/styles/vue-mastery.css"></style>
<div class="vue-mastery-link">
  <a href="https://www.vuemastery.com/courses/" target="_blank">
    <div class="banner-wrapper">
      <img class="banner" alt="Vue Mastery banner" width="96px" height="56px" src="https://storage.googleapis.com/vue-mastery.appspot.com/flamelink/media/vuemastery-graphical-link-96x56.png" />
    </div>
    <p class="description">在 <span>VueMastery</span> 上看视频课程，学习 Vue</p>
    <div class="logo-wrapper">
        <img alt="Vue Mastery Logo" width="25px" src="https://storage.googleapis.com/vue-mastery.appspot.com/flamelink/media/vue-mastery-logo.png" />
    </div>
  </a>
</div>

## 什么是 Vue？ {#what-is-vue}

Vue（读作 /vjuː/，像英文 **view**）是一个用 JavaScript 做用户界面的框架。它基于 HTML、CSS 和 JavaScript，提供声明式、组件化的写法，帮你做用户界面。界面简单或复杂，Vue 都能用。

下面是一个最简单的示例：

<div class="options-api">

```js
import { createApp } from 'vue'

createApp({
  data() {
    return {
      count: 0
    }
  }
}).mount('#app')
```

</div>
<div class="composition-api">

```js
import { createApp, ref } from 'vue'

createApp({
  setup() {
    return {
      count: ref(0)
    }
  }
}).mount('#app')
```

</div>

```vue-html
<div id="app">
  <button @click="count++">
    Count is: {{ count }}
  </button>
</div>
```

**结果展示**

<script setup>
import { ref } from 'vue'
const count = ref(0)
</script>

<div class="demo">
  <button @click="count++">
    Count is: {{ count }}
  </button>
</div>

上面的示例展示了 Vue 的两个核心功能：

- **声明式渲染**：Vue 在 HTML 基础上增加了模板语法。你可以直接描述：页面上的 HTML 应该和 JavaScript 里的数据是什么关系。

- **响应性**：Vue 会自动跟踪 JavaScript 里的数据，并在其变化时响应式地更新 DOM。

你可能已经有疑问——先别急。后面的文档会一步步讲清楚。现在先继续读下去，对 Vue 能做什么有一个整体了解。

:::tip 预备知识
后面的内容默认你已经会一些 HTML、CSS 和 JavaScript。如果你完全没做过前端，不建议直接从框架开始学——最好先学基础，再回来看这里。需要的话，可以用这些 [JavaScript](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/A_re-introduction_to_JavaScript)、[HTML](https://developer.mozilla.org/zh-CN/docs/Learn/HTML/Introduction_to_HTML) 和 [CSS](https://developer.mozilla.org/zh-CN/docs/Learn/CSS/First_steps) 教程检查自己的水平。以前用过其他框架会有帮助，但不是必须的。
:::

## 渐进式框架 {#the-progressive-framework}

Vue 既是一个框架，也是一个生态。它覆盖了前端开发里很多常见需求。但 Web 世界很多样：不同开发者做的东西，大小和形式可能差很多。所以 Vue 很灵活，可以一步步接入你的项目。根据你的情况，可以这样用 Vue：

- 不用构建工具，在静态 HTML 上逐步增强
- 在任意页面里，作为 Web Components 嵌入
- 单页应用 (SPA)
- 全栈 / 服务端渲染 (SSR)
- Jamstack / 静态站点生成 (SSG)
- 做桌面、移动、WebGL，甚至命令行界面

如果你是新手，这些名词可能有点多。没关系！读教程和指南，只需要会一点 HTML 和 JavaScript。即使你还不是专家，也能跟得上。

如果你已经有经验，想知道怎么在项目里用 Vue，或者对这些用法好奇，可以看[使用 Vue 的多种方式](/guide/extras/ways-of-using-vue)。

不管怎么用，Vue 的核心知识是通用的。你现在还是新手，以后做更复杂的项目，现在学的东西仍然有用。如果你已经是老手，可以按场景选最合适的方式，开发效率也能保持一致。所以我们说 Vue 是「渐进式框架」：它能跟着你成长，适应不同需求。

## 单文件组件 {#single-file-components}

在大多数用构建工具的 Vue 项目里，我们可以用一种类似 HTML 的文件来写组件，叫**单文件组件**（也叫 `*.vue` 文件，英文 Single-File Components，缩写 **SFC**）。顾名思义，一个 `.vue` 文件里会放组件的逻辑 (JavaScript)、模板 (HTML) 和样式 (CSS)。下面用单文件组件重写上面的计数器示例：

<div class="options-api">

```vue
<script>
export default {
  data() {
    return {
      count: 0
    }
  }
}
</script>

<template>
  <button @click="count++">Count is: {{ count }}</button>
</template>

<style scoped>
button {
  font-weight: bold;
}
</style>
```

</div>
<div class="composition-api">

```vue
<script setup>
import { ref } from 'vue'
const count = ref(0)
</script>

<template>
  <button @click="count++">Count is: {{ count }}</button>
</template>

<style scoped>
button {
  font-weight: bold;
}
</style>
```

</div>

单文件组件是 Vue 的标志性功能。如果你的项目需要构建，我们推荐用它来写组件。更多内容见[单文件组件的用法及用途](/guide/scaling-up/sfc)。现在你只需要知道：Vue 会帮你处理构建工具的配置。

## API 风格 {#api-styles}

Vue 组件可以用两种风格来写：**选项式 API** 和**组合式 API**。

### 选项式 API (Options API) {#options-api}

用选项式 API 时，你用一个对象来描述组件逻辑，比如 `data`、`methods` 和 `mounted`。这些选项里的属性都会挂在 `this` 上，`this` 指向当前组件实例。

```vue
<script>
export default {
  // data() 返回的属性将会成为响应式的状态
  // 并且暴露在 `this` 上
  data() {
    return {
      count: 0
    }
  },

  // methods 是一些用来更改状态与触发更新的函数
  // 它们可以在模板中作为事件处理器绑定
  methods: {
    increment() {
      this.count++
    }
  },

  // 生命周期钩子会在组件生命周期的各个不同阶段被调用
  // 例如这个函数就会在组件挂载完成后被调用
  mounted() {
    console.log(`The initial count is ${this.count}.`)
  }
}
</script>

<template>
  <button @click="increment">Count is: {{ count }}</button>
</template>
```

[在演练场中尝试一下](https://play.vuejs.org/#eNptkMFqxCAQhl9lkB522ZL0HNKlpa/Qo4e1ZpLIGhUdl5bgu9es2eSyIMio833zO7NP56pbRNawNkivHJ25wV9nPUGHvYiaYOYGoK7Bo5CkbgiBBOFy2AkSh2N5APmeojePCkDaaKiBt1KnZUuv3Ky0PppMsyYAjYJgigu0oEGYDsirYUAP0WULhqVrQhptF5qHQhnpcUJD+wyQaSpUd/Xp9NysVY/yT2qE0dprIS/vsds5Mg9mNVbaDofL94jZpUgJXUKBCvAy76ZUXY53CTd5tfX2k7kgnJzOCXIF0P5EImvgQ2olr++cbRE4O3+t6JxvXj0ptXVpye1tvbFY+ge/NJZt)

### 组合式 API (Composition API) {#composition-api}


用组合式 API 时，你用导入的 API 函数来描述组件逻辑。在单文件组件里，组合式 API 通常和 [`<script setup>`](/api/sfc-script-setup) 一起用。`setup` 这个 attribute 告诉 Vue：编译时要特殊处理，这样写组合式 API 会更简洁。比如，`<script setup>` 里导入的内容，以及顶层的变量和函数，都可以直接在模板里用。

下面是用组合式 API 和 `<script setup>` 写的组件，模板和上面完全一样：

```vue
<script setup>
import { ref, onMounted } from 'vue'

// 响应式状态
const count = ref(0)

// 用来修改状态、触发更新的函数
function increment() {
  count.value++
}

// 生命周期钩子
onMounted(() => {
  console.log(`The initial count is ${count.value}.`)
})
</script>

<template>
  <button @click="increment">Count is: {{ count }}</button>
</template>
```

[在演练场中尝试一下](https://play.vuejs.org/#eNpNkMFqwzAQRH9lMYU4pNg9Bye09NxbjzrEVda2iLwS0spQjP69a+yYHnRYad7MaOfiw/tqSliciybqYDxDRE7+qsiM3gWGGQJ2r+DoyyVivEOGLrgRDkIdFCmqa1G0ms2EELllVKQdRQa9AHBZ+PLtuEm7RCKVd+ChZRjTQqwctHQHDqbvMUDyd7mKip4AGNIBRyQujzArgtW/mlqb8HRSlLcEazrUv9oiDM49xGGvXgp5uT5his5iZV1f3r4HFHvDprVbaxPhZf4XkKub/CDLaep1T7IhGRhHb6WoTADNT2KWpu/aGv24qGKvrIrr5+Z7hnneQnJu6hURvKl3ryL/ARrVkuI=)

### 该选哪一个？{#which-to-choose}

两种 API 风格都能满足大部分需求。它们只是同一套系统的两种写法。实际上，选项式 API 是在组合式 API 之上实现的！Vue 的基础概念在两种风格里是通用的。

选项式 API 以「组件实例」为中心（就是示例里的 `this`）。如果你学过面向对象语言，这往往更像「类」的写法。它把响应式细节藏起来，并按选项组织代码，对新手更友好。

组合式 API 的核心是：在函数里直接定义响应式变量，再把多个函数里的状态组合起来，处理复杂逻辑。写法更自由，但要更懂 Vue 的响应式系统，才能用得好。它的灵活性也让你更容易组织和复用逻辑。

在[组合式 API FAQ](/guide/extras/composition-api-faq) 里，你可以看两种风格的对比，以及组合式 API 的好处。

如果你是 Vue 新手，我们的建议大致如下：

- 学习时，选你更容易理解的一种风格。再说一次：大部分核心概念两种风格是通用的。熟悉一种以后，另一种也能很快看懂。

- 做正式项目时：

  - 不用构建工具，或者项目比较简单（比如渐进增强），推荐选项式 API。

  - 要做完整的单页应用，推荐组合式 API + 单文件组件。

学习阶段不必只选一种。后面的文档会同时提供两种风格的代码，你可以随时用左上角的 **API 风格偏好** 切换。

## 还有其他问题？ {#still-got-questions}

请看我们的 [FAQ](/about/faq)。

## 选择你的学习路径 {#pick-your-learning-path}

每个人学习方式不同。我们建议尽量通读，但你可以按自己的喜好选路径：

<div class="vt-box-container next-steps">
  <a class="vt-box" href="/tutorial/">
    <p class="next-steps-link">尝试互动教程</p>
    <p class="next-steps-caption">适合喜欢边做边学的人。</p>
  </a>
  <a class="vt-box" href="/guide/quick-start.html">
    <p class="next-steps-link">继续阅读该指南</p>
    <p class="next-steps-caption">会带你了解框架各个部分的细节。</p>
  </a>
  <a class="vt-box" href="/examples/">
    <p class="next-steps-link">查看示例</p>
    <p class="next-steps-caption">浏览核心功能和常见界面的示例。</p>
  </a>
</div>
