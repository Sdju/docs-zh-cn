# 无障碍访问 {#accessibility}

Web 无障碍（也叫 a11y）是让网站人人都能用：有障碍的用户、网速慢、旧设备，或环境不便时也一样。例如视频加字幕，能帮听障用户或在嘈杂环境里用手机的人；文字对比度够高，对低视力和强光下看手机的人也有帮助。

想开始但不知从何入手？

可先读 [W3C 的 Web 无障碍规划与管理](https://www.w3.org/WAI/planning-and-managing/)。

## 跳过链接 {#skip-link}

每个页面顶部应加「跳到主内容」的链接，方便跳过重复的导航等内容。

通常放在 `App.vue` 顶部，作为全站第一个可聚焦元素：

```vue-html
<span ref="backToTop" tabindex="-1" />
<ul class="skip-links">
  <li>
    <a href="#main" ref="skipLink" class="skip-link">Skip to main content</a>
  </li>
</ul>
```

未聚焦时想隐藏该链接，可加：

```css
.skip-links {
  list-style: none;
}
.skip-link {
  white-space: nowrap;
  margin: 1em auto;
  top: 0;
  position: fixed;
  left: 50%;
  margin-left: -72px;
  opacity: 0;
}
.skip-link:focus {
  opacity: 1;
  background-color: white;
  padding: 0.5em;
  border: 1px solid black;
}
```

路由变化后，应把焦点回到页面开头（跳过链接之前）。用 `vue-router` 时，可对 `backToTop` 模板引用调用 `focus()`：

<div class="options-api">

```vue
<script>
export default {
  watch: {
    $route() {
      this.$refs.backToTop.focus()
    }
  }
}
</script>
```

</div>
<div class="composition-api">

```vue
<script setup>
import { ref, watch } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const backToTop = ref()

watch(
  () => route.path,
  () => {
    backToTop.value.focus()
  }
)
</script>
```

</div>

[阅读关于跳过链接到主要内容的文档](https://www.w3.org/WAI/WCAG21/Techniques/general/G1.html)

## 内容结构 {#content-structure}

无障碍很重要的一环是设计要便于实现。除颜色对比、字体、字号、语言外，还要想清楚内容怎么组织。

### 标题 {#headings}

用户常靠标题在页面里跳转。每个区块用清楚的标题，方便猜内容。标题方面建议：

- 按级别顺序嵌套标题：`<h1>` - `<h6>`
- 同一章节内不要跳级（例如从 h2 直接到 h4）
- 用真正的标题标签，不要只靠样式把普通文字做成「看起来像标题」

[阅读更多有关标题的信息](https://www.w3.org/TR/UNDERSTANDING-WCAG20/navigation-mechanisms-descriptive.html)

```vue-html
<main role="main" aria-labelledby="main-title">
  <h1 id="main-title">Main title</h1>
  <section aria-labelledby="section-title-1">
    <h2 id="section-title-1"> Section Title </h2>
    <h3>Section Subtitle</h3>
    <!-- 内容 -->
  </section>
  <section aria-labelledby="section-title-2">
    <h2 id="section-title-2"> Section Title </h2>
    <h3>Section Subtitle</h3>
    <!-- 内容 -->
    <h3>Section Subtitle</h3>
    <!-- 内容 -->
  </section>
</main>
```

### Landmarks {#landmarks}

[Landmark](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Roles/landmark_role) 标出页面主要区域，用辅助技术的用户可快速跳到各块。可用 [ARIA role](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Roles) 实现。

| HTML    | ARIA Role            | 地标的目的 |
|---------| -------------------- | --------- |
| header  | role="banner"        | 页头 / 站点标题 |
| nav     | role="navigation"    | 导航链接区 |
| main    | role="main"          | 主内容 |
| footer  | role="contentinfo"   | 页脚：版权、隐私链接等 |
| aside   | role="complementary" | 辅助主内容的侧边信息 |
| search  | role="search"        | 搜索区域 |
| form    | role="form"          | 表单区域 |
| section | role="region"        | 可单独导航的区块，需提供 label |

[阅读更多有关标题的细节](https://www.w3.org/TR/wai-aria-1.2/#landmark_roles)

## 语义化表单 {#semantic-forms}

做表单常用：`<form>`、`<label>`、`<input>`、`<textarea>`、`<button>`。

标签一般放在字段上方或左侧：

```vue-html
<form action="/dataCollectionLocation" method="post" autocomplete="on">
  <div v-for="item in formItems" :key="item.id" class="form-item">
    <label :for="item.id">{{ item.label }}: </label>
    <input
      :type="item.type"
      :id="item.id"
      :name="item.id"
      v-model="item.value"
    />
  </div>
  <button type="submit">Submit</button>
</form>
```

上面在表单上设了 `autocomplete='on'`，会作用于所有 input。也可给每个 input 单独设 [autocomplete](https://developer.mozilla.org/en-US/docs/Web/HTML/Attributes/autocomplete)。

### 标签 {#labels}

用 `<label>` 说明每个控件的用途，`for` 与 `id` 对应：

```vue-html
<label for="name">Name: </label>
<input type="text" name="name" id="name" v-model="name" />
```

在 Chrome 开发者工具里打开 Elements → Accessibility，可看到 input 的名称来自 label：

![Chrome 开发者工具正在通过标签展示无障碍访问的 input 框的名字](./images/AccessibleLabelChromeDevTools.png)

:::warning 警告：
你可能还见过这样的包装 input 框的标签：

```vue-html
<label>
  Name：
  <input type="text" name="name" id="name" v-model="name" />
</label>
```

仍建议显式用 `for`/`id` 配对，无障碍效果更好。
:::

#### `aria-label` {#aria-label}

也可用 [`aria-label`](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Attributes/aria-label) 提供无障碍名称。

```vue-html
<label for="name">Name: </label>
<input
  type="text"
  name="name"
  id="name"
  v-model="name"
  :aria-label="nameLabel"
/>
```

在 Chrome DevTools 里查看，无障碍名称会随之变化：

![Chrome 开发者工具正在通过 aria-label 展示无障碍访问的 input 框名字](./images/AccessibleARIAlabelDevTools.png)

#### `aria-labelledby` {#aria-labelledby}

[`aria-labelledby`](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Attributes/aria-labelledby) 类似 `aria-label`，但标签要在屏幕上可见。通过 `id` 关联，可链多个 `id`：

```vue-html
<form
  class="demo"
  action="/dataCollectionLocation"
  method="post"
  autocomplete="on"
>
  <h1 id="billing">Billing</h1>
  <div class="form-item">
    <label for="name">Name: </label>
    <input
      type="text"
      name="name"
      id="name"
      v-model="name"
      aria-labelledby="billing name"
    />
  </div>
  <button type="submit">Submit</button>
</form>
```

![Chrome 开发者工具通过 aria-labelledby 展示 input 的无障碍访问名称](./images/AccessibleARIAlabelledbyDevTools.png)

#### `aria-describedby` {#aria-describedby}

[`aria-describedby`](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Attributes/aria-describedby) 用法类似，用于补充说明，例如输入格式要求：

```vue-html
<form
  class="demo"
  action="/dataCollectionLocation"
  method="post"
  autocomplete="on"
>
  <h1 id="billing">Billing</h1>
  <div class="form-item">
    <label for="name">Full Name: </label>
    <input
      type="text"
      name="name"
      id="name"
      v-model="name"
      aria-labelledby="billing name"
      aria-describedby="nameDescription"
    />
    <p id="nameDescription">Please provide first and last name.</p>
  </div>
  <button type="submit">Submit</button>
</form>
```

可在 Chrome 开发者工具里查看效果：

![Chrome 开发者工具正在根据 aria-labelledby 和 aria-describedby 展示 input 的无障碍访问名和无障碍访问描述信息](./images/AccessibleARIAdescribedby.png)

### 占位符 {#placeholder}

尽量避免用占位符（placeholder），容易让用户困惑。

占位符默认往往达不到[颜色对比度](https://www.w3.org/WAI/WCAG21/Understanding/contrast-minimum.html)要求；若要用，应改颜色，并避免让人误以为是已填好的值。下面示例里，对比度合格的占位符仍可能被当成预填内容：

![可访问的占位文本](./images/AccessiblePlaceholder.png)

```vue-html
<form
  class="demo"
  action="/dataCollectionLocation"
  method="post"
  autocomplete="on"
>
  <div v-for="item in formItems" :key="item.id" class="form-item">
    <label :for="item.id">{{ item.label }}: </label>
    <input
      type="text"
      :id="item.id"
      :name="item.id"
      v-model="item.value"
      :placeholder="item.placeholder"
    />
  </div>
  <button type="submit">Submit</button>
</form>
```

```css
/* https://www.w3schools.com/howto/howto_css_placeholder.asp */

#lastName::placeholder {
  /* Chrome, Firefox, Opera, Safari 10.1+ */
  color: black;
  opacity: 1; /* Firefox */
}

#lastName:-ms-input-placeholder {
  /* Internet Explorer 10-11 */
  color: black;
}

#lastName::-ms-input-placeholder {
  /* Microsoft Edge */
  color: black;
}
```

填写说明最好放在表单字段外面，不要只靠占位符。

### 用法说明 {#instructions}

加填写说明时，要正确关联到对应 input。
可在 [`aria-labelledby`](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Attributes/aria-labelledby) 里绑多个 id，布局更灵活。

```vue-html
<fieldset>
  <legend>Using aria-labelledby</legend>
  <label id="date-label" for="date">Current Date: </label>
  <input
    type="date"
    name="date"
    id="date"
    aria-labelledby="date-label date-instructions"
  />
  <p id="date-instructions">MM/DD/YYYY</p>
</fieldset>
```

也可用 [`aria-describedby`](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Attributes/aria-describedby) 把说明挂到 input 上。

```vue-html
<fieldset>
  <legend>Using aria-describedby</legend>
  <label id="dob" for="dob">Date of Birth: </label>
  <input type="date" name="dob" id="dob" aria-describedby="dob-instructions" />
  <p id="dob-instructions">MM/DD/YYYY</p>
</fieldset>
```

### 隐藏内容 {#hiding-content}

即使有无障碍名称，一般也不建议把 label 在视觉上藏起来。若周围文字已能说明用途，可以隐藏视觉 label。

例如搜索框：

```vue-html
<form role="search">
  <label for="search" class="hidden-visually">Search: </label>
  <input type="text" name="search" id="search" v-model="search" />
  <button type="submit">Search</button>
</form>
```

视力正常的用户能从按钮文字看出这是搜索。

这时可用 CSS 视觉隐藏 label，但不影响读屏：

```css
.hidden-visually {
  position: absolute;
  overflow: hidden;
  white-space: nowrap;
  margin: 0;
  padding: 0;
  height: 1px;
  width: 1px;
  clip: rect(0 0 0 0);
  clip-path: inset(100%);
}
```

#### `aria-hidden="true"` {#aria-hidden-true}

`aria-hidden="true"` 对读屏隐藏，视觉上仍可见。不要用在可聚焦元素上，只用于装饰、重复或屏外内容。

```vue-html
<p>This is not hidden from screen readers.</p>
<p aria-hidden="true">This is hidden from screen readers.</p>
```

### 按钮 {#buttons}

表单里的 `<button>` 要设 `type`，避免误提交。
也可用 `<input type="button">` / `<input type="submit">`：

```vue-html
<form action="/dataCollectionLocation" method="post" autocomplete="on">
  <!-- 按钮 -->
  <button type="button">Cancel</button>
  <button type="submit">Submit</button>

  <!-- 输入按钮 -->
  <input type="button" value="Cancel" />
  <input type="submit" value="Submit" />
</form>
```

### 功能图片 {#functional-images}

功能型图片可以这样写：

- input

  - 类似 `type="submit"` 的表单按钮

  ```vue-html
  <form role="search">
    <label for="search" class="hidden-visually">Search: </label>
    <input type="text" name="search" id="search" v-model="search" />
    <input
      type="image"
      class="btnImg"
      src="https://img.icons8.com/search"
      alt="Search"
    />
  </form>
  ```

- 图标

```vue-html
<form role="search">
  <label for="searchIcon" class="hidden-visually">Search: </label>
  <input type="text" name="searchIcon" id="searchIcon" v-model="searchIcon" />
  <button type="submit">
    <i class="fas fa-search" aria-hidden="true"></i>
    <span class="hidden-visually">Search</span>
  </button>
</form>
```

## 规范 {#standards}

W3C 的 Web 无障碍倡议 (WAI) 制定了相关标准：

- [用户代理无障碍访问指南 (UAAG)](https://www.w3.org/WAI/standards-guidelines/uaag/)
  - 浏览器和媒体查询，包括一些其他方面的辅助技术
- [创作工具无障碍访问指南 (ATAG)](https://www.w3.org/WAI/standards-guidelines/atag/)
  - 创作工具
- [Web 内容无障碍访问指南 (WCAG)](https://www.w3.org/WAI/standards-guidelines/wcag/)
  - 网站内容 - 由开发者、创作工具和无障碍访问评估工具使用。

### 网络内容无障碍指南 (WCAG) {#web-content-accessibility-guidelines-wcag}

[WCAG 2.1](https://www.w3.org/TR/WCAG21/) 在 [WCAG 2.0](https://www.w3.org/TR/WCAG20/) 基础上更新，覆盖新技术。W3C 建议策略采用最新 WCAG 版本。

#### WCAG 2.1 四大指导原则 (缩写 POUR)：{#wcag-2-1-four-main-guiding-principles-abbreviated-as-pour}

- [可感知](https://www.w3.org/TR/WCAG21/#perceivable)：用户能感知呈现的信息
- [可操作](https://www.w3.org/TR/WCAG21/#operable)：界面、控件、导航可操作
- [可理解](https://www.w3.org/TR/WCAG21/#understandable)：信息和操作对所有用户可理解
- [健壮](https://www.w3.org/TR/WCAG21/#robust)：技术演进后内容仍可访问

#### Web 无障碍倡议 – 无障碍访问丰富的互联网应用 (WAI-ARIA) {#web-accessibility-initiative-–-accessible-rich-internet-applications-wai-aria}

W3C 的 WAI-ARIA 说明如何构建动态内容和高阶 UI 控件。

- [可便捷访问的丰富互联网应用 (WAI-ARIA) 1.2](https://www.w3.org/TR/wai-aria-1.2/)
- [WAI-ARIA 实践 1.2](https://www.w3.org/TR/wai-aria-practices-1.2/)

## 资源 {#resources}

### 文档 {#documentation}

- [WCAG 2.0](https://www.w3.org/TR/WCAG20/)
- [WCAG 2.1](https://www.w3.org/TR/WCAG21/)
- [Accessible Rich Internet Applications (WAI-ARIA) 1.2](https://www.w3.org/TR/wai-aria-1.2/)
- [WAI-ARIA Authoring Practices 1.2](https://www.w3.org/TR/wai-aria-practices-1.2/)

### 辅助技术 {#assistive-technologies}

- 屏幕助读器
  - [NVDA](https://www.nvaccess.org/download/)
  - [VoiceOver](https://www.apple.com/accessibility/mac/vision/)
  - [JAWS](https://www.freedomscientific.com/products/software/jaws/?utm_term=jaws%20screen%20reader&utm_source=adwords&utm_campaign=All+Products&utm_medium=ppc&hsa_tgt=kwd-394361346638&hsa_cam=200218713&hsa_ad=296201131673&hsa_kw=jaws%20screen%20reader&hsa_grp=52663682111&hsa_net=adwords&hsa_mt=e&hsa_src=g&hsa_acc=1684996396&hsa_ver=3&gclid=Cj0KCQjwnv71BRCOARIsAIkxW9HXKQ6kKNQD0q8a_1TXSJXnIuUyb65KJeTWmtS6BH96-5he9dsNq6oaAh6UEALw_wcB)
  - [ChromeVox](https://chrome.google.com/webstore/detail/chromevox-classic-extensi/kgejglhpjiefppelpmljglcjbhoiplfn?hl=en)
- 缩放工具
  - [MAGic](https://www.freedomscientific.com/products/software/magic/)
  - [ZoomText](https://www.freedomscientific.com/products/software/zoomtext/)
  - [Magnifier](https://support.microsoft.com/en-us/help/11542/windows-use-magnifier-to-make-things-easier-to-see)

### 测试 {#testing}

- 自动化相关的工具
  - [Lighthouse](https://chrome.google.com/webstore/detail/lighthouse/blipmdconlkpinefehnmjammfjpmpbjk)
  - [WAVE](https://chrome.google.com/webstore/detail/wave-evaluation-tool/jbbplnpkjmmeebjpijfedlgcdilocofh)
  - [ARC Toolkit](https://chrome.google.com/webstore/detail/arc-toolkit/chdkkkccnlfncngelccgbgfmjebmkmce?hl=en-US)
- 颜色相关的工具
  - [WebAim Color Contrast](https://webaim.org/resources/contrastchecker/)
  - [WebAim Link Color Contrast](https://webaim.org/resources/linkcontrastchecker)
- 其他有用的工具
  - [HeadingMap](https://chrome.google.com/webstore/detail/headingsmap/flbjommegcjonpdmenkdiocclhjacmbi?hl=en…)
  - [Color Oracle](https://colororacle.org)
  - [NerdeFocus](https://chrome.google.com/webstore/detail/nerdefocus/lpfiljldhgjecfepfljnbjnbjfhennpd?hl=en-US…)
  - [Visual Aria](https://chrome.google.com/webstore/detail/visual-aria/lhbmajchkkmakajkjenkchhnhbadmhmk?hl=en-US)
  - [Silktide Website Accessibility Simulator](https://chrome.google.com/webstore/detail/silktide-website-accessib/okcpiimdfkpkjcbihbmhppldhiebhhaf?hl=en-US)

### 用户 {#users}

世卫组织估计全球约 15% 人口有某种残疾，其中约 2–4% 为重度。残障人士约 10 亿，是最大的少数群体之一。

残疾类型很多，大致分四类：

- _[视觉](https://webaim.org/articles/visual/)_：屏幕阅读器、放大、对比度、盲文等
- _[听觉](https://webaim.org/articles/auditory/)_：字幕、文字稿、手语视频等
- _[运动](https://webaim.org/articles/motor/)_：[辅助技术](https://webaim.org/articles/motor/assistive) 如语音输入、眼动、单键开关、大轨迹球、自适应键盘等
- _[认知](https://webaim.org/articles/cognitive/)_：补充说明、更简单清晰、更有结构的内容

更多需求说明见 WebAIM：

- [Web 无障碍愿景：探索改变 & 人人受益](https://www.w3.org/WAI/perspective-videos/)
- [Web 用户的故事](https://www.w3.org/WAI/people-use-web/user-stories/)
