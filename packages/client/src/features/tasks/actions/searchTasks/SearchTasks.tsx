import { useTranslation } from "~/shared/hooks";
import { Input } from "~/shared/ui";

export const SearchTasks = () => {
  const { t } = useTranslation();

  return (
    <Input
      color="fg"
      truncate
      placeholder={t("features.tasks.search.input.placeholder")}
      variant="subtle"
      width="70%"
    />
  );
};
