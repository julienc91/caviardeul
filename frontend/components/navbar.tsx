"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import React, { useCallback, useState } from "react";
import { FaCog } from "react-icons/fa";

import IntroductionModal from "@caviardeul/components/modals/introductionModal";

const links = [
  { href: "/archives", label: "Archives" },
  { href: "/custom/nouveau", label: "Partie personnalisée" },
  { href: "/a-propos", label: "À propos" },
];

const isActive = (pathname: string | null, href: string) =>
  !!pathname && (pathname === href || pathname.startsWith(`${href}/`));

const Navbar = () => {
  const [active, setActive] = useState<boolean>(false);
  const pathname = usePathname();

  const handleToggle = useCallback(() => {
    setActive((value) => !value);
  }, []);

  const handleClose = useCallback(() => {
    setActive(false);
  }, []);

  return (
    <>
      <nav>
        <button
          className={"hamburger" + (active ? " active" : "")}
          onClick={handleToggle}
          title="Menu"
          aria-label="Menu"
        >
          <span className="line" />
          <span className="line" />
          <span className="line" />
        </button>
        <h1>
          <Link href="/" prefetch={false} onClick={handleClose}>
            Caviardeul
          </Link>
        </h1>

        <div className={"nav-links" + (active ? " active" : "")}>
          <div className="nav-link-background" onClick={handleClose} />
          <ul>
            {links.map(({ href, label }) => (
              <li
                key={href}
                className={isActive(pathname, href) ? "active" : undefined}
              >
                <Link href={href} prefetch={false} onClick={handleClose}>
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <Link
          href="/parametres"
          prefetch={false}
          onClick={handleClose}
          className={
            "settings-link" +
            (isActive(pathname, "/parametres") ? " active" : "")
          }
          title="Paramètres"
          aria-label="Paramètres"
        >
          <FaCog />
        </Link>
      </nav>
      <IntroductionModal />
    </>
  );
};

export default React.memo(Navbar);
