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

type Kingdom = { [key: number]: string[] };

type Curiosidades = {
  KINGDOM: Kingdom;
  PHYLUM: string[];
  CLASS: string[];
  ORDER: string[];
  FAMILY: string[];
  GENUS: string[];
};
export const curiosidades: Curiosidades = {
  KINGDOM: {
    1: [
      "Mais de 95% de todas as espécies animais são invertebrados — vertebrados como peixes, répteis e mamíferos são uma minoria evolutiva.",
      "O polvo tem três corações, sangue azul e resolve quebra-cabeças — sua inteligência evoluiu de forma completamente independente da dos vertebrados.",
      "O tardigrado (urso d'água) é o único animal capaz de sobreviver no vácuo do espaço, a -272°C e a doses de radiação 3.000× letais para humanos.",
      "Esponjas (Porifera) não têm músculos nem sistema nervoso, mas são animais — e existem há mais de 600 milhões de anos, sobrevivendo a cinco extinções em massa.",
      "A baleia-azul tem o maior coração já medido em qualquer animal: pesa cerca de 180 kg e seu batimento pode ser detectado a quilômetros de distância.",
      "O camarão-mantis detecta 16 tipos de fotorreceptores de cor — humanos têm apenas 3 — e processa informação visual três vezes mais rápido que nós.",
      "Estima-se entre 5 e 10 milhões de espécies de insetos no planeta; apenas cerca de 1 milhão foi descrita pela ciência.",
      "O corvo-da-nova-caledônia fabrica ferramentas de galhos com mais habilidade que chimpanzés, desafiando a ideia de que uso de ferramentas era exclusivo de primatas.",
    ],
    2: [
      "Archaea foram descobertos como grupo separado da vida apenas em 1977, quando Carl Woese sequenciou RNA ribossomal e revelou uma terceira linhagem — transformando a biologia.",
      "Methanobrevibacter smithii vive no seu intestino agora — é uma archaea que produz metano e influencia diretamente a eficiência da sua digestão.",
      "Algumas arqueanas se reproduzem a 121°C em fontes hidrotermais oceânicas — a temperatura mais alta em que qualquer organismo conhecido consegue se multiplicar.",
      "Archaea não possuem peptidoglicano em suas paredes celulares, tornando-as naturalmente imunes a antibióticos como a penicilina.",
      "As membranas das Archaea usam ligações éter em vez de éster (como em bactérias e animais), tornando-as extremamente estáveis em condições extremas.",
      "Estudos filogenômicos modernos sugerem que eucariontes — incluindo humanos — descendem de um ancestral comum com Archaea, sendo mais aparentados a elas do que bactérias são.",
      "Thaumarchaeota realizam nitrificação nos oceanos e são responsáveis por parte essencial do ciclo global do nitrogênio — sem elas, a vida marinha colapsaria.",
      "Nenhuma Archaea conhecida causa doenças em humanos — um fato surpreendente dado que vivem em tão íntimo contato com nosso organismo.",
    ],
    3: [
      "Seu intestino abriga cerca de 38 trilhões de bactérias — aproximadamente igual ao número de células do seu próprio corpo.",
      "A bactéria Deinococcus radiodurans suporta doses de radiação 3.000× maiores que o letal para humanos, reconstituindo seu DNA fragmentado em horas.",
      "O cianobactério Prochlorococcus é a menor célula fotossintética conhecida e estima-se que produza cerca de 20% do oxigênio de toda a atmosfera terrestre.",
      "Candidatus Thiomargarita magnifica, descoberta em 2022 na Guadalupe, tem células visíveis a olho nu — com até 2 cm de comprimento, é a maior bactéria já encontrada.",
      "Bactérias transferem genes diretamente entre si (transferência horizontal), permitindo que resistência a antibióticos se espalhe globalmente em questão de anos.",
      "Fósseis de cianobactérias datam de 3,5 bilhões de anos — as bactérias oxigenaram a atmosfera terrestre e possibilitaram a evolução de toda a vida complexa.",
      "Myxococcus xanthus caça em enxames multicelulares coordenados e forma corpos de frutificação — um comportamento social raro e sofisticado em bactérias.",
      "Barry Marshall bebeu uma solução de Helicobacter pylori em 1984 para provar que a bactéria causava úlcera gástrica — e ganhou o Nobel de Medicina em 2005.",
    ],
    4: [
      "Diatomáceas produzem entre 20% e 25% de todo o oxigênio da Terra — mais do que todas as florestas tropicais juntas.",
      "A parede celular das diatomáceas (frústula) é feita de sílica (vidro biológico) e exibe padrões geométricos nanosimétricos usados como referência em nanotecnologia.",
      "O oomiceto Phytophthora infestans causou a Grande Fome Irlandesa (1845–1852), matando mais de 1 milhão de pessoas e forçando outros 2 milhões a emigrar.",
      "Chromista têm cloroplastos de origem secundária: em vez de capturar cianobactérias (como plantas), capturaram uma alga eucariótica inteira por endossimbiose.",
      "O cocolitofóride Emiliania huxleyi forma florescimentos visíveis do espaço, cobrindo milhões de km² de oceano com seus escudos de calcário branco.",
      "As falésias brancas de Dover, na Inglaterra, são feitas de bilhões de conchas de cocolitos (Haptophyta) acumuladas no fundo do mar há ~80 milhões de anos.",
      "Kelps (algas marrons, Phaeophyta) formam florestas submersas com até 45 m de altura — os ecossistemas costeiros mais produtivos do planeta.",
      "Sem Chromista, o ciclo do carbono oceânico seria profundamente alterado: diatomáceas e cocolitos afundam carbono para o fundo do mar em escala planetária.",
    ],
    5: [
      "O maior organismo vivo da Terra pode ser um fungo: Armillaria ostoyae no Oregon ocupa 9,6 km² de área e tem mais de 8.000 anos.",
      "Fungos são mais próximos dos animais do que das plantas na árvore evolutiva — compartilhamos com eles cerca de 50% dos genes essenciais.",
      "O fungo Ophiocordyceps unilateralis infecta formigas, controla seu comportamento e força o inseto a subir até a altura ideal antes de morrer — perfeito para liberar esporos.",
      "Líquens não são um organismo: são uma simbiose entre um fungo e algas ou cianobactérias — e existem há pelo menos 400 milhões de anos.",
      "A rede micelial de um fungo pode transferir nutrientes e sinais de defesa entre árvores em uma floresta, numa estrutura chamada de 'wood wide web'.",
      "Penicillium chrysogenum foi descoberto acidentalmente por Alexander Fleming em 1928 e inaugurou a era dos antibióticos, salvando centenas de milhões de vidas.",
      "Leveduras (Saccharomyces cerevisiae) foram domesticadas pelo ser humano há pelo menos 9.000 anos e foram o primeiro eucarioto a ter seu genoma completamente sequenciado (1996).",
      "Alguns fungos são bioluminescentes — emitem luz verde constante no escuro, fenômeno descrito por Aristóteles e chamado de foxfire.",
    ],
    6: [
      "A Pando, no Utah, é uma única colônia de álamos trementes com 47.000 troncos e 6.000 toneladas — e tem estimados 80.000 anos, tornando-a um dos organismos mais velhos da Terra.",
      "As angiospermas (plantas com flores) surgiram há ~140 Ma e hoje representam 90% das espécies vegetais — sua diversificação acelerada intrigou Darwin, que a chamou de 'abominável mistério'.",
      "A Welwitschia mirabilis da Namíbia produz apenas duas folhas durante toda a vida, mas vive mais de 1.000 anos em um dos desertos mais áridos do planeta.",
      "A Rafflesia arnoldii não tem raízes, caules nem folhas visíveis — vive inteiramente como parasita dentro de outra planta e produz a maior flor do mundo, com até 1 metro de diâmetro.",
      "A Victoria amazonica produz flores que aquecem até 35°C e mudam de cor — uma adaptação que prende besouros polinizadores dentro da flor por até 24 horas.",
      "Sementes podem sobreviver séculos em dormência: uma semente de tâmareira com ~2.000 anos, encontrada em Massada (Israel), germinou com sucesso em 2005.",
      "Plantas se comunicam quimicamente: quando atacadas por herbívoros, emitem compostos voláteis que alertam plantas vizinhas, que aumentam sua produção de toxinas defensivas.",
      "O General Sherman (Sequoiadendron giganteum) tem 1.487 m³ de volume e mais de 2.700 anos — seus cones só liberam sementes com o calor de incêndios florestais.",
    ],
    7: [
      "Plasmodium falciparum, um protozoário transmitido por mosquitos Anopheles, é possivelmente o parasita que mais matou seres humanos em toda a história.",
      "Toxoplasma gondii infecta cerca de 30% da população humana e altera o comportamento de ratos infectados — elimina seu medo de gatos, facilitando o ciclo do parasita.",
      "A ameba Naegleria fowleri penetra pelo nariz em nados de água doce quente, chega ao cérebro e causa meningoencefalite quase sempre fatal em menos de duas semanas.",
      "Foraminíferos são protozoários com conchas calcárias que se acumulam no fundo do mar há 500 Ma — a Pirâmide de Gizé foi construída com calcário composto de suas conchas fósseis.",
      "Stentor, um ciliado unicelular, aprende a ignorar estímulos repetidos sem ter sistema nervoso — um dos exemplos mais simples de comportamento aprendido na natureza.",
      "Radiolários produzem esqueletos de sílica com simetria geométrica perfeita — tão elaborados que Ernst Haeckel os eternizou em gravuras científicas que viraram ícones da arte do século XIX.",
      "Paramecium tem dois núcleos com funções distintas (macronúcleo e micronúcleo) e pode 'rejeitar' parceiros geneticamente incompatíveis durante a conjugação sexual.",
      "Trypanosoma brucei, causador da doença do sono, troca sua proteína de superfície mais de 100 vezes para escapar do sistema imune — um dos mecanismos de evasão mais sofisticados da natureza.",
    ],
  },

  PHYLUM: [
    "Arthropoda é o filo mais diverso da Terra: insetos, aranhas, caranguejos e centopeias juntos representam mais de 80% de todas as espécies animais descritas.",
    "Nematoda pode ser o filo animal mais abundante do planeta — 60% de todos os indivíduos animais são nematódeos, e uma única maçã podre pode conter 90.000 deles.",
    "Chordata, o filo dos vertebrados, representa menos de 5% das espécies animais — os outros 95% são invertebrados de outros filos.",
    "O filo Cnidaria inclui um animal biologicamente imortal: Turritopsis dohrnii pode reverter para o estágio juvenil após atingir a maturidade, repetindo o ciclo indefinidamente.",
    "Echinodermata (ouriços, estrelas-do-mar) são os invertebrados mais próximos dos vertebrados — compartilhamos com eles genes de desenvolvimento fundamentais e simetria bilateral na larva.",
    "Alguns filos têm apenas uma ou poucas espécies: Cycliophora foi descoberto em 1995 em lagostas norueguesas; Placozoa é um animal sem órgãos, com apenas 6 tipos de células.",
    "Mollusca inclui desde lesmas microscópicas até a lula-gigante (Architeuthis dux), com olhos de até 30 cm — os maiores do reino animal.",
    "Filos inteiros foram descobertos no século XX: Loricifera (1983), Micrognathozoa (2000) — a diversidade animal do planeta ainda está longe de ser totalmente mapeada.",
  ],

  CLASS: [
    "Actinopterygii (peixes com nadadeiras raiadas) é a classe de vertebrados mais diversa: mais de 34.000 espécies — mais do que todos os outros vertebrados somados.",
    "Aves são dinossauros terópodes: descendem diretamente dos mesmos ancestrais de Velociraptor e T. rex, e são os únicos dinossauros sobreviventes da extinção K-Pg.",
    "Insecta tem ~1 milhão de espécies descritas — mais do que todas as outras classes animais combinadas — com estimativa de 5 a 10 milhões ainda desconhecidas.",
    "Mammalia deve seu sucesso a um evento de extinção: com o fim dos dinossauros há 66 Ma, mamíferos antes restritos a nichos noturnos diversificaram-se explosivamente.",
    "Chondrichthyes (tubarões e raias) manteve o mesmo plano corporal por ~450 milhões de anos — tubarões existem há mais tempo que as árvores.",
    "Amphibia tem a maior taxa de extinção atual entre vertebrados: ~41% das espécies estão ameaçadas, principalmente pelo fungo quitrídio Batrachochytrium dendrobatidis.",
    "Cephalopoda (polvos, lulas, náutilos) tem o maior cérebro entre invertebrados e inclui as únicas espécies invertebradas com uso confirmado de ferramentas e camuflagem ativa.",
    "Reptilia em sentido clássico é um grupo parafilético — aves são répteis e são mais próximas de crocodilos do que cobras são de lagartos.",
  ],

  ORDER: [
    "Coleoptera (besouros) é a ordem animal mais diversa: ~400.000 espécies descritas. Perguntado sobre a natureza de Deus, o biólogo Haldane teria respondido: 'uma predileção incomum por besouros'.",
    "Chiroptera (morcegos) é a segunda maior ordem de mamíferos com ~1.400 espécies e são os únicos mamíferos capazes de voo sustentado.",
    "Hymenoptera inclui formigas-cortadeiras que cultivam fungos em monocultura há 50 milhões de anos — precedendo a agricultura humana em 49,9 milhões de anos.",
    "Cetacea (baleias e golfinhos) descende de mamíferos terrestres com unhas; seu parente vivo mais próximo é o hipopótamo, e a transição completa para o mar ocorreu em ~10–15 Ma.",
    "Passeriformes (pássaros canoros) representa mais da metade de todas as espécies de aves (~6.500) e se diversificou tão rapidamente que sua filogenia é um dos grandes desafios da ornitologia.",
    "Primates evoluiu em nichos noturnos e arbóreos — a visão tridimensional colorida e as mãos preênseis são adaptações a saltar entre galhos, não características 'superiores' inatas.",
    "Lepidoptera (borboletas e mariposas) realiza uma das metamorfoses mais radicais da natureza: a lagarta se liquefaz quase completamente dentro do casulo antes de se reconstituir como adulto.",
    "Crocodilia sobreviveu ao evento K-Pg praticamente inalterada enquanto os dinossauros não-aviários desapareciam — e seu coração de quatro câmaras é o mais sofisticado entre répteis.",
  ],

  FAMILY: [
    "Hominidae inclui humanos, chimpanzés, gorilas e orangotangos — chimpanzés compartilham ~98,7% do DNA com Homo sapiens, mais do que com gorilas.",
    "Orchidaceae é a maior família de angiospermas em espécies (~28.000) e 70% são epífitas que dependem de fungos micorrízicos específicos para germinar — tornando-as extremamente vulneráveis.",
    "Formicidae (formigas) representa apenas uma família, mas sua biomassa total supera a de todos os mamíferos selvagens do planeta combinados.",
    "Canidae mostra a maior variação morfológica dentro de uma família de mamíferos: um chihuahua e um mastim tibetano são exatamente a mesma espécie — Canis lupus familiaris.",
    "Felidae tem 37 espécies, todas carnívoras obrigatórias e todas sem capacidade de sentir doçura — perderam os receptores de sabor doce há ~7 Ma por uma mutação no gene Tas1r2.",
    "Poaceae (gramíneas) alimenta o mundo: trigo, arroz, milho, cevada, aveia e cana-de-açúcar são gramíneas — responsáveis por mais de 50% das calorias consumidas pela humanidade.",
    "Viperidae (víboras) evoluiu presas ocas articuladas e veneno hemotrópico de alta eficiência, mas a maioria das ~70.000 mortes anuais por serpentes é causada por apenas 5 espécies.",
    "Fabaceae (leguminosas) é a família vegetal com maior importância para o ciclo do nitrogênio: feijão, soja, ervilha e amendoim fixam nitrogênio atmosférico por simbiose com bactérias do gênero Rhizobium.",
  ],

  GENUS: [
    "Homo já teve ao menos 6–8 espécies simultâneas — Homo sapiens conviveu com neandertais, denisovanos e possivelmente H. floresiensis até menos de 50.000 anos atrás.",
    "Streptomyces é um gênero bacteriano responsável pela produção de mais de dois terços de todos os antibióticos de origem natural em uso clínico no mundo.",
    "Panthera inclui os únicos felinos capazes de rugir — leão, tigre, leopardo e jaguar — graças a um osso hioide parcialmente cartilaginoso que vibra na expiração.",
    "Saccharomyces (leveduras) foi o primeiro eucarioto a ter seu genoma completamente sequenciado (1996) e permanece o organismo-modelo mais usado em biologia celular.",
    "Sequoia e Sequoiadendron têm apenas 2 espécies vivas atualmente, mas fósseis mostram que o gênero cobria todo o Hemisfério Norte há 60 Ma.",
    "Plasmodium tem ~200 espécies que infectam répteis, aves e mamíferos — mas apenas 5 infectam humanos; P. falciparum é responsável por ~90% das mortes por malária.",
    "Canis inclui lobos, coiotes, dingos e todos os cães domésticos — e a domesticação do lobo foi o primeiro ato de manejo animal da história humana, há pelo menos 15.000 anos.",
    "Eucalyptus tem ~700 espécies quase todas endêmicas da Austrália e é o segundo gênero arbóreo mais plantado no mundo — com impactos severos como invasora em outros continentes.",
  ],
};

export const game_info_fake = {
  activities: [],
  seen_species: [],
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
