import React, { useState } from "react";

const CustomGameBanner: React.FC = () => {
  const [show, setShow] = useState(true);
  if (!show) {
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
        jeu. Son contenu peut ne pas être adapté à tous les publics.
      </p>
    </div>
  );
};

export default CustomGameBanner;
