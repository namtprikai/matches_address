import { AddFilled } from "@fluentui/react-icons";
import {
  DrawerBody,
  DrawerHeader,
  DrawerHeaderTitle,
  InlineDrawer,
  makeStyles,
  SearchBox,
  tokens,
} from "@fluentui/react-components";
import { useFormContext } from "react-hook-form";
import { type z } from "zod";
import { type form_workbook_edit_schema } from "../zod/form_workbook_edit";
import { useFetchDataSetResults } from "../hooks/use-fetch-data-set-results";
import { DataSetResults } from "./data-set-results";
import { Button } from "./button";

const useStyles = makeStyles({
  heading: {
    fontSize: tokens.fontSizeBase400,
    lineHeight: tokens.lineHeightBase600,
    fontWeight: tokens.fontWeightSemibold,
  },
  drawerBody: {
    display: "grid",
    gap: tokens.spacingVerticalXXL,
    padding: `${tokens.spacingVerticalXXL} ${tokens.spacingHorizontalNone}`,
  },
});

type FormType = z.infer<typeof form_workbook_edit_schema>;

type Props = {
  selectedValue: number;
};

export const DrawerDataSet = ({ selectedValue }: Props): JSX.Element => {
  const styles = useStyles();
  const { watch, setValue } = useFormContext<FormType>();
  const { data: dataSetResults } = useFetchDataSetResults();

  const isAddView = watch(`resultsheetsWithViews.${selectedValue}.is_add_view`);

  return (
    <InlineDrawer open>
      <DrawerHeader>
        <DrawerHeaderTitle
          action={
            isAddView ? undefined : (
              <Button
                icon={<AddFilled />}
                onClick={(): void => {
                  setValue(
                    `resultsheetsWithViews.${selectedValue}.is_add_view`,
                    true,
                  );
                }}
                shape="square"
              />
            )
          }
          className={styles.heading}
        >
          ビューを追加
        </DrawerHeaderTitle>
      </DrawerHeader>

      <DrawerBody>
        <div className={styles.drawerBody}>
          <div>
            <SearchBox />
          </div>
          <span className={styles.heading}>データセット一覧</span>
          {isAddView && (
            <DataSetResults
              dataSetResults={dataSetResults}
              selectedIndex={selectedValue as number}
            />
          )}
          {!isAddView && <>入力モード！</>}
        </div>
      </DrawerBody>
    </InlineDrawer>
  );
};
