import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

type TooltipNodeProps = {
  trigger: React.ReactNode;
  content: React.ReactNode;
};

export const TooltipNode = ({ trigger, content }: TooltipNodeProps) => {
  return (
    <Tooltip delayDuration={600}>
      <TooltipTrigger asChild>{trigger}</TooltipTrigger>
      {content && (
        <TooltipContent side="right" className="text-sm">
          {content}
        </TooltipContent>
      )}
    </Tooltip>
  );
};
