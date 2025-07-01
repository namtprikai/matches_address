/** ページネーションを利用するときにdrizzleクエリが必要とする値 */
export type PaginationQuery = {
  limit: number;
  offset: number;
};
