import { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableRow,
  TableHeader,
  TableHeaderCell,
  Card,
} from "@fluentui/react-components";

type CSVRow = Record<string, string>;

export function DataPreview(): JSX.Element {
  const [csvData, setCsvData] = useState<CSVRow[]>([]);
  const [headers, setHeaders] = useState<string[]>([]);

  useEffect(() => {
    const fetchCSV = async (): Promise<void> => {
      const response = await fetch("/dummy-data.csv");
      const csvText = await response.text();
      const rows = csvText.split("\n").map((row) => row.split(","));
      const headers = rows[0].map((header) => header.trim());
      setHeaders(headers);

      const data: CSVRow[] = rows
        .slice(1)
        .map((row) => {
          return headers.reduce((obj, header, index) => {
            obj[header] = row[index]?.trim() ?? "";
            return obj;
          }, {} as CSVRow);
        })
        .filter((row) => Object.values(row).some((value) => value !== ""));
      setCsvData(data);
    };

    void fetchCSV();
  }, []);

  return (
    <Card>
      <Table aria-label="CSV Data Table">
        <TableHeader>
          <TableRow>
            {headers.map((header) => (
              <TableHeaderCell key={header}>{header}</TableHeaderCell>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {csvData.map((row, rowIndex) => (
            <TableRow key={rowIndex}>
              {headers.map((header) => (
                <TableCell key={`${rowIndex}-${header}`}>
                  {row[header]}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  );
}
