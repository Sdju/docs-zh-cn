# 生命周期钩子 {#lifecycle-hooks}

每个 Vue 组件实例创建时都会经历一系列初始化：设置数据侦听、编译模板、挂载到 DOM，以及在数据变化时更新 DOM。过程中会运行叫**生命周期钩子**的函数，让你在特定阶段写自己的代码。

## 注册周期钩子 {#registering-lifecycle-hooks}

例如，<span class="composition-api">`onMounted`</span><span class="options-api">`mounted`</span> 钩子可以在组件完成初次渲染、DOM 节点创建好之后执行代码：

<div class="composition-api">

```vue
<script setup>
import { onMounted } from 'vue'

onMounted(() => {
  console.log(`the component is now mounted.`)
})
</script>
```

</div>
<div class="options-api">

```js
export default {
  mounted() {
    console.log(`the component is now mounted.`)
  }
}
```

</div>

还有其他钩子会在生命周期的不同阶段调用。最常用的是 <span class="composition-api">[`onMounted`](/api/composition-api-lifecycle#onmounted)、[`onUpdated`](/api/composition-api-lifecycle#onupdated) 和 [`onUnmounted`](/api/composition-api-lifecycle#onunmounted)。完整列表和用法见 [API 索引](/api/composition-api-lifecycle.html)。</span><span class="options-api">[`mounted`](/api/options-lifecycle#mounted)、[`updated`](/api/options-lifecycle#updated) 和 [`unmounted`](/api/options-lifecycle#unmounted)。</span>

<div class="options-api">

所有生命周期钩子里的 `this` 会自动指向当前组件实例。注意：不要用箭头函数定义生命周期钩子，否则在函数里无法用 `this` 拿到组件实例。

</div>

<div class="composition-api">

调用 `onMounted` 时，Vue 会把回调注册到当前正在初始化的组件实例上。所以这些钩子要在组件初始化时**同步**注册。例如，不要这样做：

```js
setTimeout(() => {
  onMounted(() => {
    // 异步注册时当前组件实例已丢失
    // 这将不会正常工作
  })
}, 100)
```

这不代表 `onMounted` 必须写在 `setup()` 或 `<script setup>` 的词法上下文里。只要调用栈是同步的，且最终来自 `setup()`，`onMounted()` 也可以在外部函数里调用。

</div>

## 生命周期图示 {#lifecycle-diagram}

下面是实例生命周期的图示。你现在不必全懂，以后会是很好的参考。

![组件生命周期图示](./images/lifecycle_zh-CN.png)

<!-- https://www.figma.com/file/Xw3UeNMOralY6NV7gSjWdS/Vue-Lifecycle -->
<!-- https://www.figma.com/file/QHo4ehJ4TRx3f7gzRP1F1k/Vue-Lifecycle-(zh-CN) -->

各生命周期钩子及用法的详情，见<span class="composition-api">[生命周期钩子 API 索引](/api/composition-api-lifecycle)</span><span class="options-api">[生命周期钩子 API 索引](/api/options-lifecycle)</span>。
