# 组合式 API：辅助 {#composition-api-helpers}

## useAttrs() {#useattrs}

从 [Setup 上下文](/api/composition-api-setup#setup-context) 返回 `attrs` 对象，包含当前组件的[透传 attributes](/guide/components/attrs#fallthrough-attributes)。用于 `<script setup>`，因为其中无法直接拿到 setup 上下文。

- **类型**

  ```ts
  function useAttrs(): Record<string, unknown>
  ```

## useSlots() {#useslots}

从 [Setup 上下文](/api/composition-api-setup#setup-context) 返回 `slots` 对象，包含父组件传入的插槽。插槽是可调用函数，返回虚拟 DOM 节点。用于 `<script setup>`，因为其中无法直接拿到 setup 上下文。

TypeScript 中建议优先用 [`defineSlots()`](/api/sfc-script-setup#defineslots)。

- **类型**

  ```ts
  function useSlots(): Record<string, (...args: any[]) => VNode[]>
  ```

## useModel() {#usemodel}

[`defineModel()`](/api/sfc-script-setup#definemodel) 的底层辅助函数。用 `<script setup>` 时优先用 `defineModel()`。

- 仅在 3.4+ 版本中可用

- **类型**

  ```ts
  function useModel(
    props: Record<string, any>,
    key: string,
    options?: DefineModelOptions
  ): ModelRef

  type DefineModelOptions<T = any> = {
    get?: (v: T) => any
    set?: (v: T) => any
  }

  type ModelRef<T, M extends PropertyKey = string, G = T, S = T> = Ref<G, S> & [
    ModelRef<T, M, G, S>,
    Record<M, true | undefined>
  ]
  ```

- **示例**

  ```js
  export default {
    props: ['count'],
    emits: ['update:count'],
    setup(props) {
      const msg = useModel(props, 'count')
      msg.value = 1
    }
  }
  ```

- **详细信息**

  `useModel()` 可用于非单文件组件，例如原始 `setup()`。第一个参数是 `props`，第二个是 model 名称。第三个参数可选，用于声明 model ref 的自定义 getter/setter。与 `defineModel()` 不同，props 和 emits 需自己声明。

## useTemplateRef() <sup class="vt-badge" data-text="3.5+" /> {#usetemplateref}

返回浅层 ref，值与模板中匹配 ref attribute 的元素或组件同步。

- **类型**

  ```ts
  function useTemplateRef<T>(key: string): Readonly<ShallowRef<T | null>>
  ```

- **示例**

  ```vue
  <script setup>
  import { useTemplateRef, onMounted } from 'vue'

  const inputRef = useTemplateRef('input')

  onMounted(() => {
    inputRef.value.focus()
  })
  </script>

  <template>
    <input ref="input" />
  </template>
  ```

- **参考**
  - [指南 - 模板引用](/guide/essentials/template-refs)
  - [指南 - 为模板引用标注类型](/guide/typescript/composition-api#typing-template-refs) <sup class="vt-badge ts" />
  - [指南 - 为组件模板引用标注类型](/guide/typescript/composition-api#typing-component-template-refs) <sup class="vt-badge ts" />

## useId() <sup class="vt-badge" data-text="3.5+" /> {#useid}

为无障碍属性或表单元素生成应用内唯一 ID。

- **类型**

  ```ts
  function useId(): string
  ```

- **示例**

  ```vue
  <script setup>
  import { useId } from 'vue'

  const id = useId()
  </script>

  <template>
    <form>
      <label :for="id">Name:</label>
      <input :id="id" type="text" />
    </form>
  </template>
  ```

- **详细信息**

  `useId()` 生成的 ID 在应用内唯一，可用于表单元素和无障碍属性。同一组件多次调用会生成不同 ID；同一组件的不同实例也会生成不同 ID。

  `useId()` 在 SSR 前后稳定，可安全用于 SSR，不会导致激活不匹配。

  同一页面有多个 Vue 应用时，可通过 [`app.config.idPrefix`](/api/application#app-config-idprefix) 设置 ID 前缀，避免冲突。

  :::warning 注意
  不要在 `computed()` 内部调用 `useId()`，可能导致实例冲突。应在 `computed()` 外部声明 ID，在计算函数内引用。
  :::
