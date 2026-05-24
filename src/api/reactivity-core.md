# 响应式 API：核心 {#reactivity-api-core}

:::info 参考
想更好理解响应式 API，建议先看这些指南章节：

- [响应式基础](/guide/essentials/reactivity-fundamentals) (with the API preference set to Composition API)
- [深入响应式系统](/guide/extras/reactivity-in-depth)
  :::

## ref() {#ref}

接收一个内部值，返回响应式、可修改的 ref 对象。该对象只有一个 `.value` 属性指向内部值。

- **类型**

  ```ts
  function ref<T>(value: T): Ref<UnwrapRef<T>>

  interface Ref<T> {
    value: T
  }
  ```

- **详细信息**

  ref 可以修改：给 `.value` 赋新值即可。它也是响应式的：对 `.value` 的读写都会被追踪，写操作会触发相关副作用。

  若把对象赋给 ref，对象会通过 [reactive()](#reactive) 转为深层响应式对象，嵌套的 ref 也会被深层解包。

  若不想做深层转换，请用 [`shallowRef()`](./reactivity-advanced#shallowref)。

- **示例**

  ```js
  const count = ref(0)
  console.log(count.value) // 0

  count.value = 1
  console.log(count.value) // 1
  ```

- **参考**
  - [指南 - `ref()` 的响应式基础](/guide/essentials/reactivity-fundamentals#reactive-variables-with-ref)
  - [指南 - 为 `ref()` 标注类型](/guide/typescript/composition-api#typing-ref) <sup class="vt-badge ts" />

## computed() {#computed}

接收 [getter 函数](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Functions/get#description)，返回只读响应式 [ref](#ref)。通过 `.value` 读取 getter 的返回值。也可以传带 `get` 和 `set` 的对象，创建可写 ref。

- **类型**

  ```ts
  // 只读
  function computed<T>(
    getter: (oldValue: T | undefined) => T,
    // 查看下方的 "计算属性调试" 链接
    debuggerOptions?: DebuggerOptions
  ): Readonly<Ref<Readonly<T>>>

  // 可写的
  function computed<T>(
    options: {
      get: (oldValue: T | undefined) => T
      set: (value: T) => void
    },
    debuggerOptions?: DebuggerOptions
  ): Ref<T>
  ```

- **示例**

  创建一个只读的计算属性 ref：

  ```js
  const count = ref(1)
  const plusOne = computed(() => count.value + 1)

  console.log(plusOne.value) // 2

  plusOne.value++ // 错误
  ```

  创建一个可写的计算属性 ref：

  ```js
  const count = ref(1)
  const plusOne = computed({
    get: () => count.value + 1,
    set: (val) => {
      count.value = val - 1
    }
  })

  plusOne.value = 1
  console.log(count.value) // 0
  ```

  调试：

  ```js
  const plusOne = computed(() => count.value + 1, {
    onTrack(e) {
      debugger
    },
    onTrigger(e) {
      debugger
    }
  })
  ```

- **参考**
  - [指南 - 计算属性](/guide/essentials/computed)
  - [指南 - 计算属性调试](/guide/extras/reactivity-in-depth#computed-debugging)
  - [指南 - 为 `computed()` 标注类型](/guide/typescript/composition-api#typing-computed) <sup class="vt-badge ts" />
  - [指南 - 性能优化 - 计算属性稳定性](/guide/best-practices/performance#computed-stability)

## reactive() {#reactive}

返回对象的响应式代理。

- **类型**

  ```ts
  function reactive<T extends object>(target: T): UnwrapNestedRefs<T>
  ```

- **详细信息**

  响应式转换是「深层」的：会影响所有嵌套属性。响应式对象也会深层解包其中的 [ref](#ref)，并保持响应性。

  访问响应式数组或 `Map` 等原生集合里的 ref 元素时，**不会**解包 ref。

  若只要顶层响应性、不要深层转换，请用 [shallowReactive()](./reactivity-advanced#shallowreactive)。

  返回的对象及嵌套对象都由 [ES Proxy](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy) 包裹，**不等于**源对象。建议只用响应式代理，避免直接操作原始对象。

- **示例**

  创建一个响应式对象：

  ```js
  const obj = reactive({ count: 0 })
  obj.count++
  ```

  ref 的解包：

  ```ts
  const count = ref(1)
  const obj = reactive({ count })

  // ref 会被解包
  console.log(obj.count === count.value) // true

  // 会更新 `obj.count`
  count.value++
  console.log(count.value) // 2
  console.log(obj.count) // 2

  // 也会更新 `count` ref
  obj.count++
  console.log(obj.count) // 3
  console.log(count.value) // 3
  ```

	注意：访问响应式数组或 `Map` 等原生集合里的 ref 元素时，**不会**解包 ref：

  ```js
  const books = reactive([ref('Vue 3 Guide')])
  // 这里需要 .value
  console.log(books[0].value)

  const map = reactive(new Map([['count', ref(0)]]))
  // 这里需要 .value
  console.log(map.get('count').value)
  ```

  把 [ref](#ref) 赋给 `reactive` 对象的属性时，ref 会自动解包：

  ```ts
  const count = ref(1)
  const obj = reactive({})

  obj.count = count

  console.log(obj.count) // 1
  console.log(obj.count === count.value) // true
  ```

- **参考**
  - [指南 - 响应式基础](/guide/essentials/reactivity-fundamentals)
  - [指南 - 为 `reactive()` 标注类型](/guide/typescript/composition-api#typing-reactive) <sup class="vt-badge ts" />

## readonly() {#readonly}

接收对象（响应式或普通）或 [ref](#ref)，返回原值的只读代理。

- **类型**

  ```ts
  function readonly<T extends object>(
    target: T
  ): DeepReadonly<UnwrapNestedRefs<T>>
  ```

- **详细信息**

  只读代理是深层的：访问任何嵌套属性都是只读。ref 解包行为与 `reactive()` 相同，但解包后的值是只读的。

  若不要深层转换，请用 [shallowReadonly()](./reactivity-advanced#shallowreadonly)。

- **示例**

  ```js
  const original = reactive({ count: 0 })

  const copy = readonly(original)

  watchEffect(() => {
    // 用来做响应性追踪
    console.log(copy.count)
  })

  // 更改源属性会触发其依赖的侦听器
  original.count++

  // 更改该只读副本将会失败，并会得到一个警告
  copy.count++ // warning!
  ```

## watchEffect() {#watcheffect}

立即运行函数，并响应式追踪其依赖；依赖变化时重新执行。

- **类型**

  ```ts
  function watchEffect(
    effect: (onCleanup: OnCleanup) => void,
    options?: WatchEffectOptions
  ): WatchHandle

  type OnCleanup = (cleanupFn: () => void) => void

  interface WatchEffectOptions {
    flush?: 'pre' | 'post' | 'sync' // 默认：'pre'
    onTrack?: (event: DebuggerEvent) => void
    onTrigger?: (event: DebuggerEvent) => void
  }

  interface WatchHandle {
    (): void // 可调用，与 `stop` 相同
    pause: () => void
    resume: () => void
    stop: () => void
  }
  ```

- **详细信息**

  第一个参数是要运行的副作用函数。它还接收一个函数参数，用来注册清理回调。清理回调会在副作用下次执行前调用，可用来清理无效副作用，例如取消进行中的异步请求（见下方示例）。

  第二个参数是可选配置，可调整副作用刷新时机或调试依赖。

  默认情况下，侦听器在组件渲染前执行。设 `flush: 'post'` 会延迟到组件渲染之后。详见[回调的触发时机](/guide/essentials/watchers#callback-flush-timing)。某些场景（如缓存失效）可能需要在依赖变化时立刻触发，可设 `flush: 'sync'`。但应谨慎使用：多个属性同时更新时，可能影响性能和数据一致性。

  返回值是用来停止该副作用的函数。

- **示例**

  ```js
  const count = ref(0)

  watchEffect(() => console.log(count.value))
  // -> 输出 0

  count.value++
  // -> 输出 1
  ```

  停止侦听器：

  ```js
  const stop = watchEffect(() => {})

  // 当不再需要此侦听器时:
  stop()
  ```

  暂停/恢复侦听器：<sup class="vt-badge" data-text="3.5+" />

  ```js
  const { stop, pause, resume } = watchEffect(() => {})

  // 暂停侦听器
  pause()

  // 稍后恢复
  resume()

  // 停止
  stop()
  ```

  副作用清理：

  ```js
  watchEffect(async (onCleanup) => {
    const { response, cancel } = doAsyncWork(newId)
    // 如果 `id` 变化，则调用 `cancel`，
    // 如果之前的请求未完成，则取消该请求
    onCleanup(cancel)
    data.value = await response
  })
  ```

  3.5+ 中的副作用清理：

  ```js
  import { onWatcherCleanup } from 'vue'

  watchEffect(async () => {
    const { response, cancel } = doAsyncWork(newId)
    // 如果 `id` 变化，则调用 `cancel`，
    // 如果之前的请求未完成，则取消该请求
    onWatcherCleanup(cancel)
    data.value = await response
  })
  ```

  选项：

  ```js
  watchEffect(() => {}, {
    flush: 'post',
    onTrack(e) {
      debugger
    },
    onTrigger(e) {
      debugger
    }
  })
  ```

- **参考**
  - [指南 - 侦听器](/guide/essentials/watchers#watcheffect)
  - [指南 - 侦听器调试](/guide/extras/reactivity-in-depth#watcher-debugging)

## watchPostEffect() {#watchposteffect}

[`watchEffect()`](#watcheffect) 使用 `flush: 'post'` 选项时的别名。

## watchSyncEffect() {#watchsynceffect}

[`watchEffect()`](#watcheffect) 使用 `flush: 'sync'` 选项时的别名。

## watch() {#watch}

侦听一个或多个响应式数据源，变化时调用回调。

- **类型**

  ```ts
  // 侦听单个来源
  function watch<T>(
    source: WatchSource<T>,
    callback: WatchCallback<T>,
    options?: WatchOptions
  ): WatchHandle

  // 侦听多个来源
  function watch<T>(
    sources: WatchSource<T>[],
    callback: WatchCallback<T[]>,
    options?: WatchOptions
  ): WatchHandle

  type WatchCallback<T> = (
    value: T,
    oldValue: T,
    onCleanup: (cleanupFn: () => void) => void
  ) => void

  type WatchSource<T> =
    | Ref<T> // ref
    | (() => T) // getter
    | (T extends object ? T : never) // 响应式对象

  interface WatchOptions extends WatchEffectOptions {
    immediate?: boolean // 默认：false
    deep?: boolean | number // 默认：false
    flush?: 'pre' | 'post' | 'sync' // 默认：'pre'
    onTrack?: (event: DebuggerEvent) => void
    onTrigger?: (event: DebuggerEvent) => void
    once?: boolean // 默认：false (3.4+)
  }

  interface WatchHandle {
    (): void // 可调用，与 `stop` 相同
    pause: () => void
    resume: () => void
    stop: () => void
  }
  ```

  > 为便于阅读，类型已简化。

- **详细信息**

  `watch()` 默认是懒侦听：只有侦听源变化时才执行回调。

  第一个参数是侦听**源**，可以是：

  - 返回值的函数
  - ref
  - 响应式对象
  - …或由以上类型组成的数组

  第二个参数是变化时的回调，接收三个参数：新值、旧值，以及注册清理副作用的函数。该清理函数会在副作用下次重新执行前调用，可用来清除无效副作用，例如取消进行中的异步请求。

  侦听多个来源时，回调接收两个数组，分别对应新值和旧值。

  第三个参数是可选配置对象，支持：

  - **`immediate`**：创建侦听器时立刻触发回调。第一次调用时旧值是 `undefined`。
  - **`deep`**：源是对象时，强制深度遍历，深层变更也会触发回调。3.5+ 还可传数字表示最大遍历深度。见[深层侦听器](/guide/essentials/watchers#deep-watchers)。
  - **`flush`**：调整回调刷新时机。见[回调的刷新时机](/guide/essentials/watchers#callback-flush-timing)和 [`watchEffect()`](/api/reactivity-core#watcheffect)。
  - **`onTrack / onTrigger`**：调试侦听器依赖。见[调试侦听器](/guide/extras/reactivity-in-depth#watcher-debugging)。
  - **`once`**：(3.4+) 回调只运行一次，首次运行后自动停止。

  相比 [`watchEffect()`](#watcheffect)，`watch()` 可以：

  - 懒执行副作用；
  - 更明确由哪个状态触发重新执行；
  - 访问前一个值和当前值。

- **示例**

  侦听一个 getter 函数：

  ```js
  const state = reactive({ count: 0 })
  watch(
    () => state.count,
    (count, prevCount) => {
      /* ... */
    }
  )
  ```

  侦听一个 ref：

  ```js
  const count = ref(0)
  watch(count, (count, prevCount) => {
    /* ... */
  })
  ```

  当侦听多个来源时，回调函数接受两个数组，分别对应来源数组中的新值和旧值：

  ```js
  watch([fooRef, barRef], ([foo, bar], [prevFoo, prevBar]) => {
    /* ... */
  })
  ```

  用 getter 作源时，只有返回值变化才触发回调。若要在深层变更时也触发，需设 `{ deep: true }` 进入深层模式。此时若因深层变更触发，新值和旧值会是同一对象。

  ```js
  const state = reactive({ count: 0 })
  watch(
    () => state,
    (newValue, oldValue) => {
      // newValue === oldValue
    },
    { deep: true }
  )
  ```

  直接侦听响应式对象时，会自动启用深层模式：

  ```js
  const state = reactive({ count: 0 })
  watch(state, () => {
    /* 深层级变更状态所触发的回调 */
  })
  ```

  `watch()` 和 [`watchEffect()`](#watcheffect) 享有相同的刷新时机和调试选项：

  ```js
  watch(source, callback, {
    flush: 'post',
    onTrack(e) {
      debugger
    },
    onTrigger(e) {
      debugger
    }
  })
  ```

  停止侦听器：

  ```js
  const stop = watch(source, callback)

  // 当已不再需要该侦听器时：
  stop()
  ```

  暂停/恢复侦听器：<sup class="vt-badge" data-text="3.5+" />

  ```js
  const { stop, pause, resume } = watch(() => {})

  // 暂停侦听器
  pause()

  // 稍后恢复
  resume()

  // 停止
  stop()
  ```

  副作用清理：

  ```js
  watch(id, async (newId, oldId, onCleanup) => {
    const { response, cancel } = doAsyncWork(newId)
    // 当 `id` 变化时，`cancel` 将被调用，
    // 取消之前的未完成的请求
    onCleanup(cancel)
    data.value = await response
  })
  ```

  3.5+ 中的副作用清理：

  ```js
  import { onWatcherCleanup } from 'vue'

  watch(id, async (newId) => {
    const { response, cancel } = doAsyncWork(newId)
    onWatcherCleanup(cancel)
    data.value = await response
  })
  ```

- **参考**

  - [指南 - 侦听器](/guide/essentials/watchers)
  - [指南 - 侦听器调试](/guide/extras/reactivity-in-depth#watcher-debugging)

## onWatcherCleanup() <sup class="vt-badge" data-text="3.5+" /> {#onwatchercleanup}

注册清理函数，在当前侦听器即将重新运行时执行。只能在 `watchEffect` 作用函数或 `watch` 回调的**同步**执行期间调用（不能在异步函数里 `await` 之后调用）。

- **类型**

  ```ts
  function onWatcherCleanup(
    cleanupFn: () => void,
    failSilently?: boolean
  ): void
  ```

- **示例**

  ```ts
  import { watch, onWatcherCleanup } from 'vue'

  watch(id, (newId) => {
    const { response, cancel } = doAsyncWork(newId)
    // 如果 `id` 变化，则调用 `cancel`，
    // 如果之前的请求未完成，则取消该请求
    onWatcherCleanup(cancel)
  })
  ```
