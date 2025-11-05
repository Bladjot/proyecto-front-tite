import React, { Suspense } from "react";
import Spinner from "../components/spinner/Spinner";

function Loadable<P extends object>(Component: React.ComponentType<P>, fallback?: React.ReactNode) {
  return function LoadableComponent(props: P) {
    return (
      <Suspense fallback={fallback ?? <Spinner />}>
        <Component {...props} />
      </Suspense>
    );
  };
}

export default Loadable;