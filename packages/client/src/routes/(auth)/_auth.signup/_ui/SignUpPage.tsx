import { SignUpForm } from "~/features/auth";
import { useSeo } from "~/shared/seo";

export function SignUpPage() {
  useSeo({
    description:
      "Create a Just Time Tracker account and start tracking your daily activities.",
    path: "/signup",
  });

  return <SignUpForm />;
}
