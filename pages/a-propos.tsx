import Head from "next/head";
import Link from "next/link";
import React from "react";

import ExternalLink from "@caviardeul/components/externalLink";

const AboutPage: React.FC = () => {
  const title = "Caviardeul - À propos";
  return (
    <>
      <Head>
        <title>{title}</title>
        <meta key="og:title" property="og:title" content={title} />
        <meta key="twitter:title" name="twitter:title" content={title} />
      </Head>
      <main id="about">
        <div className="left-container">
          <h1>À propos de Caviardeul</h1>

          <h2>Présentation</h2>
          <p>
            Caviardeul est un jeu reprenant le concept de{" "}
            <ExternalLink href="https://www.redactle.com/">
              Redactle
            </ExternalLink>{" "}
            par{" "}
            <ExternalLink href="https://twitter.com/jhntrnr">
              John Turner
            </ExternalLink>
            , mais en français.
          </p>
          <p>
            Le but est de retrouver quotidiennement l&apos;article Wikipédia
            caché derrière les mots caviardés. Les articles sont choisis parmi
            la liste des{" "}
            <ExternalLink href="https://fr.wikipedia.org/wiki/Wikip%C3%A9dia:Articles_vitaux/Niveau_4">
              10&nbsp;000 articles vitaux de Wikipédia
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
