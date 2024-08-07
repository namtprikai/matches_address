import { Suspense } from "react";
import { EditWorkbookForm } from "../../../../components/edit-workbook-form";

export function EditWorkbook(): JSX.Element {
  return (
    <Suspense fallback={<></>}>
      <EditWorkbookForm />
    </Suspense>
  );
}
