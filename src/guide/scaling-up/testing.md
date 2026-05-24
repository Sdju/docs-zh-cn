<script setup>
import { VTCodeGroup, VTCodeGroupTab } from '@vue/theme'
</script>
<style>
.lambdatest {
  background-color: var(--vt-c-bg-soft);
  border-radius: 8px;
  padding: 12px 16px 12px 12px;
  font-size: 13px;
  a {
    display: flex;
    color: var(--vt-c-text-2);
  }
  img {
    background-color: #fff;
    padding: 12px 16px;
    border-radius: 6px;
    margin-right: 24px;
  }
  .testing-partner {
    color: var(--vt-c-text-1);
    font-size: 15px;
    font-weight: 600;
  }
}
</style>

# 测试 {#testing}

## 为什么需要测试 {#why-test}

自动化测试能减少无意引入的 bug，并鼓励你把应用拆成可测试、可维护的函数、模块、类和组件。团队可以更快、更放心地开发复杂 Vue 应用。和任何应用一样，Vue 项目也可能以多种方式出错，发布前发现问题很重要。

本篇会介绍基本术语，并给出 Vue 3 测试工具的建议。

另有专门小节讲[测试组合式函数](#testing-composables)。

## 何时测试 {#when-to-test}

越早越好。建议尽快开始写测试。拖得越久，依赖和复杂度越高，补测试就越难。

## 测试的类型 {#testing-types}

设计 Vue 测试策略时，通常会用到这几类：

- **单元测试**：检查函数、类或组合式函数的输入是否产生预期输出或副作用。
- **组件测试**：检查组件能否挂载、渲染、交互，行为是否符合预期。比单元测试导入更多代码，更慢。
- **端到端测试 (E2E)**：跨多个页面验证功能，并对生产构建发真实网络请求。常需要数据库或其他后端。

各类测试各防一类问题，应组合使用。

## 总览 {#overview}

下面简要说明这些测试是什么、在 Vue 里怎么做，并给出一些通用建议。

## 单元测试 {#unit-testing}

单元测试验证小的、独立的代码单元是否按预期工作。通常覆盖单个函数、类、组合式函数或模块，只关注应用的一小块逻辑，可能会 mock 环境（初始状态、复杂类、第三方模块、网络请求）。

单元测试主要发现业务逻辑错误。

例如 `increment` 函数：

```js [helpers.js]
export function increment(current, max = 10) {
  if (current < max) {
    return current + 1
  }
  return current
}
```

它很独立，可以直接调用并断言返回值，适合写单元测试。

任一断言失败，问题就在 `increment` 里。

```js{3-15} [helpers.spec.js]
import { increment } from './helpers'

describe('increment', () => {
  test('increments the current number by 1', () => {
    expect(increment(0, 10)).toBe(1)
  })

  test('does not increment the current number over the max', () => {
    expect(increment(10, 10)).toBe(10)
  })

  test('has a default max of 10', () => {
    expect(increment(10)).toBe(10)
  })
})
```

单元测试通常针对独立业务逻辑，不涉及 UI 渲染、网络等环境问题。

这类代码多是与 Vue 无关的纯 JavaScript/TypeScript。为业务逻辑写单元测试，和其他框架差别不大。

但有两类情况需要针对 Vue 特性测试：

1. 组合式函数
2. 组件

### 组合式函数 {#composables}

[组合式函数](/guide/reusability/composables) 是 Vue 特有概念，测试时可能需要特殊处理。见下方[测试组合式函数](#testing-composables)。

### 组件的单元测试 {#unit-testing-components}

测组件有两种思路：

1. **白盒（单元测试）**

   了解实现细节和依赖，尽量把组件单独测，常会 mock 子组件、插件状态（如 Pinia）等。

2. **黑盒（组件测试）**

   不了解实现细节，尽量少 mock，测组件在系统中的集成，通常会渲染子组件，更像“集成测试”。见下方[组件测试](#component-testing)。

### 推荐方案 {#recommendation}

- [Vitest](https://vitest.dev/)

  `create-vue` 默认基于 [Vite](https://cn.vitejs.dev/)，推荐用能复用同一套 Vite 配置的测试框架。[Vitest](https://cn.vitest.dev/) 由 Vue / Vite 团队维护，集成简单、速度快。

### 其他选择 {#other-options}

- [Jest](https://jestjs.io/) 很流行。若你已有 Jest 配置、正在迁到 Vite，可以继续用；否则更推荐 Vitest，集成和性能更好。

## 组件测试 {#component-testing}

Vue 应用主要靠组件构建 UI，因此组件测试是自然的测试单元。从粒度上看，它介于单元测试和集成测试之间。建议每个 Vue 组件都有自己的组件测试文件。

组件测试应覆盖 props、事件、插槽、样式、CSS class、生命周期钩子等对外行为。

**不要**为了测组件而去 mock 子组件。应像用户一样通过交互测试父子关系，例如点击元素，而不是在代码里直接调组件内部 API。

组件测试关注**公开接口**（事件、props、插槽），而不是内部实现。

- **推荐做法**

  - **视图**：根据 props 和插槽断言渲染结果。
  - **交互**：断言 DOM 更新或事件是否响应用户操作。

  下面是一个 Stepper 组件：有可点击的 `increment` 元素，以及 `max` prop。`max` 为 2 时，点 3 次仍应显示 2。

  我们不必知道实现细节，只知道输入是 `max` prop，输出是界面上的数字。

::: code-group

```js [Vue Test Utils]
const valueSelector = '[data-testid=stepper-value]'
const buttonSelector = '[data-testid=increment]'

const wrapper = mount(Stepper, {
  props: {
    max: 1
  }
})

expect(wrapper.find(valueSelector).text()).toContain('0')

await wrapper.find(buttonSelector).trigger('click')

expect(wrapper.find(valueSelector).text()).toContain('1')
```

```js [Cypress]
const valueSelector = '[data-testid=stepper-value]'
const buttonSelector = '[data-testid=increment]'

mount(Stepper, {
  props: {
    max: 1
  }
})

cy.get(valueSelector)
  .should('be.visible')
  .and('contain.text', '0')
  .get(buttonSelector)
  .click()
  .get(valueSelector)
  .should('contain.text', '1')
```

```js [Testing Library]
const { getByText } = render(Stepper, {
  props: {
    max: 1
  }
})

getByText('0') // Implicit assertion that "0" is within the component

const button = getByRole('button', { name: /increment/i })

// Dispatch a click event to our increment button.
await fireEvent.click(button)

getByText('1')

await fireEvent.click(button)
```

:::

**应避免的做法**

- 不要断言组件实例的私有状态，也不要测私有方法。测实现细节会让测试很脆，一改实现就要大改测试。

  组件的职责是输出正确 DOM，专注 DOM 的测试通常够用，也更稳。

- 不要只靠快照测试。比对 HTML 字符串不能说明行为是否正确，应写有明确意图的测试。

- 若某个方法值得单独测，抽成工具函数并写单元测试；若不好抽取，把它当作交互测试的一部分。

### 推荐方案 {#recommendation-1}

- [Vitest](https://vitest.dev/) 用无头方式渲染组件和组合式函数（如 VueUse 的 [`useFavicon`](https://vueuse.org/core/useFavicon/#usefavicon)）。组件和 DOM 可用 [@vue/test-utils](https://github.com/vuejs/test-utils)。

- [Cypress 组件测试](https://on.cypress.io/component) 在真实浏览器里测样式和原生 DOM 事件，可配合 [@testing-library/cypress](https://testing-library.com/docs/cypress-testing-library/intro)。

Vitest 与浏览器运行器的主要区别是速度和运行环境。浏览器运行器（如 Cypress）能发现 Node 运行器（如 Vitest）难以发现的问题（样式、原生事件、Cookie、localStorage、网络故障），但通常**慢几个数量级**（要启动浏览器、编译样式等）。Cypress 支持组件测试。Vitest 与 Cypress 的对比见 [Vitest 文档「比较」](https://vitest.dev/guide/comparisons.html#cypress)。

### 组件挂载库 {#mounting-libraries}

组件测试常要：单独挂载组件、模拟用户输入、断言 DOM。以下库可以简化这些步骤：

- [`@vue/test-utils`](https://github.com/vuejs/test-utils)：官方底层库，暴露 Vue 特有 API。[`@testing-library/vue`](https://github.com/testing-library/vue-testing-library) 基于它构建。

- [`@testing-library/vue`](https://github.com/testing-library/vue-testing-library)：强调像用户一样测试，少依赖实现细节。

推荐在项目中用 `@vue/test-utils`。`@testing-library/vue` 测带 Suspense 的异步组件时可能有问题，需谨慎。

### 其他选择 {#other-options-1}

- [Nightwatch](https://v2.nightwatchjs.org/) 是 E2E 运行器，也支持 Vue 组件测试（[示例](https://github.com/nightwatchjs-community/todo-vue)）。

- [WebdriverIO](https://webdriver.io/docs/component-testing/vue) 做跨浏览器组件测试，依赖标准 WebDriver 交互，也可配合 Testing Library。

## 端到端 (E2E) 测试 {#e2e-testing}

单元测试和组件测试无法覆盖上线后的全部行为。E2E 测试关注**真实用户使用时**应用是否正常。

E2E 侧重多页面行为，对生产构建发网络请求，常要搭数据库或后端，有时在预发布环境运行。它能发现路由、状态库、顶层组件（如 App / Layout）、静态资源、请求处理等问题——这些是单元/组件测试难以覆盖的。

E2E 不导入 Vue 源码，而是在真实浏览器里浏览整个应用。

可在本地构建产物或预发布环境运行。预发布环境会连上真实后端和基础设施。

> 测试越接近真实使用方式，你就越能信任它。—— [Kent C. Dodds](https://twitter.com/kentcdodds/status/977018512689455106)（Testing Library 作者）

通过模拟用户操作，E2E 测试最能提高“应用能正常工作”的信心。

### 选择一个端到端测试解决方案 {#choosing-an-e2e-testing-solution}

历史上 E2E 常被批评为不稳定、拖慢开发，但现代工具已改进很多。选型时可参考下面几点。

#### 跨浏览器测试 {#cross-browser-testing}

E2E 的一大优势是能在多种浏览器里验证应用。100% 跨浏览器覆盖是理想目标，但成本会递增（更多机器、更长的 CI 时间）。要在覆盖率和资源之间权衡。

#### 更快的反馈 {#faster-feedback-loops}

E2E 套件跑完全部用例往往很慢，通常只在 CI/CD 里跑。现代框架通过并行等方式加速；本地开发时，能只跑当前页面的单个测试并热重载，会明显提升效率。

#### 第一优先级的调试体验 {#first-class-debugging-experience}

以前常靠看终端日志排错；现代 E2E 可直接用浏览器开发者工具调试。

#### 无头模式下的可见性 {#visibility-in-headless-mode}

CI 里常在无头浏览器运行。出错时，快照、录像等能帮助定位问题；以前要手动接这些能力，很麻烦。

### 推荐方案 {#recommendation-2}

- [Playwright](https://playwright.dev/)：支持 Chromium、WebKit、Firefox；可在 Windows / Linux / macOS 本地或 CI 运行，支持无头模式与移动端模拟；UI、调试、断言、并行、追踪较完善；[组件测试](https://playwright.dev/docs/test-components) 为实验功能。由微软维护。

- [Cypress](https://www.cypress.io/)：图形界面友好，调试方便，内置断言、stub、抗 flaky、并行、快照；也支持[组件测试](https://docs.cypress.io/guides/component-testing/introduction)。支持 Chromium 系、Firefox、Electron；WebKit 为实验支持。MIT 许可，但并行等部分功能需 Cypress Cloud 订阅。

<div class="lambdatest">
  <a href="https://lambdatest.com" target="_blank">
    <img src="/images/lambdatest.svg">
    <div>
      <div class="testing-partner">测试赞助商</div>
      <div>Lambdatest 是云平台，可在主流浏览器和真机上运行 E2E、可访问性与视觉回归测试，并提供 AI 辅助生成测试。</div>
    </div>
  </a>
</div>

### 其他选项 {#other-options-2}

- [Nightwatch](https://nightwatchjs.org/) 基于 [Selenium WebDriver](https://www.npmjs.com/package/selenium-webdriver)，浏览器支持最广，含原生移动端；通常比 Playwright 或 Cypress 慢。

- [WebdriverIO](https://webdriver.io/) 基于 WebDriver 协议，用于 Web 与移动端自动化。

## 用例指南 {#recipes}

### 添加 Vitest 到项目中 {#adding-vitest-to-a-project}

在基于 Vite 的 Vue 项目中运行：

```sh
> npm install -D vitest happy-dom @testing-library/vue
```

在 Vite 配置里添加 `test` 选项：

```js{5-11} [vite.config.js]
import { defineConfig } from 'vite'

export default defineConfig({
  // ...
  test: {
    // 启用类似 jest 的全局测试 API
    globals: true,
    // 使用 happy-dom 模拟 DOM
    // 这需要你安装 happy-dom 作为对等依赖 (peer dependency)
    environment: 'happy-dom'
  }
})
```

:::tip
若使用 TypeScript，在 `tsconfig.json` 的 `types` 中加入 `vitest/globals`：

```json [tsconfig.json]
{
  "compilerOptions": {
    "types": ["vitest/globals"]
  }
}
```

:::

创建以 `*.test.js` 结尾的文件。可放在项目根目录的 `test` 下，或源文件旁的 `test` 目录。Vitest 会按命名规则自动发现。

```js [MyComponent.test.js]
import { render } from '@testing-library/vue'
import MyComponent from './MyComponent.vue'

test('it should work', () => {
  const { getByText } = render(MyComponent, {
    props: {
      /* ... */
    }
  })

  // 断言输出
  getByText('...')
})
```

在 `package.json` 添加测试脚本并运行：

```json{4} [package.json]
{
  // ...
  "scripts": {
    "test": "vitest"
  }
}
```

```sh
> npm test
```

### 测试组合式函数 {#testing-composables}

> 请先阅读[组合式函数](/guide/reusability/composables)一章。

可按是否依赖宿主组件实例，把组合式函数分成两类。

若使用了以下 API，就依赖宿主组件：

- 生命周期钩子
- provide / inject

若只用响应式 API，可直接调用并断言返回的状态或方法：

```js [counter.js]
import { ref } from 'vue'

export function useCounter() {
  const count = ref(0)
  const increment = () => count.value++

  return {
    count,
    increment
  }
}
```

```js [counter.test.js]
import { useCounter } from './counter.js'

test('useCounter', () => {
  const { count, increment } = useCounter()
  expect(count.value).toBe(0)

  increment()
  expect(count.value).toBe(1)
})
```

依赖生命周期或 provide/inject 的组合式函数，需要包在宿主组件里测试。可写辅助函数：

```js [test-utils.js]
import { createApp } from 'vue'

export function withSetup(composable) {
  let result
  const app = createApp({
    setup() {
      result = composable()
      // 忽略模板警告
      return () => {}
    }
  })
  app.mount(document.createElement('div'))
  // 返回结果与应用实例
  // 用来测试供给和组件卸载
  return [result, app]
}
```

```js [foo.test.js]
import { withSetup } from './test-utils'
import { useFoo } from './foo'

test('useFoo', () => {
  const [result, app] = withSetup(() => useFoo(123))
  // 为注入的测试模拟一方供给
  app.provide(...)
  // 执行断言
  expect(result.foo.value).toBe(1)
  // 如果需要的话可以这样触发
  app.unmount()
})
```

更复杂的组合式函数，用[组件测试](#component-testing) 写包装组件的测试往往更简单。

<!--
TODO more testing recipes can be added in the future e.g.
- How to set up CI via GitHub actions
- How to do mocking in component testing
-->

<!-- zhlint disabled -->
