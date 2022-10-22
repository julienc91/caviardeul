import Image from "next/image";
import Link from "next/link";
import React, { useCallback, useState } from "react";

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
        <Link href="/" prefetch={false}>
          <a onClick={handleClick}>רדקטעל</a>
        </Link>
      </h1>

      <div className={"nav-links" + (active ? " active" : "")}>
        <div className="nav-link-background" onClick={handleClick} />
        <ul>
          <li className="left">
            <Link href="/archives/" prefetch={false}>
              <a onClick={handleClick}>ארכיון</a>
            </Link>
          </li>
          <li className="left">
            <Link href="/custom/nouveau" prefetch={false}>
              <a onClick={handleClick}>מותאם אישית</a>
            </Link>
          </li>
          <li className="left">
            <Link href="/a-propos" prefetch={false}>
              <a onClick={handleClick}>אודות</a>
            </Link>
          </li>
          <li
            className="left"
            onClick={() => {
              onShowSettingsModal();
              handleClick();
            }}
          >
            אפשרויות
          </li>
          <li className="divider" />
          <li>
            <ExternalLink href="https://github.com/perkio/caviardeul">
              <Image height={30} width={30} src="/github.png" alt="GitHub" />
            </ExternalLink>
          </li>
        </ul>
      </div>
    </nav>
  );
};

export default React.memo(Navbar);
