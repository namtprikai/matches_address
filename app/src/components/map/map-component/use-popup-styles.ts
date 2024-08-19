import { makeStyles, tokens } from "@fluentui/react-components";

export const usePopupStyles = makeStyles({
  container: {
    position: "absolute",
    backgroundColor: "white",
    boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
    borderRadius: "10px",
    border: "1px solid #e0e0e0",
    bottom: "4px",
    left: "8px",
    minWidth: "280px",
    fontFamily: "Arial, sans-serif",
  },
  header: {
    backgroundColor: "#1B8C631F",
    padding: "20px 16px 12px",
    display: "flex",
    gap: tokens.spacingHorizontalM,
  },
  circleIcon: {
    width: "32px",
    height: "32px",
    borderRadius: "50%",
  },
  close: {
    position: "absolute",
    fontSize: "24px",
    top: "15px",
    right: "15px",
    cursor: "pointer",
    color: "#8A8A8A",
  },
  vacancyRate: {
    fontSize: "20px",
    fontWeight: "bold",
  },
  address: {
    color: "#666",
    fontSize: "12px",
  },
  info: {
    padding: "12px 20px 20px",
    "& > div + div": {
      marginTop: "12px",
    },
  },
  heading: {
    color: "#333",
    fontSize: "14px",
    fontWeight: "bold",
    marginBottom: "4px",
    display: "flex",
    alignItems: "center",
  },
  item: {
    display: "flex",
    justifyContent: "space-between",
    fontSize: "12px",
    borderBottom: "1px solid #E0E0E0",
    lineHeight: "2",
  },
  itemLabel: {
    color: "#8A8A8A",
  },
  itemValue: {
    color: "#242424",
  },
  square: {
    width: "24px",
    height: "24px",
    marginRight: "10px",
    borderRadius: "4px",
    display: "inline-block",
  },
  householdIcon: {
    backgroundColor: tokens.colorPaletteGreenBackground3,
  },
  waterIcon: {
    backgroundColor: tokens.colorPaletteBlueBackground2,
  },
  buildingIcon: {
    backgroundColor: tokens.colorPaletteDarkOrangeBackground2,
  },
  otherIcon: {
    backgroundColor: "#738298",
  },
  low: {
    color: tokens.colorPaletteGreenBackground3,
    backgroundColor: tokens.colorPaletteGreenBackground1,
    "& > span": {
      backgroundColor: tokens.colorPaletteGreenBackground3,
    },
  },
  medium: {
    color: tokens.colorPaletteYellowBackground3,
    backgroundColor: tokens.colorPaletteYellowBackground1,
    "& > span": {
      backgroundColor: tokens.colorPaletteYellowBackground3,
    },
  },
  high: {
    color: tokens.colorPaletteRedBackground3,
    backgroundColor: tokens.colorPaletteRedBackground1,
    "& > span": {
      backgroundColor: tokens.colorPaletteRedBackground3,
    },
  },
});
