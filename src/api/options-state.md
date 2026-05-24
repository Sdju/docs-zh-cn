# 状态选项 {#options-state}

## data {#data}

声明组件初始响应式数据的函数。

- **类型**

  ```ts
  interface ComponentOptions {
    data?(
      this: ComponentPublicInstance,
      vm: ComponentPublicInstance
    ): object
  }
  ```

- **详细信息**

  函数应返回普通 JavaScript 对象，Vue 会把它变成响应式对象。实例创建后，可用 `this.$data` 访问。组件实例也会代理数据对象上的属性，所以 `this.a` 和 `this.$data.a` 等价。

  所有会用到的顶层数据属性都应提前声明。虽然可以向 `this.$data` 添加新属性，但不推荐。如果一开始拿不到值，先用 `undefined` 或 `null` 占位，让 Vue 知道有这个属性。

  以 `_` 或 `$` 开头的属性**不会**被组件实例代理，因为可能和 Vue 内置属性、API 方法冲突。要用 `this.$data._property` 访问。

  **不要**返回可能改变自身状态的对象，比如浏览器 API 原生对象或带原型的类实例。最好返回只表示组件状态的普通对象。

- **示例**

  ```js
  export default {
    data() {
      return { a: 1 }
    },
    created() {
      console.log(this.a) // 1
      console.log(this.$data) // { a: 1 }
    }
  }
  ```

  注意：如果 `data` 用箭头函数，`this` 不会指向组件实例，但可以通过第一个参数访问实例：

  ```js
  data: (vm) => ({ a: vm.myProp })
  ```

- **参考**[深入响应式系统](/guide/extras/reactivity-in-depth)

## props {#props}

声明组件的 props。

- **类型**

  ```ts
  interface ComponentOptions {
    props?: ArrayPropsOptions | ObjectPropsOptions
  }

  type ArrayPropsOptions = string[]

  type ObjectPropsOptions = { [key: string]: Prop }

  type Prop<T = any> = PropOptions<T> | PropType<T> | null

  interface PropOptions<T> {
    type?: PropType<T>
    required?: boolean
    default?: T | ((rawProps: object) => T)
    validator?: (value: unknown, rawProps: object) => boolean
  }

  type PropType<T> = { new (): T } | { new (): T }[]
  ```

  > 为了便于阅读，对类型进行了简化。

- **详细信息**

  Vue 中所有组件 props 都要显式声明。有两种写法：

  - 字符串数组（简易形式）
  - 对象（完整形式）：键是 prop 名，值是类型构造函数或更高级的选项

  对象语法里，每个 prop 还可以设置：

  - **`type`**：可以是 `String`、`Number`、`Boolean`、`Array`、`Object`、`Date`、`Function`、`Symbol`、自定义构造函数，或上述类型的数组。开发模式下，Vue 会检查 prop 值是否匹配声明类型，不匹配会警告。详见 [Prop 校验](/guide/components/props#prop-validation)。

    注意：`Boolean` 类型的 prop 会影响开发/生产模式下的值转换。详见 [Boolean 类型转换](/guide/components/props#boolean-casting)。

  - **`default`**：prop 未传入或值为 `undefined` 时的默认值。对象或数组的默认值要用工厂函数返回。工厂函数也会收到原始 prop 对象。

  - **`required`**：是否必须传入。非生产环境下，如果 required 为[真值](https://developer.mozilla.org/en-US/docs/Glossary/Truthy)但未传入 prop，控制台会警告。

  - **`validator`**：自定义验证函数，接收 prop 值和 prop 对象。开发模式下，返回[假值](https://developer.mozilla.org/en-US/docs/Glossary/Falsy)（验证失败）时控制台会警告。

- **示例**

  简易声明：

  ```js
  export default {
    props: ['size', 'myMessage']
  }
  ```

  对象声明，带验证：

  ```js
  export default {
    props: {
      // 类型检查
      height: Number,
      // 类型检查 + 其他验证
      age: {
        type: Number,
        default: 0,
        required: true,
        validator: (value) => {
          return value >= 0
        }
      }
    }
  }
  ```

- **参考**
  - [指南 - Props](/guide/components/props)
  - [指南 - 为组件的 props 标注类型](/guide/typescript/options-api#typing-component-props) <sup class="vt-badge ts" />

## computed {#computed}

声明要在组件实例上暴露的计算属性。

- **类型**

  ```ts
  interface ComponentOptions {
    computed?: {
      [key: string]: ComputedGetter<any> | WritableComputedOptions<any>
    }
  }

  type ComputedGetter<T> = (
    this: ComponentPublicInstance,
    vm: ComponentPublicInstance
  ) => T

  type ComputedSetter<T> = (
    this: ComponentPublicInstance,
    value: T
  ) => void

  type WritableComputedOptions<T> = {
    get: ComputedGetter<T>
    set: ComputedSetter<T>
  }
  ```

- **详细信息**

  接收一个对象：键是计算属性名，值是 getter，或带 `get` 和 `set` 的对象（可写计算属性）。

  所有 getter 和 setter 的 `this` 会自动绑定到组件实例。

  注意：计算属性用箭头函数时，`this` 不会指向组件实例，但可以通过第一个参数访问：

  ```js
  export default {
    computed: {
      aDouble: (vm) => vm.a * 2
    }
  }
  ```

- **示例**

  ```js
  export default {
    data() {
      return { a: 1 }
    },
    computed: {
      // 只读
      aDouble() {
        return this.a * 2
      },
      // 可写
      aPlus: {
        get() {
          return this.a + 1
        },
        set(v) {
          this.a = v - 1
        }
      }
    },
    created() {
      console.log(this.aDouble) // => 2
      console.log(this.aPlus) // => 2

      this.aPlus = 3
      console.log(this.a) // => 2
      console.log(this.aDouble) // => 4
    }
  }
  ```

- **参考**
  - [指南 - 计算属性](/guide/essentials/computed)
  - [指南 - 为计算属性标记类型](/guide/typescript/options-api#typing-computed-properties) <sup class="vt-badge ts" />

## methods {#methods}

声明要混入组件实例的方法。

- **类型**

  ```ts
  interface ComponentOptions {
    methods?: {
      [key: string]: (this: ComponentPublicInstance, ...args: any[]) => any
    }
  }
  ```

- **详细信息**

  声明的方法可以直接通过组件实例访问，或在模板表达式中使用。所有方法的 `this` 都会自动绑定到组件实例，即使作为回调传递也是如此。

  声明方法时不要用箭头函数，否则无法通过 `this` 访问组件实例。

- **示例**

  ```js
  export default {
    data() {
      return { a: 1 }
    },
    methods: {
      plus() {
        this.a++
      }
    },
    created() {
      this.plus()
      console.log(this.a) // => 2
    }
  }
  ```

- **参考**[事件处理](/guide/essentials/event-handling)

## watch {#watch}

声明数据变化时要执行的侦听回调。

- **类型**

  ```ts
  interface ComponentOptions {
    watch?: {
      [key: string]: WatchOptionItem | WatchOptionItem[]
    }
  }

  type WatchOptionItem = string | WatchCallback | ObjectWatchOptionItem

  type WatchCallback<T> = (
    value: T,
    oldValue: T,
    onCleanup: (cleanupFn: () => void) => void
  ) => void

  type ObjectWatchOptionItem = {
    handler: WatchCallback | string
    immediate?: boolean // default: false
    deep?: boolean // default: false
    flush?: 'pre' | 'post' | 'sync' // default: 'pre'
    onTrack?: (event: DebuggerEvent) => void
    onTrigger?: (event: DebuggerEvent) => void
  }
  ```

  > 为了便于阅读，对类型进行了简化。

- **详细信息**

  `watch` 接收一个对象：键是要侦听的响应式属性（通过 `data` 或 `computed` 声明的），值是对应的回调。回调接收新值和旧值。

  除了根级属性，键名也可以是点分隔路径，如 `a.b.c`。注意这种写法**不支持**复杂表达式，只支持点分隔路径。要侦听复杂数据源，用命令式 [`$watch()`](/api/component-instance#watch) API。

  值也可以是 `methods` 里声明的方法名字符串，或带额外选项的对象。对象语法时，回调写在 `handler` 里。额外选项：

  - **`immediate`**：创建侦听器时立即触发回调。第一次调用时旧值为 `undefined`。
  - **`deep`**：源是对象或数组时，深度遍历，深层变更也会触发回调。详见[深层侦听器](/guide/essentials/watchers#deep-watchers)。
  - **`flush`**：调整回调刷新时机。详见[回调的触发时机](/guide/essentials/watchers#callback-flush-timing)和 [`watchEffect()`](/api/reactivity-core#watcheffect)。
  - **`onTrack / onTrigger`**：调试侦听器依赖。详见[侦听器调试](/guide/extras/reactivity-in-depth#watcher-debugging)。

  声明侦听回调时不要用箭头函数，否则无法通过 `this` 访问组件实例。

- **示例**

  ```js
  export default {
    data() {
      return {
        a: 1,
        b: 2,
        c: {
          d: 4
        },
        e: 5,
        f: 6
      }
    },
    watch: {
      // 侦听根级属性
      a(val, oldVal) {
        console.log(`new: ${val}, old: ${oldVal}`)
      },
      // 字符串方法名称
      b: 'someMethod',
      // 该回调将会在被侦听的对象的属性改变时调动，无论其被嵌套多深
      c: {
        handler(val, oldVal) {
          console.log('c changed')
        },
        deep: true
      },
      // 侦听单个嵌套属性：
      'c.d': function (val, oldVal) {
        // do something
      },
      // 该回调将会在侦听开始之后立即调用
      e: {
        handler(val, oldVal) {
          console.log('e changed')
        },
        immediate: true
      },
      // 你可以传入回调数组，它们将会被逐一调用
      f: [
        'handle1',
        function handle2(val, oldVal) {
          console.log('handle2 triggered')
        },
        {
          handler: function handle3(val, oldVal) {
            console.log('handle3 triggered')
          }
          /* ... */
        }
      ]
    },
    methods: {
      someMethod() {
        console.log('b changed')
      },
      handle1() {
        console.log('handle 1 triggered')
      }
    },
    created() {
      this.a = 3 // => new: 3, old: 1
    }
  }
  ```

- **参考**[侦听器](/guide/essentials/watchers)

## emits {#emits}

声明组件会触发的自定义事件。

- **类型**

  ```ts
  interface ComponentOptions {
    emits?: ArrayEmitsOptions | ObjectEmitsOptions
  }

  type ArrayEmitsOptions = string[]

  type ObjectEmitsOptions = { [key: string]: EmitValidator | null }

  type EmitValidator = (...args: unknown[]) => boolean
  ```

- **详细信息**

  两种声明方式：

  - 字符串数组（简易形式）
  - 对象（完整形式）：键是事件名，值是 `null` 或验证函数

  验证函数会收到 `$emit` 传入的额外参数。例如 `this.$emit('foo', 1)` 时，`foo` 的验证函数收到参数 `1`。应返回布尔值，表示参数是否通过验证。

  注意：`emits` 会影响监听器被解析为组件事件还是原生 DOM 事件。声明为组件事件的监听器不会透传到根元素，也会从 `$attrs` 中移除。详见[透传 Attributes](/guide/components/attrs)。

- **示例**

  数组语法：

  ```js
  export default {
    emits: ['check'],
    created() {
      this.$emit('check')
    }
  }
  ```

  对象语法：

  ```js
  export default {
    emits: {
      // 没有验证函数
      click: null,

      // 具有验证函数
      submit: (payload) => {
        if (payload.email && payload.password) {
          return true
        } else {
          console.warn(`Invalid submit event payload!`)
          return false
        }
      }
    }
  }
  ```

- **参考**
  - [指南 - 透传 Attributes](/guide/components/attrs)
  - [指南 - 为组件的 emits 标注类型](/guide/typescript/options-api#typing-component-emits) <sup class="vt-badge ts" />

## expose {#expose}

声明父组件通过模板引用访问组件实例时，要暴露的公共属性。

- **类型**

  ```ts
  interface ComponentOptions {
    expose?: string[]
  }
  ```

- **详细信息**

  默认情况下，通过 `$parent`、`$root` 或模板引用访问时，组件实例会暴露所有属性。但组件可能有些内部状态或方法应保持私有，避免紧耦合。

  `expose` 的值应是要暴露的属性名字符串数组。使用 `expose` 后，只有列出的属性会暴露。

  `expose` 只影响用户定义的属性，不会过滤内置的组件实例属性。

- **示例**

  ```js
  export default {
    // 只有 `publicMethod` 在公共实例上可用
    expose: ['publicMethod'],
    methods: {
      publicMethod() {
        // ...
      },
      privateMethod() {
        // ...
      }
    }
  }
  ```
