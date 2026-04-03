import type { TFunction } from "i18next";
import type { LucideIcon } from "lucide-react";
import { Eye, GitBranchPlus, Images, ListTree, Target } from "lucide-react";

export type BenefitKey =
  | "saveShortcuts"
  | "dailyAndRandomChallenges"
  | "viewHistory"
  | "speciesGallery"
  | "activityHistory";

export interface BenefitDefinition {
  key: BenefitKey;
  icon: LucideIcon;
  color: string;
  bgColor: string;
}

export const benefits: BenefitDefinition[] = [
  {
    key: "saveShortcuts",
    icon: GitBranchPlus,
    color: "text-purple-600",
    bgColor: "",
  },
  {
    key: "dailyAndRandomChallenges",
    icon: Target,
    color: "text-green-600",
    bgColor: "",
  },
  {
    key: "viewHistory",
    icon: Eye,
    color: "text-yellow-600",
    bgColor: "",
  },
  {
    key: "speciesGallery",
    icon: Images,
    color: "text-pink-600",
    bgColor: "",
  },
  {
    key: "activityHistory",
    icon: ListTree,
    color: "text-blue-600",
    bgColor: "",
  },
];

export const getBenefitCopy = (t: TFunction, benefitKey: BenefitKey) => ({
  title: t(`auth.benefits.${benefitKey}.title`),
  description: t(`auth.benefits.${benefitKey}.description`),
});
