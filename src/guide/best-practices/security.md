# 安全 {#security}

## 报告漏洞 {#reporting-vulnerabilities}

收到漏洞报告后，团队会优先处理。报告请发邮件至 [security@vuejs.org](mailto:security@vuejs.org)。

新漏洞不多见，但仍建议始终使用最新版 Vue 和官方配套库，让应用尽量安全。

## 首要规则：不要使用无法信赖的模板 {#rule-no-1-never-use-non-trusted-templates}

用 Vue 最基本的安全规则：**不要把不可信内容当作组件模板**。不可信模板等于允许任意 JavaScript 在应用里执行；若在 SSR 中执行，还可能攻击服务器。例如：

```js
Vue.createApp({
  template: `<div>` + userProvidedString + `</div>` // 永远不要这样做！
}).mount('#app')
```

Vue 模板会编译成 JavaScript，模板里的表达式在渲染时也会执行。受全局环境影响，Vue 很难在合理性能下彻底挡住恶意代码。最稳妥的做法是：模板内容始终可信，且由你自己控制。

## Vue 自身的安全机制 {#what-vue-does-to-protect-you}

### HTML 内容 {#html-content}

用模板或渲染函数时，内容都会自动转义。例如：

```vue-html
<h1>{{ userProvidedString }}</h1>
```

如果 `userProvidedString` 包含了：

```js
'<script>alert("hi")</script>'
```

那么它将被转义为如下的 HTML：

```vue-html
&lt;script&gt;alert(&quot;hi&quot;)&lt;/script&gt;
```

从而防止脚本注入。转义靠浏览器原生 API（如 `textContent`）完成，一般只有浏览器自身有漏洞时才会出问题。

### Attribute 绑定 {#attribute-bindings}

动态 attribute 绑定也会自动转义。例如：

```vue-html
<h1 :title="userProvidedString">
  hello
</h1>
```

如果 `userProvidedString` 包含了：

```js
'" onclick="alert(\'hi\')'
```

那么它将被转义为如下的 HTML：

```vue-html
&quot; onclick=&quot;alert('hi')
```

从而防止在解析 `title` 时注入 HTML。同样依赖 `setAttribute` 等原生 API。

## 潜在的危险 {#potential-dangers}

任何 Web 应用里，执行未经消毒的用户 HTML、CSS、JavaScript 都有风险，应尽量避免。有时风险可以接受。

例如 CodePen、JSFiddle 在 iframe 沙盒里运行用户代码。功能重要又难免有风险时，要自己权衡收益和最坏情况。

### 注入 HTML {#html-injection}

Vue 会自动转义 HTML，避免误注入可执行 HTML。**在确认 HTML 安全时**，仍可显式渲染 HTML：

- 使用模板：

  ```vue-html
  <div v-html="userProvidedHtml"></div>
  ```

- 使用渲染函数：

  ```js
  h('div', {
    innerHTML: this.userProvidedHtml
  })
  ```

- 以 JSX 形式使用渲染函数：

  ```jsx
  <div innerHTML={this.userProvidedHtml}></div>
  ```

:::warning 警告
用户提供的 HTML 不能当成 100% 安全，除非在 iframe 沙盒里，或只有该用户自己能看到。让用户写 Vue 模板也有类似风险。
:::

### URL 注入 {#url-injection}

在这样一个使用 URL 的场景中：

```vue-html
<a :href="userProvidedUrl">
  click me
</a>
```

若 URL 未消毒、仍可用 `javascript:` 执行脚本，就有安全风险。可用 [sanitize-url](https://www.npmjs.com/package/@braintree/sanitize-url) 等库，但要注意：**若必须在前端消毒 URL，说明后端没做好**。**用户提供的 URL 应先在后端消毒再入库**，这样所有客户端（含原生 App）都受益。即使消毒过，Vue 也不能保证链接目标一定安全。

### 样式注入 {#style-injection}

我们来看这样一个例子：

```vue-html
<a
  :href="sanitizedUrl"
  :style="userProvidedStyles"
>
  click me
</a>
```

假设 `sanitizedUrl` 已消毒，是普通 URL。但 `userProvidedStyles` 仍可能被用来搞「点击劫持」，例如在「登录」按钮上盖透明链接。若 `https://user-controlled-website.com/` 仿造你的登录页，还可能骗到账号密码。

若在 `<style>` 里插入用户 CSS，风险更大，因为能控制整页样式。所以 Vue 不允许在模板里这样写：

```vue-html
<style>{{ userProvidedStyles }}</style>
```

要避免点击劫持，建议只在 iframe 沙盒里让用户控制 CSS。或用样式绑定的[对象形式](/guide/essentials/class-and-style#object-syntax-2)，只开放少数安全属性，例如：

```vue-html
<a
  :href="sanitizedUrl"
  :style="{
    color: userProvidedColor,
    background: userProvidedBackground
  }"
>
  click me
</a>
```

### JavaScript 注入 {#javascript-injection}

强烈建议不要在 Vue 里渲染 `<script>`，模板和渲染函数不应有副作用。但插入可执行 JS 不只有这一种方式。

很多 HTML 属性可写 JS 字符串，如 `onclick`、`onfocus`、`onmouseenter`。不要把用户提供的 JS 绑到这些事件属性上。

:::warning 警告
用户提供的 JavaScript 不能当成 100% 安全，除非在 iframe 沙盒里，或只在该用户自己的页面执行。
:::

有时会收到「Vue 模板可 XSS」的报告。我们通常不认为这是 Vue 漏洞，因为下面两种场景很难由框架完全挡住：

1. 开发者把未消毒的用户内容当 Vue 模板渲染——本身就不安全，Vue 无法替你把关。

2. 把 Vue 挂到含 SSR 或用户 HTML 的节点上——和上面类似，且开发者可能没意识到。攻击者 HTML 在普通页面里可能安全，在 Vue 模板里却不安全。**不要把 Vue 挂到可能含 SSR 或用户内容的 DOM 上**。

## 最佳实践 {#best-practices}

基本规则：只要执行未消毒的用户 HTML、JavaScript 或 CSS，就可能被攻击。用 Vue、别的框架或不用框架都一样。

除上文[潜在危险](#potential-dangers)的建议外，建议阅读：

- [HTML5 安全手册](https://html5sec.org/)
- [OWASP 的跨站脚本攻击 (XSS) 防护手册](https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html)

再用这些知识检查依赖源码，看第三方组件是否会影响 DOM 渲染内容。

## 后端协调 {#backend-coordination}

CSRF/XSRF、XSSI 等 HTTP 安全问题主要由后端处理，不在 Vue 职责内。但仍应与后端沟通 API 用法，例如表单提交时带 CSRF 令牌。

## 服务端渲染 (SSR) {#server-side-rendering-ssr}

SSR 还有额外安全注意点，请遵循 [SSR 文档](/guide/scaling-up/ssr)里的最佳实践。
