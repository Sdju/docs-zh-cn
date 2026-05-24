# 单文件组件 CSS 功能 {#sfc-css-features}

## 组件作用域 CSS {#scoped-css}

`<style>` 标签带 `scoped` attribute 时，CSS 只影响当前组件元素，类似 Shadow DOM 的样式封装。使用时有一些注意点，但不需要 polyfill。实现方式是通过 PostCSS 将以下内容：

```vue
<style scoped>
.example {
  color: red;
}
</style>

<template>
  <div class="example">hi</div>
</template>
```

转换为：

```vue
<style>
.example[data-v-f3f3eg9] {
  color: red;
}
</style>

<template>
  <div class="example" data-v-f3f3eg9>hi</div>
</template>
```

### 子组件的根元素 {#child-component-root-elements}

使用 `scoped` 后，父组件样式不会渗透到子组件。但子组件根节点会同时受父、子组件作用域样式影响。这样父组件可以从布局角度调整子组件根元素样式。

### 深度选择器 {#deep-selectors}

`scoped` 样式中若要影响子组件，可用 `:deep()` 伪类：

```vue
<style scoped>
.a :deep(.b) {
  /* ... */
}
</style>
```

上面的代码会被编译成：

```css
.a[data-v-f3f3eg9] .b {
  /* ... */
}
```

:::tip
通过 `v-html` 创建的 DOM 不受作用域样式影响，但可用深度选择器设置其样式。
:::

### 插槽选择器 {#slotted-selectors}

默认情况下，作用域样式不影响 `<slot/>` 渲染的内容，因为它们由父组件传入。用 `:slotted` 伪类可将插槽内容作为选择器目标：

```vue
<style scoped>
:slotted(div) {
  color: red;
}
</style>
```

### 全局选择器 {#global-selectors}

若要让某条样式规则全局生效，不必另建 `<style>`，可用 `:global` 伪类：

```vue
<style scoped>
:global(.red) {
  color: red;
}
</style>
```

### 混合使用局部与全局样式 {#mixing-local-and-global-styles}

同一组件可同时包含作用域和非作用域样式：

```vue
<style>
/* 全局样式 */
</style>

<style scoped>
/* 局部样式 */
</style>
```

### 作用域样式须知 {#scoped-style-tips}

- **作用域样式仍需要 class**。浏览器渲染各类 CSS 选择器的方式不同，`p { color: red }` 配合作用域样式（与 attribute 选择器组合）会慢很多。用 class 或 id，如 `.example { color: red }`，几乎可避免性能损失。

- **注意递归组件中的后代选择器**。对 `.a .b` 规则，若匹配到 `.a` 的元素包含递归子组件，该子组件中所有 `.b` 都会匹配这条规则。

## CSS Modules {#css-modules}

`<style module>` 标签会编译为 [CSS Modules](https://github.com/css-modules/css-modules)，并将生成的 CSS class 作为 `$style` 对象暴露给组件：

```vue
<template>
  <p :class="$style.red">This should be red</p>
</template>

<style module>
.red {
  color: red;
}
</style>
```

class 会被哈希化以避免冲突，实现 CSS 仅作用于当前组件。

详见 [CSS Modules spec](https://github.com/css-modules/css-modules)，如 [global exceptions](https://github.com/css-modules/css-modules/blob/master/docs/composition.md#exceptions) 和 [composition](https://github.com/css-modules/css-modules/blob/master/docs/composition.md#composition)。

### 自定义注入名称 {#custom-inject-name}

给 `module` attribute 指定值，可自定义注入 class 对象的属性名：

```vue
<template>
  <p :class="classes.red">red</p>
</template>

<style module="classes">
.red {
  color: red;
}
</style>
```

### 与组合式 API 一同使用 {#usage-with-composition-api}

可通过 `useCssModule` API 在 `setup()` 和 `<script setup>` 中访问注入的 class。对使用自定义注入名称的 `<style module>` 块，`useCssModule` 接收匹配的 `module` attribute 值作为第一个参数：

```js
import { useCssModule } from 'vue'

// 在 setup() 作用域中...
// 默认情况下，返回 <style module> 的 class
useCssModule()

// 具名情况下，返回 <style module="classes"> 的 class
useCssModule('classes')
```

- **示例**

```vue
<script setup lang="ts">
import { useCssModule } from 'vue'

const classes = useCssModule()
</script>

<template>
  <p :class="classes.red">red</p>
</template>

<style module>
.red {
  color: red;
}
</style>
```

## CSS 中的 `v-bind()` {#v-bind-in-css}

SFC 的 `<style>` 标签支持 `v-bind` CSS 函数，将 CSS 值链接到动态组件状态：

```vue
<template>
  <div class="text">hello</div>
</template>

<script>
export default {
  data() {
    return {
      color: 'red'
    }
  }
}
</script>

<style>
.text {
  color: v-bind(color);
}
</style>
```

同样适用于 [`<script setup>`](./sfc-script-setup)，并支持 JavaScript 表达式（须用引号包裹）：

```vue
<script setup>
import { ref } from 'vue'
const theme = ref({
    color: 'red',
})
</script>

<template>
  <p>hello</p>
</template>

<style scoped>
p {
  color: v-bind('theme.color');
}
</style>
```

实际值会编译成哈希化的 CSS 自定义属性，CSS 本身仍是静态的。自定义属性通过内联样式应用到组件根元素，源值变更时会响应式更新。
