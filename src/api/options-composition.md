# 组合选项 {#options-composition}

## provide {#provide}

提供可供后代组件 inject 的值。

- **类型**

  ```ts
  interface ComponentOptions {
    provide?: object | ((this: ComponentPublicInstance) => object)
  }
  ```

- **详细信息**

  `provide` 和 [`inject`](#inject) 通常成对使用。祖先组件向任意深度的后代注入依赖，只要在同一条组件链上即可。

  `provide` 可以是对象，或返回对象的函数。对象里放要注入的属性，key 可以用 Symbol。

- **示例**

  基本使用方式：

  ```js
  const s = Symbol()

  export default {
    provide: {
      foo: 'foo',
      [s]: 'bar'
    }
  }
  ```

  用函数可以提供组件中的状态：

  ```js
  export default {
    data() {
      return {
        msg: 'foo'
      }
    }
    provide() {
      return {
        msg: this.msg
      }
    }
  }
  ```

  注意：上面例子里提供的 `msg` **不会**是响应式的。详见[和响应式数据配合使用](/guide/components/provide-inject#working-with-reactivity)。

- **参考**[依赖注入](/guide/components/provide-inject)

## inject {#inject}

声明要从上层 provide 并注入当前组件的属性。

- **类型**

  ```ts
  interface ComponentOptions {
    inject?: ArrayInjectOptions | ObjectInjectOptions
  }

  type ArrayInjectOptions = string[]

  type ObjectInjectOptions = {
    [key: string | symbol]:
      | string
      | symbol
      | { from?: string | symbol; default?: any }
  }
  ```

- **详细信息**

  `inject` 有两种写法：

  - 字符串数组
  - 对象：key 是当前组件中的本地名，值可以是：
    - 匹配 inject 的 key（string 或 Symbol）
    - 对象
      - `from`：匹配的 key（string 或 Symbol）
      - `default`：默认值。和 props 默认值类似，对象类型要用工厂函数，避免多个组件共享同一对象。

  没有匹配的 provide 且没有默认值时，注入值为 `undefined`。

  注意：inject 绑定本身不是响应式的，这是设计如此。如果注入的是响应式对象，对象上的属性仍保持响应性。详见[配合响应性](/guide/components/provide-inject#working-with-reactivity)。

- **示例**

  基本使用方式：

  ```js
  export default {
    inject: ['foo'],
    created() {
      console.log(this.foo)
    }
  }
  ```

  用注入的值作为 props 默认值：

  ```js
  const Child = {
    inject: ['foo'],
    props: {
      bar: {
        default() {
          return this.foo
        }
      }
    }
  }
  ```

  用注入的值作为 data：

  ```js
  const Child = {
    inject: ['foo'],
    data() {
      return {
        bar: this.foo
      }
    }
  }
  ```

  注入项可以带默认值：

  ```js
  const Child = {
    inject: {
      foo: { default: 'foo' }
    }
  }
  ```

  要从不同名字的属性注入，用 `from` 指定来源：

  ```js
  const Child = {
    inject: {
      foo: {
        from: 'bar',
        default: 'foo'
      }
    }
  }
  ```

  和 props 默认值类似，非原始类型要用工厂函数：

  ```js
  const Child = {
    inject: {
      foo: {
        from: 'bar',
        default: () => [1, 2, 3]
      }
    }
  }
  ```

- **参考**[依赖注入](/guide/components/provide-inject)

## mixins {#mixins}

包含组件选项对象的数组，这些选项会混入当前组件实例。

- **类型**

  ```ts
  interface ComponentOptions {
    mixins?: ComponentOptions[]
  }
  ```

- **详细信息**

  `mixins` 接收 mixin 对象数组。mixin 可以像普通组件一样包含实例选项，会按选项合并规则与最终选项合并。例如 mixin 有 `created` 钩子，组件自身也有，两个都会调用。

  Mixin 钩子按提供顺序调用，且在组件自身钩子之前。

  :::warning 不再推荐
  Vue 2 中 mixins 是复用逻辑的主要方式。Vue 3 仍支持 mixins，但更推荐用[组合式 API 的组合式函数](/guide/reusability/composables)复用逻辑。
  :::

- **示例**

  ```js
  const mixin = {
    created() {
      console.log(1)
    }
  }

  createApp({
    created() {
      console.log(2)
    },
    mixins: [mixin]
  })

  // => 1
  // => 2
  ```

## extends {#extends}

要继承的「基类」组件。

- **类型**

  ```ts
  interface ComponentOptions {
    extends?: ComponentOptions
  }
  ```

- **详细信息**

  让一个组件继承另一个组件的选项。

  实现上，`extends` 和 `mixins` 几乎相同。`extends` 指定的组件当作第一个 mixin 处理。

  但目标不同：`mixins` 侧重组合功能，`extends` 侧重继承关系。

  和 `mixins` 一样，所有选项（`setup()` 除外）都按相应策略合并。

- **示例**

  ```js
  const CompA = { ... }

  const CompB = {
    extends: CompA,
    ...
  }
  ```

  :::warning 不建议用于组合式 API
  `extends` 为选项式 API 设计，不会合并 `setup()` 钩子。

  组合式 API 中，复用逻辑首选「组合」而非「继承」。需要复用时，把逻辑提取到[组合式函数](/guide/reusability/composables#composables)。

  如果仍要在组合式 API 中「继承」组件，可以在子组件 `setup()` 里调用基类 `setup()`：

  ```js
  import Base from './Base.js'
  export default {
    extends: Base,
    setup(props, ctx) {
      return {
        ...Base.setup(props, ctx),
        // 本地绑定
      }
    }
  }
  ```
  :::
