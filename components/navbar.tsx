import React from "react";

const Navbar: React.FC<{ onShowInfoModal: () => void }> = ({
  onShowInfoModal,
}) => {
  return (
    <nav>
      <h1>Caviardeul</h1>
      <ul>
        <li onClick={onShowInfoModal}>Info</li>
      </ul>
    </nav>
  );
};

export default React.memo(Navbar);
