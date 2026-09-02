import {
  useEffect,
  useState
} from "react";


function getInitialTheme() {

  const savedTheme =
    localStorage.getItem(
      "runambiz_theme"
    );


  if (
    savedTheme === "light" ||
    savedTheme === "dark"
  ) {

    return savedTheme;

  }


  if (
    window.matchMedia &&
    window.matchMedia(
      "(prefers-color-scheme: dark)"
    ).matches
  ) {

    return "dark";

  }


  return "light";

}



export function useTheme() {

  const [theme, setTheme] =
    useState(getInitialTheme);


  useEffect(() => {

    document.documentElement.setAttribute(
      "data-theme",
      theme
    );


    localStorage.setItem(
      "runambiz_theme",
      theme
    );

  }, [theme]);


  function toggleTheme() {

    setTheme(
      current =>
        current === "dark"
          ? "light"
          : "dark"
    );

  }


  return {
    theme,
    toggleTheme
  };

}