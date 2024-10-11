import { join } from "path";
import { expect, test } from "vitest";
import { readCSVHeader } from "./read-csv-header";

test("CSVヘッダーの一行目を読み取る", async () => {
  const filePath = "./test-sample.csv";
  const header = await readCSVHeader(join(__dirname, filePath));
  expect(header).toEqual(["Name", "Age", "Email", "Country", "Occupation"]);
});
