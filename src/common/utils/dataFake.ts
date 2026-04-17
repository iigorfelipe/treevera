import { COLOR_KINGDOM_BY_KEY } from "../constants/tree";
import { getBgImgByKingdom, getRankIcon } from "./tree/ranks";

export const dataFake = [
  {
    kingdomKey: 1,
    kingdomName: "Animalia",
    numDescendants: 0,
    explored: 0,
    bgImg: getBgImgByKingdom("animalia"),
    icon: getRankIcon(1),
    primaryColor: COLOR_KINGDOM_BY_KEY[1],
    lightColor: "#fff3f0",
    description:
      "Organismos multicelulares heterótrofos que se alimentam de outros seres vivos.",
    mainGroups: [
      {
        groupName: "Mamíferos",
        pathNode: [
          {
            key: 1,
            rank: "KINGDOM",
            name: "Animalia",
          },
          {
            rank: "PHYLUM",
            key: 44,
          },
          {
            rank: "CLASS",
            key: 359,
          },
        ],
      },
      {
        groupName: "Aves",
        pathNode: [
          {
            key: 1,
            rank: "KINGDOM",
            name: "Animalia",
          },
          {
            rank: "PHYLUM",
            key: 44,
          },
          {
            rank: "CLASS",
            key: 212,
          },
        ],
      },
      {
        groupName: "Insetos",
        pathNode: [
          {
            key: 1,
            rank: "KINGDOM",
            name: "Animalia",
          },
          {
            rank: "PHYLUM",
            key: 54,
          },
          {
            rank: "CLASS",
            key: 216,
          },
        ],
      },
    ],
  },
  {
    kingdomKey: 2,
    kingdomName: "Archaea",
    numDescendants: 0,
    explored: 0,
    bgImg: getBgImgByKingdom("archaea"),
    icon: getRankIcon(2),
    primaryColor: COLOR_KINGDOM_BY_KEY[2],
    lightColor: "#f8f3ff",
    description:
      "Micro-organismos unicelulares procariontes que vivem em ambientes extremos.",
    mainGroups: [
      {
        groupName: "Thermoproteota",
        pathNode: [
          {
            rank: "KINGDOM",
            key: 2,
            name: "Archaea",
          },
          {
            rank: "PHYLUM",
            key: 10807497,
          },
        ],
      },
      {
        groupName: "Nanoarchaeia",
        pathNode: [
          {
            rank: "KINGDOM",
            key: 2,
            name: "Archaea",
          },
          {
            rank: "PHYLUM",
            key: 10706191,
          },
          {
            rank: "CLASS",
            key: 10809188,
          },
        ],
      },
    ],
  },
  {
    kingdomKey: 3,
    kingdomName: "Bacteria",
    numDescendants: 0,
    explored: 0,
    bgImg: getBgImgByKingdom("bacteria"),
    icon: getRankIcon(3),
    primaryColor: COLOR_KINGDOM_BY_KEY[3],
    lightColor: "#f0fbf9",
    description:
      "Organismos unicelulares procariontes, encontrados em praticamente todos os ambientes.",
    mainGroups: [
      {
        groupName: "Cyanobacteria",
        pathNode: [
          {
            rank: "KINGDOM",
            key: 3,
            name: "Bacteria",
          },
          {
            rank: "PHYLUM",
            key: 68,
          },
        ],
      },
      {
        groupName: "Flavobacteriales",
        pathNode: [
          {
            rank: "KINGDOM",
            key: 3,
            name: "Bacteria",
          },
          {
            rank: "PHYLUM",
            key: 10707955,
          },
          {
            rank: "CLASS",
            key: 7498440,
          },
          {
            rank: "ORDER",
            key: 569,
          },
        ],
      },
    ],
  },
  {
    kingdomKey: 4,
    kingdomName: "Chromista",
    numDescendants: 0,
    explored: 0,
    bgImg: getBgImgByKingdom("chromista"),
    icon: getRankIcon(4),
    primaryColor: COLOR_KINGDOM_BY_KEY[4],
    lightColor: "#fff9ed",
    description:
      "Grupo diverso de organismos, incluindo algas marrons e diatomáceas, geralmente fotossintéticos.",
    mainGroups: [
      {
        groupName: "Heterotrichea",
        pathNode: [
          {
            rank: "KINGDOM",
            key: 4,
            name: "Chromista",
          },
          {
            rank: "PHYLUM",
            key: 7765738,
          },
          {
            rank: "CLASS",
            key: 8235041,
            name: "Chromista",
          },
        ],
      },
      {
        groupName: "Bacillariophyceae",
        pathNode: [
          {
            rank: "KINGDOM",
            key: 4,
            name: "Chromista",
          },
          {
            rank: "PHYLUM",
            key: 98,
          },
          {
            rank: "CLASS",
            key: 7947184,
          },
        ],
      },
    ],
  },
  {
    kingdomKey: 5,
    kingdomName: "Fungi",
    numDescendants: 0,
    explored: 0,
    bgImg: getBgImgByKingdom("fungi"),
    icon: getRankIcon(5),
    primaryColor: COLOR_KINGDOM_BY_KEY[5],
    lightColor: "#fff3ef",
    description:
      "Organismos heterótrofos com parede celular quitinosa, decompositores na natureza.",
    mainGroups: [
      {
        groupName: "Cogumelos",
        pathNode: [
          {
            rank: "KINGDOM",
            key: 5,
          },
          {
            rank: "PHYLUM",
            key: 34,
          },
        ],
      },
      {
        groupName: "Leveduras",
        pathNode: [
          {
            rank: "KINGDOM",
            key: 5,
            name: "Fungi",
          },
          {
            rank: "PHYLUM",
            key: 95,
          },
          {
            rank: "CLASS",
            key: 182,
          },
          {
            rank: "ORDER",
            key: 1281,
          },
        ],
      },
    ],
  },
  {
    kingdomKey: 6,
    kingdomName: "Plantae",
    numDescendants: 0,
    explored: 0,
    bgImg: getBgImgByKingdom("plantae"),
    icon: getRankIcon(6),
    primaryColor: COLOR_KINGDOM_BY_KEY[6],
    lightColor: "#f3fbf0",
    description:
      "Organismos fotossintéticos multicelulares, produtores de oxigênio e base das cadeias alimentares.",
    mainGroups: [
      {
        groupName: "Angiospermas",
        pathNode: [
          {
            rank: "KINGDOM",
            key: 6,
            name: "Plantae",
          },
          {
            rank: "PHYLUM",
            key: 7707728,
          },
          {
            rank: "CLASS",
            key: 220,
          },
        ],
      },
      {
        groupName: "Jungermanniopsida",
        pathNode: [
          {
            rank: "KINGDOM",
            key: 6,
            name: "Plantae",
          },
          {
            rank: "PHYLUM",
            key: 9,
          },
          {
            rank: "CLASS",
            key: 126,
          },
        ],
      },
      {
        groupName: "Briófitas",
        pathNode: [
          {
            rank: "KINGDOM",
            key: 6,
            name: "Plantae",
          },
          {
            rank: "PHYLUM",
            key: 35,
          },
        ],
      },
    ],
  },
  {
    kingdomKey: 7,
    kingdomName: "Protozoa",
    numDescendants: 0,
    explored: 0,
    bgImg: getBgImgByKingdom("protozoa"),
    icon: getRankIcon(7),
    primaryColor: COLOR_KINGDOM_BY_KEY[7],
    lightColor: "#f0f7ff",
    description:
      "Organismos unicelulares eucariontes, geralmente móveis e heterótrofos.",
    mainGroups: [
      {
        groupName: "Amebas",
        pathNode: [
          {
            rank: "KINGDOM",
            key: 7,
            name: "Protozoa",
          },
          {
            rank: "PHYLUM",
            key: 7509337,
          },
        ],
      },
      {
        groupName: "Euglenoidea",
        pathNode: [
          {
            rank: "KINGDOM",
            key: 7,
            name: "Protozoa",
          },
          {
            rank: "PHYLUM",
            key: 41,
          },
        ],
      },
    ],
  },
];

export const game_info_fake = {
  shortcuts: [],
  progress: {
    exploited_species: 0,
    challenges_completed: 0,
    accuracy_of_hits: 0,
    num_achievements: 0,
    consecutive_days: 0,
    global_ranking: 0,
  },
  achievements: { unlocked: [], locked: [] },
};
