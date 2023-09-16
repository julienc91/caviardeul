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
      <h3>Mise en garde</h3>
      <p>
        L&apos;article caché n&apos;a pas été sélectionné par l&apos;auteur du
        jeu.{" "}
        {safetyLevel === "UNSAFE"
          ? "Son contenu n'est pas adapté à tous les publics."
          : "Son contenu peut ne pas être adapté à tous les publics."}
      </p>
    </div>
  );
};

export default CustomGameBanner;
