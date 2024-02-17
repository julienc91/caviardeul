import Error from "next/error";
import React from "react";

const NotFoundPage: React.FC = () => {
  return <Error statusCode={404} title="Page non trouvée" />;
};

export default NotFoundPage;
