import { SignInByLoginForm } from "~/features/auth";
import { useSeo } from "~/shared/seo";

export function SignInPage() {
  useSeo({
    description:
      "Sign in to Just Time Tracker — track time, manage activities, and review your day.",
    path: "/signin",
  });

  return <SignInByLoginForm />;
}
