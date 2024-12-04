import { NavDrawer, NavDrawerBody, NavItem } from "@fluentui/react-nav-preview";

import { makeStyles, mergeClasses, tokens } from "@fluentui/react-components";
import {
  ArrowTrendingLinesRegular,
  HomeRegular,
  DatabaseRegular,
  FolderRegular,
  ArrowSyncCircleRegular,
  TableSwitchRegular,
} from "@fluentui/react-icons";
import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

const useStyles = makeStyles({
  navDrawer: {
    width: "82px",
    height: "100vh",
    padding: `${tokens.spacingVerticalXXL} ${tokens.spacingHorizontalNone}`,
    backgroundColor: tokens.colorBrandBackground,
    position: "fixed",
  },
  navDrawerBody: {
    padding: `${tokens.spacingVerticalNone} ${tokens.spacingHorizontalMNudge}`,
  },
  navItem: {
    padding: `${tokens.spacingVerticalS} ${tokens.spacingHorizontalNone}`,
    backgroundColor: tokens.colorTransparentBackground,
    color: tokens.colorNeutralForegroundInverted,
    "&:hover": {
      color: tokens.colorBrandBackground,
    },
    ":after": {
      content: "none",
    },
  },
  menuItem: {
    display: "flex",
    flexFlow: "column",
    gap: tokens.spacingVerticalXS,
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
  },
  icon: {
    width: tokens.spacingHorizontalXXL,
    height: tokens.spacingVerticalXXL,
  },
  label: {
    fontSize: tokens.fontSizeBase100,
  },
  isActive: {
    backgroundColor: tokens.colorNeutralBackground1,
    color: tokens.colorBrandBackground,
    fontWeight: tokens.fontWeightSemibold,
  },
});

/**
 * @ref createHashRouter
 */
const menuItems = [
  {
    icon: ArrowTrendingLinesRegular,
    label: "分析",
    value: "1",
    href: "#analysis/workbook",
  },
  {
    icon: TableSwitchRegular,
    label: "正規化処理",
    value: "2",
    href: "#normalization",
  },
  {
    icon: DatabaseRegular,
    label: "モデル管理",
    value: "3",
    href: "#model",
  },
  {
    icon: HomeRegular,
    label: "空き家判定",
    value: "4",
    href: "#evaluation",
  },

  {
    icon: FolderRegular,
    label: "データセット",
    value: "5",
    href: "#dataset",
  },
  {
    icon: ArrowSyncCircleRegular,
    label: "非同期処理",
    value: "6",
    href: "#job",
  },
];

export const Sidebar = (): JSX.Element => {
  const styles = useStyles();

  const [selectedValue, setSelectedValue] = useState("");

  /** グローバルナビ以外をクリックして画面遷移したときのための処理 */
  const { pathname } = useLocation();
  useEffect(() => {
    if (selectedValue !== "") return; // selectedValueが空のときだけ実行
    const value = menuItems.find((item) =>
      pathname.replace("/", "").includes(item.href.replace("#", "")),
    )?.value;
    if (value) {
      setSelectedValue(value);
    }
  }, [pathname, selectedValue]);

  return (
    <NavDrawer
      className={styles.navDrawer}
      defaultSelectedValue="1"
      onNavItemSelect={(_, data) => setSelectedValue(data.value as string)}
      open
      selectedValue={selectedValue}
      type="inline"
    >
      <NavDrawerBody className={styles.navDrawerBody}>
        {menuItems.map((item) => {
          const isActive = selectedValue === item.value;
          return (
            <NavItem
              key={item.value}
              className={mergeClasses(
                styles.navItem,
                isActive ? styles.isActive : "",
              )}
              href={item.href}
              value={item.value}
            >
              <div className={styles.menuItem}>
                <item.icon className={styles.icon} />
                <div className={styles.label}>{item.label}</div>
              </div>
            </NavItem>
          );
        })}
      </NavDrawerBody>
    </NavDrawer>
  );
};
