import { useRef, useEffect } from "react";
import { useLocation } from "react-router-dom";

function useScrollRestoration() {
  const { key } = useLocation();
  const elementRef = useRef();

  useEffect(() => {
    const scrollTop = sessionStorage.getItem(key);
    const element = elementRef.current;
    const saveScrollTop = () => sessionStorage.setItem(key, element.scrollTop);

    if (scrollTop) element.scrollTo(0, scrollTop);
    element.addEventListener("scroll", saveScrollTop);

    return () => element.removeEventListener("scroll", saveScrollTop);
  }, []);

  return elementRef;
}

export default useScrollRestoration;
