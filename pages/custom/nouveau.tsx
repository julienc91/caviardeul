import React, { FormEvent, useCallback, useState } from "react";
import { useCreateCustomGame } from "../../hooks/article";
import { CustomGameCreation } from "../../types";
import Loader from "../../components/loader";
import { BASE_URL } from "../../utils/config";
import { copyToClipboard } from "../../utils/clipboard";
import { GetStaticProps } from "next";
import { useRouter } from "next/router";

const NewCustomGame: React.FC = () => {
  const [pageName, setPageName] = useState("");
  const [gameId, setGameId] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const mutation = useCreateCustomGame();
  const gameUrl = gameId ? BASE_URL + "/custom/" + gameId : "";
  const router = useRouter();

  const handleChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = event.target.value;
      setPageName(newValue);
    },
    []
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
      setPageName(newValue);
      event.preventDefault();
    },
    []
  );

  const handleSubmissionCreated = useCallback(
    async ({ pageId, title }: CustomGameCreation) => {
      setGameId(pageId);
      setTitle(title);
      await handleCopyToClipboard(gameUrl);
    },
    [handleCopyToClipboard, gameUrl]
  );

  const handleSubmit = useCallback(
    (event: FormEvent) => {
      event.preventDefault();
      if (gameId) {
        return;
      }
      mutation.mutate(pageName, {
        onSuccess: handleSubmissionCreated,
      });
    },
    [gameId, handleSubmissionCreated, mutation, pageName]
  );

  const handleReset = useCallback(() => {
    setGameId(null);
    setTitle("");
    setPageName("");
    mutation.reset();
  }, [mutation]);

  return (
    <main id="new-custom-game">
      <div className="left-container">
        <h1>Cr??er une partie personnalis??e</h1>

        <form onSubmit={handleSubmit}>
          <p>
            Saisissez l&apos;adresse de l&apos;article Wikip??dia de votre
            choix&nbsp;:
          </p>
          <p>
            <label className="url-input">
              <span>fr.wikipedia.org/wiki/</span>
              <input
                type="text"
                placeholder="Jeu"
                readOnly={!!gameId}
                value={pageName}
                onChange={handleChange}
                onPaste={handlePaste}
                required
              />
            </label>
            <input
              type="submit"
              disabled={!pageName.length || mutation.isLoading || !!gameId}
              value="Cr??er"
            />
          </p>
          {mutation.isLoading && <Loader />}
          {mutation.isError && (
            <p>
              Impossibe de cr??er une partie personnalis??e ?? partir de cet
              article.
            </p>
          )}
        </form>
        {gameId && (
          <>
            <p>Voici le lien de votre partie personnalis??e&nbsp;:</p>
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
            <p>Le titre ?? trouver est &laquo;&nbsp;{title}&nbsp;&raquo;.</p>
            <div>
              <input
                type="button"
                value="Cr??er une autre partie"
                onClick={handleReset}
              />
            </div>
          </>
        )}
      </div>
      <div className="right-container">
        <h1>Partie personnalis??e</h1>

        <p>
          Les parties personnalis??es sont des parties ?? partager, cr????es ??
          partir de l&apos;article Wikip??dia de votre choix.
        </p>

        <ol>
          <li>S??lectionnez un article Wikip??dia</li>
          <li>Saisissez son adresse sur cette page et validez</li>
          <li>Partagez le lien de la partie autour de vous&nbsp;!</li>
        </ol>

        <p>
          Conseil&nbsp;: ??vitez les articles trop courts qui peuvent ??tre plus
          difficiles ?? trouver.
        </p>
      </div>
    </main>
  );
};

export default NewCustomGame;

export const getStaticProps: GetStaticProps = async () => {
  return {
    props: {},
  };
};
