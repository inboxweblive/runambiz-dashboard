import {
  useEffect,
  useState
} from "react";


export function usePwaInstall() {

  const [deferredPrompt, setDeferredPrompt] =
    useState(null);

  const [installed, setInstalled] =
    useState(false);

  const [isIOS, setIsIOS] =
    useState(false);


  useEffect(() => {

    /* =========================================
       DEVICE CHECK
    ========================================= */

    const ios =
      /iphone|ipad|ipod/i.test(
        window.navigator.userAgent
      );

    setIsIOS(ios);



    /* =========================================
       CHECK IF ALREADY INSTALLED
    ========================================= */

    const standalone =
      window.matchMedia(
        "(display-mode: standalone)"
      ).matches ||
      window.navigator.standalone === true;


    if (standalone) {

      setInstalled(true);

    }



    /* =========================================
       CAPTURE INSTALL PROMPT
    ========================================= */

    function handleBeforeInstallPrompt(event) {

      /*
        Prevent Chrome/Edge from showing
        its own automatic install banner.
      */

      event.preventDefault();


      /*
        Save the event for our custom
        Runambiz Install button.
      */

      setDeferredPrompt(event);


      console.log(
        "Runambiz is ready to install."
      );

    }



    /* =========================================
       INSTALLED EVENT
    ========================================= */

    function handleAppInstalled() {

      console.log(
        "Runambiz was installed successfully."
      );


      setInstalled(true);

      setDeferredPrompt(null);

    }



    window.addEventListener(
      "beforeinstallprompt",
      handleBeforeInstallPrompt
    );


    window.addEventListener(
      "appinstalled",
      handleAppInstalled
    );



    return () => {

      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt
      );


      window.removeEventListener(
        "appinstalled",
        handleAppInstalled
      );

    };

  }, []);



  /* =========================================
     INSTALL RUNAMBIZ
  ========================================= */

  async function installApp() {

    /*
      Browser doesn't currently support
      the native install prompt.
    */

    if (!deferredPrompt) {

      return {
        available: false,
        outcome: null
      };

    }


    try {

      /*
        THIS is the part Chrome is talking about.

        It must happen after a user clicks
        your Install button.
      */

      const result =
        await deferredPrompt.prompt();


      console.log(
        "PWA install result:",
        result
      );


      /*
        The stored prompt can only
        be used once.
      */

      setDeferredPrompt(null);


      if (
        result &&
        result.outcome === "accepted"
      ) {

        setInstalled(true);

      }


      return {
        available: true,

        outcome:
          result?.outcome || null
      };


    } catch (error) {

      console.error(
        "Runambiz installation error:",
        error
      );


      return {
        available: false,
        outcome: "error"
      };

    }

  }



  return {

    canInstall:
      Boolean(deferredPrompt),

    installed,

    isIOS,

    installApp

  };

}