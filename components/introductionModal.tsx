import React, { useCallback, useEffect } from "react";

import Modal from "@caviardeul/components/modal";
import SaveManagement from "@caviardeul/utils/save";

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
    <Modal open={open} onClose={handleClose} closeLabel="התחל">
      <h1>רדקטעל</h1>
      <p>
        רדקטעל הוא משחק פאזל. המטרה היא למצוא את מאמר
        הויקיפדיה מאחורי המילים המוסתרות. הצע מילים
        בתיבת הטקסט, ולאחר מכן לחץ בדוק על מנת לחשוף את המקומות שבהם
        הן מופיעות במאמר. כדי לעזור לך, חלק מהמילים הכי נפוצות כבר נחשפו.      
      </p>
      <p>
        המשחק מסתיים כאשר כל המילים בכותרת המאמר
        מתגלות. ניתן להציע כמה הצעות שרוצים.
        אבל נסו להיות יעילים ולסיים את המשחק מהר יותר!
      </p>
      <p>
        בכל יום יעלה אתגר חדש לפענוח
      </p>
    </Modal>
  );
};

export default IntroductionfoModal;
