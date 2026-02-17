import { widgetApi } from '../api/widget-client'

export function createFeedbackFormState(org: string, boards: any[], onSubmitted: () => void) {
  let title = $state('')
  let body = $state('')
  let boardId = $state('')
  let submitting = $state(false)
  let error = $state('')
  let similarPosts = $state<any[]>([])

  // Set default board
  $effect(() => {
    if (boards.length > 0 && !boardId) {
      boardId = boards[0].id
    }
  })

  let debounceTimer: ReturnType<typeof setTimeout>
  function handleTitleInput() {
    clearTimeout(debounceTimer)
    if (title.length >= 3) {
      debounceTimer = setTimeout(async () => {
        try {
          const data = await widgetApi.searchPosts(org, title)
          similarPosts = data.data.slice(0, 3)
        } catch {
          similarPosts = []
        }
      }, 500)
    } else {
      similarPosts = []
    }
  }

  async function handleSubmit(e: Event) {
    e.preventDefault()
    if (!title.trim() || !boardId) return

    submitting = true
    error = ''

    try {
      await widgetApi.createPost(org, {
        boardId,
        title: title.trim(),
        body: body.trim(),
      })
      title = ''
      body = ''
      similarPosts = []
      onSubmitted()
    } catch (err: unknown) {
      error = err instanceof Error ? err.message : 'Failed to submit'
    } finally {
      submitting = false
    }
  }

  return {
    get title() { return title },
    set title(v: string) { title = v },
    get body() { return body },
    set body(v: string) { body = v },
    get boardId() { return boardId },
    set boardId(v: string) { boardId = v },
    get submitting() { return submitting },
    get error() { return error },
    get similarPosts() { return similarPosts },
    handleTitleInput,
    handleSubmit,
  }
}
