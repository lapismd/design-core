import {
  booleanField,
  createFormConfig,
  optionField,
  orderedStringListField,
  segmentedField,
  textareaField,
  textField,
} from "../core/core";
import type { FormConfig, FormFieldConfig } from "../core/types";
import { getAtPath, setAtPath } from "./complete-cv-form.model";
import type {
  CvEntryType,
  PathPart,
  StoryRecord,
} from "./complete-cv-form.types";

export type StoryOption = { value: string; label: string };
export type StoryField = {
  id: string;
  label: string;
  path: PathPart[];
  kind?: "text" | "textarea" | "boolean" | "option" | "segmented" | "list";
  defaultValue?: string | boolean | string[];
  placeholder?: string;
  inputType?: string;
  options?: StoryOption[];
  addLabel?: string;
  seedPath?: PathPart[];
  seedValue?: unknown;
};

export type StoryFormGroup = {
  id: string;
  title: string;
  fields: StoryField[];
};

const options = (values: string[]): StoryOption[] =>
  values.map((value) => ({ value, label: value }));

function fieldConfig(
  field: StoryField,
): FormFieldConfig<StoryRecord, undefined, any> {
  const setValue = (root: StoryRecord, value: unknown) => {
    const seeded =
      field.seedPath && getAtPath(root, field.seedPath) === undefined
        ? setAtPath(root, field.seedPath, field.seedValue)
        : root;
    return setAtPath(seeded, field.path, value);
  };
  const base = {
    id: field.id,
    label: field.label,
    placeholder: field.placeholder,
    inputType: field.inputType,
  };
  const getString = (root: StoryRecord) =>
    String(getAtPath(root, field.path) ?? field.defaultValue ?? "");
  if (field.kind === "textarea") {
    return textareaField({ ...base, get: getString, set: setValue });
  }
  if (field.kind === "boolean") {
    return booleanField({
      ...base,
      get: (root) =>
        Boolean(getAtPath(root, field.path) ?? field.defaultValue ?? false),
      set: setValue,
    });
  }
  if (field.kind === "option") {
    return optionField({
      ...base,
      options: field.options ?? [],
      get: getString,
      set: setValue,
    });
  }
  if (field.kind === "segmented") {
    return segmentedField({
      ...base,
      options: field.options ?? [],
      get: getString,
      set: setValue,
    });
  }
  if (field.kind === "list") {
    return orderedStringListField({
      ...base,
      addLabel: field.addLabel ?? "item",
      get: (root) =>
        (getAtPath(root, field.path) as string[] | undefined) ?? [],
      set: setValue,
    });
  }
  return textField({ ...base, get: getString, set: setValue });
}

export function storyFormConfig(
  id: string,
  fields: StoryField[],
): FormConfig<StoryRecord, undefined> {
  return createFormConfig<StoryRecord>({ id, fields: fields.map(fieldConfig) });
}

export const profileConfig = storyFormConfig("complete-cv-profile", [
  {
    id: "profile-name",
    label: "Name",
    path: ["name"],
    placeholder: "Full name",
  },
  { id: "profile-headline", label: "Headline", path: ["headline"] },
  { id: "profile-location", label: "Location", path: ["location"] },
  { id: "profile-email", label: "Email", path: ["email"], inputType: "email" },
  { id: "profile-phone", label: "Phone", path: ["phone"], inputType: "tel" },
  {
    id: "profile-website",
    label: "Website",
    path: ["website"],
    inputType: "url",
  },
  { id: "profile-last-updated", label: "Last updated", path: ["last_updated"] },
]);

export const targetRolesConfig = storyFormConfig("complete-cv-target-roles", [
  {
    id: "profile-target-roles",
    label: "Target Roles",
    path: ["target_roles"],
    kind: "list",
    addLabel: "Add",
  },
]);

export const socialNetworkConfig = storyFormConfig(
  "complete-cv-social-network",
  [
    {
      id: "social-network",
      label: "Network",
      path: ["network"],
      kind: "option",
      options: options([
        "LinkedIn",
        "GitHub",
        "GitLab",
        "IMDB",
        "Instagram",
        "ORCID",
        "Mastodon",
        "StackOverflow",
        "ResearchGate",
        "YouTube",
        "Google Scholar",
        "Telegram",
        "WhatsApp",
        "Leetcode",
        "X",
        "Bluesky",
        "Reddit",
      ]),
    },
    { id: "social-username", label: "Username", path: ["username"] },
  ],
);

const sharedDateFields: StoryField[] = [
  { id: "date", label: "Date", path: ["date"] },
  { id: "start-date", label: "Start date", path: ["start_date"] },
  { id: "end-date", label: "End date", path: ["end_date"] },
  { id: "display-date", label: "Display date", path: ["display_date"] },
];

export const entryConfigs: Record<
  CvEntryType,
  FormConfig<StoryRecord, undefined>
> = {
  TextEntry: storyFormConfig("complete-cv-text-entry", [
    { id: "text", label: "Text", path: ["text"], kind: "textarea" },
  ]),
  ExperienceEntry: storyFormConfig("complete-cv-experience-entry", [
    { id: "company", label: "Company", path: ["company"] },
    { id: "position", label: "Position", path: ["position"] },
    { id: "location", label: "Location", path: ["location"] },
    ...sharedDateFields,
    { id: "summary", label: "Summary", path: ["summary"], kind: "textarea" },
    {
      id: "highlights",
      label: "Highlights",
      path: ["highlights"],
      kind: "list",
      addLabel: "highlight",
    },
  ]),
  EducationEntry: storyFormConfig("complete-cv-education-entry", [
    { id: "institution", label: "Institution", path: ["institution"] },
    { id: "area", label: "Area", path: ["area"] },
    { id: "degree", label: "Degree", path: ["degree"] },
    { id: "location", label: "Location", path: ["location"] },
    ...sharedDateFields,
    { id: "summary", label: "Summary", path: ["summary"], kind: "textarea" },
    {
      id: "highlights",
      label: "Highlights",
      path: ["highlights"],
      kind: "list",
      addLabel: "highlight",
    },
  ]),
  PublicationEntry: storyFormConfig("complete-cv-publication-entry", [
    { id: "title", label: "Title", path: ["title"] },
    { id: "journal", label: "Journal", path: ["journal"] },
    { id: "date", label: "Date", path: ["date"] },
    { id: "doi", label: "DOI", path: ["doi"] },
    { id: "url", label: "URL", path: ["url"], inputType: "url" },
    { id: "summary", label: "Summary", path: ["summary"], kind: "textarea" },
    {
      id: "authors",
      label: "Authors",
      path: ["authors"],
      kind: "list",
      addLabel: "author",
    },
  ]),
  OneLineEntry: storyFormConfig("complete-cv-one-line-entry", [
    { id: "label", label: "Label", path: ["label"] },
    { id: "details", label: "Details", path: ["details"], kind: "textarea" },
  ]),
  BulletEntry: storyFormConfig("complete-cv-bullet-entry", [
    { id: "bullet", label: "Bullet", path: ["bullet"], kind: "textarea" },
  ]),
  NumberedEntry: storyFormConfig("complete-cv-numbered-entry", [
    {
      id: "number",
      label: "Numbered item",
      path: ["number"],
      kind: "textarea" as const,
    },
  ]),
  ReversedNumberedEntry: storyFormConfig(
    "complete-cv-reversed-numbered-entry",
    [
      {
        id: "reversed-number",
        label: "Reversed numbered item",
        path: ["reversed_number"],
        kind: "textarea",
      },
    ],
  ),
  NormalEntry: storyFormConfig("complete-cv-normal-entry", [
    { id: "name", label: "Name", path: ["name"] },
    { id: "url", label: "URL", path: ["url"], inputType: "url" },
    ...sharedDateFields,
    { id: "location", label: "Location", path: ["location"] },
    { id: "summary", label: "Summary", path: ["summary"], kind: "textarea" },
    {
      id: "highlights",
      label: "Highlights",
      path: ["highlights"],
      kind: "list",
      addLabel: "highlight",
    },
  ]),
};

export const roleHistoryConfig = storyFormConfig("complete-cv-role-history", [
  { id: "position", label: "Position", path: ["position"] },
  ...sharedDateFields,
]);

export const extraDetailConfig = storyFormConfig("complete-cv-extra-detail", [
  { id: "detail-id", label: "ID", path: ["id"] },
  { id: "detail-title", label: "Title", path: ["title"] },
  {
    id: "detail-type",
    label: "Content type",
    path: ["content_type"],
    kind: "segmented",
    defaultValue: "list",
    options: options(["list", "text"]),
  },
  {
    id: "detail-enabled",
    label: "Enabled",
    path: ["enabled"],
    kind: "boolean",
    defaultValue: true,
  },
  { id: "detail-text", label: "Text", path: ["text"], kind: "textarea" },
  {
    id: "detail-items",
    label: "Items",
    path: ["items"],
    kind: "list",
    addLabel: "detail",
  },
]);

const colorFields = [
  "body",
  "name",
  "headline",
  "connections",
  "section_titles",
  "links",
  "footer",
  "top_note",
];
const styleRoles = [
  "body",
  "name",
  "headline",
  "connections",
  "section_titles",
];
const compactStyleRoles = styleRoles.filter((role) => role !== "body");
const textFields = (prefix: PathPart[], names: string[]): StoryField[] =>
  names.map((name) => ({
    id: [...prefix, name].join("-"),
    label: name
      .replaceAll("_", " ")
      .replace(/^./, (letter) => letter.toUpperCase()),
    path: [...prefix, name],
  }));
const booleanFields = (
  prefix: PathPart[],
  names: string[],
  defaultValue = false,
): StoryField[] =>
  names.map((name) => ({
    id: [...prefix, name].join("-"),
    label: name
      .replaceAll("_", " ")
      .replace(/^./, (letter) => letter.toUpperCase()),
    path: [...prefix, name],
    kind: "boolean",
    defaultValue,
  }));

const themes = options([
  "classic",
  "ember",
  "engineeringclassic",
  "engineeringresumes",
  "harvard",
  "ink",
  "moderncv",
  "opal",
  "sb2nov",
]);
const pageSizes = [
  { value: "a4", label: "A4" },
  { value: "a5", label: "A5" },
  { value: "us-letter", label: "US Letter" },
  { value: "us-executive", label: "US Executive" },
];
const alignment = options(["left", "center", "right"]);

export const designGroups: StoryFormGroup[] = [
  {
    id: "design-theme",
    title: "Theme",
    fields: [
      {
        id: "theme",
        label: "Theme",
        path: ["theme"],
        kind: "option",
        defaultValue: "moderncv",
        options: themes,
      },
    ],
  },
  {
    id: "design-page",
    title: "Page",
    fields: [
      {
        id: "page-size",
        label: "Page size",
        path: ["page", "size"],
        kind: "option",
        defaultValue: "a4",
        options: pageSizes,
      },
      ...textFields(
        ["page"],
        ["top_margin", "bottom_margin", "left_margin", "right_margin"],
      ),
      ...booleanFields(["page"], ["show_footer", "show_top_note"], true),
    ],
  },
  {
    id: "design-colors",
    title: "Colors",
    fields: textFields(["colors"], colorFields),
  },
  {
    id: "design-typography",
    title: "Typography",
    fields: [
      {
        id: "line-spacing",
        label: "Line spacing",
        path: ["typography", "line_spacing"],
      },
      {
        id: "typography-alignment",
        label: "Alignment",
        path: ["typography", "alignment"],
        kind: "segmented",
        defaultValue: "left",
        options: options([
          "left",
          "justified",
          "justified-with-no-hyphenation",
        ]),
      },
      {
        id: "date-location-alignment",
        label: "Date/location",
        path: ["typography", "date_and_location_column_alignment"],
        kind: "segmented",
        defaultValue: "right",
        options: alignment,
      },
    ],
  },
  {
    id: "design-font-family",
    title: "Font Family",
    fields: styleRoles.map((role) => ({
      id: `font-family-${role}`,
      label: role.replace(/^./, (letter) => letter.toUpperCase()),
      path: ["typography", "font_family", role],
      kind: "option",
      defaultValue: "Source Sans 3",
      options: options([
        "EB Garamond",
        "Lato",
        "Noto Sans",
        "Open Sans",
        "Roboto",
        "Source Sans 3",
        "XCharter",
      ]),
    })),
  },
  {
    id: "design-font-size",
    title: "Font Size",
    fields: textFields(["typography", "font_size"], styleRoles),
  },
  {
    id: "design-small-caps",
    title: "Small Caps",
    fields: booleanFields(["typography", "small_caps"], compactStyleRoles),
  },
  {
    id: "design-bold",
    title: "Bold",
    fields: booleanFields(
      ["typography", "bold"],
      [...compactStyleRoles, "links"],
    ),
  },
  {
    id: "design-links",
    title: "Links",
    fields: [
      ...booleanFields(["links"], ["underline"]),
      ...booleanFields(["links"], ["show_external_link_icon"], true),
    ],
  },
  {
    id: "design-header",
    title: "Header",
    fields: [
      {
        id: "header-alignment",
        label: "Alignment",
        path: ["header", "alignment"],
        kind: "segmented",
        defaultValue: "center",
        options: alignment,
      },
      {
        id: "photo-position",
        label: "Photo position",
        path: ["header", "photo_position"],
        kind: "segmented",
        defaultValue: "right",
        options: options(["left", "right"]),
      },
      ...textFields(
        ["header"],
        [
          "photo_width",
          "photo_space_left",
          "photo_space_right",
          "space_below_name",
          "space_below_headline",
          "space_below_connections",
        ],
      ),
    ],
  },
  {
    id: "design-header-connections",
    title: "Header Connections",
    fields: [
      {
        id: "phone-format",
        label: "Phone number format",
        path: ["header", "connections", "phone_number_format"],
        kind: "option",
        defaultValue: "national",
        options: options(["national", "international", "E164"]),
      },
      ...booleanFields(
        ["header", "connections"],
        ["hyperlink", "show_icons"],
        true,
      ),
      ...booleanFields(
        ["header", "connections"],
        ["display_urls_instead_of_usernames"],
      ),
      ...textFields(
        ["header", "connections"],
        ["separator", "space_between_connections"],
      ),
    ],
  },
  {
    id: "design-section-titles",
    title: "Section Titles",
    fields: [
      {
        id: "section-title-type",
        label: "Type",
        path: ["section_titles", "type"],
        kind: "option",
        defaultValue: "with_partial_line",
        options: options([
          "with_partial_line",
          "with_full_line",
          "without_line",
          "moderncv",
          "centered_without_line",
          "centered_with_partial_line",
          "centered_with_centered_partial_line",
          "centered_with_full_line",
        ]),
      },
      ...textFields(
        ["section_titles"],
        ["line_thickness", "space_above", "space_below"],
      ),
    ],
  },
  {
    id: "design-sections",
    title: "Sections",
    fields: [
      ...booleanFields(["sections"], ["allow_page_break"], true),
      ...textFields(
        ["sections"],
        ["space_between_regular_entries", "space_between_text_based_entries"],
      ),
      {
        id: "show-time-spans-in",
        label: "Show time spans in",
        path: ["sections", "show_time_spans_in"],
        kind: "list",
        addLabel: "section",
      },
    ],
  },
  {
    id: "design-entries",
    title: "Entries",
    fields: [
      ...textFields(
        ["entries"],
        [
          "date_and_location_width",
          "side_space",
          "space_between_columns",
          "degree_width",
        ],
      ),
      ...booleanFields(["entries"], ["allow_page_break"], true),
      ...booleanFields(["entries"], ["short_second_row"]),
    ],
  },
  {
    id: "design-entry-summary",
    title: "Entry Summary",
    fields: textFields(["entries", "summary"], ["space_above", "space_left"]),
  },
  {
    id: "design-entry-highlights",
    title: "Entry Highlights",
    fields: [
      {
        id: "highlight-bullet",
        label: "Bullet",
        path: ["entries", "highlights", "bullet"],
        kind: "option",
        defaultValue: "•",
        options: options(["●", "•", "◦", "-", "◆", "★", "■", "—", "○"]),
      },
      {
        id: "highlight-nested-bullet",
        label: "Nested bullet",
        path: ["entries", "highlights", "nested_bullet"],
        kind: "option",
        defaultValue: "•",
        options: options(["●", "•", "◦", "-", "◆", "★", "■", "—", "○"]),
      },
      ...textFields(
        ["entries", "highlights"],
        [
          "space_left",
          "space_above",
          "space_between_items",
          "space_between_bullet_and_text",
        ],
      ),
    ],
  },
  {
    id: "design-templates",
    title: "Templates",
    fields: [
      "footer",
      "top_note",
      "single_date",
      "date_range",
      "time_span",
    ].map((name) => ({
      id: `template-${name}`,
      label: name
        .replaceAll("_", " ")
        .replace(/^./, (letter) => letter.toUpperCase()),
      path: ["templates", name],
      kind: "textarea" as const,
    })),
  },
  ...[
    ["One-Line Entry Template", "one_line_entry", ["main_column"]],
    [
      "Education Entry Template",
      "education_entry",
      ["main_column", "degree_column", "date_and_location_column"],
    ],
    [
      "Normal Entry Template",
      "normal_entry",
      ["main_column", "date_and_location_column"],
    ],
    [
      "Experience Entry Template",
      "experience_entry",
      ["main_column", "date_and_location_column"],
    ],
    [
      "Publication Entry Template",
      "publication_entry",
      ["main_column", "date_and_location_column"],
    ],
  ].map(([title, key, fields]) => ({
    id: `design-${key}`,
    title: title as string,
    fields: (fields as string[]).map((name) => ({
      id: `${key}-${name}`,
      label: name
        .replaceAll("_", " ")
        .replace(/^./, (letter) => letter.toUpperCase()),
      path: ["templates", key as string, name],
      kind: "textarea" as const,
    })),
  })),
];

export const localeOptions = options([
  "english",
  "arabic",
  "danish",
  "dutch",
  "french",
  "german",
  "hebrew",
  "hindi",
  "hungarian",
  "indonesian",
  "italian",
  "japanese",
  "korean",
  "mandarin_chinese",
  "norwegian_bokmål",
  "norwegian_nynorsk",
  "persian",
  "portuguese",
  "russian",
  "spanish",
  "turkish",
  "vietnamese",
]);
export const monthLabels = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];
export const monthAbbreviations = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "June",
  "July",
  "Aug",
  "Sept",
  "Oct",
  "Nov",
  "Dec",
];

const monthFields = (
  key: "month_abbreviations" | "month_names",
  defaults: string[],
): StoryField[] =>
  monthLabels.map((label, index) => ({
    id: `${key}-${index}`,
    label,
    path: [key, index],
    defaultValue: defaults[index],
    seedPath: [key],
    seedValue: defaults,
  }));

export const localeGroups: StoryFormGroup[] = [
  {
    id: "locale-language",
    title: "Language",
    fields: [
      {
        id: "locale-language-field",
        label: "Language",
        path: ["language"],
        kind: "option",
        defaultValue: "english",
        options: localeOptions,
      },
    ],
  },
  {
    id: "locale-last-updated",
    title: "Last Updated",
    fields: [
      {
        id: "locale-last-updated-in",
        label: "Last updated in",
        path: ["last_updated"],
        defaultValue: "Last updated in",
      },
      {
        id: "locale-present",
        label: "Present",
        path: ["present"],
        defaultValue: "present",
      },
      {
        id: "locale-month",
        label: "Month",
        path: ["month"],
        defaultValue: "month",
      },
      {
        id: "locale-months",
        label: "Months",
        path: ["months"],
        defaultValue: "months",
      },
      {
        id: "locale-year",
        label: "Year",
        path: ["year"],
        defaultValue: "year",
      },
      {
        id: "locale-years",
        label: "Years",
        path: ["years"],
        defaultValue: "years",
      },
    ],
  },
  {
    id: "locale-phrases",
    title: "Phrases",
    fields: [
      {
        id: "degree-with-area",
        label: "Degree with area",
        path: ["phrases", "degree_with_area"],
        defaultValue: "DEGREE in AREA",
      },
    ],
  },
  {
    id: "locale-month-abbreviations",
    title: "Month Abbreviations",
    fields: monthFields("month_abbreviations", monthAbbreviations),
  },
  {
    id: "locale-month-names",
    title: "Month Names",
    fields: monthFields("month_names", monthLabels),
  },
];

export const settingsConfig = storyFormConfig("complete-cv-settings", [
  {
    id: "current-date",
    label: "Current date",
    path: ["current_date"],
    defaultValue: "today",
  },
  {
    id: "pdf-title",
    label: "PDF title",
    path: ["pdf_title"],
    defaultValue: "NAME - CV",
  },
  {
    id: "bold-keywords",
    label: "Bold keywords",
    path: ["bold_keywords"],
    kind: "list",
    addLabel: "keyword",
  },
]);
