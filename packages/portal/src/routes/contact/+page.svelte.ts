export function createContactPageState() {
  let name = $state('')
  let email = $state('')
  let subject = $state('')
  let body = $state('')
  let sending = $state(false)
  let error = $state('')
  let conversationId = $state('')

  async function handleSubmit(e: Event) {
    e.preventDefault()
    if (!body.trim()) return
    sending = true
    error = ''
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject: subject || null,
          body,
          endUserEmail: email || undefined,
          endUserName: name || undefined,
          channel: 'portal',
        }),
      })
      if (!res.ok) throw new Error('Failed to send message')
      const data = await res.json()
      conversationId = data.data.id
    } catch {
      error = 'Something went wrong. Please try again.'
    } finally {
      sending = false
    }
  }

  return {
    get name() { return name },
    set name(v: string) { name = v },
    get email() { return email },
    set email(v: string) { email = v },
    get subject() { return subject },
    set subject(v: string) { subject = v },
    get body() { return body },
    set body(v: string) { body = v },
    get sending() { return sending },
    get error() { return error },
    get conversationId() { return conversationId },
    handleSubmit,
  }
}
