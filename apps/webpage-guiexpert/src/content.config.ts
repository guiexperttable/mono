import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

// Showcase cards on the home page (src/content/showcase/*.json).
// The other folders in src/content (docs, docsmd) are read directly via import.meta.glob.
const showcase = defineCollection({
  loader: glob({ pattern: "*.json", base: "./src/content/showcase" }),
  schema: ({ image }) =>
    z.object({
      title: z.string().min(1),
      image: image(),
      url: z.string(),
      featured: z.number().min(1).optional(),
    }),
});

export const collections = {
  showcase
};
