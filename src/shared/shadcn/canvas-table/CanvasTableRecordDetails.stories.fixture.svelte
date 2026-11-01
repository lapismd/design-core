<script lang="ts">
  import X from "@lucide/svelte/icons/x";
  import { Badge } from "../badge/index.js";
  import { Button } from "../button/index.js";
  import type { CanvasTableRowContext } from "./index.js";
  let { context }: { context: CanvasTableRowContext } = $props();
  const amount = $derived(
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(Number(context.row.cells[1]) || 0),
  );
</script>

<section class="record-details" aria-label="Account review">
  <header>
    <div>
      <span class="eyebrow">Account review</span><strong
        >Details for {context.row.cells[0]}</strong
      >
    </div>
    <Badge variant="secondary">In review</Badge>
    <Button
      variant="ghost"
      size="icon-xs"
      aria-label="Close row details"
      onclick={context.close}><X aria-hidden="true" /></Button
    >
  </header>
  <dl>
    <div>
      <dt>Account owner</dt>
      <dd>Maya Chen</dd>
    </div>
    <div>
      <dt>Renewal value</dt>
      <dd>{amount}</dd>
    </div>
    <div>
      <dt>Next review</dt>
      <dd>12 November 2026</dd>
    </div>
    <div>
      <dt>Reference</dt>
      <dd>REC-{String(context.row.id).padStart(4, "0")}</dd>
    </div>
  </dl>
  <p>
    Quarterly service renewal for the design systems team. Confirm seat counts
    and the billing contact before approval.
  </p>
  <footer>
    <span>Latest activity</span>Finance approved the estimate · 2 hours ago
  </footer>
</section>

<style>
  .record-details {
    display: grid;
    gap: 0.875rem;
    padding: 1rem;
    color: var(--foreground);
    font-size: 0.8125rem;
    line-height: 1.5;
  }
  header {
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }
  header > div {
    display: grid;
    gap: 0.125rem;
    flex: 1;
    min-width: 0;
  }
  .eyebrow {
    color: var(--muted-foreground);
    font-size: 0.625rem;
    letter-spacing: 0.06em;
    text-transform: uppercase;
  }
  strong {
    font-size: 0.875rem;
    font-weight: 600;
  }
  dl {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(130px, 1fr));
    gap: 0.75rem;
    margin: 0;
  }
  dt {
    color: var(--muted-foreground);
    font-size: 0.75rem;
  }
  dd {
    margin: 0.125rem 0 0;
    font-weight: 500;
  }
  p {
    margin: 0;
    max-width: 70ch;
  }
  footer {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    color: var(--muted-foreground);
    font-size: 0.75rem;
  }
  footer > span {
    color: var(--foreground);
    font-weight: 500;
  }
</style>
