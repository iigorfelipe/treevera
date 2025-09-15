import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/common/components/ui/tooltip";

type TooltipNodeProps = {
  trigger: React.ReactNode;
  content: React.ReactNode;
  delay?: number;
};

// TODO: ta pesado, refatore ou descarte!
export const TooltipNode = ({ trigger, content, delay }: TooltipNodeProps) => {
  return (
    <Tooltip delayDuration={delay ?? 600}>
      <TooltipTrigger asChild>{trigger}</TooltipTrigger>
      {content && (
        <TooltipContent side="top" className="text-sm">
          {content}
        </TooltipContent>
      )}
    </Tooltip>
  );
};
