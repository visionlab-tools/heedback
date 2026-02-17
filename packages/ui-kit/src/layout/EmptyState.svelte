<!--
  Placeholder shown when a list has no items.
-->
<script lang="ts">
  let {
    message,
  }: {
    message: string
  } = $props()
</script>

<div class="mt-8 text-center py-12 bg-white rounded-xl border border-gray-200">
  <p class="text-gray-500">{message}</p>
</div>
