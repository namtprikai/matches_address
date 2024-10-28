import { useForm, type UseFormReturn } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

export const schema = z.object({
  path: z.string(),
  settings: z.object({
    explanatory_variables: z.array(z.string()).min(1),
    advanced: z.object({
      test_size: z.coerce.number().optional(),
      n_splits: z.coerce.number().optional(),
      undersample: z.boolean().optional(),
      undersample_ratio: z.coerce.number().optional(),
      threshold: z.coerce.number().optional(),
      hyperparameter_flag: z.coerce.boolean().optional(),
      n_trials: z.coerce.number().optional(),
      lambda_l1: z.coerce.number().optional(),
      lambda_l2: z.coerce.number().optional(),
      num_leavs: z.coerce.number().optional(),
      feature_fraction: z.coerce.number().optional(),
      bagging_fraction: z.coerce.number().optional(),
      bagging_freq: z.coerce.number().optional(),
      min_data_in_leaf: z.coerce.number().optional(),
    }),
  }),
});
type FormType = z.infer<typeof schema>;

export const useFormModelCreate = (): UseFormReturn<FormType> => {
  return useForm<FormType>({
    defaultValues: {
      settings: {
        explanatory_variables: [],
        advanced: {},
      },
    },
    resolver: zodResolver(schema),
  });
};
