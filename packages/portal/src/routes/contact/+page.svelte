<script lang="ts">
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
</script>

<svelte:head>
  <title>Contact Us</title>
</svelte:head>

<div class="max-w-2xl mx-auto px-4 py-12">
  <h1 class="text-3xl font-bold text-gray-900">Contact Us</h1>
  <p class="mt-2 text-gray-600">Send us a message and we'll get back to you.</p>

  {#if conversationId}
    <div class="mt-8 bg-green-50 border border-green-200 rounded-xl p-6 text-center">
      <p class="text-green-800 font-medium">Message sent successfully!</p>
      <p class="mt-2 text-sm text-green-600">We'll get back to you as soon as possible.</p>
      <a
        href="/contact/{conversationId}"
        class="mt-4 inline-block px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700"
      >
        View conversation
      </a>
    </div>
  {:else}
    <form onsubmit={handleSubmit} class="mt-8 space-y-5">
      {#if error}
        <div class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">{error}</div>
      {/if}

      <div class="grid grid-cols-2 gap-4">
        <div>
          <label for="name" class="block text-sm font-medium text-gray-700">Name</label>
          <input
            id="name"
            type="text"
            bind:value={name}
            placeholder="Your name"
            class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
        <div>
          <label for="email" class="block text-sm font-medium text-gray-700">Email</label>
          <input
            id="email"
            type="email"
            bind:value={email}
            placeholder="your@email.com"
            class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
      </div>

      <div>
        <label for="subject" class="block text-sm font-medium text-gray-700">Subject</label>
        <input
          id="subject"
          type="text"
          bind:value={subject}
          placeholder="How can we help?"
          class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
        />
      </div>

      <div>
        <label for="body" class="block text-sm font-medium text-gray-700">Message</label>
        <textarea
          id="body"
          bind:value={body}
          rows={5}
          required
          placeholder="Describe your question or issue..."
          class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
        ></textarea>
      </div>

      <button
        type="submit"
        disabled={sending || !body.trim()}
        class="w-full px-4 py-2.5 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors"
      >
        {sending ? 'Sending...' : 'Send Message'}
      </button>
    </form>
  {/if}
</div>
