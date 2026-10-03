"use client";

import { deleteCookie } from "cookies-next/client";
import React, { useCallback, useState } from "react";

import ConfirmModal from "@caviardeul/components/modals/confirmModal";
import SaveManagement from "@caviardeul/utils/save";

const AccountReset: React.FC = () => {
  const [showConfirmModal, setShowConfirmModal] = useState<boolean>(false);

  const handleReset = useCallback(() => {
    SaveManagement.clearProgress(true, true, true);
    deleteCookie("userId");
    setShowConfirmModal(false);
    window.location.reload();
  }, []);

  return (
    <div className="account-reset">
      <p>
        Effacez vos scores et votre progression sur cet appareil. Cette action
        est irréversible.
      </p>
      <button
        className="danger-outline"
        onClick={() => setShowConfirmModal(true)}
      >
        Réinitialiser
      </button>
      <ConfirmModal
        title={"Réinitialiser\u00a0?"}
        message={
          <p>
            Cette action réinitialisera vos scores et votre progression de
            manière irréversible. Voulez-vous continuer&nbsp;?
          </p>
        }
        open={showConfirmModal}
        danger={true}
        confirmLabel="Confirmer"
        cancelLabel="Annuler"
        onConfirm={handleReset}
        onCancel={() => setShowConfirmModal(false)}
      />
    </div>
  );
};

export default AccountReset;
