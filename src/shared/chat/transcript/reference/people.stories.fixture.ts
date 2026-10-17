import avatar from "./codex.stories.fixture.svg?url";
import type { TranscriptAuthor } from "../model.js";
export const referenceAgent: TranscriptAuthor = {
  id: "reference-codex",
  name: "Codex",
  image: avatar,
  initials: "CX",
  shape: "rounded",
};
export const referenceUser: TranscriptAuthor = {
  id: "reference-user",
  name: "You",
  initials: "YO",
};
