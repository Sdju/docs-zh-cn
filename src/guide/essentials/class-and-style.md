# Class 与 Style 绑定 {#class-and-style-bindings}

绑定数据时，常要改变元素的 CSS class 和内联样式。`class` 和 `style` 也是 attribute，可以和其他 attribute 一样用 `v-bind` 绑动态字符串。但复杂绑定时，拼字符串又麻烦又容易错。所以 Vue 为 `class` 和 `style` 的 `v-bind` 做了增强：表达式的值还可以是对象或数组。

## 绑定 HTML class {#binding-html-classes}

### 绑定对象 {#binding-to-objects}

给 `:class`（`v-bind:class` 的缩写）传对象，可以动态切换 class：

```vue-html
<div :class="{ active: isActive }"></div>
```

上面表示 `active` 是否出现，取决于 `isActive` 的[真假值](https://developer.mozilla.org/en-US/docs/Glossary/Truthy)。

对象里可以写多个字段，控制多个 class。`:class` 也可以和普通的 `class` attribute 一起用。例如下面这种状态：

<div class="composition-api">

```js
const isActive = ref(true)
const hasError = ref(false)
```

</div>

<div class="options-api">

```js
data() {
  return {
    isActive: true,
    hasError: false
  }
}
```

</div>

模板如下：

```vue-html
<div
  class="static"
  :class="{ active: isActive, 'text-danger': hasError }"
></div>
```

渲染结果：

```vue-html
<div class="static active"></div>
```

`isActive` 或 `hasError` 一变，class 列表也会更新。例如 `hasError` 变成 `true` 时，class 会变成 `"static active text-danger"`。

绑定的对象不必写在模板里，也可以直接绑一个对象：

<div class="composition-api">

```js
const classObject = reactive({
  active: true,
  'text-danger': false
})
```

</div>

<div class="options-api">

```js
data() {
  return {
    classObject: {
      active: true,
      'text-danger': false
    }
  }
}
```

</div>

```vue-html
<div :class="classObject"></div>
```

会渲染成：

```vue-html
<div class="active"></div>
```

也可以绑返回对象的[计算属性](./computed)，这很常见也很好用：

<div class="composition-api">

```js
const isActive = ref(true)
const error = ref(null)

const classObject = computed(() => ({
  active: isActive.value && !error.value,
  'text-danger': error.value && error.value.type === 'fatal'
}))
```

</div>

<div class="options-api">

```js
data() {
  return {
    isActive: true,
    error: null
  }
},
computed: {
  classObject() {
    return {
      active: this.isActive && !this.error,
      'text-danger': this.error && this.error.type === 'fatal'
    }
  }
}
```

</div>

```vue-html
<div :class="classObject"></div>
```

### 绑定数组 {#binding-to-arrays}

给 `:class` 绑数组，可以渲染多个 CSS class：

<div class="composition-api">

```js
const activeClass = ref('active')
const errorClass = ref('text-danger')
```

</div>

<div class="options-api">

```js
data() {
  return {
    activeClass: 'active',
    errorClass: 'text-danger'
  }
}
```

</div>

```vue-html
<div :class="[activeClass, errorClass]"></div>
```

渲染结果：

```vue-html
<div class="active text-danger"></div>
```

想在数组里按条件加某个 class，可以用三元表达式：

```vue-html
<div :class="[isActive ? activeClass : '', errorClass]"></div>
```

`errorClass` 会一直存在，但 `activeClass` 只会在 `isActive` 为真时才存在。

多个 class 都要按条件判断时，上面写法会偏长。也可以在数组里嵌套对象：

```vue-html
<div :class="[{ [activeClass]: isActive }, errorClass]"></div>
```

### 在组件上使用 {#with-components}

> 本节默认你已了解 [Vue 组件](/guide/essentials/component-basics)。没有的话可先跳过，以后再读。

只有一个根元素的组件，你加的 `class` attribute 会合并到根元素上，和根元素原有的 class 合在一起。

例如组件名叫 `MyComponent`，模板如下：

```vue-html
<!-- 子组件模板 -->
<p class="foo bar">Hi!</p>
```

在使用时添加一些 class：

```vue-html
<!-- 在使用组件时 -->
<MyComponent class="baz boo" />
```

渲染出的 HTML 为：

```vue-html
<p class="foo bar baz boo">Hi!</p>
```

`:class` 绑定也一样：

```vue-html
<MyComponent :class="{ active: isActive }" />
```

当 `isActive` 为真时，被渲染的 HTML 会是：

```vue-html
<p class="foo bar active">Hi!</p>
```

组件有多个根元素时，要指定哪个根元素接收 class。可以用组件的 `$attrs` 来指定：

```vue-html
<!-- MyComponent 模板使用 $attrs 时 -->
<p :class="$attrs.class">Hi!</p>
<span>This is a child component</span>
```

```vue-html
<MyComponent class="baz" />
```

这将被渲染为：

```html
<p class="baz">Hi!</p>
<span>This is a child component</span>
```

更多 attribute 继承细节，见[透传 Attribute](/guide/components/attrs)。

## 绑定内联样式 {#binding-inline-styles}

### 绑定对象 {#binding-to-objects-1}

`:style` 支持绑定 JavaScript 对象值，对应的是 [HTML 元素的 `style` 属性](https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/style)：

<div class="composition-api">

```js
const activeColor = ref('red')
const fontSize = ref(30)
```

</div>

<div class="options-api">

```js
data() {
  return {
    activeColor: 'red',
    fontSize: 30
  }
}
```

</div>

```vue-html
<div :style="{ color: activeColor, fontSize: fontSize + 'px' }"></div>
```

推荐用 camelCase，但 `:style` 也支持 kebab-case 的 CSS 属性名（和 CSS 里写法一致），例如：

```vue-html
<div :style="{ 'font-size': fontSize + 'px' }"></div>
```

直接绑样式对象通常更好，模板更简洁：

<div class="composition-api">

```js
const styleObject = reactive({
  color: 'red',
  fontSize: '30px'
})
```

</div>

<div class="options-api">

```js
data() {
  return {
    styleObject: {
      color: 'red',
      fontSize: '13px'
    }
  }
}
```

</div>

```vue-html
<div :style="styleObject"></div>
```

样式逻辑更复杂时，也可以用返回样式对象的计算属性。

`:style` 可以和普通 style attribute 一起用，和 `:class` 一样。

模板：

```vue-html
<h1 style="color: red" :style="'font-size: 1em'">hello</h1>
```

这将被渲染为：

```vue-html
<h1 style="color: red; font-size: 1em;">hello</h1>
```

### 绑定数组 {#binding-to-arrays-1}

`:style` 也可以绑多个样式对象的数组，会合并后渲染到同一元素上：

```vue-html
<div :style="[baseStyles, overridingStyles]"></div>
```

### 自动前缀 {#auto-prefixing}

`:style` 里用了需要[浏览器前缀](https://developer.mozilla.org/en-US/docs/Glossary/Vendor_Prefix)的 CSS 属性时，Vue 会自动加前缀。运行时会检查当前浏览器是否支持；不支持就依次尝试各浏览器前缀，直到找到可用的。

### 样式多值 {#multiple-values}

一个样式属性可以写多个（不同前缀的）值，例如：

```vue-html
<div :style="{ display: ['-webkit-box', '-ms-flexbox', 'flex'] }"></div>
```

数组只会用浏览器支持的最后一个值。这个例子里，现代浏览器最终会渲染成 `display: flex`。
