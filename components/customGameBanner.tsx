import { ArticleSafety } from "@prisma/client";
import React, { useState } from "react";

const CustomGameBanner: React.FC<{ safetyLevel: ArticleSafety }> = ({
  safetyLevel,
}) => {
  const [show, setShow] = useState(true);
  if (!show || safetyLevel === "SAFE") {
    return null;
  }
  return (
    <div className="banner">
      <span className="close" onClick={() => setShow(false)} title="Masquer">
        X
      </span>
      <h3>אזהרה</h3>
      <p>
       המאמר המוסתר לא נבחר ע&quot;י המחבר של המשחק{" "}
        {safetyLevel === "UNSAFE"
          ? "התוכן אינו מתאים לכל הקהלים."
          : "ייתכן והתוכן לא יתאים לכל הקהלים."}
      </p>
    </div>
  );
};

export default CustomGameBanner;
