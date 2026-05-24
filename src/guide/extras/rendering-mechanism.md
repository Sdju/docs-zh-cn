---
outline: deep
---

# 渲染机制 {#rendering-mechanism}

模板是怎么变成真实 DOM 的？Vue 又是怎么高效更新节点的？下面从 Vue 内部渲染机制说起。

## 虚拟 DOM {#virtual-dom}

你可能听过「虚拟 DOM」。Vue 的渲染系统就建立在这个概念上。

虚拟 DOM (VDOM) 是一种编程思路：用数据结构在内存里「虚拟」表示目标 UI，再和真实 DOM 同步。[React](https://reactjs.org/) 最早推广，后来很多框架采用，Vue 也是其一。

与其说虚拟 DOM 是具体技术，不如说是一种模式，没有标准实现。简单例子：

```js
const vnode = {
  type: 'div',
  props: {
    id: 'hello'
  },
  children: [
    /* 更多 vnode */
  ]
}
```

这里的 `vnode` 是纯 JavaScript 对象（「虚拟节点」），代表一个 `<div>`，包含创建真实元素所需的信息，子节点让它成为虚拟 DOM 树的根。

运行时渲染器会遍历整棵虚拟 DOM 树，据此构建真实 DOM 树，这个过程叫**挂载** (mount)。

若有两棵虚拟 DOM 树，渲染器会比较它们，找出差异，应用到真实 DOM 上。这叫**更新** (patch)，也叫「比对」(diffing) 或「协调」(reconciliation)。

虚拟 DOM 的主要好处是：你可以灵活、声明式地描述 UI 结构，具体 DOM 操作交给渲染器。

## 渲染管线 {#render-pipeline}

从高层看，Vue 组件挂载时大致会：

1. **编译**：Vue 模板编译成**渲染函数**——返回虚拟 DOM 树的函数。可在构建时提前完成，或用运行时编译器即时完成。

2. **挂载**：运行时渲染器调用渲染函数，遍历虚拟 DOM 树，创建真实 DOM。这一步作为[响应式副作用](./reactivity-in-depth)执行，会追踪用到的响应式依赖。

3. **更新**：依赖变化后，副作用重新运行，生成新的虚拟 DOM 树。渲染器比较新旧树，把必要更新应用到真实 DOM。

![render pipeline](./images/render-pipeline.png)

<!-- https://www.figma.com/file/elViLsnxGJ9lsQVsuhwqxM/Rendering-Mechanism -->

## 模板 vs. 渲染函数 {#templates-vs-render-functions}

Vue 模板会预编译成虚拟 DOM 渲染函数。Vue 也提供 API，可以不写模板、直接手写渲染函数。高度动态的逻辑里，渲染函数比模板更灵活，因为可以用 JavaScript 自由构造 vnode。

那为什么 Vue 默认推荐模板？主要有：

1. 模板更接近真实 HTML，方便复用已有 HTML、做无障碍、用 CSS、也让设计师更好改。

2. 语法固定，便于静态分析。模板编译器能做很多编译时优化，提升虚拟 DOM 性能（下文会讲）。

实践中，模板对大多数场景够用且高效。渲染函数一般只在需要高度动态逻辑的可复用组件里用。更多细节见[渲染函数 & JSX](./render-function)。

## 带编译时信息的虚拟 DOM {#compiler-informed-virtual-dom}

React 和多数实现里，虚拟 DOM 是纯运行时的：更新算法不知道新树长什么样，只能遍历整棵树、比对每个 vnode 的 props。即使某部分从未变化，每次重渲染仍会新建 vnode，带来多余内存压力。这也是虚拟 DOM 常被诟病的一点：用效率换声明式写法和正确性。

其实不必如此。Vue 同时控制编译器和运行时，可以对紧耦合的模板渲染器做很多编译时优化。编译器可静态分析模板，在生成代码里打标记，让运行时走捷径；同时仍保留用户手写底层渲染函数的能力。这种混合方案叫**带编译时信息的虚拟 DOM**。

下面介绍 Vue 编译器提升虚拟 DOM 运行时性能的主要优化：

### 缓存静态内容 {#cache-static}

模板里常有不带动态绑定的部分：

```vue-html{2-3}
<div>
  <div>foo</div> <!-- 需缓存 -->
  <div>bar</div> <!-- 需缓存 -->
  <div>{{ dynamic }}</div>
</div>
```

[在模板编译预览中查看](https://template-explorer.vuejs.org/#eyJzcmMiOiI8ZGl2PlxuICA8ZGl2PmZvbzwvZGl2PiA8IS0tIGNhY2hlZCAtLT5cbiAgPGRpdj5iYXI8L2Rpdj4gPCEtLSBjYWNoZWQgLS0+XG4gIDxkaXY+e3sgZHluYW1pYyB9fTwvZGl2PlxuPC9kaXY+XG4iLCJvcHRpb25zIjp7ImhvaXN0U3RhdGljIjp0cnVlfX0=)

`foo` 和 `bar` 两个 div 完全静态，重渲染时不必再创建和比对。首次渲染时渲染器会缓存这部分 vnode，之后直接用缓存；新旧 vnode 在这部分相同，会跳过差异比对。

连续静态元素够多时，还会压成「静态 vnode」，里面是相应节点的 HTML 字符串。([示例](https://template-explorer.vuejs.org/#eyJzcmMiOiI8ZGl2PlxuICA8ZGl2IGNsYXNzPVwiZm9vXCI+Zm9vPC9kaXY+XG4gIDxkaXYgY2xhc3M9XCJmb29cIj5mb288L2Rpdj5cbiAgPGRpdiBjbGFzcz1cImZvb1wiPmZvbzwvZGl2PlxuICA8ZGl2IGNsYXNzPVwiZm9vXCI+Zm9vPC9kaXY+XG4gIDxkaXYgY2xhc3M9XCJmb29cIj5mb288L2Rpdj5cbiAgPGRpdj57eyBkeW5hbWljIH19PC9kaXY+XG48L2Rpdj4iLCJzc3IiOmZhbHNlLCJvcHRpb25zIjp7ImhvaXN0U3RhdGljIjp0cnVlfX0=))，通过 `innerHTML` 挂载。

### 更新类型标记 {#patch-flags}

对单个有动态绑定的元素，编译时可以推断很多信息：

```vue-html
<!-- 仅含 class 绑定 -->
<div :class="{ active }"></div>

<!-- 仅含 id 和 value 绑定 -->
<input :id="id" :value="value">

<!-- 仅含文本子节点 -->
<div>{{ dynamic }}</div>
```

[在模板编译预览中查看](https://template-explorer.vuejs.org/#eyJzcmMiOiI8ZGl2IDpjbGFzcz1cInsgYWN0aXZlIH1cIj48L2Rpdj5cblxuPGlucHV0IDppZD1cImlkXCIgOnZhbHVlPVwidmFsdWVcIj5cblxuPGRpdj57eyBkeW5hbWljIH19PC9kaXY+Iiwib3B0aW9ucyI6e319)

生成渲染函数时，Vue 会在 vnode 创建调用里直接编码每个元素需要的更新类型：

```js{3}
createElementVNode("div", {
  class: _normalizeClass({ active: _ctx.active })
}, null, 2 /* CLASS */)
```

最后的参数 `2` 是[更新类型标记 (patch flag)](https://github.com/vuejs/core/blob/main/packages/shared/src/patchFlags.ts)。一个元素可有多个标记，合并成一个数字。运行时渲染器用[位运算](https://en.wikipedia.org/wiki/Bitwise_operation)检查标记，决定更新操作：

```js
if (vnode.patchFlag & PatchFlags.CLASS /* 2 */) {
  // 更新节点的 CSS class
}
```

位运算很快。有了更新类型标记，Vue 更新带动态绑定的元素时只需做最少操作。

Vue 也会给 vnode 子节点打类型标记。例如多根节点模板表示为片段 (fragment)，多数情况下子节点顺序不变，这个信息可作为更新类型标记交给运行时。

```js{4}
export function render() {
  return (_openBlock(), _createElementBlock(_Fragment, null, [
    /* children */
  ], 64 /* STABLE_FRAGMENT */))
}
```

运行时会跳过对这个根片段子元素顺序的重新协调。

### 树结构打平 {#tree-flattening}

看上面例子生成的代码，虚拟 DOM 树由特殊的 `createElementBlock()` 创建：

```js{2}
export function render() {
  return (_openBlock(), _createElementBlock(_Fragment, null, [
    /* children */
  ], 64 /* STABLE_FRAGMENT */))
}
```

这里引入「区块」：内部结构稳定的一部分可称为一个区块。这个用例里整份模板只有一个区块，因为没有 `v-if` 或 `v-for` 等结构性指令。

每个块会追踪所有带更新类型标记的后代（不只是直接子节点），例如：

```vue-html{3,5}
<div> <!-- root block -->
  <div>...</div>         <!-- 不会追踪 -->
  <div :id="id"></div>   <!-- 要追踪 -->
  <div>                  <!-- 不会追踪 -->
    <div>{{ bar }}</div> <!-- 要追踪 -->
  </div>
</div>
```

编译结果会打平成数组，只含所有动态后代：

```
div (block root)
- div 带有 :id 绑定
- div 带有 {{ bar }} 绑定
```

组件重渲染时，只需遍历这棵打平的树，而不是整棵树。这就是**树结构打平**，大大减少虚拟 DOM 协调时要遍历的节点数，静态部分会被高效跳过。

`v-if` 和 `v-for` 会创建新区块：

```vue-html
<div> <!-- 根区块 -->
  <div>
    <div v-if> <!-- if 区块 -->
      ...
    </div>
  </div>
</div>
```

子区块会在父区块的动态子节点数组里被追踪，从而为父区块保留稳定结构。

### 对 SSR 激活的影响 {#impact-on-ssr-hydration}

更新类型标记和树结构打平都明显提升了 Vue [SSR 激活](/guide/scaling-up/ssr#client-hydration) 的性能：

- 单个元素激活可根据 vnode 的更新类型标记走更快路径。

- 激活时只需遍历区块节点及其动态子节点，模板层面可实现更高效的部分激活。
