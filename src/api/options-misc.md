# 其他杂项选项 {#options-misc}

## name {#name}

显式声明组件展示名称。

- **类型**

  ```ts
  interface ComponentOptions {
    name?: string
  }
  ```

- **详细信息**

  组件名用于：

  - 组件模板中递归引用自身
  - Vue 开发者工具的组件树显示
  - 组件警告的调用栈信息

  单文件组件会根据文件名推导名称。例如 `MyComponent.vue` 推导为「MyComponent」。

  组件通过 [`app.component`](/api/application#app-component) 全局注册时，全局 ID 会自动设为名称。

  用 `name` 可以覆盖推导名称，或在没有推导名时显式提供（例如不用构建工具，或内联非单文件组件）。

  有一种情况必须显式声明 `name`：[`<KeepAlive>`](/guide/built-ins/keep-alive) 用 `include / exclude` prop 匹配要缓存的组件时。

  :::tip
  3.2.34+ 版本中，`<script setup>` 单文件组件会自动根据文件名生成 `name`，配合 `<KeepAlive>` 时无需手动声明。
  :::

## inheritAttrs {#inheritattrs}

控制是否启用默认的 attribute 透传。

- **类型**

  ```ts
  interface ComponentOptions {
    inheritAttrs?: boolean // 默认值：true
  }
  ```

- **详细信息**

  默认情况下，父组件传入但未被子组件解析为 props 的 attributes 会「透传」。单根节点子组件中，这些绑定会作为普通 HTML attribute 应用到根元素。如果组件要在目标元素外再包一层，可能不想要这个行为。设 `inheritAttrs` 为 `false` 可禁用。这些 attributes 可通过 `$attrs` 访问，用 `v-bind` 显式绑定到非根元素。

- **示例**

  <div class="options-api">

  ```vue
  <script>
  export default {
    inheritAttrs: false,
    props: ['label', 'value'],
    emits: ['input']
  }
  </script>

  <template>
    <label>
      {{ label }}
      <input
        v-bind="$attrs"
        v-bind:value="value"
        v-on:input="$emit('input', $event.target.value)"
      />
    </label>
  </template>
  ```

  </div>
  <div class="composition-api">

  在 `<script setup>` 组件中，用 [`defineOptions`](/api/sfc-script-setup#defineoptions) 宏声明：

  ```vue
  <script setup>
  defineProps(['label', 'value'])
  defineEmits(['input'])
  defineOptions({
    inheritAttrs: false
  })
  </script>

  <template>
    <label>
      {{ label }}
      <input
        v-bind="$attrs"
        v-bind:value="value"
        v-on:input="$emit('input', $event.target.value)"
      />
    </label>
  </template>
  ```

  </div>

- **参考**

  - [透传 attribute](/guide/components/attrs)
  <div class="composition-api">

  - [在常规 `<script>` 中使用 `inheritAttrs`](/api/sfc-script-setup.html#usage-alongside-normal-script)
  </div>

## components {#components}

注册当前组件实例可用的组件。

- **类型**

  ```ts
  interface ComponentOptions {
    components?: { [key: string]: Component }
  }
  ```

- **示例**

  ```js
  import Foo from './Foo.vue'
  import Bar from './Bar.vue'

  export default {
    components: {
      // 简写
      Foo,
      // 注册为一个不同的名称
      RenamedBar: Bar
    }
  }
  ```

- **参考**[组件注册](/guide/components/registration)

## directives {#directives}

注册当前组件实例可用的指令。

- **类型**

  ```ts
  interface ComponentOptions {
    directives?: { [key: string]: Directive }
  }
  ```

- **示例**

  ```js
  export default {
    directives: {
      // 在模板中启用 v-focus
      focus: {
        mounted(el) {
          el.focus()
        }
      }
    }
  }
  ```

  ```vue-html
  <input v-focus>
  ```

- **参考**[自定义指令](/guide/reusability/custom-directives)
