import React from "react";

export const PageHeader: React.FC<{
  eyebrow: string;
  title: string;
  children?: React.ReactNode;
}> = ({ eyebrow, title, children }) => {
  return (
    <header className="page-header">
      <div className="eyebrow">{eyebrow}</div>
      <h1>{title}</h1>
      {children}
    </header>
  );
};

export const PageSection: React.FC<{
  title: string;
  index?: number;
  className?: string;
  children: React.ReactNode;
}> = ({ title, index, className, children }) => {
  return (
    <section className={"page-section" + (className ? ` ${className}` : "")}>
      <h2>
        {index !== undefined && (
          <span className="index">{index.toString().padStart(2, "0")}</span>
        )}
        {title}
      </h2>
      <div className="page-section-body">{children}</div>
    </section>
  );
};
