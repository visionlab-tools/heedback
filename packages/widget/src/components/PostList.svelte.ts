import { onMount } from 'svelte'
import { widgetApi } from '../api/widget-client'

export function createPostListState(org: string) {
  let posts = $state<any[]>([])
  let loading = $state(true)
  let search = $state('')

  onMount(loadPosts)

  async function loadPosts() {
    loading = true
    try {
      const data = await widgetApi.searchPosts(org, search)
      posts = data.data.slice(0, 20)
    } catch {
      posts = []
    } finally {
      loading = false
    }
  }

  async function handleVote(postId: string) {
    try {
      await widgetApi.vote(org, postId)
      const post = posts.find((p) => p.id === postId)
      if (post) {
        post.voteCount++
        post.hasVoted = true
        posts = [...posts]
      }
    } catch {
      // Already voted or error
    }
  }

  let searchTimeout: ReturnType<typeof setTimeout>
  function handleSearch() {
    clearTimeout(searchTimeout)
    searchTimeout = setTimeout(loadPosts, 300)
  }

  return {
    get posts() { return posts },
    get loading() { return loading },
    get search() { return search },
    set search(v: string) { search = v },
    handleVote,
    handleSearch,
  }
}
