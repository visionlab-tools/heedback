import { onMount } from 'svelte'
import { widgetApi } from '../api/widget-client'

interface HelpViewOptions {
  org: string
  locale: string
  onViewChange?: (view: string) => void
}

export function createHelpViewState({ org, locale, onViewChange }: HelpViewOptions) {
  let articles = $state<any[]>([])
  let loading = $state(true)
  let search = $state('')
  let searchResults = $state<any[]>([])
  let searching = $state(false)
  let selectedArticle = $state<any>(null)
  let view = $state<'home' | 'search' | 'article'>('home')
  let selectedTagId = $state<string | null>(null)

  // Unique tags extracted from loaded articles
  let availableTags = $derived.by(() => {
    const seen = new Map<string, { id: string; name: string; color: string }>()
    for (const article of articles) {
      for (const tag of article.tags ?? []) {
        if (!seen.has(tag.id)) seen.set(tag.id, tag)
      }
    }
    return [...seen.values()]
  })

  // Articles filtered by selected tag
  let filteredArticles = $derived.by(() => {
    if (!selectedTagId) return articles
    return articles.filter((a: any) =>
      a.tags?.some((tag: any) => tag.id === selectedTagId),
    )
  })

  onMount(loadArticles)

  async function loadArticles() {
    loading = true
    try {
      const data = await widgetApi.getArticles(org, locale)
      articles = data.data
    } catch {
      articles = []
    } finally {
      loading = false
    }
  }

  let searchTimeout: ReturnType<typeof setTimeout>
  function handleSearch() {
    clearTimeout(searchTimeout)
    if (!search.trim()) {
      view = 'home'
      searchResults = []
      return
    }
    searchTimeout = setTimeout(async () => {
      searching = true
      view = 'search'
      try {
        const data = await widgetApi.searchArticles(org, search, locale)
        searchResults = data.data
      } catch {
        searchResults = []
      } finally {
        searching = false
      }
    }, 300)
  }

  async function openArticle(articleId: string) {
    loading = true
    try {
      const data = await widgetApi.getArticle(org, articleId, locale)
      selectedArticle = data.data
      view = 'article'
      onViewChange?.('article')
    } catch {
      // Handle error
    } finally {
      loading = false
    }
  }

  function goBack() {
    if (view === 'article') {
      selectedArticle = null
      view = search.trim() ? 'search' : 'home'
      onViewChange?.(view)
    } else {
      view = 'home'
      search = ''
      searchResults = []
    }
  }

  function selectTag(tagId: string | null) {
    selectedTagId = tagId
  }

  return {
    get articles() { return articles },
    get loading() { return loading },
    get search() { return search },
    set search(v: string) { search = v },
    get searchResults() { return searchResults },
    get searching() { return searching },
    get selectedArticle() { return selectedArticle },
    get view() { return view },
    get availableTags() { return availableTags },
    get filteredArticles() { return filteredArticles },
    get selectedTagId() { return selectedTagId },
    handleSearch,
    openArticle,
    goBack,
    selectTag,
  }
}
