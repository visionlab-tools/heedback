<!--
  Color picker with preset swatches, hex input, and native picker fallback.
  Emits a hex color string via bindable `value`.
-->
<script lang="ts">
  let {
    label,
    value = $bindable('#6366f1'),
    hint,
    id,
  }: {
    label?: string
    value?: string
    hint?: string
    id?: string
  } = $props()

  let showPopover = $state(false)

  const presets = [
    '#6366f1', '#8b5cf6', '#ec4899', '#ef4444',
    '#f97316', '#eab308', '#22c55e', '#14b8a6',
    '#06b6d4', '#3b82f6', '#1e293b', '#64748b',
  ]

  function selectPreset(color: string) {
    value = color
    showPopover = false
  }

  function handleHexInput(e: Event) {
    const input = (e.target as HTMLInputElement).value
    // Only accept valid hex values
    if (/^#[0-9a-fA-F]{6}$/.test(input)) {
      value = input
    }
  }

  function handleClickOutside(e: MouseEvent) {
    const target = e.target as HTMLElement
    if (!target.closest('.hb-color-picker')) {
      showPopover = false
    }
  }
</script>

<svelte:window onclick={handleClickOutside} />

<div class="hb-color-picker">
  {#if label}
    <label for={id} class="block text-sm font-medium text-slate-700">{label}</label>
  {/if}

  <div class="mt-1 flex items-center gap-2">
    <!-- Swatch button that opens the popover -->
    <button
      type="button"
      class="h-10 w-10 rounded-lg border border-slate-300 cursor-pointer shrink-0 shadow-sm hover:shadow transition-shadow relative overflow-hidden"
      style="background-color: {value};"
      onclick={() => (showPopover = !showPopover)}
      aria-label="Pick color"
    >
      <!-- Checkerboard background for transparency indication -->
      <span class="absolute inset-0 rounded-lg ring-1 ring-inset ring-black/10"></span>
    </button>

    <!-- Hex text input -->
    <input
      {id}
      type="text"
      value={value}
      oninput={handleHexInput}
      maxlength={7}
      class="block w-full px-3 py-2 border border-slate-300 rounded-lg hover:border-slate-400 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors font-mono text-sm"
    />
  </div>

  <!-- Popover with presets + native picker -->
  {#if showPopover}
    <div class="mt-2 p-3 bg-white rounded-xl border border-slate-200 shadow-lg w-[232px] animate-in">
      <div class="grid grid-cols-6 gap-1.5">
        {#each presets as color}
          <button
            type="button"
            class="w-8 h-8 rounded-lg cursor-pointer border-2 transition-all hover:scale-110"
            class:border-indigo-500={value === color}
            class:border-transparent={value !== color}
            class:shadow-md={value === color}
            style="background-color: {color};"
            onclick={() => selectPreset(color)}
            aria-label={color}
          >
            {#if value === color}
              <svg class="w-4 h-4 mx-auto text-white drop-shadow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
            {/if}
          </button>
        {/each}
      </div>

      <!-- Native picker for custom colors -->
      <div class="mt-2.5 pt-2.5 border-t border-slate-100 flex items-center gap-2">
        <label class="relative cursor-pointer">
          <input
            type="color"
            bind:value
            class="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
          />
          <span
            class="inline-flex items-center gap-1.5 text-xs font-medium text-slate-600 hover:text-slate-800 transition-colors"
          >
            <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="13.5" cy="6.5" r="2.5"></circle>
              <circle cx="6.5" cy="13.5" r="2.5"></circle>
              <circle cx="17.5" cy="17.5" r="2.5"></circle>
            </svg>
            Custom color...
          </span>
        </label>
      </div>
    </div>
  {/if}

  {#if hint}
    <p class="mt-1 text-sm text-slate-500">{hint}</p>
  {/if}
</div>

<style>
  .animate-in {
    animation: pop-in 0.15s cubic-bezier(0.16, 1, 0.3, 1);
  }
  @keyframes pop-in {
    from {
      opacity: 0;
      transform: translateY(-4px) scale(0.97);
    }
    to {
      opacity: 1;
      transform: translateY(0) scale(1);
    }
  }
</style>
