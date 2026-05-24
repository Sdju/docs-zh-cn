# 响应式 API：进阶 {#reactivity-api-advanced}

## shallowRef() {#shallowref}

[`ref()`](./reactivity-core#ref) 的浅层作用形式。

- **类型**

  ```ts
  function shallowRef<T>(value: T): ShallowRef<T>

  interface ShallowRef<T> {
    value: T
  }
  ```

- **详细信息**

  和 `ref()` 不同，浅层 ref 会原样存储和暴露内部值，不会深层转为响应式。只有访问 `.value` 才是响应式的。

  `shallowRef()` 常用于优化大型数据结构，或与外部状态管理系统集成。

- **示例**

  ```js
  const state = shallowRef({ count: 1 })

  // 不会触发更改
  state.value.count = 2

  // 会触发更改
  state.value = { count: 2 }
  ```

- **参考**
  - [指南 - 减少大型不可变结构的响应性开销](/guide/best-practices/performance#reduce-reactivity-overhead-for-large-immutable-structures)
  - [指南 - 与其他状态系统集成](/guide/extras/reactivity-in-depth#integration-with-external-state-systems)

## triggerRef() {#triggerref}

强制触发依赖浅层 ref 的副作用，通常在深度修改浅 ref 内部值后使用。

- **类型**

  ```ts
  function triggerRef(ref: ShallowRef): void
  ```

- **示例**

  ```js
  const shallow = shallowRef({
    greet: 'Hello, world'
  })

  // 触发该副作用第一次应该会打印 "Hello, world"
  watchEffect(() => {
    console.log(shallow.value.greet)
  })

  // 这次变更不应触发副作用，因为这个 ref 是浅层的
  shallow.value.greet = 'Hello, universe'

  // 打印 "Hello, universe"
  triggerRef(shallow)
  ```

## customRef() {#customref}

创建自定义 ref，显式控制依赖追踪和更新触发。

- **类型**

  ```ts
  function customRef<T>(factory: CustomRefFactory<T>): Ref<T>

  type CustomRefFactory<T> = (
    track: () => void,
    trigger: () => void
  ) => {
    get: () => T
    set: (value: T) => void
  }
  ```

- **详细信息**

  `customRef()` 接收工厂函数，参数是 `track` 和 `trigger`，返回带 `get` 和 `set` 的对象。

  一般 `track()` 在 `get()` 里调用，`trigger()` 在 `set()` 里调用。但何时调用、是否调用，由你决定。

- **示例**

  创建防抖 ref：只在最后一次 `set` 后等待固定时间再更新：

  ```js
  import { customRef } from 'vue'

  export function useDebouncedRef(value, delay = 200) {
    let timeout
    return customRef((track, trigger) => {
      return {
        get() {
          track()
          return value
        },
        set(newValue) {
          clearTimeout(timeout)
          timeout = setTimeout(() => {
            value = newValue
            trigger()
          }, delay)
        }
      }
    })
  }
  ```

  在组件中使用：

  ```vue
  <script setup>
  import { useDebouncedRef } from './debouncedRef'
  const text = useDebouncedRef('hello')
  </script>

  <template>
    <input v-model="text" />
  </template>
  ```

  [在演练场中尝试一下](https://play.vuejs.org/#eNplUkFugzAQ/MqKC1SiIekxIpEq9QVV1BMXCguhBdsyaxqE/PcuGAhNfYGd3Z0ZDwzeq1K7zqB39OI205UiaJGMOieiapTUBAOYFt/wUxqRYf6OBVgotGzA30X5Bt59tX4iMilaAsIbwelxMfCvWNfSD+Gw3++fEhFHTpLFuCBsVJ0ScgUQjw6Az+VatY5PiroHo3IeaeHANlkrh7Qg1NBL43cILUmlMAfqVSXK40QUOSYmHAZHZO0KVkIZgu65kTnWp8Qb+4kHEXfjaDXkhd7DTTmuNZ7MsGyzDYbz5CgSgbdppOBFqqT4l0eX1gZDYOm057heOBQYRl81coZVg9LQWGr+IlrchYKAdJp9h0C6KkvUT3A6u8V1dq4ASqRgZnVnWg04/QWYNyYzC2rD5Y3/hkDgz8fY/cOT1ZjqizMZzGY3rDPC12KGZYyd3J26M8ny1KKx7c3X25q1c1wrZN3L9LCMWs/+AmeG6xI=)

  :::warning 谨慎使用
  使用 customRef 时要小心 getter 的返回值，尤其是每次 getter 都返回新对象时。若这样的 customRef 作为 prop 传递，会影响父子组件关系。

  父组件可能因其他响应式状态变化而重新渲染。重新渲染时会重新求值 customRef 并返回新对象作为子组件 prop。新旧 prop 不同，会触发子组件里 customRef 的响应式依赖；但 customRef 的 setter 没被调用，父组件的响应式依赖不会更新。

  [在演练场中尝试一下](https://play.vuejs.org/#eNqFVEtP3DAQ/itTS9Vm1ZCt1J6WBZUiDvTQIsoNcwiOkzU4tmU7+9Aq/71jO1mCWuhlN/PyfPP45kAujCk2HSdLsnLMCuPBcd+Zc6pEa7T1cADWOa/bW17nYMPPtvRsDT3UVrcww+DZ0flStybpKSkWQQqPU0IVVUwr58FYvdvDWXgpu6ek1pqSHL0fS0vJw/z0xbN1jUPHY/Ys87Zkzzl4K5qG2zmcnUN2oAqg4T6bQ/wENKNXNk+CxWKsSlmLTSk7XlhedYxnWclYDiK+MkQCoK4wnVtnIiBJuuEJNA2qPof7hzkEoc8DXgg9yzYTBBFgNr4xyY4FbaK2p6qfI0iqFgtgulOe27HyQRy69Dk1JXY9C03JIeQ6wg4xWvJCqFpnlNytOcyC2wzYulQNr0Ao+Mhw0KnTTEttl/CIaIJiMz8NGBHFtYetVrPwa58/IL48Zag4N0ssquNYLYBoW16J0vOkC3VQtVqk7cG9QcHz1kj0QAlgVYkNMFk6d0bJ1pbGYKUkmtD42HmvFfi94WhOEiXwjUnBnlEz9OLTJwy5qCo44D4O7en71SIFjI/F9VuG4jEy/GHQKq5hQrJAKOc4uNVighBF5/cygS0GgOMoK+HQb7+EWvLdMM7weVIJy5kXWi0Rj+xaNRhLKRp1IvB9hxYegA6WJ1xkUe9PcF4e9a+suA3YwYiC5MQ79KlFUzw5rZCZEUtoRWuE5PaXCXmxtuWIkpJSSr39EXXHQcWYNWfP/9A/uV3QUXJjueN2E1ZhtPnSIqGS+er3T77D76Ox1VUn0fsd4y3HfewCxuT2vVMVwp74RbTX8WQI1dy5qx12xI1Fpa1K5AreeEHCCN8q/QXul+LrSC3s4nh93jltkVPDIYt5KJkcIKStCReo4rVQ/CZI6dyEzToCCJu7hAtry/1QH/qXncQB400KJwqPxZHxEyona0xS/E3rt1m9Ld1rZl+uhaxecRtP3EjtgddCyimtXyj9H/Ii3eId7uOGTkyk/wOEbQ9h)

  :::

## shallowReactive() {#shallowreactive}

[`reactive()`](./reactivity-core#reactive) 的浅层作用形式。

- **类型**

  ```ts
  function shallowReactive<T extends object>(target: T): T
  ```

- **详细信息**

  和 `reactive()` 不同，这里不做深层转换：只有根级属性是响应式的。属性值原样存储和暴露，值为 ref 的属性**不会**自动解包。

  :::warning 谨慎使用
  浅层响应式对象只适合作为组件根级状态。不要嵌套在深层响应式对象里，否则响应行为不一致，难以理解和调试。
  :::

- **示例**

  ```js
  const state = shallowReactive({
    foo: 1,
    nested: {
      bar: 2
    }
  })

  // 更改状态自身的属性是响应式的
  state.foo++

  // ...但下层嵌套对象不会被转为响应式
  isReactive(state.nested) // false

  // 不是响应式的
  state.nested.bar++
  ```

## shallowReadonly() {#shallowreadonly}

[`readonly()`](./reactivity-core#readonly) 的浅层作用形式

- **类型**

  ```ts
  function shallowReadonly<T extends object>(target: T): Readonly<T>
  ```

- **详细信息**

  和 `readonly()` 不同，这里不做深层转换：只有根级属性是只读。属性值原样存储和暴露，值为 ref 的属性**不会**自动解包。

  :::warning 谨慎使用
  浅层只读对象只适合作为组件根级状态。不要嵌套在深层响应式对象里，否则响应行为不一致，难以理解和调试。
  :::

- **示例**

  ```js
  const state = shallowReadonly({
    foo: 1,
    nested: {
      bar: 2
    }
  })

  // 更改状态自身的属性会失败
  state.foo++

  // ...但可以更改下层嵌套对象
  isReadonly(state.nested) // false

  // 这是可以通过的
  state.nested.bar++
  ```

## toRaw() {#toraw}

根据 Vue 创建的代理，返回其原始对象。

- **类型**

  ```ts
  function toRaw<T>(proxy: T): T
  ```

- **详细信息**

  `toRaw()` 可返回由 [`reactive()`](./reactivity-core#reactive)、[`readonly()`](./reactivity-core#readonly)、[`shallowReactive()`](#shallowreactive) 或 [`shallowReadonly()`](#shallowreadonly) 创建的代理对应的原始对象。

  可用于临时读取而不触发代理追踪，或写入而不触发更新。不建议长期保存原始对象引用，请谨慎使用。

- **示例**

  ```js
  const foo = {}
  const reactiveFoo = reactive(foo)

  console.log(toRaw(reactiveFoo) === foo) // true
  ```

## markRaw() {#markraw}

把对象标记为不可转为代理，并返回该对象本身。

- **类型**

  ```ts
  function markRaw<T extends object>(value: T): T
  ```

- **示例**

  ```js
  const foo = markRaw({})
  console.log(isReactive(reactive(foo))) // false

  // 也适用于嵌套在其他响应性对象
  const bar = reactive({ foo })
  console.log(isReactive(bar.foo)) // false
  ```

  :::warning 谨慎使用
  `markRaw()` 和 `shallowReactive()` 等浅层 API 让你可以跳过默认的深层响应/只读转换，在状态树里嵌入原始、非代理对象。常见用途：

  - 某些值不应响应式，例如复杂的第三方类实例或 Vue 组件对象。

  - 渲染大型不可变列表时，跳过代理转换可提升性能。

  这是进阶用法。因为只有根层能访问原始值，若把未标记的嵌套原始对象放进响应式对象再访问，拿到的是代理版本。这可能引发**对象身份问题**：同一对象的原始版和代理版同时参与依赖对象身份的操作：

  ```js
  const foo = markRaw({
    nested: {}
  })

  const bar = reactive({
    // 尽管 `foo` 被标记为了原始对象，但 foo.nested 却没有
    nested: foo.nested
  })

  console.log(foo.nested === bar.nested) // false
  ```

  这类风险不常见，但要安全使用这些 API，需要充分理解响应式系统。
  :::

## effectScope() {#effectscope}

创建 effect 作用域，可捕获其中创建的响应式副作用（计算属性和侦听器），并一起处理。使用细节见对应 [RFC](https://github.com/vuejs/rfcs/blob/master/active-rfcs/0041-reactivity-effect-scope.md)。

- **类型**

  ```ts
  function effectScope(detached?: boolean): EffectScope

  interface EffectScope {
    run<T>(fn: () => T): T | undefined // 如果作用域不活跃就为 undefined
    stop(): void
  }
  ```

- **示例**

  ```js
  const scope = effectScope()

  scope.run(() => {
    const doubled = computed(() => counter.value * 2)

    watch(doubled, () => console.log(doubled.value))

    watchEffect(() => console.log('Count: ', doubled.value))
  })

  // 处理掉当前作用域内的所有 effect
  scope.stop()
  ```

## getCurrentScope() {#getcurrentscope}

若有当前活跃的 [effect 作用域](#effectscope)，则返回它。

- **类型**

  ```ts
  function getCurrentScope(): EffectScope | undefined
  ```

## onScopeDispose() {#onscopedispose}

在当前活跃的 [effect 作用域](#effectscope) 上注册回调，作用域停止时调用。

可作为可复用组合式函数里 `onUnmounted` 的替代，不绑定组件——每个 Vue 组件的 `setup()` 也在 effect 作用域里运行。

若没有活跃 effect 作用域就调用，会发出警告。3.5+ 可将第二个参数设为 `true` 来消除警告。

- **类型**

  ```ts
  function onScopeDispose(fn: () => void, failSilently?: boolean): void
  ```
