import { type z } from "zod";
import { type editResultViewFormSchema } from "../zod/edit-result-view-form-schema";

export type EditResultViewFormType = z.infer<typeof editResultViewFormSchema>;
