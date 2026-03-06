export function createArticlePageState(data: any) {
  let feedbackSent = $state(false)

  function getTitle(): string {
    return data.article.translations?.[0]?.title || 'Untitled'
  }

  async function sendFeedback(helpful: boolean) {
    try {
      await fetch(`/api/v1/org/default/articles/${data.article.id}/feedback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ helpful }),
      })
      feedbackSent = true
    } catch {
      // Silent fail
    }
  }

  return {
    get feedbackSent() { return feedbackSent },
    getTitle,
    sendFeedback,
  }
}
