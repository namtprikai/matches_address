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
      num_leaves: z.coerce.number().optional(),
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
        /** @ref https://www.notion.so/eukarya/Python-40f49a4c1a3b498486dd0e13aaad5a4a?pvs=4#b03370ab87514812bb337e1572118b2d */
        advanced: {
          test_size: 0.3,
          n_splits: 3,
          undersample: true,
          undersample_ratio: 3.0,
          threshold: 0.3,
          hyperparameter_flag: true,
          n_trials: 100,
          lambda_l1: 0,
          lambda_l2: 0,
          num_leaves: 31,
          feature_fraction: 1.0,
          bagging_fraction: 1.0,
          bagging_freq: 0,
          min_data_in_leaf: 20,
        },
      },
    },
    resolver: zodResolver(schema),
  });
};
