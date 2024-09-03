import { NavDrawer, NavDrawerBody, NavItem } from "@fluentui/react-nav-preview";

import { makeStyles, tokens } from "@fluentui/react-components";
import {
  ArrowTrendingLinesRegular,
  DocumentBulletListRegular,
  Bug16Filled,
} from "@fluentui/react-icons";

const useStyles = makeStyles({
  navDrawer: {
    width: "82px",
    height: "100vh",
    padding: `${tokens.spacingVerticalXXL} ${tokens.spacingHorizontalNone}`,
    backgroundColor: tokens.colorBrandBackground,
  },
  navDrawerBody: {
    padding: `${tokens.spacingVerticalNone} ${tokens.spacingHorizontalMNudge}`,
  },
  navItem: {
    padding: `${tokens.spacingVerticalS} ${tokens.spacingHorizontalNone}`,
    backgroundColor: tokens.colorTransparentBackground,
    color: tokens.colorNeutralForegroundInverted,
    "&:hover": {
      backgroundColor: tokens.colorSubtleBackgroundLightAlphaHover,
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
    icon: DocumentBulletListRegular,
    label: "空き家判定",
    value: "2",
    href: "#wip",
  },
  {
    icon: DocumentBulletListRegular,
    label: "モデル管理",
    value: "3",
    href: "#wip",
  },
  {
    icon: DocumentBulletListRegular,
    label: "非同期処理",
    value: "4",
    href: "#wip",
  },
  {
    icon: DocumentBulletListRegular,
    label: "データセット",
    value: "5",
    href: "#dataset",
  },
  {
    icon: Bug16Filled,
    label: "(開発用)",
    value: "6",
    href: "#debug",
  },
];

export const Sidebar = (): JSX.Element => {
  const styles = useStyles();

  return (
    <NavDrawer
      className={styles.navDrawer}
      defaultSelectedCategoryValue="1"
      defaultSelectedValue="1"
      open
      type="inline"
    >
      <NavDrawerBody className={styles.navDrawerBody}>
        {menuItems.map((item) => (
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
        ))}
      </NavDrawerBody>
    </NavDrawer>
  );
};
