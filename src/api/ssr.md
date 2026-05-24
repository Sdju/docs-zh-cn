# 服务端渲染 API {#server-side-rendering-api}

## renderToString() {#rendertostring}

- **导出自 `vue/server-renderer`**

- **类型**

  ```ts
  function renderToString(
    input: App | VNode,
    context?: SSRContext
  ): Promise<string>
  ```

- **示例**

  ```js
  import { createSSRApp } from 'vue'
  import { renderToString } from 'vue/server-renderer'

  const app = createSSRApp({
    data: () => ({ msg: 'hello' }),
    template: `<div>{{ msg }}</div>`
  })

  ;(async () => {
    const html = await renderToString(app)
    console.log(html)
  })()
  ```

  ### SSR 上下文 {#ssr-context}

  可传入可选的上下文对象，在渲染过程中记录额外数据，例如[访问 Teleport 的内容](/guide/scaling-up/ssr#teleports)：

  ```js
  const ctx = {}
  const html = await renderToString(app, ctx)

  console.log(ctx.teleports) // { '#teleported': 'teleported content' }
  ```

  本页大多数 SSR API 也接受上下文对象。组件代码中可通过 [useSSRContext](#usessrcontext) 访问。

- **参考**[指南 - 服务端渲染 (SSR)](/guide/scaling-up/ssr)

## renderToNodeStream() {#rendertonodestream}

将输入渲染为 [Node.js Readable stream](https://nodejs.org/api/stream.html#stream_class_stream_readable) 实例。

- **导出自 `vue/server-renderer`**

- **类型**

  ```ts
  function renderToNodeStream(
    input: App | VNode,
    context?: SSRContext
  ): Readable
  ```

- **示例**

  ```js
  // 在一个 Node.js http 处理函数内
  renderToNodeStream(app).pipe(res)
  ```

  :::tip 备注
  `vue/server-renderer` 的 ESM 构建不支持此方法，因为它与 Node.js 环境分离。请改用 [`pipeToNodeWritable`](#pipetonodewritable)。
  :::

## pipeToNodeWritable() {#pipetonodewritable}

将输入渲染并 pipe 到 [Node.js Writable stream](https://nodejs.org/api/stream.html#stream_writable_streams) 实例。

- **导出自 `vue/server-renderer`**

- **类型**

  ```ts
  function pipeToNodeWritable(
    input: App | VNode,
    context: SSRContext = {},
    writable: Writable
  ): void
  ```

- **示例**

  ```js
  // 在一个 Node.js http 处理函数内
  pipeToNodeWritable(app, {}, res)
  ```

## renderToWebStream() {#rendertowebstream}

将输入渲染为 [Web ReadableStream](https://developer.mozilla.org/en-US/docs/Web/API/Streams_API) 实例。

- **导出自 `vue/server-renderer`**

- **类型**

  ```ts
  function renderToWebStream(
    input: App | VNode,
    context?: SSRContext
  ): ReadableStream
  ```

- **示例**

  ```js
  // 在一个支持 ReadableStream 的环境下
  return new Response(renderToWebStream(app))
  ```

  :::tip 备注
  若环境未全局暴露 `ReadableStream` 构造函数，请改用 [`pipeToWebWritable()`](#pipetowebwritable)。
  :::

## pipeToWebWritable() {#pipetowebwritable}

将输入渲染并 pipe 到 [Web WritableStream](https://developer.mozilla.org/en-US/docs/Web/API/WritableStream) 实例。

- **导出自 `vue/server-renderer`**

- **类型**

  ```ts
  function pipeToWebWritable(
    input: App | VNode,
    context: SSRContext = {},
    writable: WritableStream
  ): void
  ```

- **示例**

  通常与 [`TransformStream`](https://developer.mozilla.org/en-US/docs/Web/API/TransformStream) 配合使用：

  ```js
  // 诸如 CloudFlare worker 这样的环境中，TransformStream 是可用的。
  // 在 Node.js 中，TransformStream 需要从 'stream/web' 显示导入。
  const { readable, writable } = new TransformStream()
  pipeToWebWritable(app, {}, writable)

  return new Response(readable)
  ```

## renderToSimpleStream() {#rendertosimplestream}

通过简单接口，以 stream 模式渲染输入。

- **导出自 `vue/server-renderer`**

- **类型**

  ```ts
  function renderToSimpleStream(
    input: App | VNode,
    context: SSRContext,
    options: SimpleReadable
  ): SimpleReadable

  interface SimpleReadable {
    push(content: string | null): void
    destroy(err: any): void
  }
  ```

- **示例**

  ```js
  let res = ''

  renderToSimpleStream(
    app,
    {},
    {
      push(chunk) {
        if (chunk === null) {
          // done
          console(`render complete: ${res}`)
        } else {
          res += chunk
        }
      },
      destroy(err) {
        // error encountered
      }
    }
  )
  ```

## useSSRContext() {#usessrcontext}

运行时 API，用于获取传给 `renderToString()` 或其他 SSR API 的上下文对象。

- **类型**

  ```ts
  function useSSRContext<T = Record<string, any>>(): T | undefined
  ```

- **示例**

  上下文可用于渲染最终 HTML 时的附加信息（例如 head 中的元数据）。

  ```vue
  <script setup>
  import { useSSRContext } from 'vue'

  // 确保只在服务端渲染时调用
  // https://cn.vitejs.dev/guide/ssr.html#conditional-logic
  if (import.meta.env.SSR) {
    const ctx = useSSRContext()
    // ...给上下文对象添加属性
  }
  </script>
  ```

## data-allow-mismatch <sup class="vt-badge" data-text="3.5+" /> {#data-allow-mismatch}

可消除[激活不匹配](/guide/scaling-up/ssr#hydration-mismatch)警告的特殊 attribute。

- **示例**

  ```html
  <div data-allow-mismatch="text">{{ data.toLocaleString() }}</div>
  ```

  值可限制不匹配的类型。允许的值：

  - `text`
  - `children` (仅允许直接子组件不匹配)
  - `class`
  - `style`
  - `attribute`

  不提供值时，允许所有类型的不匹配。
