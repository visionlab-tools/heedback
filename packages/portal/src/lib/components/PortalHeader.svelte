<script lang="ts">
  let { orgName = 'Heedback', brandColor = '#6366f1' }: { orgName?: string; brandColor?: string } = $props()
</script>

<header class="border-b border-gray-200 bg-white">
  <div class="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
    <a href="/" class="text-xl font-bold" style="color: {brandColor}">
      {orgName}
    </a>
    <nav class="flex items-center gap-6 text-sm font-medium text-gray-600">
      <a href="/help" class="hover:text-gray-900">Help Center</a>
      <a href="/feedback" class="hover:text-gray-900">Feedback</a>
      <a href="/roadmap" class="hover:text-gray-900">Roadmap</a>
      <a href="/changelog" class="hover:text-gray-900">Changelog</a>
    </nav>
  </div>
</header>
