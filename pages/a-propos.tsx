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
             מאחורי המילים שהושחרו. המאמרים נבחרים מתוך
            רשימת{" "}
            <ExternalLink href="https://he.wikipedia.org/wiki/%D7%95%D7%99%D7%A7%D7%99%D7%A4%D7%93%D7%99%D7%94:%D7%A2%D7%A8%D7%9B%D7%99%D7%9D_%D7%A9%D7%A6%D7%A8%D7%99%D7%9B%D7%99%D7%9D_%D7%9C%D7%94%D7%99%D7%95%D7%AA_%D7%A7%D7%99%D7%99%D7%9E%D7%99%D7%9D_%D7%91%D7%9B%D7%9C_%D7%9E%D7%94%D7%93%D7%95%D7%A8%D7%95%D7%AA_%D7%95%D7%99%D7%A7%D7%99%D7%A4%D7%93%D7%99%D7%94">
              10&nbsp;000 ערכי ליבה בויקיפדיה
            </ExternalLink>{" "}
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
            פותח במקור ע"י {" "}
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
