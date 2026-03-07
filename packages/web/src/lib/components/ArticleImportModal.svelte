<script lang="ts">
  import { _ } from 'svelte-i18n'
  import { franc } from 'franc'
  import { Modal, Button, Select, Badge, DataTable } from '@heedback/ui-kit'
  import { api } from '../api/client'
  import { addToast } from '../stores/toast'

  let { orgId, open = $bindable(false), onimported }: {
    orgId: string
    open: boolean
    onimported?: () => void
  } = $props()

  /** ISO 639-3 → BCP-47 mapping for the languages we support */
  const ISO3_TO_BCP47: Record<string, string> = {
    eng: 'en', fra: 'fr', nld: 'nl', spa: 'es', deu: 'de',
    por: 'pt', ita: 'it', ron: 'ro', pol: 'pl', tur: 'tr',
    swe: 'sv', dan: 'da', nor: 'no', fin: 'fi', ces: 'cs',
    hun: 'hu', rus: 'ru', ukr: 'uk', ara: 'ar', zho: 'zh',
    jpn: 'ja', kor: 'ko', hin: 'hi',
  }

  interface ParsedArticle {
    filename: string
    title: string
    slug: string
    locale: string
    body: string
    valid: boolean
  }

  let importStatus = $state<'draft' | 'published'>('draft')
  let parsedFiles = $state<ParsedArticle[]>([])
  let importing = $state(false)
  let progress = $state(0)

  let columns = $derived([
    { label: $_('articles.import_col_file') },
    { label: $_('articles.import_col_title') },
    { label: $_('articles.import_col_slug') },
    { label: $_('articles.import_col_locale') },
    { label: $_('common.status') },
  ])

  let validCount = $derived(parsedFiles.filter((f) => f.valid).length)

  function close() {
    open = false
    parsedFiles = []
    progress = 0
    importing = false
  }

  function parseFrontmatter(raw: string): { meta: Record<string, string>; body: string } {
    const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/)
    if (!match) return { meta: {}, body: raw }

    const meta: Record<string, string> = {}
    for (const line of match[1].split('\n')) {
      const idx = line.indexOf(':')
      if (idx === -1) continue
      const key = line.slice(0, idx).trim()
      // Strip surrounding quotes from YAML values
      const val = line.slice(idx + 1).trim().replace(/^['"]|['"]$/g, '')
      if (key && val) meta[key] = val
    }
    return { meta, body: match[2] }
  }

  function slugFromFilename(name: string): string {
    return name
      .replace(/\.(mdx?|MDX?)$/, '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
  }

  function titleFromFilename(name: string): string {
    return name
      .replace(/\.(mdx?|MDX?)$/, '')
      .replace(/[-_]+/g, ' ')
      .replace(/\b\w/g, (c) => c.toUpperCase())
  }

  function detectLocale(text: string): string {
    const code = franc(text, { minLength: 20 })
    if (code === 'und') return 'en'
    return ISO3_TO_BCP47[code] ?? 'en'
  }

  async function handleFiles(e: Event) {
    const input = e.target as HTMLInputElement
    if (!input.files?.length) return

    const results: ParsedArticle[] = []

    for (const file of input.files) {
      const raw = await file.text()
      const { meta, body } = parseFrontmatter(raw)

      const title = meta.title || titleFromFilename(file.name)
      const slug = meta.slug || slugFromFilename(file.name)
      const locale = meta.locale || meta.lang || detectLocale(body)

      results.push({
        filename: file.name,
        title,
        slug,
        locale,
        body: body.trim(),
        valid: title.length > 0 && slug.length > 0,
      })
    }

    parsedFiles = results
  }

  async function handleImport() {
    importing = true
    progress = 0
    let successCount = 0

    for (const file of parsedFiles) {
      if (!file.valid) {
        progress++
        continue
      }

      try {
        await api.post(`/org/${orgId}/articles`, {
          slug: file.slug,
          status: importStatus,
          translations: [{ locale: file.locale, title: file.title, body: file.body }],
        }, { silent: true })
        successCount++
      } catch {
        addToast($_('articles.import_error', { values: { filename: file.filename } }), 'error')
      }

      progress++
    }

    if (successCount > 0) {
      addToast($_('articles.import_success', { values: { count: successCount } }), 'success')
      onimported?.()
    }

    close()
  }
</script>

<Modal {open} title={$_('articles.import_title')} onclose={close}>
  <p class="text-sm text-slate-500 mb-4">{$_('articles.import_description')}</p>

  <div class="space-y-4">
    <div>
      <label for="import-files" class="block text-sm font-medium text-slate-700 mb-1">
        {$_('articles.import_select_files')}
      </label>
      <input
        id="import-files"
        type="file"
        accept=".md,.mdx"
        multiple
        onchange={handleFiles}
        class="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 file:cursor-pointer"
      />
    </div>

    <Select label={$_('articles.import_status')} bind:value={importStatus}>
      <option value="draft">{$_('article_editor.status_draft')}</option>
      <option value="published">{$_('article_editor.status_published')}</option>
    </Select>

    {#if parsedFiles.length > 0}
      <div class="max-h-64 overflow-y-auto border border-slate-200 rounded-lg">
        <DataTable {columns}>
          {#each parsedFiles as file}
            <tr class="text-sm">
              <td class="px-4 py-2 text-slate-600 truncate max-w-[140px]">{file.filename}</td>
              <td class="px-4 py-2 text-slate-900 truncate max-w-[160px]">{file.title}</td>
              <td class="px-4 py-2 text-slate-500 font-mono text-xs truncate max-w-[120px]">{file.slug}</td>
              <td class="px-4 py-2 text-slate-500">{file.locale}</td>
              <td class="px-4 py-2">
                <Badge variant={file.valid ? 'success' : 'warning'}>
                  {file.valid ? 'OK' : 'Invalid'}
                </Badge>
              </td>
            </tr>
          {/each}
        </DataTable>
      </div>

      <div class="flex items-center justify-between pt-2">
        <Button variant="ghost" onclick={close} disabled={importing}>
          {$_('common.cancel')}
        </Button>
        <Button onclick={handleImport} disabled={importing || validCount === 0}>
          {#if importing}
            {progress}/{parsedFiles.length}...
          {:else}
            {$_('articles.import_submit', { values: { count: validCount } })}
          {/if}
        </Button>
      </div>
    {/if}
  </div>
</Modal>
