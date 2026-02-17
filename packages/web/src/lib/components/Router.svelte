<!--
  Declarative router component that matches the current path against a list
  of route definitions and renders the matched component with extracted params.
-->
<script lang="ts">
  import type { Component } from 'svelte'
  import { onMount, onDestroy } from 'svelte'
  import { getPath, matchRoute, initRouter } from '../router.svelte.ts'

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  type AnyComponent = Component<any, any, any>

  export interface RouteDefinition {
    path: string
    component: AnyComponent
    /** Wrap this route inside the layout component */
    layout?: AnyComponent
  }

  let { routes }: { routes: RouteDefinition[] } = $props()

  let cleanup: (() => void) | undefined

  onMount(() => {
    cleanup = initRouter()
  })

  onDestroy(() => cleanup?.())

  /* $derived must be pure — no side-effects like setParams().
     We resolve the route and params together in a single derivation. */
  let match = $derived.by(() => {
    const path = getPath()

    for (const def of routes) {
      if (def.path === '*') {
        return { def, params: {} as Record<string, string> }
      }

      const params = matchRoute(def.path, path)
      if (params !== null) {
        return { def, params }
      }
    }

    return null
  })
</script>

{#if match}
  {#if match.def.layout}
    {#key match.def.path}
      {@const LayoutComp = match.def.layout}
      {@const PageComp = match.def.component}
      <LayoutComp>
        <PageComp {...match.params} />
      </LayoutComp>
    {/key}
  {:else}
    {#key match.def.path}
      {@const PageComp = match.def.component}
      <PageComp {...match.params} />
    {/key}
  {/if}
{/if}
