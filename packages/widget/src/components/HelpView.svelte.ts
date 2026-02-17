import { onMount } from 'svelte'
import { widgetApi } from '../api/widget-client'

export function createHelpViewState(org: string) {
  let collections = $state<any[]>([])
  let loading = $state(true)
  let search = $state('')
  let searchResults = $state<any[]>([])
  let searching = $state(false)
  let selectedArticle = $state<any>(null)
  let view = $state<'home' | 'search' | 'article'>('home')

  onMount(loadCollections)

  async function loadCollections() {
    loading = true
    try {
      const data = await widgetApi.getCollections(org)
      collections = data.data
    } catch {
      collections = []
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
        const data = await widgetApi.searchArticles(org, search)
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
      const data = await widgetApi.getArticle(org, articleId)
      selectedArticle = data.data
      view = 'article'
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
    } else {
      view = 'home'
      search = ''
      searchResults = []
    }
  }

  return {
    get collections() { return collections },
    get loading() { return loading },
    get search() { return search },
    set search(v: string) { search = v },
    get searchResults() { return searchResults },
    get searching() { return searching },
    get selectedArticle() { return selectedArticle },
    get view() { return view },
    handleSearch,
    openArticle,
    goBack,
  }
}
