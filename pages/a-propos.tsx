import Head from "next/head";
import Link from "next/link";
import React from "react";

import ExternalLink from "@caviardeul/components/externalLink";

const AboutPage: React.FC = () => {
  const title = "רדקטעל - אודות";
  return (
    <>
      <Head>
        <title>{title}</title>
        <meta key="og:title" property="og:title" content={title} />
        <meta key="twitter:title" name="twitter:title" content={title} />
      </Head>
      <main id="about">
        <div className="left-container">
          <h1>אודות רדקטעל</h1>

          <h2>ראשי</h2>
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
            המטרה היא למצוא את המאמר היומי בוויקיפדיה אשר מסתתר
            מאחורי המילים שהושחרו.
          </p>

          <p>
            משחק זה מוצע בחינם וללא כל פרסום. קוד המקור שלו זמין ב{"-"}
            <ExternalLink href="https://github.com/perkio/caviardeul">
              GitHub
            </ExternalLink>
            . והוא מתארח ב{"-"}
            <ExternalLink href="https://vercel.com/">Vercel</ExternalLink>.
          </p>

          <h2>מידע אישי</h2>
          <p>
            רדקטעל אינו משתמש או מבקש נתונים אישיים כלשהם.
            נאספים רק נתונים סטטיסטיים על מאמרים
            יומיים כאשר נפתרו, לצורך חישוב
            רמת הקושי שלהם.
          </p>

          <h2>עוגיות</h2>
          <p>
            רדקטעל משתמש בעוגיות כדי לשפר את חווית
            המשחק. הן מאפשרות:
          </p>
          <ul>
            <li>
              לשמור את היסטוריית הניחושים על מנת שתוכלו לחזור בכל עת לשחק מהנקודה בה הפסקתם.
            </li>
            <li>
              להציג את תוצאות העבר בעמוד{" "}
              <Link href="/archives">הארכיון</Link>.
            </li>
          </ul>
          <h2>צרו קשר</h2>
          <p>
            לדיווח על באגים או הצעות פנו ל{"-"}
            <ExternalLink href="https://github.com/perkio/caviardeul/issues">
              <i>בעיות</i> ב-GitHub
            </ExternalLink>
            .
          </p>
          <p>
            מבוסס על הגרסה הצרפתית{" "}
            <ExternalLink href="https://caviardeul.fr">
             Caviardeul
            </ExternalLink>
          </p>
          <p>
            פותח במקור ע&quot;י {" "}
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
