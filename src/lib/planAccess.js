/* =========================================================
   RUNAMBIZ — PLAN ACCESS RULES
========================================================= */


/*
  These subscription statuses still have access
  to their paid plan.

  Example:
  non_renewing = merchant cancelled renewal,
  but their already-paid period has not ended yet.
*/

export const PAID_ACCESS_STATUSES =
  new Set([
    "active",
    "trialing",
    "non_renewing"
  ]);



/* =========================================================
   PAID FEATURE INFORMATION

   These are mainly used when Runambiz needs to explain
   why a feature/perk requires a paid plan.
========================================================= */

export const FEATURE_META = {


  promotion_eligible: {

    label:
      "Product promotion",

    minimumPlan:
      "Starter"

  },


  hide_runambiz_promotions: {

    label:
      "Hide Runambiz promotions",

    minimumPlan:
      "Starter"

  },


  paid_member_badge: {

    label:
      "Runambiz Member badge",

    minimumPlan:
      "Starter"

  },


  priority_support: {

    label:
      "Priority support",

    minimumPlan:
      "Business"

  },


  custom_domain: {

    label:
      "Custom domain",

    minimumPlan:
      "Pro"

  },


  multiple_stores: {

    label:
      "Multiple stores",

    minimumPlan:
      "Pro"

  },


  team_access: {

    label:
      "Team access",

    minimumPlan:
      "Pro"

  },


  api_access: {

    label:
      "API access",

    minimumPlan:
      "Pro"

  }

};



/* =========================================================
   DASHBOARD PAGE RESTRICTIONS

   IMPORTANT:

   We are deliberately NOT locking normal dashboard pages
   for Free users during launch.

   Later, if Runambiz grows and we decide Analytics,
   Team, Domains, etc. should be restricted, we can add
   them here without rebuilding the whole system.
========================================================= */

export const PAGE_FEATURE_REQUIREMENTS = {};



/* =========================================================
   EFFECTIVE PLAN

   Determines which plan permissions should currently apply.
========================================================= */

export function getEffectivePlanCode(
  subscription
) {


  const planCode =
    String(
      subscription?.plan_code ||
      "free"
    )
      .trim()
      .toLowerCase();


  const status =
    String(
      subscription?.status ||
      "active"
    )
      .trim()
      .toLowerCase();



  /*
    Free is always Free.
  */

  if (
    planCode ===
    "free"
  ) {

    return "free";

  }



  /*
    Paid merchant still has their plan if:

    active
    trialing
    non_renewing

    Example:

    Starter + non_renewing
    still receives Starter benefits until the paid
    billing period actually ends.
  */

  if (
    PAID_ACCESS_STATUSES.has(
      status
    )
  ) {

    return planCode;

  }



  /*
    Examples:

    past_due
    cancelled
    expired

    These fall back to Free permissions.
  */

  return "free";

}



/* =========================================================
   GET FEATURE INFORMATION
========================================================= */

export function getFeatureMeta(
  feature
) {


  return (

    FEATURE_META[
      feature
    ]

    ||

    {

      label:
        "This feature",

      minimumPlan:
        "a paid plan"

    }

  );

}



/* =========================================================
   CHECK WHETHER A DASHBOARD PAGE REQUIRES A FEATURE

   Currently this returns null for every normal page
   because launch access is generous.
========================================================= */

export function getPageRequiredFeature(
  page
) {


  return (

    PAGE_FEATURE_REQUIREMENTS[
      page
    ]

    ||

    null

  );

}