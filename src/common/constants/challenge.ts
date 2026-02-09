export type StepTip = {
  step: number;
  classification: string;
  answer: string;
  hints: string[];
};

export type TipsData = {
  howToPlay: string;
  steps: StepTip[];
};

export const tipsData = {
  howToPlay:
    "Expanda os grupos da árvore taxonômica seguindo o caminho correto até chegar à espécie Homo sapiens.",
  steps: [
    {
      step: 0,
      classification: "reino",
      answer: "Animalia",
      hints: ["Seres multicelulares.", "Obtêm energia por heterotrofia."],
    },
    {
      step: 1,
      classification: "filo",
      answer: "Chordata",
      hints: [
        "Possuem notocorda em alguma fase da vida.",
        "Sistema nervoso dorsal.",
      ],
    },
    {
      step: 2,
      classification: "classe",
      answer: "Mammalia",
      hints: ["Possuem pelos.", "Glândulas mamárias."],
    },
    {
      step: 3,
      classification: "ordem",
      answer: "Primates",
      hints: ["Polegar opositor.", "Boa visão binocular."],
    },
    {
      step: 4,
      classification: "família",
      answer: "Hominidae",
      hints: [
        "Conhecidos como grandes primatas.",
        "Inclui humanos e grandes símios.",
      ],
    },
    {
      step: 5,
      classification: "gênero",
      answer: "Homo",
      hints: [
        "Uso avançado de ferramentas.",
        "Cérebro altamente desenvolvido.",
      ],
    },
    {
      step: 6,
      classification: "espécie",
      answer: "Homo sapiens",
      hints: ["Capacidade de linguagem complexa.", "Pensamento abstrato."],
    },
  ],
};
