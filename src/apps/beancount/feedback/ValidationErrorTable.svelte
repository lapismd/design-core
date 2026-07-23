<script lang="ts">
  import * as Table from "@stevejuma/ui/shadcn/table";

  export type ValidationErrorRow = {
    id: string;
    line?: string | number;
    message: string;
    entity?: string;
    href?: string;
  };

  let {
    errors,
    ariaLabel = "Validation errors",
    emptyTitle = "No validation errors",
    emptyDescription = "This ledger has no errors to review.",
    onNavigate,
  }: {
    errors: readonly ValidationErrorRow[];
    ariaLabel?: string;
    emptyTitle?: string;
    emptyDescription?: string;
    onNavigate?: (error: ValidationErrorRow) => void;
  } = $props();

  function navigate(error: ValidationErrorRow, event: MouseEvent) {
    if (onNavigate) event.preventDefault();
    onNavigate?.(error);
  }
</script>

{#if errors.length}
  <div
    class="border-border/80 bg-card overflow-x-auto rounded-xl border shadow-sm"
  >
    <Table.Root aria-label={ariaLabel} class="min-w-[42rem]">
      <Table.Header>
        <Table.Row class="bg-muted/65 hover:bg-muted/65">
          <Table.Head
            class="w-20 px-4 py-2 text-xs font-semibold tracking-[0.12em] uppercase"
          >
            Line
          </Table.Head>
          <Table.Head
            class="min-w-72 px-4 py-2 text-xs font-semibold tracking-[0.12em] uppercase"
          >
            Message
          </Table.Head>
          <Table.Head
            class="min-w-80 px-4 py-2 text-xs font-semibold tracking-[0.12em] uppercase"
          >
            Source context
          </Table.Head>
        </Table.Row>
      </Table.Header>
      <Table.Body>
        {#each errors as error (error.id)}
          <Table.Row>
            <Table.Cell class="px-4 py-3 font-mono text-xs tabular-nums">
              {#if error.href}
                <a
                  href={error.href}
                  class="text-primary focus-visible:ring-ring font-medium underline-offset-4 hover:underline focus-visible:ring-2 focus-visible:outline-none"
                  onclick={(event) => navigate(error, event)}
                  >{error.line ?? "—"}</a
                >
              {:else}
                {error.line ?? "—"}
              {/if}
            </Table.Cell>
            <Table.Cell class="text-destructive px-4 py-3 align-top text-sm">
              {error.message}
            </Table.Cell>
            <Table.Cell class="px-4 py-3 align-top">
              {#if error.entity}
                <code
                  class="text-muted-foreground block font-mono text-xs leading-relaxed break-words whitespace-pre-wrap"
                  >{error.entity}</code
                >
              {:else}
                <span class="text-muted-foreground text-sm">—</span>
              {/if}
            </Table.Cell>
          </Table.Row>
        {/each}
      </Table.Body>
    </Table.Root>
  </div>
{:else}
  <section
    class="border-border/80 bg-card rounded-xl border border-dashed px-5 py-8 text-center shadow-sm"
    aria-label={ariaLabel}
  >
    <h3 class="text-sm font-semibold">{emptyTitle}</h3>
    <p class="text-muted-foreground mt-1 text-sm">{emptyDescription}</p>
  </section>
{/if}
