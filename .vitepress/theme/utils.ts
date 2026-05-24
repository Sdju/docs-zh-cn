import { useData } from 'vitepress'

export function useWithBase() {
  const { site } = useData()

  return (path: string) => {
    if (/^https?:\/\//.test(path)) return path
    const base = site.value.base
    const normalized = path.startsWith('/') ? path.slice(1) : path
    return `${base}${normalized}`
  }
}
