import Link from "next/link";
import React, { useCallback, useState } from "react";
import { FaGithub } from "react-icons/fa";

import ExternalLink from "@caviardeul/components/externalLink";

const Navbar: React.FC<{
  onShowSettingsModal: () => void;
}> = ({ onShowSettingsModal }) => {
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
            <Link href="/custom/nouveau" prefetch={false} onClick={handleClick}>
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
              onShowSettingsModal();
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
  );
};

export default React.memo(Navbar);
