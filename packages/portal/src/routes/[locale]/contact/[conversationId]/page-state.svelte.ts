export function createConversationPageState(data: any) {
  let newMessage = $state('')
  let sending = $state(false)
  let messages = $state<any[]>(data.conversation?.messages || [])

  async function handleReply(e: Event) {
    e.preventDefault()
    if (!newMessage.trim() || sending) return
    sending = true
    try {
      const res = await fetch(`/api/contact/${data.conversation.id}/reply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ body: newMessage }),
      })
      if (!res.ok) throw new Error('Failed to send')
      const result = await res.json()
      messages = [...messages, result.data]
      newMessage = ''
    } catch {
      // Handle error
    } finally {
      sending = false
    }
  }

  function formatTime(dateStr: string): string {
    return new Date(dateStr).toLocaleString()
  }

  return {
    get newMessage() { return newMessage },
    set newMessage(v: string) { newMessage = v },
    get sending() { return sending },
    get messages() { return messages },
    handleReply,
    formatTime,
  }
}
