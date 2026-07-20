export type CvFileBucket = "active" | "archive" | "trash";

export type CvFileInfo = {
  id: string;
  name: string;
  bucket: CvFileBucket;
  updatedAt?: string;
};

export type OptionalFileSection = Extract<CvFileBucket, "archive" | "trash">;
