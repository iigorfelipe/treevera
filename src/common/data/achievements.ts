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
  name: string;
  description: string;
  icon: LucideIcon;
  goal: number;
}

export const ACHIEVEMENTS: AchievementDefinition[] = [
  //#region Exploração
  {
    id: "primeira_descoberta",
    name: "Primeira Descoberta",
    description: "Primeira espécie explorada na árvore taxonômica.",
    icon: Sprout,
    goal: 1,
  },
  {
    id: "explorador_da_vida",
    name: "Explorador da Vida",
    description: "100 espécies diferentes exploradas.",
    icon: Compass,
    goal: 100,
  },
  {
    id: "equilibrio_da_vida",
    name: "Equilíbrio da Vida",
    description: `Espécies de todos os ${KNOWN_KINGDOMS.length} reinos navegáveis exploradas.`,
    icon: Globe,
    goal: KNOWN_KINGDOMS.length,
  },
  {
    id: "defensor_biodiversidade",
    name: "Defensor da Biodiversidade",
    description: "5 espécies ameaçadas (EN ou VU) exploradas.",
    icon: Shield,
    goal: 5,
  },
  {
    id: "na_linha_vermelha",
    name: "Na Linha Vermelha",
    description: "5 espécies criticamente ameaçadas (CR) exploradas.",
    icon: AlertTriangle,
    goal: 5,
  },
  {
    id: "habito_selvagem",
    name: "Hábito Selvagem",
    description:
      "7 dias consecutivos com pelo menos uma espécie nova explorada.",
    icon: Flame,
    goal: 7,
  },
  {
    id: "curador_da_vida",
    name: "Curador da Vida",
    description: "25 espécies adicionadas aos favoritos.",
    icon: Heart,
    goal: 25,
  },
  //#region Desafios
  {
    id: "primeiro_desafio_diario",
    name: "Primeiro Desafio Diário",
    description: "Primeiro desafio diário concluído.",
    icon: Sun,
    goal: 1,
  },
  {
    id: "sem_roteiro",
    name: "Sem Roteiro",
    description: "5 desafios aleatórios concluídos.",
    icon: Shuffle,
    goal: 5,
  },
  {
    id: "semana_perfeita",
    name: "Semana Perfeita",
    description: "7 dias consecutivos de desafios diários concluídos.",
    icon: CalendarDays,
    goal: 7,
  },
  {
    id: "incansavel",
    name: "Incansável",
    description: "50 desafios concluídos no total.",
    icon: Trophy,
    goal: 50,
  },
];
