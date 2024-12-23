import { useParams } from "react-router-dom";
import { makeStyles, tokens } from "@fluentui/react-components";
import { useFetchWorkbook } from "../hooks/use-fetch-workbook";
import { ROUTES, withHash } from "../routes";
import { TabListEditResultSheet } from "./tab-list-edit-result-sheet";
import { SidebarEditResultView } from "./bi/sidebar-edit-result-view";
import { PreviewResultSheet } from "./preview-result-sheet";
import { BreadcrumbBase, BreadcrumbItem } from "./ui/breadcrumb";

const useStyles = makeStyles({
  root: {
    overflow: "hidden",
    display: "flex",
  },
  heading: {
    fontSize: tokens.fontSizeBase400,
    lineHeight: tokens.lineHeightBase600,
    fontWeight: tokens.fontWeightSemibold,
  },
  content: {
    flex: "1",
    padding: tokens.spacingHorizontalXXL,
    paddingLeft: `calc(320px + ${tokens.spacingHorizontalXXL})`,
    backgroundColor: tokens.colorNeutralBackground3,
    minHeight: "100vh",
    display: "flex",
    flexFlow: "column",
    gap: `${tokens.spacingVerticalXXL} ${tokens.spacingHorizontalXXL}`,
  },
  sidebar: {
    minWidth: "320px", // 現状チャート部分は無限に拡大するため、最小値を設定
    position: "fixed",
  },
});

export const EditWorkbook = (): JSX.Element => {
  const styles = useStyles();

  return (
    <div className={styles.root}>
      <div className={styles.sidebar}>
        <SidebarEditResultView />
      </div>
      <Content />
    </div>
  );
};

function Content(): JSX.Element {
  const styles = useStyles();
  const { id } = useParams();
  const { data: workbook } = useFetchWorkbook({ id: Number(id) });

  return (
    <div className={styles.content}>
      <BreadcrumbBase
        breadcrumbItem={[
          <BreadcrumbItem
            key={ROUTES.ANALYSIS.WORKBOOK}
            href={withHash(ROUTES.ANALYSIS.WORKBOOK)}
          >
            分析
          </BreadcrumbItem>,
          <BreadcrumbItem
            key={ROUTES.ANALYSIS.WORKBOOK_DETAIL(id || "#")}
            href={withHash(ROUTES.ANALYSIS.WORKBOOK_DETAIL(id || "#"))}
          >
            {workbook?.title ?? "詳細"}
          </BreadcrumbItem>,
          <BreadcrumbItem
            key={ROUTES.ANALYSIS.WORKBOOK_EDIT(id || "#")}
            current
            href={withHash(ROUTES.ANALYSIS.WORKBOOK_EDIT(id || "#"))}
          >
            編集
          </BreadcrumbItem>,
        ]}
      />
      <h2 className={styles.heading}>{workbook?.title}</h2>
      <TabListEditResultSheet workbookId={workbook?.id} />
      <div>
        <PreviewResultSheet />
      </div>
    </div>
  );
}
