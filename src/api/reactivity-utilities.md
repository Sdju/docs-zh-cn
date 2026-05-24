# 响应式 API：工具函数 {#reactivity-api-utilities}

## isRef() {#isref}

检查某个值是否为 ref。

- **类型**

  ```ts
  function isRef<T>(r: Ref<T> | unknown): r is Ref<T>
  ```

  返回值是[类型判定](https://www.typescriptlang.org/docs/handbook/2/narrowing.html#using-type-predicates) (type predicate)，`isRef` 可作类型守卫使用：

  ```ts
  let foo: unknown
  if (isRef(foo)) {
    // foo 的类型被收窄为了 Ref<unknown>
    foo.value
  }
  ```

## unref() {#unref}

若参数是 ref，返回内部值；否则返回参数本身。相当于 `val = isRef(val) ? val.value : val` 的语法糖。

- **类型**

  ```ts
  function unref<T>(ref: T | Ref<T>): T
  ```

- **示例**

  ```ts
  function useFoo(x: number | Ref<number>) {
    const unwrapped = unref(x)
    // unwrapped 现在保证为 number 类型
  }
  ```

## toRef() {#toref}

把值、refs 或 getters 规范化为 ref（3.3+）。

也可以基于响应式对象的某个属性创建 ref，并与源属性保持同步：改源属性会更新 ref，改 ref 也会更新源属性。

- **类型**

  ```ts
  // 规范化签名 (3.3+)
  function toRef<T>(
    value: T
  ): T extends () => infer R
    ? Readonly<Ref<R>>
    : T extends Ref
    ? T
    : Ref<UnwrapRef<T>>

  // 对象属性签名
  function toRef<T extends object, K extends keyof T>(
    object: T,
    key: K,
    defaultValue?: T[K]
  ): ToRef<T[K]>

  type ToRef<T> = T extends Ref ? T : Ref<T>
  ```

- **示例**

  规范化签名 (3.3+)：

  ```js
  // 按原样返回现有的 ref
  toRef(existingRef)

  // 创建一个只读的 ref，当访问 .value 时会调用此 getter 函数
  toRef(() => props.foo)

  // 从非函数的值中创建普通的 ref
  // 等同于 ref(1)
  toRef(1)
  ```

  对象属性签名：

  ```js
  const state = reactive({
    foo: 1,
    bar: 2
  })

  // 双向 ref，会与源属性同步
  const fooRef = toRef(state, 'foo')

  // 更改该 ref 会更新源属性
  fooRef.value++
  console.log(state.foo) // 2

  // 更改源属性也会更新该 ref
  state.foo++
  console.log(fooRef.value) // 3
  ```

  注意，这和下面不同：

  ```js
  const fooRef = ref(state.foo)
  ```

  上面的 ref **不会**与 `state.foo` 同步，因为 `ref()` 收到的是普通数值。

  要把 prop 的 ref 传给组合式函数时，`toRef()` 很有用：

  ```vue
  <script setup>
  import { toRef } from 'vue'

  const props = defineProps(/* ... */)

  // 将 `props.foo` 转换为 ref，然后传入
  // 一个组合式函数
  useSomeFeature(toRef(props, 'foo'))

  // getter 语法——推荐在 3.3+ 版本使用
  useSomeFeature(toRef(() => props.foo))
  </script>
  ```

  与组件 props 一起用时，仍不能改 props。给 ref 赋新值等于直接改 props，这是不允许的。这种场景可考虑用带 `get` 和 `set` 的 [`computed`](./reactivity-core#computed)。详见[在组件上使用 `v-model`](/guide/components/v-model)。

  用对象属性签名时，即使源属性还不存在，`toRef()` 也会返回可用 ref。处理可选 props 时很有用；相比之下 [`toRefs`](#torefs) 不会为可选 props 创建 ref。

## toValue() {#tovalue}

- 仅在 3.3+ 中支持

把值、refs 或 getters 规范化为普通值。类似 [unref()](#unref)，但也会处理 getter：参数是 getter 时会调用并返回结果。

可在[组合式函数](/guide/reusability/composables.html)里用来规范化「可以是值、ref 或 getter」的参数。

- **类型**

  ```ts
  function toValue<T>(source: T | Ref<T> | (() => T)): T
  ```

- **示例**

  ```js
  toValue(1) //       --> 1
  toValue(ref(1)) //  --> 1
  toValue(() => 1) // --> 1
  ```

  在组合式函数中规范化参数：

  ```ts
  import type { MaybeRefOrGetter } from 'vue'

  function useFeature(id: MaybeRefOrGetter<number>) {
    watch(() => toValue(id), id => {
      // 处理 id 变更
    })
  }

  // 这个组合式函数支持以下的任意形式：
  useFeature(1)
  useFeature(ref(1))
  useFeature(() => 1)
  ```

## toRefs() {#torefs}

把响应式对象转为普通对象，每个属性都是指向源对象对应属性的 ref。每个 ref 由 [`toRef()`](#toref) 创建。

- **类型**

  ```ts
  function toRefs<T extends object>(
    object: T
  ): {
    [K in keyof T]: ToRef<T[K]>
  }

  type ToRef = T extends Ref ? T : Ref<T>
  ```

- **示例**

  ```js
  const state = reactive({
    foo: 1,
    bar: 2
  })

  const stateAsRefs = toRefs(state)
  /*
  stateAsRefs 的类型：{
    foo: Ref<number>,
    bar: Ref<number>
  }
  */

  // 这个 ref 和源属性已经“链接上了”
  state.foo++
  console.log(stateAsRefs.foo.value) // 2

  stateAsRefs.foo.value++
  console.log(state.foo) // 3
  ```

  当从组合式函数中返回响应式对象时，`toRefs` 相当有用。使用它，消费者组件可以解构/展开返回的对象而不会失去响应性：

  ```js
  function useFeatureX() {
    const state = reactive({
      foo: 1,
      bar: 2
    })

    // ...基于状态的操作逻辑

    // 在返回时都转为 ref
    return toRefs(state)
  }

  // 可以解构而不会失去响应性
  const { foo, bar } = useFeatureX()
  ```

  `toRefs` 只为源对象上可枚举的属性创建 ref。若要为可能还不存在的属性创建 ref，请用 [`toRef`](#toref)。

## isProxy() {#isproxy}

检查对象是否由 [`reactive()`](./reactivity-core#reactive)、[`readonly()`](./reactivity-core#readonly)、[`shallowReactive()`](./reactivity-advanced#shallowreactive) 或 [`shallowReadonly()`](./reactivity-advanced#shallowreadonly) 创建的代理。

- **类型**

  ```ts
  function isProxy(value: any): boolean
  ```

## isReactive() {#isreactive}

检查对象是否由 [`reactive()`](./reactivity-core#reactive) 或 [`shallowReactive()`](./reactivity-advanced#shallowreactive) 创建的代理。

- **类型**

  ```ts
  function isReactive(value: unknown): boolean
  ```

## isReadonly() {#isreadonly}

检查值是否为只读对象。只读对象的属性可以改，但不能通过该对象直接赋值。

由 [`readonly()`](./reactivity-core#readonly) 和 [`shallowReadonly()`](./reactivity-advanced#shallowreadonly) 创建的代理都是只读的，类似没有 `set` 的 [`computed()`](./reactivity-core#computed) ref。

- **类型**

  ```ts
  function isReadonly(value: unknown): boolean
  ```
