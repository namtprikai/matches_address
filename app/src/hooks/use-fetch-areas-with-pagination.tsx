import useSWR, { type SWRResponse } from "swr";
import { type SelectAreasWithPaginationReturnType } from "../ipc-main-listeners/select-areas-with-pagination";
import { type SelectDataSetDetailArea } from "../schema";

type Params = {
  id: SelectDataSetDetailArea["id"];
  page: number;
  limitPerPage: number;
};

type Response = SelectAreasWithPaginationReturnType;

const fetcher = ([id, page, limitPerPage]: [
  Params["id"],
  Params["page"],
  Params["limitPerPage"],
  string,
]): Response => {
  const result = window.ipcRenderer.invoke("selectAreasWithPagination", {
    id,
    page,
    limitPerPage,
  });

  return result;
};

export const useFetchAreasWithPagination = ({
  id,
  page,
  limitPerPage,
}: Params): SWRResponse<Awaited<Response>> => {
  const swr = useSWR(
    [id, page, limitPerPage, useFetchAreasWithPagination.name],
    fetcher,
  );
  return swr;
};
