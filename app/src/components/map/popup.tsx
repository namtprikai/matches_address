import { forwardRef } from "react";

interface Props {
  data: {
    hdms: string | null;
  };
}

export const Popup = forwardRef<HTMLDivElement, Props>(({ data }, ref) => {
  return (
    <div
      ref={ref}
      style={{
        position: "absolute",
        backgroundColor: "white",
        boxShadow: "0 1px 4px rgba(0,0,0,0.2)",
        padding: "15px",
        borderRadius: "10px",
        border: "1px solid #cccccc",
        bottom: "4px",
        left: "8px",
        minWidth: "280px",
      }}
      tabIndex={-1}
    >
      {data.hdms}
    </div>
  );
});

Popup.displayName = "Popup";
