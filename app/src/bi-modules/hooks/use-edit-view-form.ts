import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, type UseFormReturn } from "react-hook-form";
import { type z } from "zod";
import { editViewFormSchema } from "../schema/edit-view-form";

type FormType = z.infer<typeof editViewFormSchema>;

export const useEditViewForm = (): UseFormReturn<FormType> => {
  return useForm<FormType>({
    resolver: zodResolver(editViewFormSchema),
    defaultValues: {},
  });
};
