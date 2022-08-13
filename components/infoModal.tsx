import React from "react";
import ExternalLink from "./externalLink";
import Modal from "./modal";

const InfoModal: React.FC<{ open: boolean; onClose: () => void }> = ({
  open,
  onClose,
}) => {
  return (
    <Modal open={open} onClose={onClose}>
      <h1>Caviardeul</h1>
      <p>
        Caviardeul est un jeu reprenant le concept de{" "}
        <ExternalLink href="https://www.redactle.com/">Redactle</ExternalLink>{" "}
        par{" "}
        <ExternalLink href="https://twitter.com/jhntrnr">
          John Turner
        </ExternalLink>
        , mais en Français.
      </p>
      <p>
        Le but est de retrouver quotidiennement l&apos;article Wikipédia caché
        derrière les mots caviardés. Les articles sont choisis parmi la liste
        des{" "}
        <ExternalLink href="https://fr.wikipedia.org/wiki/Wikip%C3%A9dia:Articles_vitaux/Niveau_4">
          10&nbsp;000 articles vitaux de Wikipédia
        </ExternalLink>{" "}
        de niveau 4.
      </p>
      <h2>Données personnelles</h2>
      <p>
        Caviardeul n&apos;utilise aucune donnée personnelle. Ce jeu est proposé
        gratuitement et sans aucune publicité. Son code source est disponible
        sur{" "}
        <ExternalLink href="https://github.com/julienc91/caviardeul">
          GitHub
        </ExternalLink>
        . Il est hébergé par{" "}
        <ExternalLink href="https://vercel.com/">Vercel</ExternalLink>.
      </p>
      <h2>Contact</h2>
      <p>
        Un bug à signaler ou une suggestion à faire&nbsp;? Utilisez{" "}
        <ExternalLink href="https://github.com/julienc91/caviardeul/issues">
          l&apos;espace <i>Issues</i> du dépôt GitHub
        </ExternalLink>
        .
      </p>
      <p>
        Développé par{" "}
        <ExternalLink href="https://julienc.io">Julien Chaumont</ExternalLink>.
      </p>
    </Modal>
  );
};

export default InfoModal;
