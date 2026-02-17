<!--
  Title input that auto-generates a slug below it.
  The slug updates live as the user types the title,
  but can be manually overridden. Once overridden,
  auto-generation stops until the slug is cleared.
-->
<script lang="ts">
  let {
    title = $bindable(''),
    slug = $bindable(''),
    titleLabel = 'Title',
    slugPrefix = '/',
    required = false,
  }: {
    title?: string
    slug?: string
    titleLabel?: string
    slugPrefix?: string
    required?: boolean
  } = $props()

  /*
   * Track whether auto-generation is active.
   * If the slug already has a value when the user first types in the title,
   * we assume it was pre-filled (edit mode) and stop auto-generating.
   */
  let slugTouched = $state(false)
  let hasTypedTitle = $state(false)

  function toSlug(text: string): string {
    return text
      .toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
  }

  function onTitleInput() {
    if (!hasTypedTitle && slug !== '') {
      /* First keystroke on title but slug is already set → edit mode */
      slugTouched = true
    }
    hasTypedTitle = true
    if (!slugTouched) slug = toSlug(title)
  }

  function onSlugInput() {
    slugTouched = true
    if (slug === '') slugTouched = false
  }
</script>

<div>
  <label for="title" class="block text-sm font-medium text-gray-700">{titleLabel}</label>
  <input
    id="title"
    type="text"
    {required}
    bind:value={title}
    oninput={onTitleInput}
    class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
  />

  <!-- Slug shown below the title, editable inline -->
  <div class="mt-1.5 flex items-center gap-1 text-sm text-gray-400">
    <span>{slugPrefix}</span>
    <input
      bind:value={slug}
      oninput={onSlugInput}
      placeholder="auto-generated"
      class="bg-transparent border-none outline-none p-0 text-sm text-gray-500 focus:text-gray-700 w-full"
    />
  </div>
</div>
