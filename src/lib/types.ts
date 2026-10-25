export type PublicStory = {
  id: string;
  type: "review" | "story";
  name: string;
  rating?: number;
  text: string;
  result?: string;
  date: string;
  images: { path: string; alt: string | null; width: number | null; height: number | null }[];
  featured: boolean;
};
