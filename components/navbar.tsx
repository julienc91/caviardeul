import React from "react";
import Image from "next/image";
import ExternalLink from "./externalLink";

const Navbar: React.FC<{
  onShowInfoModal: () => void;
  onShowScoreModal: () => void;
  onShowSettingsModal: () => void;
}> = ({ onShowInfoModal, onShowScoreModal, onShowSettingsModal }) => {
  return (
    <nav>
      <h1>Caviardeul</h1>
      <ul>
        <li className="left" onClick={onShowInfoModal}>
          À propos
        </li>
        <li className="left" onClick={onShowScoreModal}>
          Scores
        </li>
        <li className="left" onClick={onShowSettingsModal}>
          Options
        </li>
        <li className="divider" />
        <li>
          <ExternalLink href="https://github.com/julienc91/caviardeul">
            <Image height={30} width={30} src="/github.png" alt="GitHub" />
          </ExternalLink>
        </li>
      </ul>
    </nav>
  );
};

export default React.memo(Navbar);
