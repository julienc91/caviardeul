import React, { useCallback, useState } from "react";
import Image from "next/image";
import ExternalLink from "./externalLink";

const Navbar: React.FC<{
  onShowInfoModal: () => void;
  onShowScoreModal: () => void;
  onShowSettingsModal: () => void;
}> = ({ onShowInfoModal, onShowScoreModal, onShowSettingsModal }) => {
  const [active, setActive] = useState<boolean>(false);

  const handleClick = useCallback(() => {
    setActive(!active);
  }, [active]);

  return (
    <nav>
      <button
        className={"hamburger" + (active ? " active" : "")}
        onClick={handleClick}
      >
        <span className="line" />
        <span className="line" />
        <span className="line" />
      </button>
      <h1>Caviardeul</h1>

      <div className={"nav-links" + (active ? " active" : "")}>
        <div className="nav-link-background" onClick={handleClick} />
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
      </div>
    </nav>
  );
};

export default React.memo(Navbar);
