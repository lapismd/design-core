export type CvEntryType =
  | "TextEntry"
  | "ExperienceEntry"
  | "EducationEntry"
  | "PublicationEntry"
  | "OneLineEntry"
  | "BulletEntry"
  | "NumberedEntry"
  | "ReversedNumberedEntry"
  | "NormalEntry";

export type SocialNetwork = {
  network: string;
  username: string;
};

export type ExperienceExtraDetail = {
  id: string;
  title: string;
  content_type: "text" | "comma_list" | "semicolon_list";
  enabled?: boolean;
  text?: string;
  items?: string[];
};

export type ExperienceRoleHistoryEntry = {
  position: string;
  start_date?: string;
  end_date?: string;
  date?: string;
  display_date?: string;
};

export type ExperienceEntry = {
  company: string;
  position: string;
  location: string;
  date?: string;
  start_date: string;
  end_date: string;
  display_date?: string;
  summary?: string;
  highlights: string[];
  role_history?: ExperienceRoleHistoryEntry[];
  extra_details?: ExperienceExtraDetail[];
};

export type EducationEntry = {
  institution: string;
  degree: string;
  area: string;
  location: string;
  date?: string;
  start_date: string;
  end_date: string;
  display_date?: string;
  summary?: string;
  highlights?: string[];
};

export type NormalEntry = {
  name: string;
  url?: string;
  date?: string;
  start_date?: string;
  end_date?: string;
  location?: string;
  summary: string;
  highlights?: string[];
};

export type OneLineEntry = { label: string; details: string };
export type BulletEntry = { bullet: string };
export type NumberedEntry = { number: string };
export type ReversedNumberedEntry = { reversed_number: string };
export type PublicationEntry = {
  title: string;
  authors: string[];
  summary?: string;
  doi?: string;
  url?: string;
  journal?: string;
  date?: string;
};

export type CvEntry =
  | string
  | ExperienceEntry
  | EducationEntry
  | PublicationEntry
  | OneLineEntry
  | BulletEntry
  | NumberedEntry
  | ReversedNumberedEntry
  | NormalEntry;

export type CvSection = {
  id: string;
  title: string;
  entry_type: CvEntryType;
  entries: CvEntry[];
};

export type CvDocument = {
  name: string;
  headline: string;
  location: string;
  email: string;
  phone: string;
  website?: string;
  social_networks?: SocialNetwork[];
  target_roles?: string[];
  sections: CvSection[];
};

export type EvidenceStoryStatus = "draft" | "ready" | "archived";
export type EvidenceStoryVisibility = "internal" | "public";

export type EvidenceStory = {
  id: string;
  title: string;
  status: EvidenceStoryStatus;
  visibility: EvidenceStoryVisibility;
  notes?: string;
  tags?: string[];
  useful_for?: string[];
  source_refs?: string[];
  evidence?: {
    context?: string;
    problem?: string;
    constraints?: string[];
    actions?: string[];
    results?: string[];
    metrics?: string[];
    lessons?: string[];
  };
  answer_versions?: {
    star?: {
      situation?: string;
      task?: string;
      action?: string;
      result?: string;
    };
  };
};

export type CvEvidence = {
  technologies?: string[];
  skills?: string[];
  stories?: EvidenceStory[];
};

export type CvDesign = {
  page?: { size?: string; top_margin?: string; bottom_margin?: string };
  colors?: { text?: string; name?: string; connections?: string };
  typography?: { font_family?: string; font_size?: string };
};

export type CvLocale = {
  language?: string;
  last_updated?: string;
  present?: string;
  month?: string;
  months?: string;
  years?: string;
  degree_with_area?: string;
  month_abbreviations?: string[];
  month_names?: string[];
};

export type CvSettings = {
  current_date?: string;
  pdf_title?: string;
  bold_keywords?: string[];
};

export type CvSource = {
  cv: CvDocument;
  design?: CvDesign;
  locale?: CvLocale;
  evidence?: CvEvidence;
  settings?: CvSettings;
};
