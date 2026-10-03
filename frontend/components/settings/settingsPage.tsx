"use client";

import React from "react";

import AccountReset from "@caviardeul/components/settings/accountReset";
import Options from "@caviardeul/components/settings/options";
import Synchronization from "@caviardeul/components/settings/synchronization";
import { useUserId } from "@caviardeul/components/settings/userId";
import { PageHeader, PageSection } from "@caviardeul/components/utils/page";

const SettingsPage: React.FC = () => {
  const userId = useUserId();

  return (
    <main id="settings" className="page">
      <div className="page-content">
        <PageHeader eyebrow="Paramètres" title="Options et compte" />

        <div className="page-sections">
          <PageSection title="Options">
            <Options />
          </PageSection>
          {userId && (
            <>
              <PageSection title="Synchronisation entre appareils">
                <Synchronization userId={userId} />
              </PageSection>
              <PageSection title="Réinitialisation">
                <AccountReset />
              </PageSection>
            </>
          )}
        </div>
      </div>
    </main>
  );
};

export default SettingsPage;
