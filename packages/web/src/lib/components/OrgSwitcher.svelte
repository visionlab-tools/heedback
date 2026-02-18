<!--
  Dropdown to switch between organizations in the sidebar.
  Also shows a "new org" option to create additional organizations.
-->
<script lang="ts">
  import { _ } from 'svelte-i18n'
  import { ChevronDown, Plus } from 'lucide-svelte'
  import { currentOrg, allOrgs, type Organization } from '../stores/org'
  import CreateOrgModal from './CreateOrgModal.svelte'

  let current = $state<Organization | null>(null)
  let orgs = $state<Organization[]>([])
  let showDropdown = $state(false)
  let showCreateModal = $state(false)

  currentOrg.subscribe((v) => (current = v))
  allOrgs.subscribe((v) => (orgs = v))

  function selectOrg(org: Organization) {
    currentOrg.select(org)
    showDropdown = false
  }

  function openCreateModal() {
    showCreateModal = true
    showDropdown = false
  }
</script>

<div class="relative px-5 py-4 border-b border-white/10">
  <button
    onclick={() => (showDropdown = !showDropdown)}
    class="flex items-center justify-between w-full text-left group"
  >
    <div class="min-w-0">
      <div class="flex items-center gap-2">
        {#if current?.logoUrl}
          <img src={current.logoUrl} alt="" class="w-5 h-5 rounded object-cover" />
        {:else}
          <span class="w-2 h-2 rounded-full bg-indigo-500"></span>
        {/if}
        <h1 class="text-xl font-bold tracking-tight text-white truncate">
          {current?.name ?? $_('login.title')}
        </h1>
      </div>
    </div>
    <ChevronDown
      size={16}
      class="text-slate-400 group-hover:text-slate-200 transition-colors shrink-0"
    />
  </button>

  {#if showDropdown}
    <div class="absolute left-3 right-3 top-full mt-1 bg-slate-800 border border-slate-700 rounded-lg shadow-lg overflow-hidden z-50">
      {#each orgs as org}
        <button
          onclick={() => selectOrg(org)}
          class="flex items-center gap-2 w-full text-left px-3 py-2 text-sm transition-colors
            {org.id === current?.id ? 'text-indigo-400 bg-white/5 font-medium' : 'text-slate-300 hover:bg-white/5'}"
        >
          {#if org.logoUrl}
            <img src={org.logoUrl} alt="" class="w-4 h-4 rounded object-cover" />
          {:else}
            <span class="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
          {/if}
          <span class="truncate">{org.name}</span>
        </button>
      {/each}

      <button
        onclick={openCreateModal}
        class="flex items-center gap-2 w-full text-left px-3 py-2 text-sm text-slate-400 hover:text-slate-200 hover:bg-white/5 border-t border-slate-700 transition-colors"
      >
        <Plus size={14} />
        <span>{$_('create_org.new')}</span>
      </button>
    </div>
  {/if}
</div>

<!-- Close dropdown when clicking outside -->
{#if showDropdown}
  <!-- svelte-ignore a11y_no_static_element_interactions -->
  <!-- svelte-ignore a11y_click_events_have_key_events -->
  <div class="fixed inset-0 z-40" onclick={() => (showDropdown = false)}></div>
{/if}

<!-- Non-blocking modal to create a new org from the switcher -->
{#if showCreateModal}
  <CreateOrgModal blocking={false} onclose={() => (showCreateModal = false)} />
{/if}
