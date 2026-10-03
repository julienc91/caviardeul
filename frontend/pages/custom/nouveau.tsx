import Head from "next/head";
import Link from "next/link";
import React, { FormEvent, useCallback, useEffect, useState } from "react";
import {
  FaArrowRight,
  FaCheck,
  FaExclamationCircle,
  FaRegCopy,
  FaUndo,
} from "react-icons/fa";

import { PageHeader } from "@caviardeul/components/utils/page";
import { useCreateCustomGame } from "@caviardeul/lib/queries";
import { copyToClipboard } from "@caviardeul/utils/clipboard";
import { BASE_URL } from "@caviardeul/utils/config";

const getGameUrl = (gameId: string) => `${BASE_URL}/custom/${gameId}`;

const CreatedGame: React.FC<{
  gameId: string;
  pageName: string;
  autoCopied: boolean;
  onReset: () => void;
}> = ({ gameId, pageName, autoCopied, onReset }) => {
  const [copied, setCopied] = useState(false);
  const [showTitle, setShowTitle] = useState(false);
  const gameUrl = getGameUrl(gameId);

  useEffect(() => {
    if (!copied) {
      return;
    }
    const timeout = setTimeout(() => setCopied(false), 1800);
    return () => clearTimeout(timeout);
  }, [copied]);

  const handleCopy = useCallback(async () => {
    try {
      await copyToClipboard(gameUrl);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  }, [gameUrl]);

  const titleHint = showTitle
    ? "(cliquez pour masquer)"
    : "(cliquez pour révéler)";

  return (
    <div className="created-game">
      <div className="created-game-title">
        <FaCheck className="success" />
        Votre partie est prête
      </div>
      <div className="url-copy">
        <input type="text" readOnly value={gameUrl} aria-label="Lien" />
        <button className="copy" onClick={handleCopy}>
          {copied ? <FaCheck /> : <FaRegCopy />}
          {copied ? "Copié !" : "Copier"}
        </button>
        <Link className="open" href={`/custom/${gameId}`} prefetch={false}>
          Ouvrir
          <FaArrowRight />
        </Link>
      </div>
      <div className="hidden-title">
        Le titre à trouver est «&nbsp;
        <button
          className={"caviarded-toggle" + (showTitle ? " revealed" : "")}
          onClick={() => setShowTitle(!showTitle)}
          title={titleHint}
        >
          {pageName}
        </button>
        &nbsp;» <span className="hint">{titleHint}</span>
      </div>
      {autoCopied && (
        <div className="note">
          Le lien a été copié dans votre presse-papiers&nbsp;: partagez-le
          autour de vous&nbsp;!
        </div>
      )}
      <div>
        <button className="link-button" onClick={onReset}>
          <FaUndo />
          Créer une autre partie
        </button>
      </div>
    </div>
  );
};

const NewCustomGame: React.FC = () => {
  const [pageId, setPageId] = useState("");
  const [created, setCreated] = useState<{
    gameId: string;
    pageName: string;
    autoCopied: boolean;
  } | null>(null);
  const mutation = useCreateCustomGame();

  const title = "Caviardeul - Créez une partie personnalisée";

  const handleChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setPageId(event.target.value);
      if (mutation.error) {
        mutation.reset();
      }
    },
    [mutation],
  );

  const handlePaste = useCallback(
    (event: React.ClipboardEvent<HTMLInputElement>) => {
      let newValue = event.clipboardData.getData("text");
      if (newValue) {
        newValue = newValue.split("/").pop() || "";
        newValue = newValue.split(/[#?]/).shift() || "";
        newValue = decodeURI(newValue);
      }
      setPageId(newValue);
      event.preventDefault();
    },
    [],
  );

  const handleSubmissionCreated = useCallback(
    async ({
      articleId,
      pageName,
    }: {
      articleId: string;
      pageName: string;
    }) => {
      let autoCopied = true;
      try {
        await copyToClipboard(getGameUrl(articleId));
      } catch {
        autoCopied = false;
      }
      setCreated({ gameId: articleId, pageName, autoCopied });
    },
    [],
  );

  const handleSubmit = useCallback(
    (event: FormEvent) => {
      event.preventDefault();
      if (created || !pageId || mutation.isMutating) {
        return;
      }
      mutation
        .trigger({ pageId })
        .then((param) => param && handleSubmissionCreated(param));
    },
    [created, handleSubmissionCreated, mutation, pageId],
  );

  const handleReset = useCallback(() => {
    setCreated(null);
    setPageId("");
    mutation.reset();
  }, [mutation]);

  return (
    <>
      <Head>
        <title>{title}</title>
        <meta key="og:title" property="og:title" content={title} />
      </Head>
      <main id="new-custom-game" className="page">
        <div className="page-content narrow">
          <PageHeader
            eyebrow="Partie personnalisée"
            title="Caviardez l'article de votre choix"
          >
            <p className="lede">
              Les parties personnalisées sont des parties à partager, créées à
              partir de l&apos;article Wikipédia de votre choix.
            </p>
          </PageHeader>

          {created ? (
            <CreatedGame {...created} onReset={handleReset} />
          ) : (
            <form onSubmit={handleSubmit}>
              <label htmlFor="custom-page-id">
                Adresse de l&apos;article Wikipédia
              </label>
              <div className="url-form">
                <div className="url-input">
                  <span>fr.wikipedia.org/wiki/</span>
                  <input
                    id="custom-page-id"
                    type="text"
                    placeholder="Jeu"
                    value={pageId}
                    onChange={handleChange}
                    onPaste={handlePaste}
                    disabled={mutation.isMutating}
                    required
                  />
                </div>
                <button
                  type="submit"
                  disabled={!pageId.length || mutation.isMutating}
                >
                  {mutation.isMutating ? "Création…" : "Créer"}
                </button>
              </div>
              {mutation.error && (
                <div className="error-message" role="alert">
                  <FaExclamationCircle />
                  Impossible de créer une partie personnalisée à partir de cet
                  article.
                </div>
              )}
              <div className="note">
                Conseil&nbsp;: évitez les articles trop courts, qui peuvent être
                plus difficiles à trouver.
              </div>
            </form>
          )}
        </div>
      </main>
    </>
  );
};

export default NewCustomGame;
