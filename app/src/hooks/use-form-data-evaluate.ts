import { z } from "zod";

export const schema = z.object({
  model_path: z.string(),
  dataset_path: z.string(),
  spatial_file: z.string(),
  settings: z.object({
    threshold: z.number(),
  }),
  area_grouping: z.object({
    path: z.string(),
    columns: z.object({
      area_group_id: z.string(),
      area_group_name: z.string(),
    }),
  }),
});
