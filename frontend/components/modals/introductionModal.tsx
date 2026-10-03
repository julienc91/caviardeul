import React, { useCallback } from "react";

import Modal from "@caviardeul/components/modals/modal";
import CaviardedWord from "@caviardeul/components/utils/caviardedWord";
import SaveManagement from "@caviardeul/utils/save";

const IntroductionModal: React.FC = () => {
  const [open, setOpen] = React.useState(() => {
    if (typeof window === "undefined") return false;
    const skipTutorial = SaveManagement.getIsTutorialSkipped();
    return !skipTutorial;
  });

  const handleClose = useCallback(() => {
    setOpen(false);
    SaveManagement.setSkipTutorial();
  }, [setOpen]);

  if (!open) {
    return null;
  }

  return (
    <Modal
      open={open}
      onClose={handleClose}
      closeLabel="Commencer"
      className="introduction-modal"
    >
      <h1>Caviardeul</h1>
      <p>
        Retrouvez l&apos;article Wikipédia caché derrière les mots{" "}
        <CaviardedWord variant={1}>caviardés</CaviardedWord>. Proposez des mots
        pour les dévoiler&nbsp;: la partie s&apos;arrête quand tous les mots du
        titre sont découverts.
      </p>
    </Modal>
  );
};

export default IntroductionModal;
