<script lang="ts">
  import { X } from 'lucide-svelte'
  import { toasts, dismissToast } from '../stores/toast'

  const variantClasses: Record<string, string> = {
    error: 'bg-red-600 text-white',
    success: 'bg-emerald-600 text-white',
  }
</script>

<div class="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
  {#each $toasts as toast (toast.id)}
    <div
      class="flex items-center gap-3 rounded-lg px-4 py-3 shadow-lg animate-slide-in {variantClasses[toast.variant]}"
      role="alert"
    >
      <span class="text-sm font-medium">{toast.message}</span>
      <button onclick={() => dismissToast(toast.id)} class="ml-auto shrink-0 opacity-80 hover:opacity-100">
        <X size={16} />
      </button>
    </div>
  {/each}
</div>

<style>
  @keyframes slide-in {
    from {
      opacity: 0;
      transform: translateX(1rem);
    }
    to {
      opacity: 1;
      transform: translateX(0);
    }
  }

  .animate-slide-in {
    animation: slide-in 0.2s ease-out;
  }
</style>
