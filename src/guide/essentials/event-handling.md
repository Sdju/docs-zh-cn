# 事件处理 {#event-handling}

## 监听事件 {#listening-to-events}

用 `v-on` 指令（简写 `@`）监听 DOM 事件，触发时执行对应 JavaScript。写法：`v-on:click="handler"` 或 `@click="handler"`。

事件处理器 (handler) 可以是：

1. **内联事件处理器**：触发时直接执行的内联 JavaScript（类似 `onclick`）。

2. **方法事件处理器**：组件里某个方法的名字或路径。

## 内联事件处理器 {#inline-handlers}

内联事件处理器适合简单场景，例如：

<div class="composition-api">

```js
const count = ref(0)
```

</div>
<div class="options-api">

```js
data() {
  return {
    count: 0
  }
}
```

</div>

```vue-html
<button @click="count++">Add 1</button>
<p>Count is: {{ count }}</p>
```

<div class="composition-api">

[在演练场中尝试一下](https://play.vuejs.org/#eNo9jssKgzAURH/lko0tgrbbEqX+Q5fZaLxiqHmQ3LgJ+fdqFZcD58xMYp1z1RqRvRgP0itHEJCia4VR2llPkMDjBBkmbzUUG1oII4y0JhBIGw2hh2Znbo+7MLw+WjZ/C4TaLT3hnogPkcgaeMtFyW8j2GmXpWBtN47w5PWBHLhrPzPCKfWDXRHmPsCAaOBfgSOkdH3IGUhpDBWv9/e8vsZZ/gFFhFJN)

</div>
<div class="options-api">

[在演练场中尝试一下](https://play.vuejs.org/#eNo9jcEKgzAQRH9lyKlF0PYqqdR/6DGXaLYo1RjiRgrivzepIizLzu7sm1XUzuVLIFEKObe+d1wpS183eYahtw4DY1UWMJr15ZpmxYAnDt7uF0BxOwXL5Evc0kbxlmyxxZLFyY2CaXSDZkqKZROYJ4tnO/Tt56HEgckyJaraGNxlsVt2u6teHeF40s20EDo9oyGy+CPIYF1xULBt4H6kOZeFiwBZnOFi+wH0B1hk)

</div>

## 方法事件处理器 {#method-handlers}

逻辑变复杂后，内联写法就不够灵活。`v-on` 也可以写方法名，或调用某个方法。

例如：

<div class="composition-api">

```js
const name = ref('Vue.js')

function greet(event) {
  alert(`Hello ${name.value}!`)
  // `event` 是 DOM 原生事件
  if (event) {
    alert(event.target.tagName)
  }
}
```

</div>
<div class="options-api">

```js
data() {
  return {
    name: 'Vue.js'
  }
},
methods: {
  greet(event) {
    // 方法中的 `this` 指向当前活跃的组件实例
    alert(`Hello ${this.name}!`)
    // `event` 是 DOM 原生事件
    if (event) {
      alert(event.target.tagName)
    }
  }
}
```

</div>

```vue-html
<!-- `greet` 是上面定义过的方法名 -->
<button @click="greet">Greet</button>
```

<div class="composition-api">

[在演练场中尝试一下](https://play.vuejs.org/#eNpVj0FLxDAQhf/KMwjtXtq7dBcFQS/qzVMOrWFao2kSkkkvpf/dJIuCEBgm771vZnbx4H23JRJ3YogqaM+IxMlfpNWrd4GxI9CMA3NwK5psbaSVVjkbGXZaCediaJv3RN1XbE5FnZNVrJ3FEoi4pY0sn7BLC0yGArfjMxnjcLsXQrdNJtFxM+Ys0PcYa2CEjuBPylNYb4THtxdUobj0jH/YX3D963gKC5WyvGZ+xR7S5jf01yPzeblhWr2ZmErHw0dizivfK6PV91mKursUl6dSh/4qZ+vQ/+XE8QODonDi)

</div>
<div class="options-api">

[在演练场中尝试一下](https://play.vuejs.org/#eNplUE1LxDAQ/StjEbYL0t5LXRQEvag3Tz00prNtNE1CMilC6X83SUkRhJDJfLz3Jm8tHo2pFo9FU7SOW2Ho0in8MdoSDHhlXhKsnQIYGLHyvL8BLJK3KmcAis3YwOnDY/XlTnt1i2G7i/eMNOnBNRkwWkQqcUFFByVAXUNPk3A9COXEgBkGRgtFDkgDTQjcWxuAwDiJBeMsMcUxszCJlsr+BaXUcLtGwiqut930579KST1IBd5Aqlgie3p/hdTIk+IK//bMGqleEbMjxjC+BZVDIv0+m9CpcNr6MDgkhLORjDBm1H56Iq3ggUvBv++7IhnUFZfnGNt6b4fRtj5wxfYL9p+Sjw==)

</div>

方法事件处理器会自动收到原生 DOM 事件。上面例子里，可以用 `event.target` 访问触发事件的 DOM 元素。

<div class="composition-api">

类型标注见[为事件处理器标注类型](/guide/typescript/composition-api#typing-event-handlers)。<sup class="vt-badge ts" />

</div>
<div class="options-api">

类型标注见[为事件处理器标注类型](/guide/typescript/options-api#typing-event-handlers)。<sup class="vt-badge ts" />

</div>

### 方法与内联事件判断 {#method-vs-inline-detection}

模板编译器会检查 `v-on` 的值：合法标识符或属性路径 → 方法事件处理器；`foo()`、`count++` 等 → 内联事件处理器。例如 `foo`、`foo.bar`、`foo['bar']` 是方法；`foo()`、`count++` 是内联。

## 在内联处理器中调用方法 {#calling-methods-in-inline-handlers}

除了直接写方法名，也可以在内联处理器里调用方法，并传入自定义参数，而不必传原生事件：

<div class="composition-api">

```js
function say(message) {
  alert(message)
}
```

</div>
<div class="options-api">

```js
methods: {
  say(message) {
    alert(message)
  }
}
```

</div>

```vue-html
<button @click="say('hello')">Say hello</button>
<button @click="say('bye')">Say bye</button>
```

<div class="composition-api">

[在演练场中尝试一下](https://play.vuejs.org/#eNp9jTEOwjAMRa8SeSld6I5CBWdg9ZJGBiJSN2ocpKjq3UmpFDGx+Vn//b/ANYTjOxGcQEc7uyAqkqTQI98TW3ETq2jyYaQYzYNatSArZTzNUn/IK7Ludr2IBYTG4I3QRqKHJFJ6LtY7+zojbIXNk7yfmhahv5msvqS7PfnHGjJVp9w/hu7qKKwfEd1NSg==)

</div>
<div class="options-api">

[在演练场中尝试一下](https://play.vuejs.org/#eNptjUEKwjAQRa8yZFO7sfsSi57B7WzGdjTBtA3NVC2ldzehEFwIw8D7vM9f1cX742tmVSsd2sl6aXDgjx8ngY7vNDuBFQeAnsWMXagToQAEWg49h0APLncDAIUcT5LzlKJsqRBfPF3ljQjCvXcknEj0bRYZBzi3zrbPE6o0UBhblKiaKy1grK52J/oA//23IcmNBD8dXeVBtX0BF0pXsg==)

</div>

## 在内联事件处理器中访问事件参数 {#accessing-event-argument-in-inline-handlers}

有时要在内联处理器里访问原生 DOM 事件。可以传特殊的 `$event`，或用内联箭头函数：

```vue-html
<!-- 使用特殊的 $event 变量 -->
<button @click="warn('Form cannot be submitted yet.', $event)">
  Submit
</button>

<!-- 使用内联箭头函数 -->
<button @click="(event) => warn('Form cannot be submitted yet.', event)">
  Submit
</button>
```

<div class="composition-api">

```js
function warn(message, event) {
  // 这里可以访问原生事件
  if (event) {
    event.preventDefault()
  }
  alert(message)
}
```

</div>
<div class="options-api">

```js
methods: {
  warn(message, event) {
    // 这里可以访问 DOM 原生事件
    if (event) {
      event.preventDefault()
    }
    alert(message)
  }
}
```

</div>

## 事件修饰符 {#event-modifiers}

处理事件时，常要调用 `event.preventDefault()` 或 `event.stopPropagation()`。可以在方法里写，但更希望方法只管数据逻辑，少碰 DOM 细节。

为此，Vue 为 `v-on` 提供了**事件修饰符**。修饰符是带 `.` 的后缀，例如：

- `.stop`
- `.prevent`
- `.self`
- `.capture`
- `.once`
- `.passive`

```vue-html
<!-- 单击事件将停止传递 -->
<a @click.stop="doThis"></a>

<!-- 提交事件将不再重新加载页面 -->
<form @submit.prevent="onSubmit"></form>

<!-- 修饰语可以使用链式书写 -->
<a @click.stop.prevent="doThat"></a>

<!-- 也可以只有修饰符 -->
<form @submit.prevent></form>

<!-- 仅当 event.target 是元素本身时才会触发事件处理器 -->
<!-- 例如：事件处理器不来自子元素 -->
<div @click.self="doThat">...</div>
```

::: tip
修饰符有顺序，生成的代码也按这个顺序。`@click.prevent.self` 会阻止**元素及子元素**所有点击的默认行为；`@click.self.prevent` 只阻止**元素自身**点击的默认行为。
:::

`.capture`、`.once`、`.passive` 对应[原生 `addEventListener`](https://developer.mozilla.org/zh-CN/docs/Web/API/EventTarget/addEventListener#options) 的选项：

```vue-html
<!-- 添加事件监听器时，使用 `capture` 捕获模式 -->
<!-- 例如：指向内部元素的事件，在被内部元素处理前，先被外部处理 -->
<div @click.capture="doThis">...</div>

<!-- 点击事件最多被触发一次 -->
<a @click.once="doThis"></a>

<!-- 滚动事件的默认行为 (scrolling) 将立即发生而非等待 `onScroll` 完成 -->
<!-- 以防其中包含 `event.preventDefault()` -->
<div @scroll.passive="onScroll">...</div>
```

`.passive` 常用于触摸监听，可[改善移动端滚屏性能](https://developer.mozilla.org/zh-CN/docs/Web/API/EventTarget/addEventListener#%E4%BD%BF%E7%94%A8_passive_%E6%94%B9%E5%96%84%E6%BB%9A%E5%B1%8F%E6%80%A7%E8%83%BD)。

::: tip
不要同时用 `.passive` 和 `.prevent`。`.passive` 表示你*不想*阻止默认行为，再加 `.prevent` 会被忽略，浏览器还会警告。
:::

## 按键修饰符 {#key-modifiers}

监听键盘事件时，常要判断按了哪个键。Vue 允许在 `v-on` / `@` 上加按键修饰符。

```vue-html
<!-- 仅在 `key` 为 `Enter` 时调用 `submit` -->
<input @keyup.enter="submit" />
```

也可以用 [`KeyboardEvent.key`](https://developer.mozilla.org/zh-CN/docs/Web/API/UI_Events/Keyboard_event_key_values) 里的键名作修饰符，但要写成 kebab-case。

```vue-html
<input @keyup.page-down="onPageDown" />
```

上面例子里，只有 `$event.key` 为 `'PageDown'` 时才会触发。

### 按键别名 {#key-aliases}

Vue 为一些常用的按键提供了别名：

- `.enter`
- `.tab`
- `.delete` (捕获“Delete”和“Backspace”两个按键)
- `.esc`
- `.space`
- `.up`
- `.down`
- `.left`
- `.right`

### 系统按键修饰符 {#system-modifier-keys}

以下系统按键修饰符表示：对应键按下时，才触发鼠标或键盘监听。

- `.ctrl`
- `.alt`
- `.shift`
- `.meta`

::: tip 注意
Mac 上 meta 是 Command (⌘)；Windows 上是 Windows 键 (⊞)。
:::

例如：

```vue-html
<!-- Alt + Enter -->
<input @keyup.alt.enter="clear" />

<!-- Ctrl + 点击 -->
<div @click.ctrl="doSomething">Do something</div>
```

::: tip
系统按键修饰符和普通按键不同。配合 `keyup` 时，修饰键在事件触发时仍要按着。例如 `keyup.ctrl` 只在还按着 Ctrl、但松开了别的键时触发；单独松开 Ctrl 不会触发。
:::

### `.exact` 修饰符 {#exact-modifier}

`.exact` 可精确控制需要哪些系统修饰键一起按下。

```vue-html
<!-- 当按下 Ctrl 时，即使同时按下 Alt 或 Shift 也会触发 -->
<button @click.ctrl="onClick">A</button>

<!-- 仅当按下 Ctrl 且未按任何其他键时才会触发 -->
<button @click.ctrl.exact="onCtrlClick">A</button>

<!-- 仅当没有按下任何系统按键时触发 -->
<button @click.exact="onClick">A</button>
```

## 鼠标按键修饰符 {#mouse-button-modifiers}

- `.left`
- `.right`
- `.middle`

这些修饰符表示由哪个鼠标键触发。

注意：`.left`、`.right`、`.middle` 按常见右手鼠标命名，实际对应设备的“主”“次”“辅助”键，不一定是物理左/右键。左手鼠标、触控板（单指/双指/三指）等，触发方式也可能和“左/右”不一致。

<!-- zhlint disabled -->
