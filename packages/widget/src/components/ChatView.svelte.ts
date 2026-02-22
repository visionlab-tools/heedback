import { widgetApi, connectSSE } from '../api/widget-client'

type Screen = 'loading' | 'list' | 'new' | 'thread'

const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB
const ALLOWED_TYPES = /^(image\/(jpeg|png|gif|webp)|video\/(mp4|quicktime|webm))$/

interface UploadedAttachment {
  key: string
  name: string
  type: string
  size: number
}

/** localStorage key for persisting the end-user ID across sessions */
function storageKey(org: string) {
  return `heedback:${org}:endUserId`
}

export function createChatViewState(org: string, user: any) {
  let screen = $state<Screen>('loading')
  let endUserId = $state<string | null>(null)
  let conversations = $state<any[]>([])
  let conversationId = $state<string | null>(null)
  let messages = $state<any[]>([])
  let newMessage = $state('')
  let sending = $state(false)
  let disconnectSse = $state<(() => void) | null>(null)

  // File attachment state
  let selectedFiles = $state<File[]>([])
  let uploading = $state(false)
  let fileError = $state<string | null>(null)

  /** Bootstrap: check localStorage for existing end user */
  async function init() {
    const stored = localStorage.getItem(storageKey(org))
    if (stored) {
      endUserId = stored
      await refreshConversations()
      screen = conversations.length > 0 ? 'list' : 'new'
    } else {
      screen = 'new'
    }
  }

  async function refreshConversations() {
    if (!endUserId) return
    try {
      const data = await widgetApi.listConversations(org, endUserId)
      conversations = data.data
    } catch {
      conversations = []
    }
  }

  function connectToConversation(id: string) {
    disconnectSse?.()
    disconnectSse = connectSSE(org, id, (event) => {
      if (event.event === 'message.created') {
        if (!messages.some((m) => m.id === event.data.id)) {
          messages = [...messages, event.data]
        }
      }
    })
  }

  /** Validate and add files to the selection */
  function addFiles(files: FileList | null, locale: string, t: (l: string, k: string) => string) {
    if (!files) return
    fileError = null

    for (const file of Array.from(files)) {
      if (!ALLOWED_TYPES.test(file.type)) {
        fileError = t(locale, 'chat.unsupported_file')
        continue
      }
      if (file.size > MAX_FILE_SIZE) {
        fileError = t(locale, 'chat.file_too_large')
        continue
      }
      selectedFiles = [...selectedFiles, file]
    }
  }

  function removeFile(index: number) {
    selectedFiles = selectedFiles.filter((_, i) => i !== index)
    fileError = null
  }

  function clearFiles() {
    selectedFiles = []
    fileError = null
  }

  /** Upload all selected files and return attachment metadata */
  async function uploadAllFiles(): Promise<UploadedAttachment[]> {
    const results: UploadedAttachment[] = []
    for (const file of selectedFiles) {
      const { key } = await widgetApi.uploadFile(org, file)
      results.push({ key, name: file.name, type: file.type, size: file.size })
    }
    return results
  }

  /** Whether the user can submit (has text or files, and not busy) */
  function canSend(): boolean {
    return !sending && !uploading && (!!newMessage.trim() || selectedFiles.length > 0)
  }

  async function handleStart(e: Event) {
    e.preventDefault()
    if (!canSend()) return
    sending = true
    try {
      // Upload files first
      let attachments: UploadedAttachment[] = []
      if (selectedFiles.length > 0) {
        uploading = true
        attachments = await uploadAllFiles()
        uploading = false
      }

      const data = await widgetApi.startConversation(org, {
        body: newMessage || undefined,
        channel: 'widget',
        endUserId: endUserId ?? undefined,
        endUserExternalId: user?.id,
        endUserFirstName: user?.firstName,
        endUserLastName: user?.lastName,
        endUserEmail: user?.email,
        endUserAvatarUrl: user?.avatarUrl,
        attachments: attachments.length > 0 ? attachments : undefined,
        pageUrl: window.location.href,
      })

      const conv = data.data
      if (conv.endUserId) {
        endUserId = conv.endUserId
        localStorage.setItem(storageKey(org), conv.endUserId)
      }

      conversationId = conv.id
      messages = [{
        id: 'initial',
        senderType: 'end_user',
        body: newMessage,
        attachments,
        createdAt: new Date().toISOString(),
        sender: null,
      }]
      newMessage = ''
      clearFiles()
      screen = 'thread'
      connectToConversation(conv.id)
    } catch {
      uploading = false
    } finally {
      sending = false
    }
  }

  async function openConversation(id: string) {
    conversationId = id
    screen = 'thread'
    try {
      const data = await widgetApi.getConversation(org, id)
      messages = data.data.messages || []
      connectToConversation(id)
    } catch {
      messages = []
    }
  }

  async function handleReply(e: Event) {
    e.preventDefault()
    if (!canSend() || !conversationId) return
    sending = true
    try {
      let attachments: UploadedAttachment[] = []
      if (selectedFiles.length > 0) {
        uploading = true
        attachments = await uploadAllFiles()
        uploading = false
      }

      const data = await widgetApi.replyToConversation(org, conversationId, {
        body: newMessage || undefined,
        attachments: attachments.length > 0 ? attachments : undefined,
        pageUrl: window.location.href,
      })
      if (!messages.some((m) => m.id === data.data.id)) {
        messages = [...messages, data.data]
      }
      newMessage = ''
      clearFiles()
    } catch {
      uploading = false
    } finally {
      sending = false
    }
  }

  function goToList() {
    disconnectSse?.()
    disconnectSse = null
    conversationId = null
    messages = []
    clearFiles()
    refreshConversations()
    screen = 'list'
  }

  function goToNew() {
    disconnectSse?.()
    disconnectSse = null
    conversationId = null
    messages = []
    clearFiles()
    screen = 'new'
  }

  function cleanup() {
    disconnectSse?.()
  }

  function formatTime(dateStr: string): string {
    return new Date(dateStr).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  /** Check if a MIME type is an image */
  function isImage(type: string): boolean {
    return type.startsWith('image/')
  }

  return {
    get screen() { return screen },
    get endUserId() { return endUserId },
    get conversations() { return conversations },
    get conversationId() { return conversationId },
    get messages() { return messages },
    get newMessage() { return newMessage },
    set newMessage(v: string) { newMessage = v },
    get sending() { return sending },
    get uploading() { return uploading },
    get selectedFiles() { return selectedFiles },
    get fileError() { return fileError },
    init,
    handleStart,
    handleReply,
    openConversation,
    goToList,
    goToNew,
    cleanup,
    formatTime,
    addFiles,
    removeFile,
    canSend,
    isImage,
  }
}
