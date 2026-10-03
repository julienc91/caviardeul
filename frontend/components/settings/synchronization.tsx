"use client";

import { QRCodeSVG } from "qrcode.react";
import React, { useState } from "react";
import { FaExclamationTriangle, FaEye, FaEyeSlash } from "react-icons/fa";

import { BASE_URL } from "@caviardeul/utils/config";

const Synchronization: React.FC<{ userId: string }> = ({ userId }) => {
  const [reveal, setReveal] = useState<boolean>(false);
  const url = `${BASE_URL}/login?user=${userId}`;

  return (
    <>
      <p>
        Si vous jouez à Caviardeul sur plusieurs appareils à la fois, vous
        pouvez les synchroniser pour retrouver vos scores et votre progression
        sur chacun d&apos;entre eux.
      </p>
      <p className="note">
        Notez tout de même que l&apos;historique de vos essais n&apos;est pas
        synchronisé, vous ne pourrez donc pas commencer une partie sur un
        appareil puis la reprendre où vous l&apos;aviez laissée sur un second.
      </p>
      <p>
        Depuis votre second appareil, utilisez ce lien ou scannez le QR
        code&nbsp;:
      </p>
      <div className="sync-link">
        <div className="qr-code">
          {reveal ? (
            <QRCodeSVG value={url} size={128} marginSize={1} />
          ) : (
            <button className="mask" onClick={() => setReveal(true)}>
              <FaEye />
              <span>Afficher</span>
            </button>
          )}
        </div>
        <div className="button-input">
          <button
            onClick={() => setReveal(!reveal)}
            title={reveal ? "Masquer" : "Afficher"}
            aria-label={reveal ? "Masquer" : "Afficher"}
          >
            {reveal ? <FaEyeSlash /> : <FaEye />}
          </button>
          <input
            value={reveal ? url : "•".repeat(url.length)}
            type="text"
            readOnly
          />
        </div>
      </div>
      <p className="warning">
        <FaExclamationTriangle />
        <span>
          <strong>Attention&nbsp;:</strong>&nbsp;ce lien et ce code sont
          spécifiques à votre compte, ne les partagez pas&nbsp;!
        </span>
      </p>
    </>
  );
};

export default Synchronization;
