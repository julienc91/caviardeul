import Head from "next/head";
import Link from "next/link";
import React from "react";

import ExternalLink from "@caviardeul/components/externalLink";

const AboutPage: React.FC = () => {
  return (
    <>
      <Head>
        <title>רדקטעל - אודות</title>
      </Head>
      <main id="about">
        <div className="left-container">
          <h1>אודות רדקטעל</h1>

          <h2>Présentation</h2>
          <p>
            רדקטעל הוא משחק המבוסס על {" "}
            <ExternalLink href="https://www.redactle.com/">
              Redactle
            </ExternalLink>{" "}
            מאת {" "}
            <ExternalLink href="https://twitter.com/jhntrnr">
              John Turner
            </ExternalLink>
            , אבל בעברית.
          </p>
          <p>
            Le but est de retrouver quotidiennement l&apos;article Wikipédia
            caché derrière les mots caviardés. Les articles sont choisis parmi
            la liste des{" "}
            <ExternalLink href="https://he.wikipedia.org/wiki/%D7%95%D7%99%D7%A7%D7%99%D7%A4%D7%93%D7%99%D7%94:%D7%A2%D7%A8%D7%9B%D7%99%D7%9D_%D7%A9%D7%A6%D7%A8%D7%99%D7%9B%D7%99%D7%9D_%D7%9C%D7%94%D7%99%D7%95%D7%AA_%D7%A7%D7%99%D7%99%D7%9E%D7%99%D7%9D_%D7%91%D7%9B%D7%9C_%D7%9E%D7%94%D7%93%D7%95%D7%A8%D7%95%D7%AA_%D7%95%D7%99%D7%A7%D7%99%D7%A4%D7%93%D7%99%D7%94">
              10&nbsp;000 ערכי ליבה בויקיפדיה
            </ExternalLink>{" "}
            de niveau 4.
          </p>

          <p>
            Ce jeu est proposé gratuitement et sans aucune publicité. Son code
            source est disponible sur{" "}
            <ExternalLink href="https://github.com/julienc91/caviardeul">
              GitHub
            </ExternalLink>
            . Il est hébergé par{" "}
            <ExternalLink href="https://vercel.com/">Vercel</ExternalLink>.
          </p>

          <h2>Données personnelles</h2>
          <p>
            Caviardeul n&apos;utilise ni ne demande aucune donnée personnelle.
            Seules sont collectées les données statistiques sur les articles
            quotidiens lorsqu&apos;ils sont résolus, dans le but de calculer
            leur niveau de difficulté.
          </p>

          <h2>Cookies</h2>
          <p>
            Caviardeul utilise des cookies pour améliorer l&apos;expérience de
            jeu. Ils permettent&nbsp;:
          </p>
          <ul>
            <li>
              de conserver l&apos;historique des propositions saisies afin de
              pouvoir reprendre à tout moment une partie commencée
            </li>
            <li>
              d&apos;afficher les scores du joueur sur la page{" "}
              <Link href="/archives">Archives</Link>
            </li>
          </ul>
          <h2>Contact</h2>
          <p>
            Un bug à signaler ou une suggestion à faire&nbsp;? Utilisez{" "}
            <ExternalLink href="https://github.com/julienc91/caviardeul/issues">
              l&apos;espace <i>Issues</i> du dépôt GitHub
            </ExternalLink>
            .
          </p>
          <p>
            Développé par{" "}
            <ExternalLink href="https://julienc.io">
              Julien Chaumont
            </ExternalLink>
            .
          </p>
        </div>
        <div className="right-container" />
      </main>
    </>
  );
};

export default AboutPage;
