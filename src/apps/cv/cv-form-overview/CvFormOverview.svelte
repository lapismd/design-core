<script lang="ts">
  import {
    AddSectionChooser,
    ChipAutocomplete,
    EntryActions,
    FormField,
    FormPlaceholder,
    FormSectionHeader,
    StructuredForm,
  } from "@stevejuma/ui/forms";
  import { createFormConfig, textField } from "@stevejuma/ui/forms/core";
  import * as Select from "@stevejuma/ui/shadcn/select";
  import * as Tabs from "@stevejuma/ui/shadcn/tabs";

  type Profile = {
    name: string;
    headline: string;
    location: string;
    email: string;
    phone: string;
    website: string;
  };

  type Experience = {
    company: string;
    position: string;
    date: string;
    summary: string;
  };

  let {
    /** Active studio tab. */
    tab = $bindable("cv"),
  }: {
    tab?: string;
  } = $props();

  let profile = $state<Profile>({
    name: "Jane Doe",
    headline: "Product Designer",
    location: "San Francisco, CA",
    email: "jane@example.com",
    phone: "+1 555 0100",
    website: "https://jane.design",
  });

  let network = $state("linkedin");
  const networkLabels: Record<string, string> = {
    linkedin: "LinkedIn",
    github: "GitHub",
    twitter: "Twitter",
  };
  let username = $state("jane");
  let targetRoles = $state<string[]>(["Frontend Engineer"]);
  let experienceOpen = $state(true);
  let experience = $state<Experience>({
    company: "Acme",
    position: "Senior Designer",
    date: "2020 — Present",
    summary: "Led product design for the design system.",
  });

  let addSectionOpen = $state(false);
  let addSectionTitle = $state("");

  const profileConfig = createFormConfig<Profile>({
    id: "cv-profile",
    fields: [
      textField({
        id: "name",
        label: "Name",
        get: (p) => p.name,
        set: (p, name) => ({ ...p, name }),
      }),
      textField({
        id: "headline",
        label: "Headline",
        get: (p) => p.headline,
        set: (p, headline) => ({ ...p, headline }),
      }),
      textField({
        id: "location",
        label: "Location",
        get: (p) => p.location,
        set: (p, location) => ({ ...p, location }),
      }),
      textField({
        id: "email",
        label: "Email",
        inputType: "email",
        get: (p) => p.email,
        set: (p, email) => ({ ...p, email }),
      }),
      textField({
        id: "phone",
        label: "Phone",
        get: (p) => p.phone,
        set: (p, phone) => ({ ...p, phone }),
      }),
      textField({
        id: "website",
        label: "Website",
        get: (p) => p.website,
        set: (p, website) => ({ ...p, website }),
      }),
    ],
  });

  const sectionOptions = [
    { value: "experience", label: "Experience" },
    { value: "education", label: "Education" },
    { value: "skills", label: "Skills" },
  ];
</script>

<div data-testid="cv-form-overview">
  <Tabs.Root bind:value={tab}>
    <div class="border-b px-3 pt-1.5">
      <Tabs.List variant="line" class="justify-start overflow-visible">
        <Tabs.Trigger value="cv">CV</Tabs.Trigger>
        <Tabs.Trigger value="evidence">Evidence</Tabs.Trigger>
        <Tabs.Trigger value="design">Design</Tabs.Trigger>
        <Tabs.Trigger value="locale">Locale</Tabs.Trigger>
        <Tabs.Trigger value="settings">Settings</Tabs.Trigger>
      </Tabs.List>
    </div>

    <Tabs.Content value="cv">
      <div class="flex max-w-[646px] flex-col gap-6 py-4 pr-11 pl-10">
        <StructuredForm
          value={profile}
          config={profileConfig}
          onChange={(next) => {
            profile = next as Profile;
          }}
        />

        <div class="cv-structured-form">
          <FormField as="div" label="Network">
            <Select.Root type="single" bind:value={network}>
              <Select.Trigger
                aria-label="Network"
                class="w-full border-0 bg-transparent px-0 shadow-none"
              >
                {networkLabels[network] ?? network}
              </Select.Trigger>
              <Select.Content aria-label="Network options">
                <Select.Item value="linkedin" label="LinkedIn"
                  >LinkedIn</Select.Item
                >
                <Select.Item value="github" label="GitHub">GitHub</Select.Item>
                <Select.Item value="twitter" label="Twitter"
                  >Twitter</Select.Item
                >
              </Select.Content>
            </Select.Root>
          </FormField>
          <FormField label="Username">
            <input aria-label="Username" bind:value={username} />
          </FormField>
        </div>

        <div class="cv-structured-form">
          <FormField as="div" label="Target Roles">
            <ChipAutocomplete
              value={targetRoles}
              suggestions={["Frontend Engineer", "Product Designer"]}
              label="Target Roles"
              showLabel={false}
              uppercase={false}
              embedded={true}
              onChange={(next) => {
                targetRoles = next;
              }}
            />
          </FormField>
        </div>

        <section class="flex flex-col gap-3">
          <FormSectionHeader
            title="Experience"
            index={0}
            total={1}
            editable={false}
            titleToggleable
            open={experienceOpen}
            onToggle={() => {
              experienceOpen = !experienceOpen;
            }}
          />
          {#if experienceOpen}
            <EntryActions index={0} total={1}>
              <div class="cv-structured-form">
                <FormField label="Company">
                  <input aria-label="Company" bind:value={experience.company} />
                </FormField>
                <FormField label="Position">
                  <input
                    aria-label="Position"
                    bind:value={experience.position}
                  />
                </FormField>
                <FormField label="Date">
                  <input aria-label="Date" bind:value={experience.date} />
                </FormField>
                <FormField label="Summary">
                  <textarea
                    aria-label="Summary"
                    rows="3"
                    bind:value={experience.summary}
                  ></textarea>
                </FormField>
              </div>
            </EntryActions>
          {/if}
          <button
            type="button"
            class="text-muted-foreground hover:text-foreground w-fit text-sm"
          >
            Add experience
          </button>
        </section>

        <AddSectionChooser
          open={addSectionOpen}
          title={addSectionTitle}
          options={sectionOptions}
          onOpen={() => {
            addSectionOpen = true;
          }}
          onCancel={() => {
            addSectionOpen = false;
            addSectionTitle = "";
          }}
          onTitleChange={(next) => {
            addSectionTitle = next;
          }}
          onChoose={() => {
            addSectionOpen = false;
            addSectionTitle = "";
          }}
        />
      </div>
    </Tabs.Content>

    <Tabs.Content value="evidence">
      <div class="p-4">
        <FormPlaceholder>Evidence tab placeholder.</FormPlaceholder>
      </div>
    </Tabs.Content>
    <Tabs.Content value="design">
      <div class="p-4">
        <FormPlaceholder>Design tab placeholder.</FormPlaceholder>
      </div>
    </Tabs.Content>
    <Tabs.Content value="locale">
      <div class="p-4">
        <FormPlaceholder>Locale tab placeholder.</FormPlaceholder>
      </div>
    </Tabs.Content>
    <Tabs.Content value="settings">
      <div class="p-4">
        <FormPlaceholder>Settings tab placeholder.</FormPlaceholder>
      </div>
    </Tabs.Content>
  </Tabs.Root>
</div>
