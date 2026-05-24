# 组件 {#components}

到目前为止，我们只用了单个组件。真正的 Vue 应用通常由嵌套组件组成。

父组件可以在模板里渲染另一个组件作为子组件。要用子组件，需要先导入它：

<div class="composition-api">
<div class="sfc">

```js
import ChildComp from './ChildComp.vue'
```

</div>
</div>

<div class="options-api">
<div class="sfc">

```js
import ChildComp from './ChildComp.vue'

export default {
  components: {
    ChildComp
  }
}
```

我们还需要用 `components` 选项注册组件。这里用对象属性的简写形式，在 `ChildComp` 键下注册 `ChildComp` 组件。

</div>
</div>

<div class="sfc">

然后就可以在模板里使用组件：

```vue-html
<ChildComp />
```

</div>

<div class="html">

```js
import ChildComp from './ChildComp.js'

createApp({
  components: {
    ChildComp
  }
})
```

我们还需要用 `components` 选项注册组件。这里用对象属性的简写形式，在 `ChildComp` 键下注册 `ChildComp` 组件。

因为我们在 DOM 里写模板语法，所以要遵循浏览器的大小写敏感规则。因此，引用子组件时要用 kebab-case 名字：

```vue-html
<child-comp></child-comp>
```

</div>


现在自己试试——导入子组件并在模板里渲染它。
