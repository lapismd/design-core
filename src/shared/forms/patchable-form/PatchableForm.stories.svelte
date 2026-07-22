<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import { expect, userEvent, waitFor } from "storybook/test";
  import {
    createFormConfig,
    createOrAppendJsonReview,
    reviewedStringListField,
    reviewedTextField,
    type FormReviewState,
  } from "../core/core";
  import { clickYamlReviewButton } from "../core/yaml-review-play";
  import type { YamlReviewDiff } from "../yaml-editor/YamlEditor.svelte";
  import PatchableForm from "./PatchableForm.svelte";

  type Profile = {
    name: string;
    headline: string;
    roles: string[];
  };

  function profileConfig() {
    return createFormConfig<
      Profile,
      import("../core/field-review").FieldReviewContext
    >({
      id: "patchable-profile",
      fields: [
        reviewedTextField<Profile>({
          id: "name",
          label: "Name",
          get: (root) => root.name,
          set: (root, value) => ({ ...root, name: value }),
        }),
        reviewedTextField<Profile>({
          id: "headline",
          label: "Headline",
          get: (root) => root.headline,
          set: (root, value) => ({ ...root, headline: value }),
        }),
        reviewedStringListField<Profile>({
          id: "roles",
          label: "Roles",
          addLabel: "Add role",
          get: (root) => root.roles,
          set: (root, value) => ({ ...root, roles: value }),
        }),
      ],
    });
  }

  function seedNameReview(base: Profile): FormReviewState<Profile> {
    return createOrAppendJsonReview(null, "story", base, {
      id: "proposal-name",
      title: "Update name",
      valid: true,
      operations: [{ op: "replace", path: "/name", value: "AI Name" }],
    });
  }

  function seedRoleReview(base: Profile): FormReviewState<Profile> {
    return createOrAppendJsonReview(null, "story", base, {
      id: "proposal-role",
      title: "Update role",
      valid: true,
      operations: [
        { op: "replace", path: "/roles/0", value: "Staff Engineer" },
      ],
    });
  }

  function profileYaml(value: Profile) {
    return [
      `name: ${value.name}`,
      `headline: ${value.headline}`,
      "roles:",
      ...value.roles.map((role) => `  - ${role}`),
    ].join("\n");
  }

  function yamlDiffsFor(review: FormReviewState<Profile>): YamlReviewDiff[] {
    return review.changes
      .filter((change) => change.status === "pending")
      .map((change) => {
        const afterValue = {
          ...review.baseValue,
        } as Profile;
        // Apply only this change's ops via preview helpers from the story seed paths.
        for (const operation of change.operations) {
          if (operation.op === "remove") continue;
          if (operation.path === "/name") {
            afterValue.name = String(operation.value);
          }
          if (operation.path === "/headline") {
            afterValue.headline = String(operation.value);
          }
          const roleMatch = operation.path.match(/^\/roles\/(\d+)$/);
          if (roleMatch) {
            const index = Number(roleMatch[1]);
            afterValue.roles = afterValue.roles.map((role, roleIndex) =>
              roleIndex === index ? String(operation.value) : role,
            );
          }
        }
        return {
          id: change.id,
          title: change.title,
          before: profileYaml(review.baseValue),
          after: profileYaml(afterValue),
          paths: change.paths,
          status: change.status,
          stale: review.stale,
        };
      });
  }

  const { Story } = defineMeta({
    title: "UI Forms/Orchestrators/Patchable Form",
    component: PatchableForm,
    parameters: {
      docs: {
        description: {
          component:
            "Structured + YAML form surface with JSON Patch Keep/Undo review.",
        },
      },
    },
  });
</script>

<script lang="ts">
  const config = profileConfig();

  let formValue = $state<Profile>({
    name: "Original Name",
    headline: "Engineer",
    roles: ["Backend"],
  });
  let formReview = $state<FormReviewState<Profile> | null>(
    seedNameReview({
      name: "Original Name",
      headline: "Engineer",
      roles: ["Backend"],
    }),
  );
  let formStatus = $state("pending");

  let undoValue = $state<Profile>({
    name: "Original Name",
    headline: "Engineer",
    roles: ["Backend"],
  });
  let undoReview = $state<FormReviewState<Profile> | null>(
    seedNameReview({
      name: "Original Name",
      headline: "Engineer",
      roles: ["Backend"],
    }),
  );
  let undoStatus = $state("pending");

  let listValue = $state<Profile>({
    name: "Original Name",
    headline: "Engineer",
    roles: ["Backend"],
  });
  let listReview = $state<FormReviewState<Profile> | null>(
    seedRoleReview({
      name: "Original Name",
      headline: "Engineer",
      roles: ["Backend"],
    }),
  );
  let listStatus = $state("pending");

  let yamlValue = $state<Profile>({
    name: "Original Name",
    headline: "Engineer",
    roles: ["Backend"],
  });
  let yamlText = $state(
    profileYaml({
      name: "Original Name",
      headline: "Engineer",
      roles: ["Backend"],
    }),
  );
  let yamlReview = $state<FormReviewState<Profile> | null>(
    seedNameReview({
      name: "Original Name",
      headline: "Engineer",
      roles: ["Backend"],
    }),
  );
  let yamlStatus = $state("pending");

  let staleValue = $state<Profile>({
    name: "Original Name",
    headline: "Engineer",
    roles: ["Backend"],
  });
  let staleReview = $state<FormReviewState<Profile> | null>({
    ...seedNameReview({
      name: "Original Name",
      headline: "Engineer",
      roles: ["Backend"],
    }),
    stale: true,
  });
</script>

<Story
  name="Keeps a form field patch"
  play={async ({ canvas }) => {
    await expect(canvas.getByLabelText("Changes")).toBeVisible();
    await expect(canvas.getByRole("button", { name: "Keep" })).toBeVisible();
    await userEvent.click(canvas.getByRole("button", { name: "Keep" }));
    await waitFor(() =>
      expect(canvas.getByRole("status")).toHaveTextContent("accepted:AI Name"),
    );
    await expect(canvas.getByRole("textbox", { name: "Name" })).toHaveValue(
      "AI Name",
    );
  }}
  tags={["skip-visual"]}
>
  {#snippet template()}
    <div class="flex max-w-xl flex-col gap-2">
      <PatchableForm
        value={formValue}
        {config}
        review={formReview}
        onReviewChange={(next) => {
          formReview = next;
          if (!next) formStatus = `accepted:${formValue.name}`;
        }}
        onChange={(next) => {
          formValue = next as Profile;
          formStatus = `accepted:${(next as Profile).name}`;
        }}
      />
      <output class="text-muted-foreground text-sm">{formStatus}</output>
    </div>
  {/snippet}
</Story>

<Story
  name="Undoes a form field patch"
  play={async ({ canvas }) => {
    await expect(canvas.getByLabelText("Changes")).toBeVisible();
    await userEvent.click(canvas.getByRole("button", { name: "Undo" }));
    await waitFor(() =>
      expect(canvas.getByRole("status")).toHaveTextContent(
        "rejected:Original Name",
      ),
    );
    await expect(canvas.getByRole("textbox", { name: "Name" })).toHaveValue(
      "Original Name",
    );
  }}
  tags={["skip-visual"]}
>
  {#snippet template()}
    <div class="flex max-w-xl flex-col gap-2">
      <PatchableForm
        value={undoValue}
        {config}
        review={undoReview}
        onReviewChange={(next) => {
          undoReview = next;
        }}
        onChange={(next) => {
          undoValue = next as Profile;
          undoStatus = `rejected:${(next as Profile).name}`;
        }}
      />
      <output class="text-muted-foreground text-sm">{undoStatus}</output>
    </div>
  {/snippet}
</Story>

<Story
  name="Keeps a list item patch"
  play={async ({ canvas }) => {
    await expect(canvas.getByLabelText("Changes")).toBeVisible();
    await userEvent.click(canvas.getByRole("button", { name: "Keep" }));
    await waitFor(() =>
      expect(canvas.getByRole("status")).toHaveTextContent(
        "accepted:Staff Engineer",
      ),
    );
  }}
  tags={["skip-visual"]}
>
  {#snippet template()}
    <div class="flex max-w-xl flex-col gap-2">
      <PatchableForm
        value={listValue}
        {config}
        review={listReview}
        onReviewChange={(next) => {
          listReview = next;
        }}
        onChange={(next) => {
          listValue = next as Profile;
          listStatus = `accepted:${(next as Profile).roles[0]}`;
        }}
      />
      <output class="text-muted-foreground text-sm">{listStatus}</output>
    </div>
  {/snippet}
</Story>

<Story
  name="Keeps a YAML review hunk"
  play={async ({ canvas, canvasElement }) => {
    await waitFor(() => {
      expect(canvasElement.querySelector(".cm-ai-review-block")).not.toBeNull();
    });
    await clickYamlReviewButton(canvasElement, "keep");
    await waitFor(() =>
      expect(canvas.getByRole("status")).toHaveTextContent("accepted:AI Name"),
    );
  }}
  tags={["skip-visual"]}
>
  {#snippet template()}
    <div class="flex max-w-2xl flex-col gap-2">
      <PatchableForm
        value={yamlValue}
        {config}
        yamlMode={true}
        bind:yamlText
        review={yamlReview}
        toYamlDiffs={yamlDiffsFor}
        onReviewChange={(next) => {
          yamlReview = next;
        }}
        onChange={(next) => {
          yamlValue = next as Profile;
          yamlText = profileYaml(next as Profile);
          yamlStatus = `accepted:${(next as Profile).name}`;
        }}
      />
      <output class="text-muted-foreground text-sm">{yamlStatus}</output>
    </div>
  {/snippet}
</Story>

<Story
  name="Hides Keep when stale"
  play={async ({ canvas }) => {
    await expect(canvas.getByLabelText("Changes")).toBeVisible();
    await expect(canvas.getByRole("button", { name: "Undo" })).toBeVisible();
    await expect(canvas.queryByRole("button", { name: "Keep" })).toBeNull();
  }}
  tags={["skip-visual"]}
>
  {#snippet template()}
    <div class="flex max-w-xl flex-col gap-2">
      <PatchableForm
        value={staleValue}
        {config}
        review={staleReview}
        onReviewChange={(next) => {
          staleReview = next;
        }}
        onChange={(next) => {
          staleValue = next as Profile;
        }}
      />
    </div>
  {/snippet}
</Story>
