import { useForm, type UseFormReturn } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

export const schema = z.object({
  path: z.string(),
  settings: z.object({
    explanatory_variables: z.array(z.string()),
    advanced: z.object({
      test_size: z.number().optional(),
      n_splits: z.number().optional(),
      undersample: z.boolean().optional(),
      undersample_ratio: z.number().optional(),
      threshold: z.number().optional(),
      hyperparameter_flag: z.boolean().optional(),
      n_trials: z.number().optional(),
      lambda_l1: z.number().optional(),
      lambda_l2: z.number().optional(),
      num_leavs: z.number().optional(),
      feature_fraction: z.number().optional(),
      bagging_fraction: z.number().optional(),
      bagging_freq: z.number().optional(),
      min_data_in_leaf: z.number().optional(),
    }),
  }),
});
type FormType = z.infer<typeof schema>;

export const useFormModelCreate = (): UseFormReturn<FormType> => {
  return useForm<FormType>({
    resolver: zodResolver(schema),
  });
};
