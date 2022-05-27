import React from "react";
import Image from "next/image";

const Navbar: React.FC<{
  onShowInfoModal: () => void;
  onShowScoreModal: () => void;
}> = ({ onShowInfoModal, onShowScoreModal }) => {
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
        <li className="divider" />
        <li>
          <a
            href="https://github.com/julienc91/caviardeul"
            target="_blank"
            rel="noreferrer"
          >
            <Image height={30} width={30} src="/github.png" alt="GitHub" />
          </a>
        </li>
      </ul>
    </nav>
  );
};

export default React.memo(Navbar);
