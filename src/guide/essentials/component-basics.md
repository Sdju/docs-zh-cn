# 组件基础 {#components-basics}

<ScrimbaLink href="https://scrimba.com/links/vue-component-basics" title="Free Vue.js Components Basics Lesson" type="scrimba">
  观看 Scrimba 的互动视频课程
</ScrimbaLink>

组件帮你把 UI 拆成独立、可复用的小块，每一块可以单独想。实际项目里，组件往往一层套一层，像一棵树：

![组件树](./images/components.png)

<!-- https://www.figma.com/file/qa7WHDQRWuEZNRs7iZRZSI/components -->

这和嵌套 HTML 很像。Vue 有自己的组件模型，可以在每个组件里封装内容和逻辑。Vue 也能和原生 Web Component 配合。想了解 Vue 组件和原生 Web Components 的关系，可以看[这一章](/guide/extras/web-components)。

## 定义一个组件 {#defining-a-component}

有构建工具时，通常把 Vue 组件写在单独的 `.vue` 文件里，这叫[单文件组件](/guide/scaling-up/sfc)（简称 SFC）：

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
  <button @click="count++">You clicked me {{ count }} times.</button>
</template>
```

</div>
<div class="composition-api">

```vue
<script setup>
import { ref } from 'vue'

const count = ref(0)
</script>

<template>
  <button @click="count++">You clicked me {{ count }} times.</button>
</template>
```

</div>

没有构建工具时，用包含 Vue 选项的 JavaScript 对象定义组件：

<div class="options-api">

```js
export default {
  data() {
    return {
      count: 0
    }
  },
  template: `
    <button @click="count++">
      You clicked me {{ count }} times.
    </button>`
}
```

</div>
<div class="composition-api">

```js
import { ref } from 'vue'

export default {
  setup() {
    const count = ref(0)
    return { count }
  },
  template: `
    <button @click="count++">
      You clicked me {{ count }} times.
    </button>`
  // 也可以针对一个 DOM 内联模板：
  // template: '#my-template-element'
}
```

</div>

这里的 `template` 是内联的 JavaScript 字符串，Vue 会在运行时编译。也可以用 ID 选择器指向某个元素（常见是原生 `<template>`），Vue 会拿它的内容当模板。

上面例子在 `.js` 里默认导出一个组件；你也可以在一个文件里**具名导出**多个组件。

## 使用组件 {#using-a-component}

:::tip
后面会用单文件组件语法举例。有没有构建工具，组件概念都一样。[示例](/examples/)里两种写法都有。
:::

要用子组件，先在父组件里 import。假设计数器组件在 `ButtonCounter.vue`，默认导出。

<div class="options-api">

```vue
<script>
import ButtonCounter from './ButtonCounter.vue'

export default {
  components: {
    ButtonCounter
  }
}
</script>

<template>
  <h1>Here is a child component!</h1>
  <ButtonCounter />
</template>
```

要在模板里用，需要在 `components` 选项里[注册](/guide/components/registration)。模板里的标签名就是注册时的名字。

</div>

<div class="composition-api">

```vue
<script setup>
import ButtonCounter from './ButtonCounter.vue'
</script>

<template>
  <h1>Here is a child component!</h1>
  <ButtonCounter />
</template>
```

用 `<script setup>` 时，import 的组件在模板里直接可用。

</div>

也可以**全局注册**组件，整个应用里都能用，不用每次 import。全局和局部注册的取舍见[组件注册](/guide/components/registration)。

同一个组件可以重复用很多次：

```vue-html
<h1>Here is a child component!</h1>
<ButtonCounter />
<ButtonCounter />
<ButtonCounter />
```

<div class="options-api">

[在演练场中尝试一下](https://play.vuejs.org/#eNqVUE1LxDAQ/StjLqusNHotcfHj4l8QcontLBtsJiGdiFL6301SdrEqyEJyeG9m3ps3k3gIoXlPKFqhxi7awDtN1gUfGR4Ts6cnn4gxwj56B5tGrtgyutEEoAk/6lCPe5MGhqmwnc9KhMRjuxCwFi3UrCk/JU/uGTC6MBjGglgdbnfPGBFM/s7QJ3QHO/TfxC+UzD21d72zPItU8uQrrsWvnKsT/ZW2N2wur45BI3KKdETlFlmphZsF58j/RgdQr3UJuO8G273daVFFtlstahngxSeoNezBIUzTYgPzDGwdjk1VkYvMj4jzF0nwsyQ=)

</div>
<div class="composition-api">

[在演练场中尝试一下](https://play.vuejs.org/#eNqVj91KAzEQhV/lmJsqlY3eSlr8ufEVhNys6ZQGNz8kE0GWfXez2SJUsdCLuZiZM9+ZM4qnGLvPQuJBqGySjYxMXOJWe+tiSIznwhz8SyieKWGfgsOqkyfTGbDSXsmFUG9rw+Ti0DPNHavD/faVEqGv5Xr/BXOwww4mVBNPnvOVklXTtKeO8qKhkj++4lb8+fL/mCMS7TEdAy6BtDfBZ65fVgA2s+L67uZMUEC9N0s8msGaj40W7Xa91qKtgbdQ0Ha0gyOM45E+TWDrKHeNIhfMr0DTN4U0me8=)

</div>

你会发现：点每个按钮，`count` 各自独立。因为每用一次组件，就会新建一个**实例**。

单文件组件里，子组件标签推荐用 `PascalCase`，和原生 HTML 区分。HTML 标签不区分大小写，但 SFC 编译时可以区分。也可以用 `/>` 自闭合。

如果模板直接写在 DOM 里（比如原生 `<template>` 的内容），要遵守浏览器解析 HTML 的规则。这时组件标签要用 `kebab-case`，并**显式**写闭合标签。

```vue-html
<!-- 如果是在 DOM 中书写该模板 -->
<button-counter></button-counter>
<button-counter></button-counter>
<button-counter></button-counter>
```

细节见 [DOM 内模板解析注意事项](#in-dom-template-parsing-caveats)。

## 传递 props {#passing-props}

做博客时，可能需要一个「文章」组件：版式一样，标题和内容不同。这就要往组件里**传数据**，用 props。

Props 是一种特殊的 attribute，要在组件上先声明。要给文章组件传标题，先在 props 里声明。这里用 <span class="options-api">[`props`](/api/options-state#props) 选项</span><span class="composition-api">[`defineProps`](/api/sfc-script-setup#defineprops-defineemits) 宏</span>：

<div class="options-api">

```vue [BlogPost.vue]
<script>
export default {
  props: ['title']
}
</script>

<template>
  <h4>{{ title }}</h4>
</template>
```

父组件传进来的值，会变成子组件实例上的属性，在模板和 `this` 里都能像普通属性一样用。

</div>
<div class="composition-api">

```vue [BlogPost.vue]
<script setup>
defineProps(['title'])
</script>

<template>
  <h4>{{ title }}</h4>
</template>
```

`defineProps` 是 `<script setup>` 里的编译宏，不用 import。声明的 props 会自动给模板用。`defineProps` 会返回一个对象，里面有所有传入的 props：

```js
const props = defineProps(['title'])
console.log(props.title)
```

TypeScript 用户请参考：[为组件 props 标注类型](/guide/typescript/composition-api#typing-component-props)<sup class="vt-badge ts" />

没用 `<script setup>` 时，用 `props` 选项声明；`setup()` 的第一个参数就是 props 对象：

```js
export default {
  props: ['title'],
  setup(props) {
    console.log(props.title)
  }
}
```

</div>

一个组件可以有任意多个 props，默认什么类型的值都能收。

注册好后，用自定义 attribute 传值：

```vue-html
<BlogPost title="My journey with Vue" />
<BlogPost title="Blogging with Vue" />
<BlogPost title="Why Vue is so fun" />
```

实际项目里，父组件往往有一个文章数组：

<div class="options-api">

```js
export default {
  // ...
  data() {
    return {
      posts: [
        { id: 1, title: 'My journey with Vue' },
        { id: 2, title: 'Blogging with Vue' },
        { id: 3, title: 'Why Vue is so fun' }
      ]
    }
  }
}
```

</div>
<div class="composition-api">

```js
const posts = ref([
  { id: 1, title: 'My journey with Vue' },
  { id: 2, title: 'Blogging with Vue' },
  { id: 3, title: 'Why Vue is so fun' }
])
```

</div>

这时可以用 `v-for` 渲染：

```vue-html
<BlogPost
  v-for="post in posts"
  :key="post.id"
  :title="post.title"
 />
```

<div class="options-api">

[在演练场中尝试一下](https://play.vuejs.org/#eNp9UU1rhDAU/CtDLrawVfpxklRo74We2kPtQdaoaTUJ8bmtiP+9ia6uC2VBgjOZeXnz3sCejAkPnWAx4+3eSkNJqmRjtCU817p81S2hsLpBEEYL4Q1BqoBUid9Jmosi62rC4Nm9dn4lFLXxTGAt5dG482eeUXZ1vdxbQZ1VCwKM0zr3x4KBATKPcbsDSapFjOClx5d2JtHjR1KFN9fTsfbWcXdy+CZKqcqL+vuT/r3qvQqyRatRdMrpF/nn/DNhd7iPR+v8HCDRmDoj4RHxbfyUDjeFto8p8yEh1Rw2ZV4JxN+iP96FMvest8RTTws/gdmQ8HUr7ikere+yHduu62y//y3NWG38xIOpeODyXcoE8OohGYZ5VhhHHjl83sD4B3XgyGI=)

</div>
<div class="composition-api">

[在演练场中尝试一下](https://play.vuejs.org/#eNp9kU9PhDAUxL/KpBfWBCH+OZEuid5N9qSHrQezFKhC27RlDSF8d1tYQBP1+N78OpN5HciD1sm54yQj1J6M0A6Wu07nTIpWK+MwwPASI0qjWkQejVbpsVHVQVl30ZJ0WQRHjwFMnpT0gPZLi32w2h2DMEAUGW5iOOEaniF66vGuOiN5j0/hajx7B4zxxt5ubIiphKz+IO828qXugw5hYRXKTnqSydcrJmk61/VF/eB4q5s3x8Pk6FJjauDO16Uye0ZCBwg5d2EkkED2wfuLlogibMOTbMpf9tMwP8jpeiMfRdM1l8Tk+/F++Y6Cl0Lyg1Ha7o7R5Bn9WwSg9X0+DPMxMI409fPP1PELlVmwdQ==)

</div>

注意用 [`v-bind`](/api/built-in-directives#v-bind)（`:title="post.title"`）传**动态** prop。内容要运行时才知道时，这很有用。

props 入门就这些。想深入可以看 [props 完整指引](/guide/components/props)。

## 监听事件 {#listening-to-events}

继续看 `<BlogPost>`。有时子组件要和父组件**互动**。比如无障碍场景：只放大文章文字，页面其它地方保持默认字号。

父组件可以加一个 `postFontSize` <span class="options-api">数据属性</span><span class="composition-api">ref</span>：

<div class="options-api">

```js{6}
data() {
  return {
    posts: [
      /* ... */
    ],
    postFontSize: 1
  }
}
```

</div>
<div class="composition-api">

```js{5}
const posts = ref([
  /* ... */
])

const postFontSize = ref(1)
```

</div>

在模板里用它控制所有文章的字体大小：

```vue-html{1,7}
<div :style="{ fontSize: postFontSize + 'em' }">
  <BlogPost
    v-for="post in posts"
    :key="post.id"
    :title="post.title"
   />
</div>
```

给 `<BlogPost>` 加一个按钮：

```vue{5} [BlogPost.vue]
<!-- 省略了 <script> -->
<template>
  <div class="blog-post">
    <h4>{{ title }}</h4>
    <button>Enlarge text</button>
  </div>
</template>
```

按钮现在还没功能。我们想：点击后通知父组件「放大所有文章文字」。组件有**自定义事件**：父组件用 `v-on` 或 `@` 监听子组件抛出的事件，和监听原生 DOM 事件一样：

```vue-html{3}
<BlogPost
  ...
  @enlarge-text="postFontSize += 0.1"
 />
```

子组件调用内置 [**`$emit`**](/api/component-instance#emit)，传入事件名即可抛出：

```vue{5} [BlogPost.vue]
<!-- 省略了 <script> -->
<template>
  <div class="blog-post">
    <h4>{{ title }}</h4>
    <button @click="$emit('enlarge-text')">Enlarge text</button>
  </div>
</template>
```

父组件监听了 `@enlarge-text="postFontSize += 0.1"`，收到事件后会更新 `postFontSize`。

<div class="options-api">

[在演练场中尝试一下](https://play.vuejs.org/#eNqNUsFOg0AQ/ZUJMaGNbbHqidCmmujNxMRED9IDhYWuhV0CQy0S/t1ZYIEmaiRkw8y8N/vmMZVxl6aLY8EM23ByP+Mprl3Bk1RmCPexjJ5ljhBmMgFzYemEIpiuAHAFOzXQgIVeESNUKutL4gsmMLfbBPStVFTP1Bl46E2mup4xLDKhI4CUsMR+1zFABTywYTkD5BgzG8ynEj4kkVgJnxz38Eqaut5jxvXAUCIiLqI/8TcD/m1fKhTwHHIJYSEIr+HbnqikPkqBL/yLSMs23eDooNexel8pQJaksYeMIgAn4EewcyxjtnKNCsK+zbgpXILJEnW30bCIN7ZTPcd5KDNqoWjARWufa+iyfWBlV13wYJRvJtWVJhiKGyZiL4vYHNkJO8wgaQVXi6UGr51+Ndq5LBqMvhyrH9eYGePtOVu3n3YozWSqFsBsVJmt3SzhzVaYY2nm9l82+7GX5zTGjlTM1SyNmy5SeX+7rqr2r0NdOxbFXWVXIEoBGz/m/oHIF0rB5Pz6KTV6aBOgEo7Vsn51ov4GgAAf2A==)

</div>
<div class="composition-api">

[在演练场中尝试一下](https://play.vuejs.org/#eNp1Uk1PwkAQ/SuTxqQYgYp6ahaiJngzITHRA/UAZQor7W7TnaK16X93th8UEuHEvPdm5s3bls5Tmo4POTq+I0yYyZTAIOXpLFAySXVGUEKGEVQQZToBl6XukXqO9XahDbXc2OsAO5FlAIEKtWJByqCBqR01WFqiBLnxYTIEkhSjD+5rAV86zxQW8C1pB+88Aaphr73rtXbNVqrtBeV9r/zYFZYHacBoiHLFykB9Xgfq1NmLVvQmf7E1OGFaeE0anAMXhEkarwhtRWIjD+AbKmKcBk4JUdvtn8+6ARcTu87hLuCf6NJpSoDDKNIZj7BtIFUTUuB0tL/HomXHcnOC18d1TF305COqeJVtcUT4Q62mtzSF2/GkE8/E8b1qh8Ljw/if8I7nOkPn9En/+Ug2GEmFi0ynZrB0azOujbfB54kki5+aqumL8bING28Yr4xh+2vePrI39CnuHmZl2TwwVJXwuG6ZdU6kFTyGsQz33HyFvH5wvvyaB80bACwgvKbrYgLVH979DQc=)

</div>

可以用 <span class="options-api">[`emits`](/api/options-state#emits) 选项</span><span class="composition-api">[`defineEmits`](/api/sfc-script-setup#defineprops-defineemits) 宏</span>声明会抛出哪些事件：

<div class="options-api">

```vue{4} [BlogPost.vue]
<script>
export default {
  props: ['title'],
  emits: ['enlarge-text']
}
</script>
```

</div>
<div class="composition-api">

```vue{3} [BlogPost.vue]
<script setup>
defineProps(['title'])
defineEmits(['enlarge-text'])
</script>
```

</div>

这样可以列出组件可能触发的所有事件，还能[校验](/guide/components/events#validate-emitted-events)参数。Vue 也不会把它们误当成原生事件绑到子组件根元素上。

<div class="composition-api">

和 `defineProps` 一样，`defineEmits` 只在 `<script setup>` 里用，不用 import。它返回的 `emit` 相当于 `$emit`，在 `<script setup>` 里抛事件要用它（这里访问不到 `$emit`）：

```vue
<script setup>
const emit = defineEmits(['enlarge-text'])

emit('enlarge-text')
</script>
```

TypeScript 用户请参考：[为组件 emits 标注类型](/guide/typescript/composition-api#typing-component-emits)<sup class="vt-badge ts" />

没用 `<script setup>` 时，用 `emits` 选项声明事件；`setup()` 第二个参数（setup 上下文）上有 `emit`：

```js
export default {
  emits: ['enlarge-text'],
  setup(props, ctx) {
    ctx.emit('enlarge-text')
  }
}
```

</div>

自定义事件入门就这些。更多细节见[组件事件](/guide/components/events)。

## 通过插槽来分配内容 {#content-distribution-with-slots}

有时希望和 HTML 一样，往组件里**塞内容**：

```vue-html
<AlertBox>
  Something bad happened.
</AlertBox>
```

希望渲染成：

:::danger This is an Error for Demo Purposes
Something bad happened.
:::

用 Vue 的 `<slot>` 就能做到：

```vue{4} [AlertBox.vue]
<template>
  <div class="alert-box">
    <strong>This is an Error for Demo Purposes</strong>
    <slot />
  </div>
</template>

<style scoped>
.alert-box {
  /* ... */
}
</style>
```

`<slot>` 是占位符，父组件传进来的内容会渲染在这里。

<div class="options-api">

[在演练场中尝试一下](https://play.vuejs.org/#eNpVUcFOwzAM/RUTDruwFhCaUCmThsQXcO0lbbKtIo0jx52Kpv07TreWouTynl+en52z2oWQnXqrClXGhtrA28q3XUBi2DlL/IED7Ak7WGX5RKQHq8oDVN4Oo9TYve4dwzmxDcp7bz3HAs5/LpfKyy3zuY0Atl1wmm1CXE5SQeLNX9hZPrb+ALU2cNQhWG9NNkrnLKIt89lGPahlyDTVogVAadoTNE7H+F4pnZTrGodKjUUpRyb0h+0nEdKdRL3CW7GmfNY5ZLiiMhfP/ynG0SL/OAuxwWCNMNncbVqSQyrgfrPZvCVcIxkrxFMYIKJrDZA1i8qatGl72ehLGEY6aGNkNwU8P96YWjffB8Lem/Xkvn9NR6qy+fRd14FSgopvmtQmzTT9Toq9VZdfIpa5jQ==)

</div>
<div class="composition-api">

[在演练场中尝试一下](https://play.vuejs.org/#eNpVUEtOwzAQvcpgFt3QBBCqUAiRisQJ2GbjxG4a4Xis8aQKqnp37PyUyqv3mZn3fBVH55JLr0Umcl9T6xi85t4VpW07h8RwNJr4Cwc4EXawS9KFiGO70ubpNBcmAmDdOSNZR8T5Yg0IoOQf7DSfW9tAJRWcpXPaapWM1nVt8ObpukY8ie29GHNzAiBX7QVqI73/LIWMzn2FQylGMcieCW1TfBMhPYSoE5zFitLVZ5BhQnkadt6nGKt5/jMafI1Oq8Ak6zW4xrEaDVIGj4fD4SPiCknpQLy4ATyaVgFptVH2JFXb+wze3DDSTioV/iaD1+eZqWT92xD2Vu2X7af3+IJ6G7/UToVigpJnTzwTO42eWDnELsTtH/wUqH4=)

</div>

插槽入门就这些。更多见[组件插槽](/guide/components/slots)。

## 动态组件 {#dynamic-components}

有时要在两个组件之间切换，比如 Tab：

<div class="options-api">

[在演练场中查看示例](https://play.vuejs.org/#eNqNVE2PmzAQ/Ssj9kArLSHbrXpwk1X31mMPvS17cIxJrICNbJMmivLfO/7AEG2jRiDkefP85sNmztlr3y8OA89ItjJMi96+VFJ0vdIWfqqOQ6NVB/midIYj5sn9Sxlrkt9b14RXzXbiMElEO5IAKsmPnljzhg6thbNDmcLdkktrSADAJ/IYlj5MXEc9Z1w8VFNLP30ed2luBy1HC4UHrVH2N90QyJ1kHnUALN1gtLeIQu6juEUMkb8H5sXHqiS+qzK1Cw3Lu76llqMFsKrFAVhLjVlXWc07VWUeR89msFbhhhAWDkWjNJIwPgjp06iy5CV7fgrOOTgKv+XoKIIgpnoGyiymSmZ1wnq9dqJweZ8p/GCtYHtUmBMdLXFitgDnc9ju68b0yxDO1WzRTEcFRLiUJsEqSw3wwi+rMpFDj0psEq5W5ax1aBp7at1y4foWzq5R0hYN7UR7ImCoNIXhWjTfnW+jdM01gaf+CEa1ooYHzvnMVWhaiwEP90t/9HBP61rILQJL3POMHw93VG+FLKzqUYx3c2yjsOaOwNeRO2B8zKHlzBKQWJNH1YHrplV/iiMBOliFILYNK5mOKdSTMviGCTyNojFdTKBoeWNT3s8f/Vpsd7cIV61gjHkXnotR6OqVkJbrQKdsv9VqkDWBh2bpnn8VXaDcHPexE4wFzsojO9eDUOSVPF+65wN/EW7sHRsi5XaFqaexn+EH9Xcpe8zG2eWG3O0/NVzUaeJMk+jGhUXlNPXulw5j8w7t2bi8X32cuf/Vv/wF/SL98A==)

</div>
<div class="composition-api">

[在演练场中查看示例](https://play.vuejs.org/#eNqNVMGOmzAQ/ZURe2BXCiHbrXpwk1X31mMPvS1V5RiTWAEb2SZNhPLvHdvggLZRE6TIM/P8/N5gpk/e2nZ57HhCkrVhWrQWDLdd+1pI0bRKW/iuGg6VVg2ky9wFDp7G8g9lrIl1H80Bb5rtxfFKMcRzUA+aV3AZQKEEhWRKGgus05pL+5NuYeNwj6mTkT4VckRYujVY63GT17twC6/Fr4YjC3kp5DoPNtEgBpY3bU0txwhgXYojsJoasymSkjeqSHweK9vOWoUbXIC/Y1YpjaDH3wt39hMI6TUUSYSQAz8jArPT5Mj+nmIhC6zpAu1TZlEhmXndbBwpXH5NGL6xWrADMsyaMj1lkAzQ92E7mvYe8nCcM24xZApbL5ECiHCSnP73KyseGnvh6V/XedwS2pVjv3C1ziddxNDYc+2WS9fC8E4qJW1W0UbUZwKGSpMZrkX11dW2SpdcE3huT2BULUp44JxPSpmmpegMgU/tyadbWpZC7jCxwj0v+OfTDdU7ITOrWiTjzTS3Vei8IfB5xHZ4PmqoObMEJHryWXXkuqrVn+xEgHZWYRKbh06uLyv4iQq+oIDnkXSQiwKymlc26n75WNdit78FmLWCMeZL+GKMwlKrhLRcBzhlh51WnSwJPFQr9/zLdIZ007w/O6bR4MQe2bseBJMzer5yzwf8MtzbOzYMkNsOY0+HfoZv1d+lZJGMg8fNqdsfbbio4b77uRVv7I0Li8xxZN1PHWbeHdyTWXc/+zgw/8t/+QsROe9h)

</div>

上面用 Vue 的 `<component>` 和特殊的 `is` attribute 实现：

<div class="options-api">

```vue-html
<!-- currentTab 改变时组件也改变 -->
<component :is="currentTab"></component>
```

</div>
<div class="composition-api">

```vue-html
<!-- currentTab 改变时组件也改变 -->
<component :is="tabs[currentTab]"></component>
```

</div>

传给 `:is` 的值可以是：

- 已注册的组件名
- import 的组件对象

`is` 也可以用来渲染普通 HTML 元素。

用 `<component :is="...">` 切换时，被换掉的组件会**卸载**。想让它保持状态，可以用 [`<KeepAlive>`](/guide/built-ins/keep-alive)。

## DOM 内模板解析注意事项 {#in-dom-template-parsing-caveats}

如果模板直接写在 DOM 里，Vue 要从 DOM 读模板字符串。浏览器解析 HTML 有固定规则，要注意几件事。

:::tip
下面只针对**直接在 DOM 里写模板**的情况。如果用下面这些，就不用管：

- 单文件组件
- 内联模板字符串（如 `template: '...'`）
- `<script type="text/x-template">`
:::

### 大小写区分 {#case-insensitivity}

HTML 标签和属性名不区分大小写，浏览器会把大写转成小写。所以在 DOM 模板里，组件名（PascalCase）、prop 名（camelCase）、事件名都要写成 **kebab-case**（短横线）：

```js
// JavaScript 中的 camelCase
const BlogPost = {
  props: ['postTitle'],
  emits: ['updatePost'],
  template: `
    <h3>{{ postTitle }}</h3>
  `
}
```

```vue-html
<!-- HTML 中的 kebab-case -->
<blog-post post-title="hello!" @update-post="onUpdatePost"></blog-post>
```

### 闭合标签 {#self-closing-tags}

前面例子用过自闭合标签：

```vue-html
<MyComponent />
```

Vue 模板解析器允许任意标签用 `/>` 自闭合。

但在 DOM 模板里，必须**显式**写闭合标签：

```vue-html
<my-component></my-component>
```

HTML 只有[少数 void 元素](https://html.spec.whatwg.org/multipage/syntax.html#void-elements)可以省略闭合标签，比如 `<input>`、`<img>`。其它元素省略闭合标签时，浏览器会认为标签一直没结束。例如：

```vue-html
<my-component /> <!-- 我们想要在这里关闭标签... -->
<span>hello</span>
```

将被解析为：

```vue-html
<my-component>
  <span>hello</span>
</my-component> <!-- 但浏览器会在这里关闭标签 -->
```

### 元素位置限制 {#element-placement-restrictions}

有些 HTML 元素对子元素类型有限制，比如 `<ul>`、`<ol>`、`<table>`、`<select>`；`<li>`、`<tr>`、`<option>` 也只能放在特定父元素里。

用组件时可能踩坑。例如：

```vue-html
<table>
  <blog-post-row></blog-post-row>
</table>
```

`<blog-post-row>` 会被当成无效内容忽略，渲染就错了。可以用特殊的 [`is` attribute](/api/built-in-special-attributes#is) 解决：

```vue-html
<table>
  <tr is="vue:blog-post-row"></tr>
</table>
```

:::tip
`is` 用在原生 HTML 元素上时，值要加前缀 `vue:`，Vue 才会当成组件。这是为了不和原生[自定义内置元素](https://html.spec.whatwg.org/multipage/custom-elements.html#custom-elements-customized-builtin-example)搞混。
:::

DOM 内模板要注意的就这些。这也是 Vue **基础**部分的最后一章——恭喜！后面还有很多可学，你也可以先停一停，用 Vue 做点好玩的东西，或看看[示例](/examples/)。

读完可以回顾本节内容；想深入组件，继续看组件专题的完整指引。

<!-- zhlint ignore: Something bad happened. -->
