import {
  useCallback,
  useEffect,
  useMemo,
  useState
} from "react";

import {
  supabase
} from "../../lib/supabase";

import {
  getEffectivePlanCode,
  getFeatureMeta
} from "../../lib/planAccess";


export function usePlanAccess({
  subscription
}) {


  const [
    plan,
    setPlan
  ] =
    useState(null);


  const [
    loading,
    setLoading
  ] =
    useState(true);


  const [
    error,
    setError
  ] =
    useState("");


  /* =========================================================
     WHICH PLAN SHOULD CURRENTLY APPLY?
  ========================================================= */

  const effectivePlanCode =
    useMemo(
      () =>
        getEffectivePlanCode(
          subscription
        ),
      [
        subscription?.plan_code,
        subscription?.status
      ]
    );



  /* =========================================================
     LOAD PLAN PERMISSIONS FROM SUPABASE
  ========================================================= */

  const loadPlan =
    useCallback(
      async function () {


        setLoading(
          true
        );


        setError("");


        try {


          const {
            data,
            error:
              planError
          } =
            await supabase
              .from(
                "subscription_plans"
              )
              .select(`
                code,
                name,
                feature_flags,
                feature_limits
              `)
              .eq(
                "code",
                effectivePlanCode
              )
              .eq(
                "is_active",
                true
              )
              .maybeSingle();


          if (
            planError
          ) {

            throw planError;

          }


          if (
            !data
          ) {

            throw new Error(
              "Runambiz plan access could not be loaded."
            );

          }


          setPlan(
            data
          );


        } catch (
          err
        ) {


          console.error(
            "Plan access load error:",
            err
          );


          setError(
            err?.message ||
            "We couldn't load your plan permissions."
          );


          setPlan(
            null
          );


        } finally {


          setLoading(
            false
          );

        }


      },
      [
        effectivePlanCode
      ]
    );



  /* =========================================================
     LOAD ON FIRST OPEN + WHEN SUBSCRIPTION CHANGES
  ========================================================= */

  useEffect(
    () => {


      loadPlan();


    },
    [
      loadPlan
    ]
  );



  /* =========================================================
     CHECK IF MERCHANT CAN USE A FEATURE
  ========================================================= */

  const can =
    useCallback(
      feature => {


        if (
          !feature ||
          !plan
        ) {

          return false;

        }


        return (
          plan
            ?.feature_flags
            ?.[feature] ===
          true
        );


      },
      [
        plan
      ]
    );



  /* =========================================================
     READ NUMERIC PLAN LIMITS
  ========================================================= */

  const limit =
    useCallback(
      (
        key,
        fallback =
          0
      ) => {


        return (
          plan
            ?.feature_limits
            ?.[key]

          ??

          fallback
        );


      },
      [
        plan
      ]
    );



  /* =========================================================
     RESULT
  ========================================================= */

  return {

    loading,

    error,

    plan,

    effectivePlanCode,

    can,

    limit,

    featureInfo:
      getFeatureMeta,

    refresh:
      loadPlan

  };

}