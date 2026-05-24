# 内置指令 {#built-in-directives}

## v-text {#v-text}

更新元素的文本内容。

- **期望的绑定值类型：**`string`

- **详细信息**

  `v-text` 通过设置元素的 [textContent](https://developer.mozilla.org/en-US/docs/Web/API/Node/textContent) 工作，会覆盖元素里所有现有内容。如果只改部分内容，用 [mustache interpolations](/guide/essentials/template-syntax#text-interpolation)。

- **示例**

  ```vue-html
  <span v-text="msg"></span>
  <!-- 等同于 -->
  <span>{{msg}}</span>
  ```

- **参考**[模板语法 - 文本插值](/guide/essentials/template-syntax#text-interpolation)

## v-html {#v-html}

更新元素的 [innerHTML](https://developer.mozilla.org/en-US/docs/Web/API/Element/innerHTML)。

- **期望的绑定值类型：**`string`

- **详细信息**

  `v-html` 的内容会作为普通 HTML 插入，Vue 模板语法不会解析。如果想用 `v-html` 写模板，不如改用组件。

  ::: warning 安全说明
  动态渲染任意 HTML 很危险，容易导致 [XSS 攻击](https://en.wikipedia.org/wiki/Cross-site_scripting)。只对可信内容使用 HTML 插值，**绝不要**用用户提供的内容作为插值。
  :::

  在[单文件组件](/guide/scaling-up/sfc)中，`scoped` 样式不会作用于 `v-html` 内容，因为 HTML 不会被模板编译器解析。要让 `v-html` 内容也支持 scoped CSS，可用 [CSS modules](./sfc-css-features#css-modules)，或额外加全局 `<style>`，手动做类似 BEM 的作用域。

- **示例**

  ```vue-html
  <div v-html="html"></div>
  ```

- **参考**[模板语法 - 原始 HTML](/guide/essentials/template-syntax#raw-html)

## v-show {#v-show}

根据表达式真假控制元素是否可见。

- **期望的绑定值类型：**`any`

- **详细信息**

  `v-show` 通过内联样式的 `display` 控制可见性；显示时恢复初始 `display`。条件变化时会触发过渡。

- **参考**[条件渲染 - v-show](/guide/essentials/conditional#v-show)

## v-if {#v-if}

根据表达式真假条件渲染元素或模板片段。

- **期望的绑定值类型：**`any`

- **详细信息**

  条件变化时，元素及其指令/组件会销毁并重建。初始为假时，内部内容不会渲染。

  可用于 `<template>` 包裹纯文本或多元素的条件块。

  条件变化时会触发过渡。

  同时使用时，`v-if` 优先级高于 `v-for`。不推荐在同一元素上同时用这两个指令，详见[列表渲染指南](/guide/essentials/list#v-for-with-v-if)。

- **参考**[条件渲染 - v-if](/guide/essentials/conditional#v-if)

## v-else {#v-else}

表示 `v-if` 或 `v-if` / `v-else-if` 链的 else 块。

- **无需传入表达式**

- **详细信息**

  - 要求：上一个兄弟元素必须有 `v-if` 或 `v-else-if`。
  - 可用于 `<template>` 包裹纯文本或多元素的条件块。

- **示例**

  ```vue-html
  <div v-if="Math.random() > 0.5">
    Now you see me
  </div>
  <div v-else>
    Now you don't
  </div>
  ```

- **参考**[条件渲染 - v-else](/guide/essentials/conditional#v-else)

## v-else-if {#v-else-if}

表示 `v-if` 的 else if 块，可链式调用。

- **期望的绑定值类型：**`any`

- **详细信息**

  - 要求：上一个兄弟元素必须有 `v-if` 或 `v-else-if`。
  - 可用于 `<template>` 包裹纯文本或多元素的条件块。

- **示例**

  ```vue-html
  <div v-if="type === 'A'">
    A
  </div>
  <div v-else-if="type === 'B'">
    B
  </div>
  <div v-else-if="type === 'C'">
    C
  </div>
  <div v-else>
    Not A/B/C
  </div>
  ```

- **参考**[条件渲染 - v-else-if](/guide/essentials/conditional#v-else-if)

## v-for {#v-for}

根据数据多次渲染元素或模板块。

- **期望的绑定值类型：**`Array | Object | number | string | Iterable`

- **详细信息**

  指令值要用 `alias in expression` 语法给迭代项起别名：

  ```vue-html
  <div v-for="item in items">
    {{ item.text }}
  </div>
  ```

  也可以为索引指定别名（对象迭代时是键名）：

  ```vue-html
  <div v-for="(item, index) in items"></div>
  <div v-for="(value, key) in object"></div>
  <div v-for="(value, name, index) in object"></div>
  ```

  `v-for` 默认就地更新元素，不移动它们。要强制重排，用 `key` attribute 提供排序提示：

  ```vue-html
  <div v-for="item in items" :key="item.id">
    {{ item.text }}
  </div>
  ```

  `v-for` 也支持 [Iterable Protocol](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Iteration_protocols#The_iterable_protocol)，包括原生 `Map` 和 `Set`。

- **参考**
  - [列表渲染](/guide/essentials/list)

## v-on {#v-on}

给元素绑定事件监听器。

- **缩写：**`@`

- **期望的绑定值类型：**`Function | Inline Statement | Object (不带参数)`

- **参数：**`event` (使用对象语法则为可选项)

- **修饰符**

  - `.stop` - 调用 `event.stopPropagation()`。
  - `.prevent` - 调用 `event.preventDefault()`。
  - `.capture` - 在捕获模式添加事件监听器。
  - `.self` - 只有事件从元素本身发出才触发处理函数。
  - `.{keyAlias}` - 只在某些按键下触发处理函数。
  - `.once` - 最多触发一次处理函数。
  - `.left` - 只在鼠标左键事件触发处理函数。
  - `.right` - 只在鼠标右键事件触发处理函数。
  - `.middle` - 只在鼠标中键事件触发处理函数。
  - `.passive` - 通过 `{ passive: true }` 附加一个 DOM 事件。

- **详细信息**

  事件类型由参数指定。表达式可以是方法名、内联语句；有修饰符时可省略表达式。

  用于普通元素时，只监听[**原生 DOM 事件**](https://developer.mozilla.org/en-US/docs/Web/Events)。用于自定义组件时，监听子组件触发的**自定义事件**。

  监听原生 DOM 事件时，方法接收原生事件作为唯一参数。内联语句可用特殊变量 `$event`：`v-on:click="handle('ok', $event)"`。

  `v-on` 也支持绑定事件/监听器对象（不带参数）。对象语法不支持修饰符。

- **示例**

  ```vue-html
  <!-- 方法处理函数 -->
  <button v-on:click="doThis"></button>

  <!-- 动态事件 -->
  <button v-on:[event]="doThis"></button>

  <!-- 内联声明 -->
  <button v-on:click="doThat('hello', $event)"></button>

  <!-- 缩写 -->
  <button @click="doThis"></button>

  <!-- 使用缩写的动态事件 -->
  <button @[event]="doThis"></button>

  <!-- 停止传播 -->
  <button @click.stop="doThis"></button>

  <!-- 阻止默认事件 -->
  <button @click.prevent="doThis"></button>

  <!-- 不带表达式地阻止默认事件 -->
  <form @submit.prevent></form>

  <!-- 链式调用修饰符 -->
  <button @click.stop.prevent="doThis"></button>

  <!-- 按键用于 keyAlias 修饰符-->
  <input @keyup.enter="onEnter" />

  <!-- 点击事件将最多触发一次 -->
  <button v-on:click.once="doThis"></button>

  <!-- 对象语法 -->
  <button v-on="{ mousedown: doThis, mouseup: doThat }"></button>
  ```

  监听子组件自定义事件（子组件触发 `my-event` 时调用处理函数）：

  ```vue-html
  <MyComponent @my-event="handleThis" />

  <!-- 内联声明 -->
  <MyComponent @my-event="handleThis(123, $event)" />
  ```

- **参考**
  - [事件处理](/guide/essentials/event-handling)
  - [组件 - 自定义事件](/guide/essentials/component-basics#listening-to-events)

## v-bind {#v-bind}

动态绑定一个或多个 attribute，或组件 prop。

- **缩写：**
  - `:` 或者 `.` (当使用 `.prop` 修饰符)
  - 值可以省略 (当 attribute 和绑定的值同名时，需要 3.4+ 版本)

- **期望：**`any (带参数) | Object (不带参数)`

- **参数：**`attrOrProp (可选的)`

- **修饰符**

  - `.camel` - 将短横线命名的 attribute 转变为驼峰式命名。
  - `.prop` - 强制绑定为 DOM property (3.2+)。
  - `.attr` - 强制绑定为 DOM attribute (3.2+)。

- **用途**

  绑定 `class` 或 `style` 时，`v-bind` 支持数组或对象等额外类型。详见下方指南链接。

  绑定时，Vue 默认用 `in` 检查元素是否有同名 DOM property。有同名 property 时，会赋给 property 而不是 attribute。多数情况符合预期，也可用 `.prop` 和 `.attr` 强制绑定方式，和[自定义元素](/guide/extras/web-components#passing-dom-properties)配合时有时需要。

  绑定组件 props 时，props 必须在子组件中已声明。

  不带参数时，可绑定包含多个 attribute 名-值对的对象。

- **示例**

  ```vue-html
  <!-- 绑定 attribute -->
  <img v-bind:src="imageSrc" />

  <!-- 动态 attribute 名 -->
  <button v-bind:[key]="value"></button>

  <!-- 缩写 -->
  <img :src="imageSrc" />

  <!-- 缩写形式的动态 attribute 名 (3.4+)，扩展为 :src="src" -->
  <img :src />

  <!-- 动态 attribute 名的缩写 -->
  <button :[key]="value"></button>

  <!-- 内联字符串拼接 -->
  <img :src="'/path/to/images/' + fileName" />

  <!-- class 绑定 -->
  <div :class="{ red: isRed }"></div>
  <div :class="[classA, classB]"></div>
  <div :class="[classA, { classB: isB, classC: isC }]"></div>

  <!-- style 绑定 -->
  <div :style="{ fontSize: size + 'px' }"></div>
  <div :style="[styleObjectA, styleObjectB]"></div>

  <!-- 绑定对象形式的 attribute -->
  <div v-bind="{ id: someProp, 'other-attr': otherProp }"></div>

  <!-- prop 绑定。“prop” 必须在子组件中已声明。 -->
  <MyComponent :prop="someThing" />

  <!-- 传递子父组件共有的 prop -->
  <MyComponent v-bind="$props" />

  <!-- XLink -->
  <svg><a :xlink:special="foo"></a></svg>
  ```

  `.prop` 修饰符也有专门的缩写，`.`：

  ```vue-html
  <div :someProperty.prop="someObject"></div>

  <!-- 等同于 -->
  <div .someProperty="someObject"></div>
  ```

  在 DOM 内模板中用 `.camel`，可把 `v-bind` attribute 名转为驼峰，例如 SVG 的 `viewBox`：

  ```vue-html
  <svg :view-box.camel="viewBox"></svg>
  ```

  如果用字符串模板或构建工具预编译模板，不需要 `.camel`。

- **参考**
  - [Class 与 Style 绑定](/guide/essentials/class-and-style)
  - [组件 -  Prop 传递细节](/guide/components/props#prop-passing-details)

## v-model {#v-model}

在表单输入元素或组件上创建双向绑定。

- **期望的绑定值类型**：根据表单输入元素或组件输出的值而变化

- **仅限：**

  - `<input>`
  - `<select>`
  - `<textarea>`
  - components

- **修饰符**

  - [`.lazy`](/guide/essentials/forms#lazy) - 监听 `change` 事件而不是 `input`
  - [`.number`](/guide/essentials/forms#number) - 将输入的合法字符串转为数字
  - [`.trim`](/guide/essentials/forms#trim) - 移除输入内容两端空格

- **参考**

  - [表单输入绑定](/guide/essentials/forms)
  - [组件事件 - 配合 `v-model` 使用](/guide/components/v-model)

## v-slot {#v-slot}

声明具名插槽，或接收 props 的作用域插槽。

- **缩写：**`#`

- **期望的绑定值类型**：合法用于函数参数的 JavaScript 表达式，支持解构。绑定值可选——只有给作用域插槽传 props 时才需要。

- **参数**：插槽名 (可选，默认是 `default`)

- **仅限：**

  - `<template>`
  - [components](/guide/components/slots#scoped-slots) (用于带有 prop 的单个默认插槽)

- **示例**

  ```vue-html
  <!-- 具名插槽 -->
  <BaseLayout>
    <template v-slot:header>
      Header content
    </template>

    <template v-slot:default>
      Default slot content
    </template>

    <template v-slot:footer>
      Footer content
    </template>
  </BaseLayout>

  <!-- 接收 prop 的具名插槽 -->
  <InfiniteScroll>
    <template v-slot:item="slotProps">
      <div class="item">
        {{ slotProps.item.text }}
      </div>
    </template>
  </InfiniteScroll>

  <!-- 接收 prop 的默认插槽，并解构 -->
  <Mouse v-slot="{ x, y }">
    Mouse position: {{ x }}, {{ y }}
  </Mouse>
  ```

- **参考**
  - [组件 - 插槽](/guide/components/slots)

## v-pre {#v-pre}

跳过该元素及其所有子元素的编译。

- **无需传入**

- **详细信息**

  有 `v-pre` 的元素内，Vue 模板语法会原样保留、不编译。常见用途是显示原始双大括号标签和内容。

- **示例**

  ```vue-html
  <span v-pre>{{ this will not be compiled }}</span>
  ```

## v-once {#v-once}

仅渲染元素和组件一次，并跳过之后的更新。

- **无需传入**

- **详细信息**

  后续重新渲染时，元素/组件及其子项当作静态内容，跳过渲染。可用于优化更新性能。

  ```vue-html
  <!-- 单个元素 -->
  <span v-once>This will never change: {{msg}}</span>
  <!-- 带有子元素的元素 -->
  <div v-once>
    <h1>Comment</h1>
    <p>{{msg}}</p>
  </div>
  <!-- 组件 -->
  <MyComponent v-once :comment="msg" />
  <!-- `v-for` 指令 -->
  <ul>
    <li v-for="i in list" v-once>{{i}}</li>
  </ul>
  ```

  从 3.2 起，也可配合 [`v-memo`](#v-memo) 的无效条件缓存部分模板。

- **参考**
  - [数据绑定语法 - 插值](/guide/essentials/template-syntax#text-interpolation)
  - [v-memo](#v-memo)

## v-memo {#v-memo}

- 仅在 3.2+ 中支持

- **期望的绑定值类型：**`any[]`

- **详细信息**

  缓存模板子树，可用于元素和组件。需传入固定长度的依赖数组；若每个值都和上次渲染相同，整个子树更新会被跳过。例如：

  ```vue-html
  <div v-memo="[valueA, valueB]">
    ...
  </div>
  ```

  重新渲染时，若 `valueA` 和 `valueB` 都不变，这个 `<div>` 及其子项的所有更新都会跳过。虚拟 DOM 的 vnode 创建也会跳过，因为可复用缓存的子树。

  依赖数组要指定正确，否则该更新的可能被跳过。空依赖数组 (`v-memo="[]"`) 效果和 `v-once` 相同。

  **与 `v-for` 一起使用**

  `v-memo` 只用于性能优化，一般很少需要。常见场景是渲染超长 `v-for` 列表（超过 1000 项）：

  ```vue-html
  <div v-for="item in list" :key="item.id" v-memo="[item.id === selected]">
    <p>ID: {{ item.id }} - selected: {{ item.id === selected }}</p>
    <p>...more child nodes</p>
  </div>
  ```

  `selected` 变化时，默认会重建大量 vnode，尽管多数和之前一样。`v-memo` 在这里表示「只有该项选中状态变时才更新」。选中状态未变的项可复用 vnode、跳过 diff。memo 依赖数组不必包含 `item.id`，Vue 也会根据 `:key` 判断。

  :::warning 警告
  搭配 `v-for` 使用 `v-memo` 时，两者须绑定在同一元素上。**`v-memo` 不能用在 `v-for` 内部。**
  :::

  `v-memo` 也可在默认优化不够时，手动避免子组件不必要的更新。但要自己指定正确的依赖数组，以免跳过必要更新。

- **参考**
  - [v-once](#v-once)

## v-cloak {#v-cloak}

用于隐藏尚未完成编译的 DOM 模板。

- **无需传入**

- **详细信息**

  **只在没有构建步骤的环境下需要。**

  直接在 DOM 中写模板时，可能出现「未编译模板闪现」：用户先看到未编译的双大括号，直到组件挂载后才替换为实际内容。

  `v-cloak` 会保留在元素上，直到组件实例挂载后移除。配合 `[v-cloak] { display: none }` 等 CSS，可在编译完成前隐藏原始模板。

- **示例**

  ```css
  [v-cloak] {
    display: none;
  }
  ```

  ```vue-html
  <div v-cloak>
    {{ message }}
  </div>
  ```

  编译完成前，`<div>` 不可见。
