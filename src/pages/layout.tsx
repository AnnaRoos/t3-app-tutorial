import React, { type PropsWithChildren } from "react";

export const Layout = (props: PropsWithChildren) => {
  const { children } = props;
  return (
    <main className="flex h-screen flex-col items-center">
      <div className="flex h-full w-full flex-col overflow-y-auto border-x-2 border-t border-teal-400 md:max-w-2xl">
        {children}
      </div>
    </main>
  );
};
