<script setup>
import SwitchComponent from './keep-alive-demos/SwitchComponent.vue'
</script>

# KeepAlive {#keepalive}

`<KeepAlive>` 是内置组件，用来在多个组件之间切换时，缓存被切走的组件实例。

## 基本使用 {#basic-usage}

在组件基础一章里，我们讲过用 `<component>` 做[动态组件](/guide/essentials/component-basics#dynamic-components)：

```vue-html
<component :is="activeComponent" />
```

默认情况下，组件被换掉后，旧实例会被销毁，里面的状态也会一起丢掉。再次显示时，会新建一个只有初始状态的新实例。

下面的例子里有两个带状态的组件：A 有计数器，B 用 `v-model` 同步输入框文字。你先改一下任意一边的状态，再切走、再切回来：

<SwitchComponent />

切回来后，你会发现之前改过的状态都没了。

多数时候，切换时新建实例是合理的；但这个例子里，我们希望组件被切走时仍保留状态。可以用 `<KeepAlive>` 包住动态组件：

```vue-html
<!-- 非活跃的组件将会被缓存！ -->
<KeepAlive>
  <component :is="activeComponent" />
</KeepAlive>
```

这样切换时，状态就能保留了：

<SwitchComponent use-KeepAlive />

<div class="composition-api">

[在演练场中尝试一下](https://play.vuejs.org/#eNqtUsFOwzAM/RWrl4IGC+cqq2h3RFw495K12YhIk6hJi1DVf8dJSllBaAJxi+2XZz8/j0lhzHboeZIl1NadMA4sd73JKyVaozsHI9hnJqV+feJHmODY6RZS/JEuiL1uTTEXtiREnnINKFeAcgZUqtbKOqj7ruPKwe6s2VVguq4UJXEynAkDx1sjmeMYAdBGDFBLZu2uShre6ioJeaxIduAyp0KZ3oF7MxwRHWsEQmC4bXXDJWbmxpjLBiZ7DwptMUFyKCiJNP/BWUbO8gvnA+emkGKIgkKqRrRWfh+Z8MIWwpySpfbxn6wJKMGV4IuSs0UlN1HVJae7bxYvBuk+2IOIq7sLnph8P9u5DJv5VfpWWLaGqTzwZTCOM/M0IaMvBMihd04ruK+lqF/8Ajxms8EFbCiJxR8khsP6ncQosLWnWV6a/kUf2nqu75Fby04chA0iPftaYryhz6NBRLjdtajpHZTWPio=)

</div>
<div class="options-api">

[在演练场中尝试一下](https://play.vuejs.org/#eNqtU8tugzAQ/JUVl7RKWveMXFTIseofcHHAiawasPxArRD/3rVNSEhbpVUrIWB3x7PM7jAkuVL3veNJmlBTaaFsVraiUZ22sO0alcNedw2s7kmIPHS1ABQLQDEBAMqWvwVQzffMSQuDz1aI6VreWpPCEBtsJppx4wE1s+zmNoIBNLdOt8cIjzut8XAKq3A0NAIY/QNveFEyi8DA8kZJZjlGALQWPVSSGfNYJjVvujIJeaxItuMyo6JVzoJ9VxwRmtUCIdDfNV3NJWam5j7HpPOY8BEYkwxySiLLP1AWkbK4oHzmXOVS9FFOSM3jhFR4WTNfRslcO54nSwJKcCD4RsnZmJJNFPXJEl8t88quOuc39fCrHalsGyWcnJL62apYNoq12UQ8DLEFjCMy+kKA7Jy1XQtPlRTVqx+Jx6zXOJI1JbH4jejg3T+KbswBzXnFlz9Tjes/V/3CjWEHDsL/OYNvdCE8Wu3kLUQEhy+ljh+brFFu)

</div>

:::tip
在 [DOM 内模板](/guide/essentials/component-basics#in-dom-template-parsing-caveats)里，标签要写成 `<keep-alive>`。
:::

## 包含/排除 {#include-exclude}

`<KeepAlive>` 默认会缓存里面所有组件实例。可以用 `include` 和 `exclude` 两个 prop 控制要缓存谁。它们的值可以是：英文逗号分隔的字符串、正则表达式，或数组：

```vue-html
<!-- 以英文逗号分隔的字符串 -->
<KeepAlive include="a,b">
  <component :is="view" />
</KeepAlive>

<!-- 正则表达式 (需使用 `v-bind`) -->
<KeepAlive :include="/a|b/">
  <component :is="view" />
</KeepAlive>

<!-- 数组 (需使用 `v-bind`) -->
<KeepAlive :include="['a', 'b']">
  <component :is="view" />
</KeepAlive>
```

匹配依据是组件的 [`name`](/api/options-misc#name)。想按条件被 `KeepAlive` 缓存，组件需要声明 `name`。

:::tip
3.2.34 及以上：用 `<script setup>` 的单文件组件会按文件名自动生成 `name`，一般不用手写。
:::

## 最大缓存实例数 {#max-cached-instances}

用 `max` prop 可以限制最多缓存多少个实例。设了 `max` 之后，`<KeepAlive>` 类似 [LRU 缓存](<https://en.wikipedia.org/wiki/Cache_replacement_policies#Least_recently_used_(LRU)>)：快满时，会先清掉最久没用过的实例，给新的腾地方。

```vue-html
<KeepAlive :max="10">
  <component :is="activeComponent" />
</KeepAlive>
```

## 缓存实例的生命周期 {#lifecycle-of-cached-instance}

组件从 DOM 上拿掉，但被 `<KeepAlive>` 缓存时，不会真正卸载，只是变成**不活跃**。再次插回 DOM 时，会重新**激活**。

<div class="composition-api">

一直留在树里的组件，可以用 [`onActivated()`](/api/composition-api-lifecycle#onactivated) 和 [`onDeactivated()`](/api/composition-api-lifecycle#ondeactivated) 监听激活、停用：

```vue
<script setup>
import { onActivated, onDeactivated } from 'vue'

onActivated(() => {
  // 调用时机为首次挂载
  // 以及每次从缓存中被重新插入时
})

onDeactivated(() => {
  // 在从 DOM 上移除、进入缓存
  // 以及组件卸载时调用
})
</script>
```

</div>
<div class="options-api">

一直留在树里的组件，可以用 [`activated`](/api/options-lifecycle#activated) 和 [`deactivated`](/api/options-lifecycle#deactivated) 监听激活、停用：

```js
export default {
  activated() {
    // 在首次挂载、
    // 以及每次从缓存中被重新插入的时候调用
  },
  deactivated() {
    // 在从 DOM 上移除、进入缓存
    // 以及组件卸载时调用
  }
}
```

</div>

请注意：

- <span class="composition-api">`onActivated`</span><span class="options-api">`activated`</span> 首次挂载时也会触发；<span class="composition-api">`onDeactivated`</span><span class="options-api">`deactivated`</span> 在组件卸载时也会触发。

- 这两个钩子不只作用于 `<KeepAlive>` 包住的根组件，缓存树里的子组件也会触发。
---

**参考**

- [`<KeepAlive>` API 参考](/api/built-in-components#keepalive)
