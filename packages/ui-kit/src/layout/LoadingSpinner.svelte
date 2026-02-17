<!--
  Centered loading indicator with optional message.
-->
<script lang="ts">
  let {
    message = 'Loading...',
  }: {
    message?: string
  } = $props()
</script>

<div class="mt-8 text-center text-gray-500">{message}</div>
