import Head from "next/head";
import { useRouter } from "next/router";
import React, { FormEvent, useCallback, useState } from "react";

import Loader from "@caviardeul/components/utils/loader";
import { useCreateCustomGame } from "@caviardeul/lib/queries";
import { copyToClipboard } from "@caviardeul/utils/clipboard";
import { BASE_URL } from "@caviardeul/utils/config";

const NewCustomGame: React.FC = () => {
  const [pageId, setPageId] = useState("");
  const [gameId, setArticleId] = useState<string | null>(null);
  const [pageName, setPageName] = useState("");
  const mutation = useCreateCustomGame();
  const gameUrl = gameId ? BASE_URL + "/custom/" + gameId : "";
  const router = useRouter();

  const title = "Caviardeul - Créez une partie personnalisée";

  const handleChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = event.target.value;
      setPageId(newValue);
    },
    [],
  );

  const handleCopyToClipboard = useCallback(async (content: string) => {
    await copyToClipboard(content);
  }, []);

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
      setArticleId(articleId);
      setPageName(pageName);
      await handleCopyToClipboard(gameUrl);
    },
    [handleCopyToClipboard, gameUrl],
  );

  const handleSubmit = useCallback(
    (event: FormEvent) => {
      event.preventDefault();
      if (gameId || !pageId) {
        return;
      }
      mutation
        .trigger({ pageId })
        .then((param) => param && handleSubmissionCreated(param));
    },
    [gameId, handleSubmissionCreated, mutation, pageId],
  );

  const handleReset = useCallback(() => {
    setArticleId(null);
    setPageId("");
    setPageName("");
    mutation.reset();
  }, [mutation]);

  return (
    <>
      <Head>
        <title>{title}</title>
        <meta key="og:title" property="og:title" content={title} />
      </Head>
      <main id="new-custom-game">
        <div className="left-container">
          <h1>Créer une partie personnalisée</h1>

          <form onSubmit={handleSubmit}>
            <p>
              Saisissez l&apos;adresse de l&apos;article Wikipédia de votre
              choix&nbsp;:
            </p>
            <p>
              <label className="url-input">
                <span>fr.wikipedia.org/wiki/</span>
                <input
                  type="text"
                  placeholder="Jeu"
                  readOnly={!!gameId}
                  value={pageId}
                  onChange={handleChange}
                  onPaste={handlePaste}
                  required
                />
              </label>
              <input
                type="submit"
                disabled={!pageId.length || mutation.isMutating || !!gameId}
                value="Créer"
              />
            </p>
            {mutation.isMutating && <Loader />}
            {mutation.error && (
              <p>
                Impossible de créer une partie personnalisée à partir de cet
                article.
              </p>
            )}
          </form>
          {gameId && (
            <>
              <p>Voici le lien de votre partie personnalisée&nbsp;:</p>
              <div className="url-copy">
                <input
                  type="button"
                  value="Copier"
                  onClick={() => handleCopyToClipboard(gameUrl)}
                />
                <input type="text" readOnly value={gameUrl} />
                <input
                  type="button"
                  value="Ouvrir"
                  onClick={async () => {
                    await router.push(gameUrl);
                  }}
                />
              </div>
              <p>
                Le titre à trouver est &laquo;&nbsp;{pageName}&nbsp;&raquo;.
              </p>
              <div>
                <input
                  type="button"
                  value="Créer une autre partie"
                  onClick={handleReset}
                />
              </div>
            </>
          )}
        </div>
        <div className="right-container">
          <h1>Partie personnalisée</h1>

          <p>
            Les parties personnalisées sont des parties à partager, créées à
            partir de l&apos;article Wikipédia de votre choix.
          </p>

          <ol>
            <li>Sélectionnez un article Wikipédia</li>
            <li>Saisissez son adresse sur cette page et validez</li>
            <li>Partagez le lien de la partie autour de vous&nbsp;!</li>
          </ol>

          <p>
            Conseil&nbsp;: évitez les articles trop courts qui peuvent être plus
            difficiles à trouver.
          </p>
        </div>
      </main>
    </>
  );
};

export default NewCustomGame;
