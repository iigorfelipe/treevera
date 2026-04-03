import type { TFunction } from "i18next";
import type { LucideIcon } from "lucide-react";
import {
  AlertTriangle,
  CalendarDays,
  Compass,
  Flame,
  Globe,
  Heart,
  Shield,
  Shuffle,
  Sprout,
  Star,
  Sun,
  Trophy,
} from "lucide-react";

export const KNOWN_KINGDOMS = [
  "Animalia",
  "Archaea",
  "Bacteria",
  "Chromista",
  "Fungi",
  "Plantae",
  "Protozoa",
] as const;

export interface AchievementDefinition {
  id: string;
  icon: LucideIcon;
  goal: number;
}

export const ACHIEVEMENTS: AchievementDefinition[] = [
  {
    id: "primeira_descoberta",
    icon: Sprout,
    goal: 1,
  },
  {
    id: "explorador_da_vida",
    icon: Compass,
    goal: 100,
  },
  {
    id: "equilibrio_da_vida",
    icon: Globe,
    goal: KNOWN_KINGDOMS.length,
  },
  {
    id: "defensor_biodiversidade",
    icon: Shield,
    goal: 5,
  },
  {
    id: "na_linha_vermelha",
    icon: AlertTriangle,
    goal: 5,
  },
  {
    id: "habito_selvagem",
    icon: Flame,
    goal: 7,
  },
  {
    id: "curador_da_vida",
    icon: Heart,
    goal: 25,
  },
  {
    id: "vitrine_pessoal",
    icon: Star,
    goal: 4,
  },
  {
    id: "primeiro_desafio_diario",
    icon: Sun,
    goal: 1,
  },
  {
    id: "sem_roteiro",
    icon: Shuffle,
    goal: 5,
  },
  {
    id: "semana_perfeita",
    icon: CalendarDays,
    goal: 7,
  },
  {
    id: "incansavel",
    icon: Trophy,
    goal: 50,
  },
];

const getAchievementKey = (
  achievementId: string,
  field: "name" | "description",
) => `achievements.items.${achievementId}.${field}` as const;

export const getAchievementName = (t: TFunction, achievementId: string) =>
  t(getAchievementKey(achievementId, "name"));

export const getAchievementDescription = (
  t: TFunction,
  achievementId: string,
) => t(getAchievementKey(achievementId, "description"));
