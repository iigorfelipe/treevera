import type { TFunction } from "i18next";
import type { LucideIcon } from "lucide-react";
import {
  Eye,
  GitBranchPlus,
  Images,
  ListTree,
  Target,
  List,
} from "lucide-react";

export type BenefitKey =
  | "dailyAndRandomChallenges"
  | "speciesGallery"
  | "lists"
  | "saveShortcuts"
  | "viewHistory"
  | "activityHistory";

export interface BenefitDefinition {
  key: BenefitKey;
  icon: LucideIcon;
}

export const benefits: BenefitDefinition[] = [
  { key: "dailyAndRandomChallenges", icon: Target },
  { key: "speciesGallery", icon: Images },
  { key: "lists", icon: List },
  { key: "saveShortcuts", icon: GitBranchPlus },
  { key: "viewHistory", icon: Eye },
  { key: "activityHistory", icon: ListTree },
];

export const getBenefitCopy = (t: TFunction, benefitKey: BenefitKey) => ({
  title: t(`auth.benefits.${benefitKey}.title`),
  description: t(`auth.benefits.${benefitKey}.description`),
});
