<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import { expect, userEvent } from "storybook/test";
  import FormField from "../form-field/FormField.svelte";
  import ListEditor from "../list-editor/ListEditor.svelte";
  import FieldReviewActions from "./FieldReviewActions.svelte";
  import UnifiedReviewDiff from "./UnifiedReviewDiff.svelte";

  const { Story } = defineMeta({
    title: "UI Forms/Review/Composed Review",
    parameters: {
      docs: {
        description: {
          component:
            "Review primitives composed with Form Inputs (FormField / ListEditor) — not bespoke markup.",
        },
      },
    },
  });
</script>

<script lang="ts">
  let name = $state("AI Name");
  let nameReview = $state<{
    removedValue: string;
    stale?: boolean;
  } | null>({ removedValue: "Original Name" });

  let roles = $state<string[]>(["Staff Engineer", "Backend"]);
  let roleReview = $state<Record<number, { removedValue: string } | null>>({
    0: { removedValue: "Backend" },
  });

  let status = $state("");
</script>

<Story
  name="Keeps a text field review"
  play={async ({ canvas }) => {
    await userEvent.click(canvas.getByRole("button", { name: "Keep" }));
    await expect(canvas.getByRole("status")).toHaveTextContent("kept");
  }}
>
  {#snippet template()}
    <div class="cv-structured-form max-w-xl">
      <FormField
        label="Name"
        value={name}
        review={nameReview
          ? {
              removedValue: nameReview.removedValue,
              stale: nameReview.stale,
              onKeep: () => {
                nameReview = null;
                status = "kept";
              },
              onUndo: () => {
                name = nameReview?.removedValue ?? name;
                nameReview = null;
                status = "undone";
              },
            }
          : null}
      >
        <input
          value={name}
          aria-label="Name"
          oninput={(event) => {
            name = event.currentTarget.value;
          }}
        />
      </FormField>
      <output class="sr-only">{status}</output>
    </div>
  {/snippet}
</Story>

<Story
  name="Reviews a list item with ListEditor"
  play={async ({ canvas }) => {
    await expect(canvas.getByLabelText("Changes")).toBeVisible();
    await userEvent.click(canvas.getByRole("button", { name: "Keep" }));
    await expect(canvas.getByLabelText("Roles 1")).toHaveValue(
      "Staff Engineer",
    );
  }}
>
  {#snippet template()}
    <div class="cv-structured-form max-w-xl">
      <ListEditor
        label="Roles"
        items={roles}
        addLabel="role"
        multiline={false}
        reviewItems={{
          0: roleReview[0]
            ? {
                removedValue: roleReview[0].removedValue,
                onKeep: () => {
                  roleReview = { ...roleReview, 0: null };
                },
                onUndo: () => {
                  const removed = roleReview[0]?.removedValue;
                  if (removed != null) {
                    roles = roles.map((item, index) =>
                      index === 0 ? removed : item,
                    );
                  }
                  roleReview = { ...roleReview, 0: null };
                },
              }
            : null,
        }}
        onChange={(next) => {
          roles = next;
        }}
      />
    </div>
  {/snippet}
</Story>

<Story name="Unified diff with actions" tags={["skip-visual"]}>
  {#snippet template()}
    <div class="cv-structured-form max-w-xl">
      <FormField label="Headline" align="start">
        <UnifiedReviewDiff before="Engineer" after="Staff Engineer" />
        <FieldReviewActions
          onKeep={() => {
            status = "kept-diff";
          }}
          onUndo={() => {
            status = "undone-diff";
          }}
        />
      </FormField>
      <output class="sr-only">{status}</output>
    </div>
  {/snippet}
</Story>
