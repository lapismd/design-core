import type { CvSource } from "./types";

export const sampleCvSource: CvSource = {
  cv: {
    name: "Jane Doe",
    headline: "Product Designer",
    location: "San Francisco, CA",
    email: "jane@example.com",
    phone: "+1 555 0100",
    website: "https://jane.design",
    social_networks: [
      { network: "LinkedIn", username: "jane" },
      { network: "GitHub", username: "janedoe" },
    ],
    target_roles: ["Frontend Engineer", "Product Designer"],
    sections: [
      {
        id: "experience",
        title: "Experience",
        entry_type: "ExperienceEntry",
        entries: [
          {
            company: "Acme",
            position: "Senior Designer",
            location: "Remote",
            start_date: "2020-01",
            end_date: "present",
            display_date: "2020 — Present",
            summary: "Led product design for the design system.",
            highlights: ["Shipped the token system", "Mentored three designers"],
            role_history: [
              {
                position: "Designer",
                start_date: "2018-01",
                end_date: "2019-12",
              },
            ],
            extra_details: [
              {
                id: "technologies",
                title: "Technologies",
                content_type: "comma_list",
                enabled: true,
                items: ["Figma", "TypeScript"],
              },
            ],
          },
        ],
      },
      {
        id: "education",
        title: "Education",
        entry_type: "EducationEntry",
        entries: [
          {
            institution: "State University",
            degree: "BFA",
            area: "Graphic Design",
            location: "Boston, MA",
            start_date: "2014",
            end_date: "2018",
            display_date: "2014 — 2018",
            highlights: [],
          },
        ],
      },
      {
        id: "skills",
        title: "Skills",
        entry_type: "OneLineEntry",
        entries: [
          { label: "Design", details: "Systems, prototyping, facilitation" },
        ],
      },
      {
        id: "highlights",
        title: "Highlights",
        entry_type: "BulletEntry",
        entries: [{ bullet: "Built a cross-product design system" }],
      },
    ],
  },
  evidence: {
    technologies: ["TypeScript", "Svelte"],
    skills: ["Design systems", "Facilitation"],
    stories: [
      {
        id: "deploy-pipeline",
        title: "Deployment story",
        status: "ready",
        visibility: "internal",
        notes: "Use for platform interviews",
        tags: ["devops"],
        useful_for: ["Staff engineer"],
        source_refs: ["[^1]"],
        evidence: {
          context: "CI was flaky for weekly releases.",
          problem: "No shared deploy path across apps.",
          actions: ["Introduced a single pipeline template"],
          results: ["Cut release time by 40%"],
        },
        answer_versions: {
          star: {
            situation: "Weekly releases were unreliable.",
            task: "Unify deploy tooling.",
            action: "Templated the pipeline and migrated apps.",
            result: "Faster, safer releases.",
          },
        },
      },
    ],
  },
  design: {
    page: { size: "a4", top_margin: "0.7in", bottom_margin: "0.7in" },
    colors: { text: "#222222", name: "#000000", connections: "#0a66c2" },
    typography: { font_family: "Source Sans 3", font_size: "10pt" },
  },
  locale: {
    language: "English",
    present: "present",
    month: "month",
    months: "months",
    years: "years",
    degree_with_area: "{degree} in {area}",
    month_abbreviations: [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ],
    month_names: [
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
    ],
  },
  settings: {
    current_date: "2026-07-19",
    pdf_title: "Jane Doe — CV",
    bold_keywords: ["design system", "TypeScript"],
  },
};

export function cloneSampleCvSource(): CvSource {
  return structuredClone(sampleCvSource);
}
