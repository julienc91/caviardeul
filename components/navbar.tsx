"use client";

import Link from "next/link";
import React, { useCallback, useState } from "react";
import { FaGithub } from "react-icons/fa";

import IntroductionModal from "@caviardeul/components/modals/introductionModal";
import SettingsModal from "@caviardeul/components/modals/settingsModal";
import ExternalLink from "@caviardeul/components/utils/externalLink";

const Navbar = () => {
  const [active, setActive] = useState<boolean>(false);
  const [showSettingsModal, setShowSettingsModal] = useState<boolean>(false);

  const handleClick = useCallback(() => {
    setActive(!active);
  }, [active]);

  return (
    <>
      <nav>
        <button
          className={"hamburger" + (active ? " active" : "")}
          onClick={handleClick}
        >
          <span className="line" />
          <span className="line" />
          <span className="line" />
        </button>
        <h1>
          <Link href="/" prefetch={false} onClick={handleClick}>
            Caviardeul
          </Link>
        </h1>

        <div className={"nav-links" + (active ? " active" : "")}>
          <div className="nav-link-background" onClick={handleClick} />
          <ul>
            <li className="left">
              <Link href="/archives/" prefetch={false} onClick={handleClick}>
                Archives
              </Link>
            </li>
            <li className="left">
              <Link
                href="/custom/nouveau"
                prefetch={false}
                onClick={handleClick}
              >
                Partie personnalisée
              </Link>
            </li>
            <li className="left">
              <Link href="/a-propos" prefetch={false} onClick={handleClick}>
                À propos
              </Link>
            </li>
            <li
              className="left"
              onClick={() => {
                setShowSettingsModal(true);
                handleClick();
              }}
            >
              Options
            </li>
            <li className="divider" />
            <li>
              <ExternalLink href="https://github.com/julienc91/caviardeul">
                <FaGithub />
              </ExternalLink>
            </li>
          </ul>
        </div>
      </nav>
      <IntroductionModal />
      <SettingsModal
        open={showSettingsModal}
        onClose={() => setShowSettingsModal(false)}
      />
    </>
  );
};

export default React.memo(Navbar);
