<script setup>
import { ref, onMounted } from 'vue'
import { data } from './errors.data.ts'
import ErrorsTable from './ErrorsTable.vue'

const highlight = ref()
onMounted(() => {
  highlight.value = location.hash.slice(1)
})
</script>

# 生产环境错误代码参考 {#error-reference}

## 运行时错误 {#runtime-errors}

在生产环境里，传给下面这些错误处理 API 的第三个参数是短代码，而不是带完整说明的字符串：

- [`app.config.errorHandler`](/api/application#app-config-errorhandler)
- [`onErrorCaptured`](/api/composition-api-lifecycle#onerrorcaptured)（组合式 API）
- [`errorCaptured`](/api/options-lifecycle#errorcaptured)（选项式 API）

下表列出短代码与原始完整信息字符串的对应关系。

<ErrorsTable kind="runtime" :errors="data.runtime" :highlight="highlight" />

## 编译错误 {#compiler-errors}

下表列出生产环境编译错误的短代码与原始消息的对应关系。

<ErrorsTable kind="compiler" :errors="data.compiler" :highlight="highlight" />
