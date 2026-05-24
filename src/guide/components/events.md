<script setup>
import { onMounted } from 'vue'

if (typeof window !== 'undefined') {
  const hash = window.location.hash

  // The docs for v-model used to be part of this page. Attempt to redirect outdated links.
  if ([
    '#usage-with-v-model',
    '#v-model-arguments',
    '#multiple-v-model-bindings',
    '#handling-v-model-modifiers'
  ].includes(hash)) {
    onMounted(() => {
      window.location = './v-model.html' + hash
    })
  }
}
</script>

# 组件事件 {#component-events}

> 建议先阅读[组件基础](/guide/essentials/component-basics)。如果还不熟悉组件，请先看完那一章。

## 触发与监听事件 {#emitting-and-listening-to-events}

在组件模板里，可以直接用 `$emit` 触发自定义事件（例如在 `v-on` 的处理函数里）：

```vue-html
<!-- MyComponent -->
<button @click="$emit('someEvent')">Click Me</button>
```

<div class="options-api">

在组件实例上，也可以用 `this.$emit()`：

```js
export default {
  methods: {
    submit() {
      this.$emit('someEvent')
    }
  }
}
```

</div>

父组件用 `v-on`（简写 `@`）监听事件：

```vue-html
<MyComponent @some-event="callback" />
```

事件监听器也支持 `.once` 修饰符：

```vue-html
<MyComponent @some-event.once="callback" />
```

和 Props 类似，事件名也支持大小写自动转换。上面触发的是 camelCase 事件名，父组件可以用 kebab-case 监听。和 [Prop 名字格式](/guide/components/props#prop-name-casing)一样，模板里推荐用 kebab-case 写监听器。

:::tip
和原生 DOM 事件不同，组件触发的自定义事件**不会冒泡**。只能监听直接子组件发出的事件。兄弟组件或跨多层嵌套时，可以用外部事件总线，或[全局状态管理](/guide/scaling-up/state-management)。
:::

## 事件参数 {#event-arguments}

有时触发事件时要附带数据。例如 `<BlogPost>` 要管理文字缩放，可以给 `$emit` 传第二个参数：

```vue-html
<button @click="$emit('increaseBy', 1)">
  Increase by 1
</button>
```

父组件监听时，可以写内联箭头函数接收参数：

```vue-html
<MyButton @increase-by="(n) => count += n" />
```

也可以用组件方法处理：

```vue-html
<MyButton @increase-by="increaseCount" />
```

方法同样会收到事件传来的参数：

<div class="options-api">

```js
methods: {
  increaseCount(n) {
    this.count += n
  }
}
```

</div>
<div class="composition-api">

```js
function increaseCount(n) {
  count.value += n
}
```

</div>

:::tip
传给 `$emit()` 的额外参数都会原样传给监听器。例如 `$emit('foo', 1, 2, 3)` 触发后，监听器会收到 `1`、`2`、`3` 三个参数。
:::

## 声明触发的事件 {#declaring-emitted-events}

组件可以显式声明要触发的事件，通过 <span class="composition-api">[`defineEmits()`](/api/sfc-script-setup#defineprops-defineemits) 宏</span><span class="options-api">[`emits`](/api/options-state#emits) 选项</span>：

<div class="composition-api">

```vue
<script setup>
defineEmits(['inFocus', 'submit'])
</script>
```

`<script setup>` 里不能直接用 `$emit`，但 `defineEmits()` 会返回一个等价的 `emit` 函数：

```vue
<script setup>
const emit = defineEmits(['inFocus', 'submit'])

function buttonClick() {
  emit('submit')
}
</script>
```

`defineEmits()` 宏**不能**写在子函数里，必须直接放在 `<script setup>` 顶层。

如果不用 `<script setup>` 而用 `setup` 函数，要用 [`emits`](/api/options-state#emits) 选项声明事件，`emit` 在 `setup()` 的上下文里：

```js
export default {
  emits: ['inFocus', 'submit'],
  setup(props, ctx) {
    ctx.emit('submit')
  }
}
```

`emit` 也可以从上下文解构出来安全使用：

```js
export default {
  emits: ['inFocus', 'submit'],
  setup(props, { emit }) {
    emit('submit')
  }
}
```

</div>
<div class="options-api">

```js
export default {
  emits: ['inFocus', 'submit']
}
```

</div>

`emits` 选项和 `defineEmits()` 也支持对象写法。配合 TypeScript 可以为参数指定类型，并对事件参数做校验：

<div class="composition-api">

```vue
<script setup lang="ts">
const emit = defineEmits({
  submit(payload: { email: string, password: string }) {
    // 通过返回值为 `true` 还是为 `false` 来判断
    // 验证是否通过
  }
})
</script>
```

如果搭配 TypeScript 和 `<script setup>`，也可以用纯类型声明：

```vue
<script setup lang="ts">
const emit = defineEmits<{
  (e: 'change', id: number): void
  (e: 'update', value: string): void
}>()
</script>
```

TypeScript 用户请参考：[如何为组件所抛出事件标注类型](/guide/typescript/composition-api#typing-component-emits) <sup class="vt-badge ts" />

</div>
<div class="options-api">

```js
export default {
  emits: {
    submit(payload: { email: string, password: string }) {
      // 通过返回值为 `true` 还是为 `false` 来判断
      // 验证是否通过
    }
  }
}
```

TypeScript 用户请参考：[如何为组件所抛出的事件标注类型](/guide/typescript/options-api#typing-component-emits)。<sup class="vt-badge ts" />

</div>

事件声明是可选的，但建议把要触发的事件都声明出来，方便当作文档。声明后，Vue 也能更好地区分事件和[透传 attribute](/guide/components/attrs#v-on-listener-inheritance)，减少第三方代码触发自定义 DOM 事件带来的边界问题。

:::tip
如果原生事件名（例如 `click`）写在 `emits` 里，监听器只会响应组件触发的 `click`，不会再响应原生元素的 `click`。
:::

## 事件校验 {#events-validation}

和 Props 类型校验类似，事件也可以用对象形式描述。

要给事件加校验，把事件赋值为一个函数：参数是 <span class="options-api">`this.$emit`</span><span class="composition-api">`emit`</span> 传入的内容，返回布尔值表示是否合法。

<div class="composition-api">

```vue
<script setup>
const emit = defineEmits({
  // 没有校验
  click: null,

  // 校验 submit 事件
  submit: ({ email, password }) => {
    if (email && password) {
      return true
    } else {
      console.warn('Invalid submit event payload!')
      return false
    }
  }
})

function submitForm(email, password) {
  emit('submit', { email, password })
}
</script>
```

</div>
<div class="options-api">

```js
export default {
  emits: {
    // 没有校验
    click: null,

    // 校验 submit 事件
    submit: ({ email, password }) => {
      if (email && password) {
        return true
      } else {
        console.warn('Invalid submit event payload!')
        return false
      }
    }
  },
  methods: {
    submitForm(email, password) {
      this.$emit('submit', { email, password })
    }
  }
}
```

</div>
