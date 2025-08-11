import { getRankIcon } from "./ranks";

export const kingdomColors = {
  Animalia: ["border-[#ff6b4d]", "#ff6b4d"],
  Archaea: ["border-[#b561ff]", "#b561ff"],
  Bacteria: ["border-[#2fb5a0]", "#2fb5a0"],
  Chromista: ["border-[#ffb700]", "#ffb700"],
  Fungi: ["border-[#c84726]", "#c84726"],
  Plantae: ["border-[#5bbd38]", "#5bbd38"],
  Protozoa: ["border-[#2196f3]", "#2196f3"],
  Viruses: ["border-[#ef3e6b]", "#ef3e6b"],
};

export const dataFake = [
  {
    kingdomKey: 1,
    kingdomName: "Animalia",
    numDescendants: 0,
    explored: 0,
    icon: getRankIcon("animalia"),
    primaryColor: "#ff6b4d",
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
            kingdom: "Animalia",
          },
          {
            rank: "PHYLUM",
            key: 44,
            kingdom: "Animalia",
          },
          {
            rank: "CLASS",
            key: 359,
            kingdom: "Animalia",
          },
        ],
      },
      {
        groupName: "Aves",
        pathNode: [
          {
            key: 1,
            rank: "KINGDOM",
            kingdom: "Animalia",
          },
          {
            rank: "PHYLUM",
            key: 44,
            kingdom: "Animalia",
          },
          {
            rank: "CLASS",
            key: 212,
            kingdom: "Animalia",
          },
        ],
      },
      {
        groupName: "Insetos",
        pathNode: [
          {
            key: 1,
            rank: "KINGDOM",
            kingdom: "Animalia",
          },
          {
            rank: "PHYLUM",
            key: 54,
            kingdom: "Animalia",
          },
          {
            rank: "CLASS",
            key: 216,
            kingdom: "Animalia",
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
    icon: getRankIcon("archaea"),
    primaryColor: "#b561ff",
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
            kingdom: "Archaea",
          },
          {
            rank: "PHYLUM",
            key: 10807497,
            kingdom: "Archaea",
          },
        ],
      },
      {
        groupName: "Nanoarchaeia",
        pathNode: [
          {
            rank: "KINGDOM",
            key: 2,
            kingdom: "Archaea",
          },
          {
            rank: "PHYLUM",
            key: 10706191,
            kingdom: "Archaea",
          },
          {
            rank: "CLASS",
            key: 10809188,
            kingdom: "Archaea",
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
    icon: getRankIcon("bacteria"),
    primaryColor: "#2fb5a0",
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
            kingdom: "Bacteria",
          },
          {
            rank: "PHYLUM",
            key: 68,
            kingdom: "Bacteria",
          },
        ],
      },
      {
        groupName: "Flavobacteriales",
        pathNode: [
          {
            rank: "KINGDOM",
            key: 3,
            kingdom: "Bacteria",
          },
          {
            rank: "PHYLUM",
            key: 10707955,
            kingdom: "Bacteria",
          },
          {
            rank: "CLASS",
            key: 7498440,
            kingdom: "Bacteria",
          },
          {
            rank: "ORDER",
            key: 569,
            kingdom: "Bacteria",
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
    icon: getRankIcon("chromista"),
    primaryColor: "#ffb700",
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
            kingdom: "Chromista",
          },
          {
            rank: "PHYLUM",
            key: 7765738,
            kingdom: "Chromista",
          },
          {
            rank: "CLASS",
            key: 8235041,
            kingdom: "Chromista",
          },
        ],
      },
      {
        groupName: "Bacillariophyceae",
        pathNode: [
          {
            rank: "KINGDOM",
            key: 4,
            kingdom: "Chromista",
          },
          {
            rank: "PHYLUM",
            key: 98,
            kingdom: "Chromista",
          },
          {
            rank: "CLASS",
            key: 7947184,
            kingdom: "Chromista",
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
    icon: getRankIcon("fungi"),
    primaryColor: "#c84726",
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
            kingdom: "Fungi",
          },
          {
            rank: "PHYLUM",
            key: 34,
            kingdom: "Fungi",
          },
        ],
      },
      {
        groupName: "Leveduras",
        pathNode: [
          {
            rank: "KINGDOM",
            key: 5,
            kingdom: "Fungi",
          },
          {
            rank: "PHYLUM",
            key: 95,
            kingdom: "Fungi",
          },
          {
            rank: "CLASS",
            key: 182,
            kingdom: "Fungi",
          },
          {
            rank: "ORDER",
            key: 1281,
            kingdom: "Fungi",
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
    icon: getRankIcon("plantae"),
    primaryColor: "#5bbd38",
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
            kingdom: "Plantae",
          },
          {
            rank: "PHYLUM",
            key: 7707728,
            kingdom: "Plantae",
          },
          {
            rank: "CLASS",
            key: 220,
            kingdom: "Plantae",
          },
        ],
      },
      {
        groupName: "Jungermanniopsida",
        pathNode: [
          {
            rank: "KINGDOM",
            key: 6,
            kingdom: "Plantae",
          },
          {
            rank: "PHYLUM",
            key: 9,
            kingdom: "Plantae",
          },
          {
            rank: "CLASS",
            key: 126,
            kingdom: "Plantae",
          },
        ],
      },
      {
        groupName: "Briófitas",
        pathNode: [
          {
            rank: "KINGDOM",
            key: 6,
            kingdom: "Plantae",
          },
          {
            rank: "PHYLUM",
            key: 35,
            kingdom: "Plantae",
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
    icon: getRankIcon("protozoa"),
    primaryColor: "#2196f3",
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
            kingdom: "Protozoa",
          },
          {
            rank: "PHYLUM",
            key: 7509337,
            kingdom: "Protozoa",
          },
        ],
      },
      {
        groupName: "Euglenoidea",
        pathNode: [
          {
            rank: "KINGDOM",
            key: 7,
            kingdom: "Protozoa",
          },
          {
            rank: "PHYLUM",
            key: 41,
            kingdom: "Protozoa",
          },
        ],
      },
    ],
  },
  // {
  //   kingdomKey: 8,
  //   kingdomName: "Viruses",
  //   numDescendants: 0,
  //   explored: 0,
  //   icon: getRankIcon("viruses"),
  //   primaryColor: "#ef3e6b",
  //   lightColor: "#fff0f5",
  //   description:
  //     "Agentes infecciosos acelulares, dependentes de células hospedeiras para reprodução.",
  //   mainGroups: ["Coronavírus", "Influenza", "HIV", "Bacteriófagos"],
  // },
];

export const curiosidades = {
  KINGDOM: {
    Animalia: [
      "O reino Animalia foi descrito pela primeira vez por Carl Linnaeus em seu livro Systema Naturae, publicado em 1758.",
      "O termo 'Animalia' tem origem no latim. É o plural de 'animalis', que significa 'ser vivo' ou 'ser que respira'.",
      "Inclui todos os animais multicelulares, heterotróficos e geralmente com mobilidade em alguma fase da vida.",
      "Estima-se que existam mais de 7 milhões de espécies animais, sendo que apenas cerca de 1,5 milhão foram descritas pela ciência.",
      "A maioria dos animais se reproduz sexualmente e passa por um desenvolvimento embrionário complexo.",
      "Os membros do reino Animalia possuem tecidos diferenciados, com exceção de algumas formas muito simples como esponjas.",
      "Representantes do reino Animalia vivem em praticamente todos os ambientes da Terra, incluindo ambientes extremos.",
      "Animalia é um dos cinco (ou seis) reinos na classificação biológica tradicional, ao lado de Plantae, Fungi, Protista, Bacteria e Archaea.",
    ],
    Archaea: [
      "O reino Archaea inclui organismos procariontes que se distinguem das bactérias por sua bioquímica e genética.",
      "Archaea foram reconhecidos como um grupo separado das bactérias apenas na década de 1970, por Carl Woese.",
      "Esses microrganismos vivem em ambientes extremos, como fontes termais, lagos salgados e regiões com pH extremo — por isso são chamados de extremófilos.",
      "Apesar de serem procariontes, os arqueanos possuem algumas semelhanças moleculares com os eucariontes.",
      "Seu DNA é organizado de forma mais complexa que o das bactérias, e suas membranas celulares são compostas por lipídios únicos.",
      "Archaea não causam doenças conhecidas em humanos, ao contrário de muitas bactérias.",
      "São importantes para processos ecológicos, como a produção de metano em ambientes anaeróbicos.",
      "Atualmente, Archaea é considerado um domínio separado de Bacteria e Eukarya, na árvore da vida moderna.",
    ],
    Bacteria: [
      "O reino Bacteria inclui organismos unicelulares procariontes, presentes em praticamente todos os ambientes da Terra.",
      "São extremamente diversos e numerosos — uma colher de solo pode conter bilhões de bactérias.",
      "Bactérias têm papel fundamental na decomposição, ciclos biogeoquímicos e simbioses com outros organismos.",
      "Podem ser patogênicas (causadoras de doenças), mas muitas são benéficas ou essenciais à vida, como as que vivem no intestino humano.",
      "As bactérias se reproduzem principalmente por fissão binária, uma forma rápida de reprodução assexuada.",
      "Elas foram os primeiros seres vivos da Terra, com fósseis datando de mais de 3,5 bilhões de anos.",
      "Muitas bactérias podem formar esporos resistentes, sobrevivendo a condições extremas por longos períodos.",
      "São amplamente usadas na biotecnologia, agricultura, medicina e indústria alimentar (como na produção de iogurte e queijos).",
    ],
    Chromista: [
      "Chromista é um reino proposto para agrupar organismos como algas marrons, diatomáceas e oomicetos.",
      "Foi introduzido por Thomas Cavalier-Smith em 1981 como uma alternativa ao reino Protista.",
      "A maioria dos organismos do reino Chromista é fotossintetizante, possuindo cloroplastos com origem secundária.",
      "O grupo inclui organismos unicelulares e multicelulares, a maioria vivendo em ambientes aquáticos.",
      "Diatomáceas, que pertencem a este reino, são importantes produtores primários em ecossistemas marinhos.",
      "Os membros do reino Chromista possuem parede celular geralmente composta por celulose ou sílica.",
      "Alguns membros são patógenos de plantas, como os oomicetos que causam a requeima em batatas.",
      "Ainda há debates sobre a validade do reino Chromista, e sua classificação pode variar entre sistemas taxonômicos.",
    ],
    Fungi: [
      "O reino Fungi inclui organismos eucariontes como cogumelos, leveduras e bolores.",
      "Todos os fungos são heterotróficos e obtêm nutrientes por absorção, após secretar enzimas digestivas no ambiente.",
      "Sua parede celular é composta por quitina, um polissacarídeo também encontrado no exoesqueleto de artrópodes.",
      "Fungos desempenham papel crucial na decomposição e reciclagem de matéria orgânica nos ecossistemas.",
      "Algumas espécies formam micorrizas, associações simbióticas com raízes de plantas, beneficiando ambas.",
      "Outros fungos são usados na produção de alimentos e bebidas, como pão, cerveja e vinho, através da fermentação.",
      "Vários fungos são fontes de medicamentos importantes, como a penicilina.",
      "Apesar de parecerem plantas, fungos são mais próximos dos animais na árvore evolutiva.",
    ],
    Protozoa: [
      "Protozoários são organismos eucariontes unicelulares tradicionalmente agrupados no reino Protista (ou Protozoa, em classificações alternativas).",
      "Vivem principalmente em ambientes aquáticos ou úmidos e podem ser de vida livre ou parasitas.",
      "O termo 'protozoário' vem do grego e significa 'primeiro animal', embora eles não sejam animais de fato.",
      "Movimentam-se por flagelos, cílios ou pseudópodes, dependendo do grupo.",
      "Alguns protozoários causam doenças em humanos, como a malária (*Plasmodium*) e a doença de Chagas (*Trypanosoma*).",
      "São importantes na cadeia alimentar aquática, atuando como consumidores primários de bactérias e algas.",
      "A classificação de protozoários tem sido revista, e muitos são hoje redistribuídos em supergrupos e domínios modernos.",
      "Apesar de sua simplicidade estrutural, podem ter ciclos de vida complexos com várias fases e hospedeiros.",
    ],
    Plantae: [
      "O reino Plantae inclui organismos eucariontes multicelulares, autotróficos e com parede celular de celulose.",
      "Realizam fotossíntese utilizando clorofila, sendo a base da maioria das cadeias alimentares terrestres.",
      "O termo 'Plantae' vem do latim e significa literalmente 'plantas'.",
      "Inclui desde musgos e samambaias até árvores, gramíneas e flores.",
      "As plantas são fundamentais para a produção de oxigênio e o sequestro de dióxido de carbono na atmosfera.",
      "Existem mais de 390 mil espécies de plantas descritas, das quais cerca de 90% são plantas com flores (angiospermas).",
      "Possuem ciclo de vida com alternância de gerações (esporófito e gametófito).",
      "Plantas são utilizadas pela humanidade desde a antiguidade para alimentação, medicina, construção, rituais e decoração.",
    ],
    Viruses: [
      "Os vírus não são considerados organismos vivos por muitos cientistas, pois não possuem metabolismo próprio nem células.",
      "São compostos basicamente por uma cápsula proteica (capsídeo) envolvendo material genético (DNA ou RNA).",
      "Para se reproduzir, os vírus precisam invadir células hospedeiras e usar sua maquinaria biológica.",
      "Vírus infectam todos os tipos de seres vivos, incluindo animais, plantas, fungos, bactérias (bacteriófagos) e arqueias.",
      "Podem causar doenças graves como gripe, AIDS, COVID-19, hepatite, ebola e muitas outras.",
      "Apesar de causarem doenças, vírus também têm papel importante na regulação de populações microbianas e na transferência de genes entre organismos.",
      "O estudo de vírus é chamado de virologia, um ramo da microbiologia.",
      "A origem dos vírus ainda é debatida — teorias incluem evolução a partir de células, fragmentos de RNA/DNA ou estruturas anteriores à vida celular.",
    ],
  },

  PHYLUM: [
    "O termo 'Filo' (ou 'Phylum' em inglês) é o segundo maior nível na hierarquia taxonômica tradicional, logo abaixo do Reino.",
    "Um filo agrupa organismos que compartilham características estruturais ou funcionais fundamentais.",
    "Filos são usados para representar divergências evolutivas profundas entre grandes grupos de organismos.",
    "O número de filos em um reino pode variar dependendo do grupo de seres vivos e do sistema de classificação adotado.",
    "Em botânica, o termo equivalente a 'filo' é frequentemente 'divisão', embora os dois sejam conceitualmente semelhantes.",
    "A definição de um filo é baseada em critérios anatômicos, genéticos e embriológicos, conforme o grupo de organismos.",
    "Os filos ajudam os cientistas a organizar e compreender a diversidade biológica em uma escala ampla.",
    "Muitos filos foram estabelecidos com base em fósseis e características morfológicas, mas estudos moleculares vêm refinando essas classificações.",
  ],

  CLASS: [
    "Classe é o terceiro nível na hierarquia taxonômica tradicional, abaixo do filo e acima da ordem.",
    "Uma classe agrupa organismos dentro de um mesmo filo que compartilham características mais específicas.",
    "O conceito de classe foi introduzido por Carl Linnaeus e permanece amplamente utilizado na classificação moderna.",
    "A quantidade de classes em um reino pode variar bastante dependendo do grupo e do nível de estudo taxonômico.",
    "A classificação em classes pode ser revista com base em estudos genéticos, moleculares e filogenéticos modernos.",
    "Algumas classes reúnem organismos com grande diversidade morfológica, ecológica ou genética.",
    "Classes são importantes para representar agrupamentos intermediários amplos na hierarquia taxonômica.",
    "Novas classes são ocasionalmente propostas à medida que novas descobertas são feitas, especialmente entre microrganismos e organismos marinhos.",
  ],

  ORDER: [
    "Ordem é um nível taxonômico que fica abaixo da classe e acima da família.",
    "Organismos de uma mesma ordem compartilham características estruturais e funcionais mais específicas do que os de uma mesma classe.",
    "O conceito de ordem foi formalizado por Carl Linnaeus e continua sendo relevante na taxonomia moderna.",
    "O número de ordens em um reino pode variar amplamente, refletindo a diversidade dos organismos agrupados.",
    "Os nomes das ordens seguem convenções específicas em cada ramo da biologia, variando entre zoologia, botânica e microbiologia.",
    "As ordens ajudam a organizar e agrupar famílias que compartilham um ancestral comum relativamente recente.",
    "Algumas ordens contêm apenas uma ou poucas espécies, enquanto outras são extremamente diversas.",
    "Estudos moleculares modernos têm levado à criação, fusão ou divisão de ordens, aprimorando a classificação filogenética.",
  ],

  FAMILY: [
    "Família é um nível taxonômico situado abaixo da ordem e acima do gênero.",
    "Reúne organismos que compartilham características morfológicas, genéticas ou comportamentais muito semelhantes.",
    "Os nomes das famílias seguem convenções taxonômicas específicas, como o sufixo '-idae' na zoologia e '-aceae' na botânica.",
    "Uma família pode conter um ou vários gêneros e dezenas ou até centenas de espécies.",
    "A delimitação de famílias é feita com base em estudos comparativos, incluindo genética, morfologia e filogenia.",
    "Novas famílias podem ser criadas conforme o avanço da taxonomia molecular e a descoberta de novos organismos.",
    "Famílias facilitam a comunicação científica ao agrupar organismos com alto grau de parentesco evolutivo.",
    "O número de famílias reconhecidas em cada reino varia conforme o grupo e o nível de detalhamento taxonômico.",
  ],

  GENUS: [
    "Gênero é uma categoria taxonômica situada abaixo da família e acima da espécie.",
    "Agrupa uma ou mais espécies que compartilham características morfológicas e genéticas muito próximas.",
    "A nomenclatura científica binomial utiliza o nome do gênero como a primeira parte do nome de uma espécie.",
    "O conceito de gênero foi introduzido por Carl Linnaeus no século XVIII como parte de seu sistema de classificação binomial.",
    "Gêneros podem conter uma única espécie (gêneros monoespecíficos) ou muitas espécies diferentes.",
    "A delimitação de um gênero é baseada em critérios morfológicos, anatômicos, comportamentais e moleculares.",
    "Com o avanço da genética, a classificação de muitos gêneros tem sido revisada e atualizada.",
    "Existem dezenas de milhares de gêneros descritos na natureza, e esse número continua crescendo com novas descobertas.",
  ],
};
