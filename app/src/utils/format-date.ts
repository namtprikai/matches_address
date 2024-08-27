import dayjs from "dayjs";

export const formatDate = (
  date: string | number | Date,
  formatString?: string,
): string => {
  if (!dayjs(date).isValid()) return "";
  if (formatString) return dayjs(date).format(formatString);
  return dayjs(date).format("YYYY/MM/DD HH:mm:ss");
};
