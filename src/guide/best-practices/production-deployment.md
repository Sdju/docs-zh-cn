# 生产部署 {#production-deployment}

## 开发环境 vs. 生产环境 {#development-vs-production}

开发时，Vue 提供很多辅助功能：

- 常见错误和隐患的警告
- props / 自定义事件的校验
- [响应性调试钩子](/guide/extras/reactivity-in-depth#reactivity-debugging)
- 开发工具集成

上线后这些不会用到，部分检查还会带来一点性能开销。部署生产环境时，应去掉仅用于开发的代码分支，让包更小、运行更快。

## 不使用构建工具 {#without-build-tools}

没用构建工具、从 CDN 等加载 Vue 时，部署请用生产版（文件名以 `.prod.js` 结尾）。生产版会压缩体积，并去掉开发专用代码。

- 用全局变量 `Vue`：选 `vue.global.prod.js`。
- 用原生 ESM import：选 `vue.esm-browser.prod.js`。

更多见[构建文件指南](https://github.com/vuejs/core/tree/main/packages/vue#which-dist-file-to-use)。

## 使用构建工具 {#with-build-tools}

用 `create-vue`（Vite）或 Vue CLI（webpack）创建的项目，生产配置已经配好。

如果是自定义构建，请确认：

1. `vue` 被解析为 `vue.runtime.esm-bundler.js`。
2. [编译时功能标记](/api/compile-time-flags)已被正确配置。
3. <code>process.env<wbr>.NODE_ENV</code> 会在构建时被替换为 `"production"`。

其他参考：

- [Vite 生产环境指南](https://cn.vitejs.dev/guide/build.html)
- [Vite 部署指南](https://cn.vitejs.dev/guide/static-deploy.html)
- [Vue CLI 部署指南](https://cli.vuejs.org/zh/guide/deployment.html)

## 追踪运行时错误 {#tracking-runtime-errors}

可用[应用级错误处理](/api/application#app-config-errorhandler)把错误上报到监控服务：

```js
import { createApp } from 'vue'
const app = createApp(...)
app.config.errorHandler = (err, instance, info) => {
  // 向追踪服务报告错误
}
```

[Sentry](https://docs.sentry.io/platforms/javascript/guides/vue/)、[Bugsnag](https://docs.bugsnag.com/platforms/javascript/vue/) 等也提供 Vue 官方集成。

<!-- zhlint disabled -->
