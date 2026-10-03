import { Metadata } from "next";
import Link from "next/link";
import React from "react";
import { FaGithub, FaRegClock } from "react-icons/fa";
import { FaArrowUpRightFromSquare } from "react-icons/fa6";

import CaviardedWord from "@caviardeul/components/utils/caviardedWord";
import ExternalLink from "@caviardeul/components/utils/externalLink";
import { PageHeader, PageSection } from "@caviardeul/components/utils/page";

const AboutPage: React.FC = () => {
  return (
    <main id="about" className="page">
      <div className="page-content">
        <PageHeader eyebrow="À propos" title="Caviardeul">
          <p className="lede caviarded-lede">
            Le but est de retrouver quotidiennement l&apos;article{" "}
            <CaviardedWord variant={1}>Wikipédia</CaviardedWord> caché derrière
            les mots <CaviardedWord variant={4}>caviardés</CaviardedWord>.
          </p>
        </PageHeader>

        <div className="page-sections">
          <PageSection index={1} title="Présentation">
            <p>
              Caviardeul est un jeu reprenant le concept de Redactle, mais en
              français. Les articles sont choisis avec soin, de sorte que la
              réponse soit connue et trouvable du plus grand nombre.
            </p>
            <p>
              Ce jeu est proposé gratuitement et sans aucune publicité. Son code
              source est disponible sur{" "}
              <ExternalLink href="https://github.com/julienc91/caviardeul">
                GitHub
              </ExternalLink>
              . Il est hébergé par{" "}
              <ExternalLink href="https://hostinger.fr?REFERRALCODE=RR6JULIENRKC">
                Hostinger
              </ExternalLink>{" "}
              (lien affilié).
            </p>
          </PageSection>

          <PageSection index={2} title="Comment jouer">
            <p>
              Caviardeul est un jeu de réflexion. Le but est de trouver
              l&apos;article Wikipédia qui se cache derrière les mots caviardés.
              Proposez des mots dans la zone de texte, puis validez pour
              dévoiler les endroits où celui-ci est utilisé. Pour vous aider,
              certains des mots les plus courants sont déjà révélés.
            </p>
            <p>
              Le jeu s&apos;arrête lorsque tous les mots du titre de
              l&apos;article sont découverts. Vous pouvez faire autant de
              propositions que vous le souhaitez, mais essayez d&apos;être
              efficace en terminant la partie au plus vite&nbsp;!
            </p>
            <p>
              Ni la casse, ni les caractères spéciaux ou les accents ne sont
              pris en compte.
            </p>
            <p>
              Chaque jour, une nouvelle partie démarre avec un nouvel article à
              déchiffrer&nbsp;!
            </p>
          </PageSection>

          <PageSection index={3} title="Données personnelles">
            <p>
              Caviardeul n&apos;utilise ni ne demande aucune donnée personnelle.
              Seules sont collectées les données statistiques sur les articles
              quotidiens lorsqu&apos;ils sont résolus, dans le but de calculer
              leur niveau de difficulté.
            </p>
          </PageSection>

          <PageSection index={4} title="Cookies">
            <p>
              Caviardeul utilise des cookies pour améliorer l&apos;expérience de
              jeu. Ils permettent&nbsp;:
            </p>
            <ul>
              <li>
                de conserver l&apos;historique des propositions saisies afin de
                pouvoir reprendre à tout moment une partie commencée&nbsp;;
              </li>
              <li>
                d&apos;afficher les scores du joueur sur la page{" "}
                <Link href="/archives">Archives</Link>.
              </li>
            </ul>
            <p className="note">
              <FaRegClock />
              L&apos;ensemble de ces informations est supprimé après 6 mois
              d&apos;inactivité.
            </p>
          </PageSection>

          <PageSection index={5} title="Contact" className="contact">
            <ExternalLink href="https://github.com/julienc91/caviardeul/issues">
              <span className="contact-label">
                Un bug à signaler ou une suggestion à faire&nbsp;?
              </span>
              <span className="contact-value">
                <FaGithub />
                L&apos;espace <i>Issues</i> du dépôt
                <FaArrowUpRightFromSquare className="external" />
              </span>
            </ExternalLink>
            <ExternalLink href="https://julienc.io">
              <span className="contact-label">Développé par</span>
              <span className="contact-value">
                Julien Chaumont
                <FaArrowUpRightFromSquare className="external" />
              </span>
            </ExternalLink>
          </PageSection>
        </div>
      </div>
    </main>
  );
};

export const metadata: Metadata = {
  title: "Caviardeul - À propos",
};
export default AboutPage;
