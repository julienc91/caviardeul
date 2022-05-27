import React from "react";

const InfoModal: React.FC<{ open: boolean; onClose: () => void }> = ({
  open,
  onClose,
}) => {
  if (!open) {
    return null;
  }
  return (
    <div className="modal-container">
      <div className="modal-background" onClick={onClose} />
      <div className="modal">
        <h1>Caviardeul</h1>
        <p>
          Caviardeul est un jeu reprenant le concept de{" "}
          <a href="https://www.redactle.com/" target="_blank" rel="noreferrer">
            Redactle
          </a>{" "}
          par{" "}
          <a
            href="https://twitter.com/jhntrnr"
            target="_blank"
            rel="noreferrer"
          >
            John Turner
          </a>
          , mais en Français.
        </p>
        <p>
          Le but est de retrouver quotidiennement l&apos;article Wikipédia caché
          derrière les mots caviardés, et choisi parmi la liste des{" "}
          <a
            href="https://fr.wikipedia.org/wiki/Wikip%C3%A9dia:Articles_vitaux/Niveau_4"
            target="_blank"
            rel="noreferrer"
          >
            10&nbsp;000 articles vitaux de Wikipédia
          </a>{" "}
          de niveau 4.
        </p>
        <h2>Données personnelles</h2>
        <p>
          Caviardeul n&apos;utilise aucune donnée personnelle. Ce jeu est
          proposé gratuitement et sans aucune publicité. Son code source est
          disponible sur{" "}
          <a
            href="https://github.com/julienc91/caviardeul"
            target="_blank"
            rel="noreferrer"
          >
            GitHub
          </a>
          .
        </p>
      </div>
    </div>
  );
};

export default InfoModal;
