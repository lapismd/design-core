export const CV_ENTRY_TYPES = [
  "TextEntry",
  "ExperienceEntry",
  "EducationEntry",
  "PublicationEntry",
  "OneLineEntry",
  "BulletEntry",
  "NumberedEntry",
  "ReversedNumberedEntry",
  "NormalEntry",
] as const;

export type CvEntryType = (typeof CV_ENTRY_TYPES)[number];
export type CvStoryTab = "cv" | "design" | "locale" | "settings";
export type PathPart = string | number;

export type StoryRecord = Record<string, unknown>;
export type CvEntry = string | StoryRecord;

export type CvSection = StoryRecord & {
  id: string;
  title: string;
  entry_type: CvEntryType;
  entries: CvEntry[];
};

export type CvFragment = StoryRecord & {
  name?: string;
  headline?: string;
  location?: string;
  email?: string;
  phone?: string;
  website?: string;
  last_updated?: string;
  target_roles?: string[];
  social_networks?: StoryRecord[];
  sections?: CvSection[];
};

export type CompleteCvSource = StoryRecord & {
  cv: CvFragment;
  design?: StoryRecord;
  locale?: StoryRecord;
  settings?: StoryRecord;
};

export type FragmentValue = CvFragment | StoryRecord;

export type UiIdentityState = {
  socialNetworks: string[];
  sections: string[];
  entries: Record<string, string[]>;
  nested: Record<string, string[]>;
};

export type ParsedFragment =
  | { ok: true; value: FragmentValue }
  | { ok: false; error: string };

export type AppliedYamlEdit = {
  source: CompleteCvSource;
  text: string;
  error: string | null;
  applied: boolean;
};
