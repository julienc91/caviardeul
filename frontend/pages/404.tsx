import React from "react";

import CustomError from "@caviardeul/components/utils/error";

const NotFoundPage: React.FC = () => {
  return <CustomError statusCode={404} text="Page non trouvée" />;
};

export default NotFoundPage;
