import React, { useCallback, useEffect } from "react";
import SaveManagement from "../utils/save";
import Modal from "./modal";

const IntroductionfoModal: React.FC = () => {
  const [open, setOpen] = React.useState(false);

  useEffect(() => {
    const skipTutorial = SaveManagement.getIsTutorialSkipped();
    if (!skipTutorial) {
      setOpen(true);
    }
  }, [setOpen]);

  const handleClose = useCallback(() => {
    setOpen(false);
    SaveManagement.setSkipTutorial();
  }, [setOpen]);

  if (!open) {
    return null;
  }

  return (
    <Modal open={open} onClose={handleClose} closeLabel="Commencer">
      <h1>Caviardeul</h1>
      <p>
        Caviardeul est un jeu de réflexion. Le but est de trouver l&apos;article
        Wikipédia qui se cache derrière les mots caviardés. Proposez des mots
        dans la zone de texte, puis validez pour dévoiler les endroits où
        celui-ci est utilisé. Pour vous aider, certains des mots les plus
        courants sont déjà révélés.
      </p>
      <p>
        Le jeu s&apos;arrête lorsque tous les mots du titre de l&apos;article
        sont découverts. Vous pouvez faire autant de propositions que vous le
        souhaitez, mais essayez d&apos;être efficace en terminant la partie au
        plus vite&nbsp;!
      </p>
      <p>
        Ni la casse, ni les caractères spéciaux ou les accents ne sont pris en
        compte.
      </p>
      <p>
        Chaque jour, une nouvelle partie démarre avec un nouvel article à
        déchiffrer&nbsp;!
      </p>
    </Modal>
  );
};

export default IntroductionfoModal;
