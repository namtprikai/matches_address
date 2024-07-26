import {
  NavDrawer,
  NavDrawerBody,
  NavItem,
} from "@fluentui/react-nav-preview";

import {
  makeStyles,
  tokens
} from "@fluentui/react-components";
import {
  ArrowTrendingLinesRegular,
  DocumentBulletListRegular,
  SettingsFilled
} from "@fluentui/react-icons";
import { Outlet } from "react-router-dom";

const useStyles = makeStyles({
  root: {
    overflow: "hidden",
    display: "flex",
  },
  navDrawer: {
    width: "82px",
    height: "100vh",
    padding: `${tokens.spacingVerticalXXL} ${tokens.spacingHorizontalNone}`
  },
  navDrawerBody: {
    padding: `${tokens.spacingVerticalNone} ${tokens.spacingHorizontalMNudge}`,
  },
  content: {
    flex: "1",
    padding: tokens.spacingVerticalL,
    display: "grid",
    justifyContent: "flex-start",
    alignItems: "flex-start",
  },
  navItem: {
    padding: `${tokens.spacingVerticalS} ${tokens.spacingHorizontalNone}`,
    ":after": {
      content: "none",
    }
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
    fontSize: tokens.fontSizeBase100
   },
});

const menuItems = [
  {
    icon: SettingsFilled,
    label: "モデル管理",
    value: "1",
    href: "#",
  },
  {
    icon: DocumentBulletListRegular,
    label: "予測結果",
    value: "2",
    href: "#about",
  },
  {
    icon: ArrowTrendingLinesRegular,
    label: "分析",
    value: "3",
    href: "#",
  },
  {
    icon: DocumentBulletListRegular,
    label: "データセット",
    value: "4",
    href: "#",
  },
]

export function Layout(): JSX.Element {
  const styles = useStyles();

  return (
    <div className={styles.root}>
      <NavDrawer
        className={styles.navDrawer}
        defaultSelectedCategoryValue="1"
        defaultSelectedValue="1"
        open
        type="inline"
      >
        <NavDrawerBody className={styles.navDrawerBody}>
          {
            menuItems.map((item) => (
              <NavItem
                key={item.value}
                className={styles.navItem}
                href={item.href}
                value={item.value}
              >
                <div className={styles.menuItem}>
                  <item.icon className={styles.icon} />
                  <div className={styles.label}>{item.label}</div>
                </div>
              </NavItem>
            ))
          }
        </NavDrawerBody>
      </NavDrawer>
      <div className={styles.content}>
        <Outlet />
      </div>
    </div>
  );
}