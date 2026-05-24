# 常见问题 {#frequently-asked-questions}

## 谁在维护 Vue？ {#who-maintains-vue}

Vue 是独立、由社区推动的项目。[尤雨溪](https://twitter.com/yuxiyou)在 2014 年把它当作个人项目做出来。现在由[全球全职成员和志愿者组成的团队](/about/team)一起维护，尤雨溪任项目负责人。想听更多背景，可看[这部纪录片](https://www.youtube.com/watch?v=OrxmtDw4pVI)。

自 2016 年起，Vue 主要靠赞助维持运转，资金上能持续做下去。如果你或公司从 Vue 获益，欢迎[赞助](/sponsor/)我们，支持后续发展！

## Vue 2 和 Vue 3 之间的区别是什么？ {#what-s-the-difference-between-vue-2-and-vue-3}

Vue 3 是当前最新的主版本。它比 Vue 2 多了一些特性（比如 Teleport、Suspense、多根节点模板），也有一些不兼容的改动。细节见 [Vue 3 迁移指南](https://v3-migration.vuejs.org/zh/)。

虽然版本不同，但大部分 Vue API 是共通的，你在 Vue 2 里学的东西在 Vue 3 里大多还能用。组合式 API 本来是 Vue 3 独有，现在也支持 Vue 2，在 [Vue 2.7](https://github.com/vuejs/vue/blob/main/CHANGELOG.md#270-2022-07-01) 里就能用。

总的来说，Vue 3 包更小、性能更好、扩展性更强，TypeScript 和 IDE 支持也更好。新项目建议直接用 Vue 3。下面这些情况可能仍要选 Vue 2：

- 需要支持 IE11。Vue 3 用到了 IE11 不支持的现代 JavaScript 特性。

要把现有 Vue 2 应用迁到 Vue 3，请看[迁移指南](https://v3-migration.vuejs.org/zh/)。

## Vue 2 仍在维护吗？ {#is-vue-2-still-supported}

Vue 2 在 2022 年 6 月发布了最后一个小版本（2.7）。现在进入维护模式：不再加新功能，但从 2.7 发布起 18 个月内仍会修重大 bug 并发布安全更新。也就是说，**Vue 2 已在 2023 年 12 月 31 日结束维护**。

我们相信这段时间够大多数生态完成迁移。但也理解有些团队或项目赶不上，仍要满足安全与合规要求。我们正在和业内专家合作为这类团队提供 Vue 2 延长支持——如果你预计 2023 年底之后还要用 Vue 2，请提前规划，详见 [Vue 2 延长 LTS](https://v2.vuejs.org/lts/)。

## Vue 使用什么开源协议？ {#what-license-does-vue-use}

Vue 是完全免费的开源项目，基于 [MIT License](https://opensource.org/licenses/MIT) 发布。

## Vue 支持哪些浏览器？ {#what-browsers-does-vue-support}

最新版 Vue（3.x）只支持[原生支持 ES2016 的浏览器](https://caniuse.com/es2016)，不包括 IE11。Vue 3.x 用到的 ES2016 特性无法在旧浏览器里兼容；若要支持旧浏览器，请用 Vue 2.x。

## Vue 可靠吗？ {#is-vue-reliable}

Vue 是成熟、经过大量实战检验的框架。它是目前生产环境里用得最多的 JavaScript 框架之一，全球用户超过 150 万，npm 月下载量超过 1000 万。

世界各地很多知名组织在生产环境使用 Vue，包括 Wikimedia 基金会、美国宇航局、苹果、谷歌、微软、GitLab、Zoom、腾讯、微博、哔哩哔哩、快手等。

## Vue 速度快吗？ {#is-vue-fast}

Vue 3 是性能最强的主流前端框架之一，多数 web 应用场景都能轻松应对，几乎不用手动优化。

在 [js-framework-benchmark](https://krausest.github.io/js-framework-benchmark/current.html) 里，Vue 的跑分比 React 和 Angular 好不少，也和一些生产环境里最快的非虚拟 DOM 框架相当。

请注意，这类跑分主要测特定场景下的原始渲染性能，不能完全代表真实项目的表现。若更关心页面加载，可用 [WebPageTest](https://www.webpagetest.org/lighthouse) 或 [PageSpeed Insights](https://pagespeed.web.dev/) 测本站。本站文档完全用 Vue 构建：静态预渲染，再在客户端 hydration。在模拟 Moto G4（CPU 降速 4 倍）+ 低速 4G 下，性能得分仍可达 100 分。

想了解更多运行时性能优化，可看[渲染机制](/guide/extras/rendering-mechanism)；在特别苛刻的场景下优化应用，可看[性能优化指南](/guide/best-practices/performance)。

## Vue 体积小吗？ {#is-vue-lightweight}

通过构建工具使用时，Vue 的很多 API 都可以[“tree-shake”](https://developer.mozilla.org/en-US/docs/Glossary/Tree_shaking)。例如不用内置的 `<Transition>` 组件，它就不会打进最终的生产包。

一个只用最少 API 的 hello world，配合最小化和 brotli 压缩，基线大小约 **16kb**。真实项目大小取决于你用了多少可选特性；极端情况下，若把 Vue 提供的特性全用上，运行时总共约 **27kb**。

不用构建工具时，既没法 tree-shake，还得在浏览器里加载模板编译器，包体积会涨到约 **41kb**。若要在没有构建步骤的情况下做渐进增强，可考虑 [petite-vue](https://github.com/vuejs/petite-vue)（仅 **6kb**）。

像 Svelte 这类框架会为单个组件生成极小的编译结果。但[我们的研究](https://github.com/yyx990803/vue-svelte-size-analysis)表明，包大小差异很大程度上取决于组件数量。Vue 基线更大，但每个组件生成的代码更少；在真实项目里，Vue 应用往往反而更轻。

## Vue 能胜任大规模场景吗？ {#does-vue-scale}

可以。有人以为 Vue 只适合小项目，其实它完全能支撑大规模应用：

- [单文件组件](/guide/scaling-up/sfc)提供模块化开发，让应用不同部分可以分开写。

- [组合式 API](/guide/reusability/composables) 与 TypeScript 集成很好，也便于组织、抽取和复用复杂逻辑。

- [完善的工具链](/guide/scaling-up/tooling)让应用在变大时，开发体验依然顺畅。

- 入门门槛低、文档好，能明显降低新人上手和培训成本。

## 我可以为 Vue 做贡献吗？ {#how-do-i-contribute-to-vue}

非常欢迎！请阅读[社区指南](/about/community-guide)。

## 我应该使用选项式 API 还是组合式 API？ {#should-i-use-options-api-or-composition-api}

如果你是 Vue 新手，我们在[这里](/guide/introduction#which-to-choose)对比了两种 API 的大致区别。

如果你一直用选项式 API，正在考虑组合式 API，可看[组合式 API 常见问题](/guide/extras/composition-api-faq)。

## 用 Vue 的时候应该选 JS 还是 TS？ {#should-i-use-javascript-or-typescript-with-vue}

Vue 本身用 TypeScript 实现，也提供一流的 TypeScript 支持，但不强制你用 TypeScript。

给 Vue 加新特性时，TypeScript 支持是重要考量。就算你自己不用 TypeScript，为 TS 设计的 API 通常也更容易被 IDE 和静态分析工具理解，对大家都有好处。Vue 的 API 也尽量让 JavaScript 和 TypeScript 用起来一致。

选 TypeScript 是在上手难度和长期可维护性之间权衡，是否合理取决于团队背景和项目规模，Vue 本身通常不是决定性因素。

## Vue 相比于 Web Components 究竟如何？ {#how-does-vue-compare-to-web-components}

Vue 诞生早于 Web Components，部分设计（例如插槽）受到 Web Components 模型启发。

Web Components 规范偏底层，以自定义元素为中心。作为框架，Vue 还解决更多上层问题，例如高效 DOM 渲染、响应式状态管理、工具链、客户端路由和服务器端渲染等。

Vue 完全支持在组件里使用原生自定义元素，也支持把 Vue 组件导出为原生自定义元素——详见 [Vue 和 Web Components 指南](/guide/extras/web-components)。

<!-- ## TODO How does Vue compare to React? -->

<!-- ## TODO How does Vue compare to Angular? -->
