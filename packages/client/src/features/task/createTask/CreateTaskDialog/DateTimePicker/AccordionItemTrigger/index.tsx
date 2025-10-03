import {
  Accordion,
  Badge,
  Text,
  type AccordionItemTriggerProps as BaseAccordionItemTriggerProps,
} from "~/shared/ui";

export interface AccordionItemTriggerProps
  extends Omit<BaseAccordionItemTriggerProps, "onClick"> {
  label?: string;
  isActive?: boolean;
  isExpanded?: boolean;
  badgeText?: string;
  onClickTrigger?: () => void;
}

export function AccordionItemTrigger({
  badgeText,
  label,
  isActive = false,
  isExpanded = false,
  onClickTrigger,
  ...props
}: AccordionItemTriggerProps) {
  return (
    <Accordion.ItemTrigger onClick={onClickTrigger} {...props}>
      {label && <Text fontSize="md">{label}</Text>}
      <Badge
        size="lg"
        transition="opacity"
        border="1px solid transparent"
        _hover={{ cursor: "pointer", opacity: "0.5" }}
        {...(isExpanded &&
          isActive && {
            borderColor: "border.inverted",
          })}
      >
        {badgeText}
      </Badge>
    </Accordion.ItemTrigger>
  );
}
