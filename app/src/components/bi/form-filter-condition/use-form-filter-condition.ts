import { z } from "zod";
import { useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { filterConditionSchema } from "../../../bi-modules/schema/parameter";

const FormFilterConditionSchema = z.object({
  filterCondition: z.array(filterConditionSchema),
});
export type FormFilterConditionType = z.infer<typeof FormFilterConditionSchema>;

export const useFormFilterCondition = () => {
  const form = useForm<FormFilterConditionType>({
    resolver: zodResolver(FormFilterConditionSchema),
  });
  const { control } = form;
  const fieldState = useFieldArray({
    control,
    name: "filterCondition",
  });

  return { form, fieldState };
};
