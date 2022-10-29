import React, { useCallback, useMemo } from "react";
import {
  FaFacebookF,
  FaShareAlt,
  FaTelegramPlane,
  FaTwitter,
  FaWhatsapp,
} from "react-icons/fa";

import { ArticleId } from "@caviardeul/types";
import { BASE_URL } from "@caviardeul/utils/config";

const ShareAction: React.FC<{
  articleId: ArticleId;
  custom: boolean;
  archive: boolean;
  nbTrials: number;
}> = ({ articleId, custom, archive, nbTrials }) => {

  const shareTitle = `פענחתי ${
    custom ? "רדקטעל" : `את הרדקטעל מספר ${articleId}`
  } ${nbTrials > 1 ? `ב-${nbTrials} ניחושים` : "בניחוש יחיד"}!`;
  let shareUrl = `${BASE_URL}/`;
  if (archive) {
    shareUrl += `archives/${articleId}`;
  } else if (custom) {
    shareUrl += `custom/${articleId}`;
  }

  const hasNativeShare = useMemo(
    () => typeof navigator !== "undefined" && !!navigator.share,
    []
  );

  const handleNativeShare = useCallback(async () => {
    await navigator.share({
      url: shareUrl,
      title: "רדקטעל",
      text: shareTitle,
    });
  }, [shareUrl, shareTitle]);

  const handleTwitterShare = useCallback(() => {
    window.open(
      `https://twitter.com/share?text=${encodeURIComponent(
        shareTitle
      )}&url=${encodeURIComponent(shareUrl)}&hashtags=רדקטעל`,
      "_blank"
    );
  }, [shareUrl, shareTitle]);

  const handleFacebookShare = useCallback(() => {
    window.open(
      `https://www.facebook.com/sharer.php?u=${encodeURIComponent(
        shareUrl
      )}&quote=${encodeURIComponent(shareTitle)}`,
      "_blank"
    );
  }, [shareUrl, shareTitle]);

  const handleWhatsAppShare = useCallback(() => {
    window.open(
      `http://api.whatsapp.com/send?text=${encodeURIComponent(
        `${shareTitle} ${shareUrl}`
      )}`,
      "_blank"
    );
  }, [shareUrl, shareTitle]);

  const handleTelegramShare = useCallback(() => {
    window.open(
      `https://t.me/share/url?url=${encodeURIComponent(
        shareUrl
      )}&text=${encodeURIComponent(shareTitle)}`
    );
  }, [shareUrl, shareTitle]);

  return (
    <div className="share-action">
      שתף את התוצאה שלך:
      <span className="actions">
          <button>
            <FaShareAlt onClick={handleNativeShare} />
          </button>
          <button>
            <FaTwitter onClick={handleTwitterShare} />
          </button>
          <button>
            <FaFacebookF onClick={handleFacebookShare} />
          </button>
          <button>
            <FaWhatsapp onClick={handleWhatsAppShare} />
          </button>
          <button>
            <FaTelegramPlane onClick={handleTelegramShare} />
          </button>
      </span>
    </div>
  );
};

export default ShareAction;
