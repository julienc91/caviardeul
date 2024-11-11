import React from "react";
import Error from "next/error";


const CustomError: React.FC<{ statusCode?: number, text?: string }> = ({statusCode, text}) => {
  return (
    <main>
      <div className="error">
        <Error statusCode={statusCode ?? 500} title={text ?? "Une erreur est survenue"}/>
      </div>
    </main>
  )
}

export default CustomError
