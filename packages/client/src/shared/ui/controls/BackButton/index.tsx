import { useCallback } from "react";
import { ArrowLeftIcon, IconButton } from "../..";
import { useNavigate, useRouter } from "@tanstack/react-router";
import type { IconButtonProps } from "@chakra-ui/react";
import type { FileRouteTypes } from "~/routeTree.gen";

export type BackButtonProps = Omit<IconButtonProps, "onClick"> & {
  /** Explicit back target — use when browser history may contain external OAuth redirects. */
  to?: FileRouteTypes["to"];
  params?: Record<string, string>;
  onBack?: () => void;
};

export const BackButton = ({ to, params, onBack, ...props }: BackButtonProps) => {
  const router = useRouter();
  const navigate = useNavigate();

  const handleGoBackPage = useCallback(() => {
    if (onBack) {
      onBack();
      return;
    }

    if (to) {
      navigate({ to, params });
      return;
    }

    if (router.history.length > 1) {
      router.history.back();
      return;
    }

    navigate({
      to: "/",
      replace: true,
    });
  }, [navigate, onBack, params, router.history, to]);

  return (
    <IconButton
      variant="outline"
      width="40px"
      borderRadius={12}
      onClick={handleGoBackPage}
      {...props}
    >
      <ArrowLeftIcon />
    </IconButton>
  );
};
