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

type KingdomFacts = { [key: number]: string[] };

type Curiosidades = {
  KINGDOM: KingdomFacts;
  PHYLUM: KingdomFacts;
  CLASS: KingdomFacts;
  ORDER: KingdomFacts;
  FAMILY: KingdomFacts;
  GENUS: KingdomFacts;
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

  PHYLUM: {
    1: [
      "Arthropoda é o filo mais diverso da Terra: insetos, aranhas, caranguejos e centopeias juntos representam mais de 80% de todas as espécies animais descritas.",
      "Nematoda pode ser o filo animal mais abundante do planeta — 60% de todos os indivíduos animais são nematódeos, e uma única maçã podre pode conter 90.000 deles.",
      "Chordata, o filo dos vertebrados, representa menos de 5% das espécies animais — os outros 95% são invertebrados de outros filos.",
      "O filo Cnidaria inclui um animal biologicamente imortal: Turritopsis dohrnii pode reverter para o estágio juvenil após atingir a maturidade, repetindo o ciclo indefinidamente.",
      "Echinodermata (ouriços, estrelas-do-mar) são os invertebrados mais próximos dos vertebrados — compartilhamos com eles genes de desenvolvimento fundamentais e simetria bilateral na larva.",
      "Alguns filos têm apenas uma ou poucas espécies: Cycliophora foi descoberto em 1995 em lagostas norueguesas; Placozoa é um animal sem órgãos, com apenas 6 tipos de células.",
      "Mollusca inclui desde lesmas microscópicas até a lula-gigante (Architeuthis dux), com olhos de até 30 cm — os maiores do reino animal.",
      "Filos inteiros foram descobertos no século XX: Loricifera (1983), Micrognathozoa (2000) — a diversidade animal do planeta ainda está longe de ser totalmente mapeada.",
    ],
    2: [
      "Euryarchaeota reúne os extremófilos mais versáteis de Archaea: inclui metanogênicos produtores de biogás, halofílicos de salinas ultraconcentradas e termoacidofílicos de fontes sulfurosas.",
      "Thermoproteota (Crenarchaeota) domina fontes hidrotermais e solos vulcânicos — Sulfolobus cresce a 80°C em pH 2 e usa enxofre como fonte de energia.",
      "Nanoarchaeota tem apenas uma espécie conhecida, Nanoarchaeum equitans — com apenas 490.000 pares de bases de DNA, é o genoma celular funcional mais compacto já descrito.",
      "O grupo Asgard, identificado em sedimentos marinhos profundos entre 2015 e 2022, é o mais próximo dos eucariontes, com genes de actina e tubulina-like inexistentes em outras Archaea.",
      "Halobacterota inclui arqueanas que produzem bacteriorodopsina — uma proteína fotossensível que converte luz solar em energia sem clorofila, uma forma de fotossíntese alternativa.",
      "O supergrupo DPANN (Nanoarchaeota, Nanohaloarchaeota, Diapherotrites, entre outros) reúne arqueanas com genomas extremamente reduzidos — possíveis parasitas de outras Archaea.",
      "Methanobacteriota engloba todos os metanogênicos conhecidos, que produzem coletivamente ~590 milhões de toneladas de metano por ano, contribuindo para o ciclo global do carbono.",
      "A maioria dos filos de Archaea foi descrita apenas por sequenciamento metagenômico de sedimentos oceânicos profundos — nunca foram cultivados em laboratório até hoje.",
    ],
    3: [
      "Pseudomonadota (Proteobacteria) é o filo mais diverso de Bacteria: inclui E. coli, Salmonella, bactérias fotossintéticas púrpuras e Helicobacter pylori — metabolismos radicalmente diferentes.",
      "Cyanobacteria oxigenou a Terra há ~2,4 bilhões de anos no 'Grande Evento de Oxigenação' — e seus descendentes são os cloroplastos das plantas, responsáveis por toda fotossíntese vegetal.",
      "Firmicutes inclui os produtores de esporos mais resistentes do mundo: Bacillus anthracis produz esporos que sobrevivem décadas no solo, resistentes ao calor, luz UV e desinfetantes.",
      "Actinobacteria é o filo de onde vêm mais de 70% dos antibióticos naturais usados na medicina: estreptomicina, eritromicina, vancomicina e tetraciclina foram todos descobertos aqui.",
      "Bacteroidota domina o intestino humano em biomassa e é fundamental para degradar fibras vegetais complexas — sem elas, a nutrição humana seria drasticamente menos eficiente.",
      "Spirochaetota inclui bactérias com morfologia única: formato de espiral rígida e motilidade por filamentos axiais internos — inclui Treponema pallidum (sífilis) e Borrelia burgdorferi (Lyme).",
      "Planctomycetes desafiam a biologia celular bacteriana: têm compartimentos membranosos internos e algumas espécies realizam anammox, oxidando amônio com nitrito de forma anaeróbica.",
      "Candidatus Patescibacteria representa centenas de linhagens ainda sem cultivo laboratorial, descobertas apenas por metagenômica — evidência de que a maioria da diversidade microbiana é desconhecida.",
    ],
    4: [
      "Bacillariophyta (diatomáceas) é o grupo fotossintético individual mais produtivo do planeta: ~100.000 espécies produzem cerca de 20% do oxigênio atmosférico global por ano.",
      "Phaeophyta (algas marrons) inclui os maiores organismos fotossintéticos do oceano: Macrocystis pyrifera cresce até 45 m de comprimento, formando florestas submarinas únicas.",
      "Oomycota (oomicetos) já foram classificados como fungos, mas são Chromista: têm paredes de celulose e incluem Phytophthora, responsável por devastar plantações de batata, soja e abacate.",
      "Haptophyta (cocolitofórideos) reveste seus corpos com placas de calcário; ao morrerem, afundam e sequestram carbono no fundo do mar — processo chamado de 'bomba biológica de carbono'.",
      "Dinoflagellata causa as marés vermelhas tóxicas, mas também a bioluminescência azul que ilumina ondas do oceano — produzida pela reação da luciferina com a luciferase.",
      "Ochrophyta engloba algas douradas, ferrugem-marinha e algas amarelo-verdes, com cloroplastos que ainda carregam a membrana da alga eucariótica capturada por endossimbiose.",
      "Radiozoa (radiolários e acantários) produz esqueletos de sílica ou sulfato de estrôncio com geometria fractal precisa — e seus sedimentos registram a história climática da Terra por 500 Ma.",
      "Foraminifera tem registro fóssil de 540 milhões de anos e suas conchas calcárias são tão abundantes que a calcária usada nas Pirâmides do Egito é composta principalmente de suas carapaças.",
    ],
    5: [
      "Ascomycota é o maior filo de fungos com ~64.000 espécies descritas: inclui leveduras de cerveja, trufas, cogumelos morel, bolores e os fungos que formam a maioria dos líquens.",
      "Basidiomycota produz os cogumelos mais conhecidos, mas seu feito mais impressionante é a lignina: basidiomicetas são os únicos organismos capazes de degradar completamente a lignina, reciclando florestas.",
      "Glomeromycota forma micorrizas arbusculares com ~80% de todas as plantas terrestres — uma simbiose tão essencial que estima-se que as plantas colonizaram a terra graças a esses fungos há ~450 Ma.",
      "Chytridiomycota é o grupo de fungos mais primitivo e o único com zoósporos flagelados — e inclui Batrachochytrium dendrobatidis, o fungo responsável pelo declínio de anfíbios em todo o mundo.",
      "Mucoromycota inclui Rhizopus stolonifer (bolor preto do pão) e fungos usados na produção de ácido cítrico e de fermentações tradicionais asiáticas como o tempeh.",
      "Microsporidia são parasitas intracelulares obrigatórios com os menores genomas eucarióticos conhecidos (~2,3 Mb) — possivelmente fungos degenerados que perderam mitocôndrias funcionais.",
      "Blastocladiomycota e Neocallimastigomycota são fungos anaeróbicos que vivem no rúmen bovino, essenciais para digerir celulose — sem eles, vacas não conseguiriam extrair energia da grama.",
      "Cryptomycota (Rozellida) é o grupo mais basal de fungos, descoberto por metagenômica — vivem como parasitas de algas e podem ser a chave para entender a origem de todos os fungos.",
    ],
    6: [
      "Tracheophyta (plantas vasculares) representa 94% de todas as espécies vegetais conhecidas — o sistema de vasos (xilema e floema) foi a inovação que permitiu às plantas crescerem além de alguns centímetros.",
      "Bryophyta (musgos) são as plantas mais resistentes à dessecação: podem perder 98% de sua água e 'ressuscitar' completamente em horas ao serem reidratados.",
      "Charophyta (algas verdes de água doce) é o grupo de algas mais próximo das plantas terrestres, com o mesmo ancestral — foi o grupo que colonizou a terra firme há ~470 Ma.",
      "Marchantiophyta (hepáticas) são as plantas terrestres mais primitivas — sem cutícula verdadeira, absorvem água diretamente pela superfície e exigem ambientes permanentemente úmidos.",
      "Cycadophyta (cicas) existem há mais de 280 milhões de anos e são as plantas com semente mais antigas ainda vivas — foram o alimento principal dos dinossauros herbívoros do Jurássico.",
      "Pinophyta (coníferas) inclui as árvores mais velhas (Pinus longaeva, 5.000 anos), mais altas (Sequoia sempervirens, 115 m) e de maior volume (Sequoiadendron giganteum) do planeta.",
      "Anthocerotophyta (antóceros) tem apenas ~220 espécies mas carrega um dos cloroplastos mais primitivos entre plantas terrestres — com um único e grande cloroplasto por célula, semelhante às algas ancestrais.",
      "Magnoliophyta (angiospermas) surgiu há ~140 Ma e hoje domina quase todos os biomas terrestres, com ~300.000 espécies — sua coevolução com insetos polinizadores é uma das maiores histórias evolutivas.",
    ],
    7: [
      "Apicomplexa é um dos filos mais mortais para humanos: além de Plasmodium (malária), inclui Toxoplasma (toxoplasmose), Cryptosporidium (diarreia severa) e Theileria (febre dos carrapatos em gado).",
      "Ciliophora tem o maior número de cílios de qualquer grupo celular: Paramecium possui ~17.000 cílios coordenados que batem em ondas — resultado de um sistema de sinalização sem sistema nervoso.",
      "Euglenozoa inclui Trypanosoma, que causa doença do sono na África e doença de Chagas nas Américas — afetando mais de 6 milhões de pessoas e causando perdas bilionárias em gado bovino.",
      "Amoebozoa inclui Dictyostelium discoideum, um modelo genético que, quando privado de alimento, forma organismos pluricelulares a partir de células individuais — um modelo único de evolução multicelular.",
      "Cercozoa é um superfilo de protozoários com pseudópodes filiformes, flagelos e conchas — e inclui parasitas de algas, plantas e outros protistas, ainda amplamente inexplorado pela ciência.",
      "Foraminifera (dentro de Rhizaria) tem ~10.000 espécies vivas e 40.000 extintas — cada concha preservada no fundo do mar permite reconstruir paleotemperaturas oceânicas com precisão de décimos de grau.",
      "Dinoflagellata inclui zooxantelas, que estabelecem simbiose com corais fornecendo até 90% da energia dos recifes — o colapso dessa simbiose por aumento de temperatura causa o branqueamento dos corais.",
      "Mycetozoa (fungos mucilaginosos) não são fungos nem animais: formam massas ameboides multinucleadas que resolvem labirintos e otimizam redes de transporte com eficiência comparável à engenharia humana.",
    ],
  },

  CLASS: {
    1: [
      "Actinopterygii (peixes com nadadeiras raiadas) é a classe de vertebrados mais diversa: mais de 34.000 espécies — mais do que todos os outros vertebrados somados.",
      "Aves são dinossauros terópodes: descendem diretamente dos mesmos ancestrais de Velociraptor e T. rex, e são os únicos dinossauros sobreviventes da extinção K-Pg.",
      "Insecta tem ~1 milhão de espécies descritas — mais do que todas as outras classes animais combinadas — com estimativa de 5 a 10 milhões ainda desconhecidas.",
      "Mammalia deve seu sucesso a um evento de extinção: com o fim dos dinossauros há 66 Ma, mamíferos antes restritos a nichos noturnos diversificaram-se explosivamente.",
      "Chondrichthyes (tubarões e raias) manteve o mesmo plano corporal por ~450 milhões de anos — tubarões existem há mais tempo que as árvores.",
      "Amphibia tem a maior taxa de extinção atual entre vertebrados: ~41% das espécies estão ameaçadas, principalmente pelo fungo quitrídio Batrachochytrium dendrobatidis.",
      "Cephalopoda (polvos, lulas, náutilos) tem o maior cérebro entre invertebrados e inclui as únicas espécies invertebradas com uso confirmado de ferramentas e camuflagem ativa.",
      "Reptilia em sentido clássico é um grupo parafilético — aves são répteis e são mais próximas de crocodilos do que cobras são de lagartos.",
    ],
    2: [
      "Methanobacteria é a classe que inclui todos os metanogênicos que produzem metano usando CO₂ e H₂ — um metabolismo anaeróbico completamente ausente nos outros domínios da vida.",
      "Halobacteria (sem relação com bactérias) são arqueanas que precisam de pelo menos 15% de NaCl para sobreviver — em ambientes com menos sal, suas membranas se dissolvem espontaneamente.",
      "Thermoprotei inclui organismos que realizam respiração com enxofre elementar: reduzem S° para produzir H₂S em temperaturas de até 100°C, vivendo em fontes hidrotermais ácidas.",
      "Methanomicrobia engloba metanogênicos com morfologias extremamente variadas — bastonetes, cocos, espirais e filamentos — uma diversidade de formas incomum para Archaea.",
      "Archaeoglobi é uma classe de arqueanas redutoras de sulfato que vivem em fontes hidrotermais e produzem H₂S como metabólito, contribuindo para o cheiro de enxofre dessas regiões.",
      "Methanopyri inclui apenas Methanopyrus kandleri, que cresce a 122°C — o organismo vivo com maior temperatura de crescimento registrada, confirmada em laboratório sob alta pressão.",
      "Nanohaloarchaea são arqueanas com genomas reduzidos (~1,2 Mb) que vivem em lagos ultrasal e parecem depender de outras arqueanas halofílicas para sobreviver metabolicamente.",
      "Thaumarchaeota realiza nitrificação em oceanos profundos: oxida amônio a nitrito onde a luz não chega, regulando o ciclo do nitrogênio em toda a coluna d'água.",
    ],
    3: [
      "Gammaproteobacteria é a classe mais clinicamente relevante de Bacteria: inclui E. coli, Salmonella, Klebsiella, Pseudomonas aeruginosa e Vibrio cholerae — responsáveis por milhões de mortes anuais.",
      "Bacilli inclui Lactobacillus e Streptococcus — fundamentais na produção de queijo, iogurte, chucrute e kefir, além de bactérias probióticas essenciais ao intestino humano.",
      "Alphaproteobacteria inclui as mitocôndrias das células eucarióticas: o ancestral das mitocôndrias foi uma alphaproteobacteria engolida por endossimbiose há ~1,5–2 bilhões de anos.",
      "Clostridia inclui C. botulinum, produtor da toxina botulínica — a proteína mais tóxica conhecida, com dose letal de ~1 nanograma por kg de massa corporal, mas usada terapeuticamente em neurologia.",
      "Actinomycetia inclui Streptomyces, gênero responsável pelo cheiro de terra úmida (geosmina) e produtor de mais de 60% dos antibióticos clinicamente utilizados no mundo.",
      "Deltaproteobacteria inclui Bdellovibrio, que predatória ativamente outras bactérias gram-negativas — perfurando a parede celular do hospedeiro e consumindo-o por dentro.",
      "Cyanobacteriia é a única classe bacteriana com fotossíntese oxigênica — e seus cloroplastos foram incorporados pelas células vegetais, tornando toda fotossíntese vegetal de origem bacteriana.",
      "Spirochaetia locomove-se por rotação de filamentos internos (endoflagelos), permitindo movimento em meios viscosos — uma vantagem decisiva no muco e tecidos do hospedeiro.",
    ],
    4: [
      "Bacillariophyceae (diatomáceas) têm frústulas de sílica com padrões ultraestruturais na nanescala tão precisos que são usados como padrões de calibração em microscopia eletrônica.",
      "Phaeophyceae (algas marrons) inclui o organismo que mais rápido cresce no planeta: Macrocystis pyrifera pode crescer até 30 cm por dia em ambientes com nutrientes adequados.",
      "Oomycetes não são fungos: têm paredes de celulose, núcleos diploides em toda a fase vegetativa e zoósporos biflagelados — características que os aproximam das algas heterocontas.",
      "Chrysophyceae (algas douradas) pode alternar entre fotossíntese e fagotrofia: são autótrofas quando há luz e passam a fagocitar bactérias quando o ambiente escurece.",
      "Dinophyceae tem cromossomos permanentemente condensados sem histonas e um genoma 10–200 vezes maior que o humano — a organização genômica mais incomum entre todos os eucariontes.",
      "Raphidophyceae inclui espécies que formam marés vermelhas devastadoras para a aquicultura: Chattonella marina libera toxinas e radicais superóxidos que destroem as brânquias dos peixes.",
      "Coccolithophyceae produz cocolitos de calcita com geometria cristalina perfeita — seu calcário acumulado durante 80 Ma forma as famosas Falésias Brancas de Dover, com até 107 m de altura.",
      "Xanthophyceae (algas amarelo-verdes) inclui Vaucheria, que forma filamentos cenocíticos sem divisões entre células — modelo de estudo para transporte de organelas em células gigantes.",
    ],
    5: [
      "Agaricomycetes é a maior classe de Basidiomycota com ~20.000 espécies: inclui todos os cogumelos comestíveis e venenosos, orelhas-de-pau e os formadores de micorrizas ectotrófica.",
      "Saccharomycetes (leveduras) tem apenas ~6.000 genes — menos de 1/3 dos humanos — mas realiza metabolismo eucarioto completo, tornando Saccharomyces cerevisiae o organismo-modelo por excelência.",
      "Sordariomycetes inclui Neurospora crassa, o fungo que permitiu a Beadle e Tatum descobrir que genes controlam enzimas (Nobel 1958), fundando a biologia molecular moderna.",
      "Eurotiomycetes inclui Aspergillus niger, usado para produzir ácido cítrico industrialmente — mais de 2 milhões de toneladas por ano, para refrigerantes, conservas e produtos farmacêuticos.",
      "Ustilaginomycetes inclui os fungos carvão que parasitam cereais: Ustilago maydis no milho produz huitlacoche, uma iguaria culinária apreciada no México, apesar de ser um patógeno.",
      "Pucciniomycetes inclui as ferrugens de cereais (Puccinia spp.), responsáveis por devastar colheitas de trigo globalmente — um único surto pode destruir até 70% da produção de uma região.",
      "Tremellomycetes inclui fungos gelatinosos como Tremella mesenterica e espécies que parasitam outros fungos — e é o grupo ancestral das leveduras patogênicas como Cryptococcus neoformans.",
      "Orbiliomycetes inclui fungos carnívoros que formam anéis, nós e redes adesivas para capturar e digerir nematódeos — o único grupo de fungos com estratégias de caça ativa.",
    ],
    6: [
      "Liliopsida (monocotiledôneas) inclui gramíneas, orquídeas, palmeiras e lírios — distingue-se por ter uma semente com um único cotilédone e feixes vasculares dispersos pelo caule.",
      "Magnoliopsida (dicotiledôneas) é a maior classe de angiospermas com ~200.000 espécies: inclui a maioria das árvores, arbustos, leguminosas e a maioria das flores vistosas.",
      "Polypodiopsida (samambaias) tem ciclo de vida único: a planta 'adulta' visível é o esporófito diploide, mas gera gametófitos minúsculos que vivem independentes no solo úmido.",
      "Pinopsida (coníferas) inclui ~600 espécies distribuídas no Hemisfério Norte e é o grupo vegetal mais resistente ao frio — Pinus sylvestris sobrevive a temperaturas de -50°C.",
      "Lycopodiopsida (licopódios) existe desde o Devoniano (~400 Ma) e inclui os ancestrais das árvores que formaram os depósitos de carvão — a primeira floresta da Terra era de licopódios de 40 m.",
      "Equisetopsida (cavalinha) é um relíquio evolutivo: o gênero Equisetum é o único sobrevivente de uma classe que dominava as florestas carboníferas com árvores de 30 m de altura.",
      "Bryopsida (musgos verdadeiros) tem ~12.000 espécies e domina a tundra ártica, onde forma tapetes que isolam termicamente o permafrost e regulam o ciclo hídrico regional.",
      "Ginkgoopsida tem apenas uma espécie viva: Ginkgo biloba, fóssil vivente praticamente inalterado por 200 Ma e a única planta conhecida com espermatozoides flagelados que nadam até o óvulo.",
    ],
    7: [
      "Conoidasida (Apicomplexa) inclui Plasmodium, Toxoplasma e Cryptosporidium — todos com um complexo apical de microtúbulos especializado em perfurar e invadir células hospedeiras com precisão cirúrgica.",
      "Oligohymenophorea inclui Paramecium, com dois tipos de núcleo: o macronúcleo controla o metabolismo diário e o micronúcleo serve exclusivamente para a reprodução sexual.",
      "Kinetoplastea tem DNA mitocondrial organizado em rede de milhares de anéis interligados (kinetoplasto) — uma estrutura sem equivalente em qualquer outro grupo eucarioto.",
      "Lobosa inclui amebas com pseudópodes largos usados para engolfar bactérias — Amoeba proteus pode ingerir partículas 10× seu tamanho e é o modelo clássico de estudo da fagocitose.",
      "Spirotrichea inclui Stentor, o maior protozoário unicelular conhecido — pode atingir 2 mm de comprimento, ser visível a olho nu, e se regenera completamente a partir de 1/100 de seu citoplasma.",
      "Gregarinasina são parasitas intestinais de invertebrados com formas extracelulares — ao contrário da maioria dos Apicomplexa, vivem fora das células hospedeiras e formam trens de gametocistos.",
      "Litostomatea inclui Balantidium coli, o único ciliado protozoário capaz de parasitar humanos, causando disenteria — transmitido por fezes de porcos e endêmico em regiões tropicais sem saneamento.",
      "Discosea inclui Acanthamoeba, que vive em solos e água doce e pode invadir o olho humano (especialmente em usuários de lente de contato), causando ceratite amebiana e risco de cegueira.",
    ],
  },

  ORDER: {
    1: [
      "Coleoptera (besouros) é a ordem animal mais diversa: ~400.000 espécies descritas. Perguntado sobre a natureza de Deus, o biólogo Haldane teria respondido: 'uma predileção incomum por besouros'.",
      "Chiroptera (morcegos) é a segunda maior ordem de mamíferos com ~1.400 espécies e são os únicos mamíferos capazes de voo sustentado.",
      "Hymenoptera inclui formigas-cortadeiras que cultivam fungos em monocultura há 50 milhões de anos — precedendo a agricultura humana em 49,9 milhões de anos.",
      "Cetacea (baleias e golfinhos) descende de mamíferos terrestres com unhas; seu parente vivo mais próximo é o hipopótamo, e a transição completa para o mar ocorreu em ~10–15 Ma.",
      "Passeriformes (pássaros canoros) representa mais da metade de todas as espécies de aves (~6.500) e se diversificou tão rapidamente que sua filogenia é um dos grandes desafios da ornitologia.",
      "Primates evoluiu em nichos noturnos e arbóreos — a visão tridimensional colorida e as mãos preênseis são adaptações a saltar entre galhos, não características 'superiores' inatas.",
      "Lepidoptera (borboletas e mariposas) realiza uma das metamorfoses mais radicais: a lagarta se liquefaz quase completamente dentro do casulo antes de se reconstituir como adulto.",
      "Crocodilia sobreviveu ao evento K-Pg praticamente inalterada enquanto os dinossauros desapareciam — e seu coração de quatro câmaras é o mais sofisticado entre répteis.",
    ],
    2: [
      "Methanobacteriales inclui organismos responsáveis por ~25% das emissões de metano do gado bovino globalmente — Methanobrevibacter ruminantium é o metanogênico dominante no rúmen.",
      "Sulfolobales cresce em fontes ácidas sulfurosas a 80°C e pH 1–3, oxidando enxofre elementar — sua descoberta expandiu os limites do que se considerava habitável para qualquer forma de vida.",
      "Halobacteriales inclui Halobacterium salinarum, que produz bacteriorodopsina — a proteína fotossensível mais estudada do mundo e inspiração para a optogenética e conversão de energia solar.",
      "Methanosarcinales é o único grupo de metanogênicos capaz de usar acetato, metanol e metilaminas além de CO₂ + H₂ — tornando-os os metanogênicos metabolicamente mais versáteis.",
      "Thermoproteales cresce em ambientes geotermais a temperaturas acima de 70°C e inclui organismos que fixam CO₂ via ciclo de Krebs reverso — uma bioquímica sem equivalente em outros domínios.",
      "Archaeoglobales são redutores de sulfato extremófilos que vivem em fontes hidrotermais a até 95°C — encontrados em reservatórios de petróleo, onde causam corrosão de equipamentos metálicos.",
      "Methanopyrales contém apenas Methanopyrus kandleri, isolado de uma chaminé hidrotermal a 122°C e 20 MPa de pressão — o metanogênico mais termófilo e barofílico já descoberto.",
      "Thermococcales inclui organismos hipertermófilos que fermentam peptídeos e carboidratos na escuridão das fontes hidrotermais profundas, usando enxofre como aceptor final de elétrons.",
    ],
    3: [
      "Enterobacterales reúne as bactérias intestinais mais estudadas: E. coli, Salmonella, Shigella, Klebsiella e Yersinia pestis (causadora da Peste Negra) pertencem todas a esta ordem.",
      "Lactobacillales inclui as bactérias que produzem ácido láctico a partir de açúcares — responsáveis pela fermentação de iogurte, queijo, kimchi, sourdough e kefir há milênios.",
      "Pseudomonadales inclui Pseudomonas aeruginosa, que forma biofilmes em pacientes imunossuprimidos e é naturalmente resistente a mais de 30 antibióticos — um dos maiores desafios clínicos modernos.",
      "Rhizobiales inclui Rhizobium, Bradyrhizobium e Mesorhizobium — bactérias que fixam N₂ atmosférico em nódulos de leguminosas, fornecendo 40–60 milhões de toneladas de nitrogênio biologicamente útil por ano.",
      "Mycobacteriales inclui Mycobacterium tuberculosis, que infectou um terço da humanidade e ainda causa ~1,5 milhão de mortes anuais — e M. leprae, que perdeu 2.000 genes por evolução regressiva.",
      "Clostridiales inclui Clostridioides difficile, que se torna patogênico quando antibióticos destroem a microbiota intestinal — causando colite pseudomembranosa em hospitais de todo o mundo.",
      "Cyanobacteriales inclui Anabaena, que possui dois tipos de célula: vegetativas (fotossíntese) e heterocistos (fixação de N₂) — um exemplo primitivo de diferenciação celular em procariontes.",
      "Actinomycetales inclui Streptomyces coelicolor, com o maior genoma bacteriano já sequenciado (~8,7 Mb) — cheio de clusters gênicos para produção de antibióticos e outros metabólitos secundários.",
    ],
    4: [
      "Naviculales é a ordem de diatomáceas com simetria bilateral mais diversa — Navicula é encontrada em praticamente todo ambiente aquático e úmido da Terra, de geleiras a desertos.",
      "Laminariales (kelps) inclui as maiores algas do mundo: florestas de Macrocystis pyrifera cobrem dezenas de km² e suas biomassas são fontes de alginato para centenas de produtos industriais.",
      "Peronosporales inclui Plasmopara viticola, responsável pela epidemia de míldio nos vinhedos europeus no século XIX, que quase destruiu a viticultura francesa e italiana.",
      "Fucales inclui Sargassum natans, que forma o Mar de Sargasso — a única região oceânica do planeta sem terra firme nos arredores, onde algas flutuantes criam um ecossistema singular.",
      "Saprolegniales inclui Saprolegnia parasitica, um oomiceto que parasita peixes de aquicultura — responsável por perdas de centenas de milhões de dólares anuais na criação de salmão.",
      "Peridiniales inclui dinoflagelados produtores de saxitoxina, neurotoxina que causa Paralytic Shellfish Poisoning (PSP) — acumulada em mexilhões e ostras, pode ser fatal para humanos.",
      "Coccolithales inclui Emiliania huxleyi, cujo florescimento em escala oceânica é detectável por satélite — e cuja morte em massa libera dimetilssulfeto (DMS), influenciando a formação de nuvens e o clima.",
      "Chrysomonadales inclui algas douradas que são indicadores ecológicos precisos: sua composição de espécies revela pH, temperatura e poluição de lagos com alta resolução.",
    ],
    5: [
      "Agaricales é a ordem com mais cogumelos comestíveis e venenosos do mundo: inclui Amanita phalloides (chapéu-da-morte), responsável por ~90% das mortes por intoxicação com cogumelos.",
      "Boletales inclui boletos comestíveis como Boletus edulis (porcini) e o fungo Pisolithus tinctorius — essencial em reflorestamentos por formar micorrizas com mais de 40 espécies de árvores.",
      "Pucciniales (ferrugens) tem o ciclo de vida mais complexo já descrito em fungos: Puccinia graminis requer dois hospedeiros não relacionados (trigo e berberis) e tem até 5 tipos de esporos.",
      "Eurotiales inclui Aspergillus flavus e A. parasiticus, produtores de aflatoxinas — as micotoxinas carcinogênicas mais potentes conhecidas, que contaminam amendoim e cereais em regiões tropicais.",
      "Hypocreales inclui Trichoderma (controle biológico de fungos), Beauveria bassiana (parasita de insetos) e Cordyceps (controla formigas) — uma ordem com impacto enorme em biotecnologia agrícola.",
      "Polyporales inclui Trametes versicolor (rabo-de-peru) e Ganoderma lucidum (reishi) — fungos decompositores de madeira amplamente pesquisados por compostos imunomoduladores e antitumorais.",
      "Pezizales inclui trufas (Tuber melanosporum, T. magnatum) — os cogumelos mais caros do mundo, com preços de até €5.000/kg — e os morel (Morchella), muito apreciados na culinária mundial.",
      "Cantharellales inclui chanterelles (Cantharellus cibarius) e, curiosamente, Ceratobasidium — fungo que coloniza orquídeas, fornecendo carbono e minerais às minúsculas sementes em germinação.",
    ],
    6: [
      "Poales inclui trigo, arroz, milho, cana-de-açúcar e bambu — as gramíneas desta ordem fornecem mais de 50% de toda a energia calórica consumida pela humanidade diariamente.",
      "Lamiales inclui mais de 23.000 espécies em 24 famílias: azaleias, lavanda, hortelã, tomilho, jasmim, oliveira e gergelim — todas com flores de simetria bilateral (zigomorfa).",
      "Asterales é a maior ordem de plantas com flores: apenas Asteraceae tem ~25.000 espécies — girassol, margarida, crisântemo e dente-de-leão têm em comum a inflorescência em capítulo.",
      "Fabales (leguminosas) contribui com a maior fixação biológica de nitrogênio entre ordens de plantas: soja, feijão, lentilha e ervilha em simbiose com Rhizobium dispensam adubos nitrogenados.",
      "Rosales inclui Rosaceae (maçã, cereja, morango), Moraceae (figo, jaca) e Cannabaceae (cânhamo) — tornando-a uma das ordens botanicamente mais diversas e economicamente importantes.",
      "Caryophyllales inclui plantas com adaptações extremas: cactos (CAM em desertos), carnívoras (Dionaea, Drosera) e halofitas (Suaeda) — todas ligadas filogeneticamente pela presença de betalinas.",
      "Pinales inclui todas as coníferas com sementes em cones — Pinus, Abies, Picea, Larix — e suas resinas formaram o âmbar que preservou organismos com mais de 90 milhões de anos.",
      "Ericales inclui blueberries, chá, kiwi, caqui, azaleia e begônia — e também Sarracenia e outras plantas carnívoras — uma ordem surpreendentemente diversa em morfologia e estratégia de vida.",
    ],
    7: [
      "Eucoccidiorida inclui Plasmodium e Toxoplasma: os parasitas Apicomplexa mais estudados do mundo, com ciclos de vida que alternam entre hospedeiro vertebrado e invertebrado ou intermediário.",
      "Hymenostomatida inclui Paramecium, que realiza conjugação — troca de material genético entre dois indivíduos via ponte citoplasmática — um processo de recombinação genética sem reprodução.",
      "Trypanosomatida inclui os agentes da doença de Chagas (T. cruzi), doença do sono (T. brucei) e leishmaniose (Leishmania spp.) — três das principais doenças tropicais negligenciadas do mundo.",
      "Amoebida inclui Amoeba proteus, o modelo clássico de locomoção por pseudópodes — cujo estudo revelou os mecanismos de polimerização de actina usados por macrófagos do sistema imune.",
      "Stichotrichida inclui hipotriquia com cílios modificados em cirtros, que os usam como 'pernas' para caminhar sobre superfícies — um comportamento locomotor único entre protozoários ciliados.",
      "Arcellinida inclui tecamebas de água doce com conchas de areia ou sílica secretada — Arcella vulgaris constrói uma carapaça circular geometricamente perfeita, descrita por D'Arcy Thompson.",
      "Gregarinida parasita invertebrados marinhos e terrestres e exibe 'gliding motility' — deslizamento sem cílios, flagelos ou pseudópodes visíveis, por um mecanismo molecular ainda controverso.",
      "Radiolaria inclui protozoários pelágicos que ao morrerem formam ooze radiolário — sedimentos de até 500 m de espessura no fundo do Pacífico que registram o ciclo climático da Terra.",
    ],
  },

  FAMILY: {
    1: [
      "Hominidae inclui humanos, chimpanzés, gorilas e orangotangos — chimpanzés compartilham ~98,7% do DNA com Homo sapiens, mais do que com gorilas.",
      "Formicidae (formigas) representa apenas uma família, mas sua biomassa total supera a de todos os mamíferos selvagens do planeta combinados.",
      "Canidae mostra a maior variação morfológica dentro de uma família de mamíferos: um chihuahua e um mastim tibetano são exatamente a mesma espécie — Canis lupus familiaris.",
      "Felidae tem 37 espécies, todas carnívoras obrigatórias e todas sem capacidade de sentir doçura — perderam os receptores de sabor doce há ~7 Ma por uma mutação no gene Tas1r2.",
      "Viperidae (víboras) evoluiu presas ocas articuladas e veneno hemotrópico de alta eficiência, mas a maioria das ~70.000 mortes anuais por serpentes é causada por apenas 5 espécies.",
      "Delphinidae inclui golfinhos, orcas e botos — e as orcas desenvolveram culturas regionais distintas com dialetos vocais transmitidos por aprendizado entre gerações.",
      "Bovidae tem ~140 espécies de ungulados (bovinos, ovinos, caprinos, antílopes) e é a família que mais influenciou o desenvolvimento das civilizações humanas.",
      "Culicidae (mosquitos) transmite mais doenças que qualquer outra família de animais: malária, dengue, febre amarela, Zika, chikungunya — os animais mais letais para humanos.",
    ],
    2: [
      "Methanobacteriaceae inclui Methanobacterium thermoautotrophicum, a primeira archaea metanogênica a ter seu genoma completamente sequenciado (1997) — abrindo a era da genômica de Archaea.",
      "Halobacteriaceae inclui as arqueanas mais estudadas de ambientes hipersalinos: Halobacterium salinarum, Haloarcula marismortui (isolada do Mar Morto) e Haloferax volcanii, modelo genético de Archaea.",
      "Sulfolobaceae inclui Sulfolobus solfataricus, que cresce a 80°C em pH 2 e tem um sistema de divisão celular baseado em proteínas ESCRT-III homólogas às eucarióticas — revelando origens evolutivas comuns.",
      "Methanosarcinaceae inclui o maior metanogênico em células individuais: Methanosarcina mazei pode formar agregados multicelulares e possui o maior genoma entre os metanogênicos (~4,1 Mb).",
      "Thermoproteaceae inclui Thermoproteus tenax, que reduz enxofre elementar com H₂ como doador de elétrons a 88°C — um metabolismo completamente inorgânico e anaeróbico.",
      "Archaeoglobaceae inclui Archaeoglobus fulgidus, primeiro hipertermófilo a ter seu genoma completamente sequenciado (1997), revelando genes de resistência a danos no DNA particularmente robustos.",
      "Methanopyraceae tem apenas Methanopyrus kandleri — e sua posição filogenética basal sugere que os primeiros metanogênicos da Terra podem ter vivido em condições igualmente extremas.",
      "Thermococcaceae inclui Pyrococcus furiosus ('bola de fogo furiosa'), amplamente usado em biotecnologia — sua DNA polimerase é empregada em variantes de PCR de alta temperatura.",
    ],
    3: [
      "Enterobacteriaceae inclui E. coli K-12, a bactéria mais estudada da história — com mais de 500.000 publicações científicas — e o segundo organismo a ter seu genoma completamente sequenciado (1997).",
      "Streptococcaceae inclui S. pneumoniae, que protagonizou a revelação de 1944: Avery, MacLeod e McCarty provaram que o DNA (não a proteína) é o material genético, usando o experimento da transformação.",
      "Mycobacteriaceae inclui M. leprae, com o genoma bacteriano mais reduzido por evolução regressiva: perdeu 2.000 genes (40% do genoma original) ao adaptar-se como parasita intracelular obrigatório.",
      "Clostridiaceae inclui C. botulinum, produtor da toxina botulínica tipo A — usada em medicina estética (Botox) e no tratamento de espasticidade muscular, enxaqueca crônica e hiperhidrose.",
      "Rhizobiaceae inclui Agrobacterium tumefaciens, que injeta DNA em plantas para causar tumores — e foi domesticado como ferramenta de transformação genética de plantas, base de toda a transgenia vegetal.",
      "Pseudomonadaceae inclui P. putida, com versatilidade metabólica excepcional: degrada tolueno, benzeno, naftaleno e xileno — candidata à biorremediação de solos contaminados com petróleo.",
      "Lactobacillaceae inclui L. acidophilus, presente em iogurtes e suplementos probióticos — cujos benefícios à microbiota intestinal têm sido confirmados em centenas de ensaios clínicos controlados.",
      "Spirochaetaceae inclui Treponema pallidum, causador da sífilis — que não pode ser cultivado em laboratório fora de células hospedeiras vivas, tornando seu estudo especialmente desafiador.",
    ],
    4: [
      "Laminariaceae inclui Laminaria e Saccharina, as kelps mais cultivadas do mundo — o Japão produz mais de 500.000 toneladas anuais de Saccharina japonica para alimentação e extração de alginato.",
      "Phytophthoraceae inclui Phytophthora ramorum, causador do 'sudden oak death' — epidemia florestal que matou milhões de carvalhos na Califórnia e Oregon desde os anos 1990.",
      "Sargassaceae inclui Sargassum muticum, alga invasora que colonizou costas europeias chegando acidentalmente com ostras cultivadas — modificando ecossistemas costeiros no Atlântico europeu.",
      "Naviculaceae inclui Navicula, com mais de 1.800 espécies validadas — tão morfologicamente diversas que sua identificação precisa requer microscopia eletrônica e, cada vez mais, análise de DNA.",
      "Coscinodiscaceae inclui Coscinodiscus, diatomáceas com frústulas ornamentadas usadas como padrões de calibração em microscopia óptica e eletrônica desde o século XIX.",
      "Noctilucaceae inclui Noctiluca scintillans, que causa a bioluminescência azul de ondas do oceano — e quando prolifera em excesso, cria marés que matam peixes em massa por produção de amônio.",
      "Pythiaceae inclui Pythium, causador de 'damping-off' — doença de mudas que pode eliminar 100% das plântulas em viveiros, representando perdas de bilhões de dólares anuais na agricultura.",
      "Bacillariaceae inclui Pseudo-nitzschia, que produz ácido domoico — toxina que causa Amnesic Shellfish Poisoning, capaz de provocar amnésia permanente e morte em mamíferos marinhos.",
    ],
    5: [
      "Amanitaceae inclui os cogumelos mais mortais do mundo: Amanita phalloides (chapéu-da-morte) contém alfa-amanitina, que inibe a RNA polimerase II e destrói o fígado irreversivelmente, sem antídoto.",
      "Tricholomataceae (s.l.) inclui Flammulina velutipes (enoki), o segundo cogumelo mais cultivado do mundo — com produção anual superior a 2 milhões de toneladas, principalmente na Ásia Oriental.",
      "Boletaceae inclui Boletus edulis (porcini/cep), o cogumelo silvestre mais comercializado do mundo — com mercado global de centenas de milhões de euros anuais e impossível de cultivar artificialmente.",
      "Morchellaceae inclui Morchella (morel) — cogumelos primaveris de alto valor gastronômico que florescem especialmente em solos perturbados por incêndios florestais recentes.",
      "Ganodermataceae inclui Ganoderma lucidum (reishi/lingzhi), um dos fungos medicinais mais pesquisados: contém triterpenoides e beta-glucanos com atividade imunomoduladora confirmada em estudos clínicos.",
      "Pleurotaceae inclui Pleurotus ostreatus (shimeji/ostra), o terceiro cogumelo mais cultivado globalmente — capaz de degradar madeira, plástico, cigarros e resíduos de café como substrato de cultivo.",
      "Clavicipitaceae inclui Claviceps purpurea, o ergot do centeio — responsável por epidemias de ergotismo medieval (Fogo de Santo Antônio), causando alucinações e gangrena coletivas; precursor do LSD.",
      "Tuberaceae inclui Tuber magnatum (trufa branca de Alba) — o fungo mais caro do mundo, com preços de até €10.000/kg, colhido apenas no outono no norte da Itália e impossível de cultivar.",
    ],
    6: [
      "Poaceae (gramíneas) é a família mais importante para a civilização humana: trigo, arroz, milho, cana-de-açúcar, sorgo, aveia e cevada são gramíneas — base calórica de 8 bilhões de pessoas.",
      "Orchidaceae é a maior família de angiospermas com ~28.000 espécies, e 70% são epífitas com sementes tão pequenas (0,3 mm) que dependem de fungos micorrízicos para germinar.",
      "Fabaceae (leguminosas) em simbiose com Rhizobium fixa ~100 kg de N₂/hectare/ano — reduzindo a necessidade de fertilizantes nitrogenados sintéticos em plantações de soja e feijão.",
      "Asteraceae é a segunda maior família com ~25.000 espécies: girassol, margarida, crisântemo, camomila e dente-de-leão têm todos a mesma 'flor' composta de centenas de flores minúsculas em capítulo.",
      "Rosaceae inclui mais de 100 espécies frutíferas cultivadas comercialmente: maçã, pêra, cereja, pêssego, ameixa, morango, damasco e framboesa — com valor agrícola global de dezenas de bilhões anuais.",
      "Solanaceae inclui tomate, batata, pimentão, berinjela, tabaco e pimenta — e também a belladona (Atropa belladonna), fonte do alcaloide atropina, essencial em anestesiologia e oftalmologia.",
      "Lamiaceae inclui as plantas aromáticas mais usadas na culinária e medicina: hortelã, tomilho, alecrim, sálvia, lavanda, manjericão e orégano — todas com óleos essenciais de terpenos bioativos.",
      "Apiaceae inclui cenoura, aipo, salsa, coentro e endro — e também a cicuta (Conium maculatum), a planta que matou Sócrates, cujo alcaloide (coniína) paralisa progressivamente o sistema nervoso.",
    ],
    7: [
      "Plasmodiidae inclui todos os parasitas da malária: os 5 que infectam humanos (P. falciparum, P. vivax, P. malariae, P. ovale, P. knowlesi) causam mais de 600.000 mortes anuais.",
      "Trypanosomatidae inclui os três parasitas das doenças tropicais negligenciadas mais prevalentes: T. brucei, T. cruzi e Leishmania — afetando mais de 20 milhões de pessoas globalmente.",
      "Paramecidae inclui Paramecium caudatum e P. aurelia — usados nos experimentos clássicos de competição que estabeleceram o 'princípio de exclusão competitiva' de Gause (1934).",
      "Amoebidae inclui Amoeba proteus, cujo movimento por pseudópodes revelou os mecanismos de polimerização de actina que compõem a base molecular da motilidade celular eucariótica.",
      "Vorticellidae inclui Vorticella, um ciliado séssil com pedúnculo que se contrai em milissegundos — uma das contrações celulares mais rápidas da natureza, baseada em espasmonemas de cálcio.",
      "Acanthamoebidae inclui Acanthamoeba castellanii, capaz de causar encefalite em imunossuprimidos e ceratite em usuários de lente de contato — e é portadora natural do Mimivirus.",
      "Radiolaridae inclui protozoários cujos esqueletos silicosos com simetria perfeita inspiraram Ernst Haeckel na obra 'Art Forms of Nature' (1904), que influenciou o movimento Art Nouveau.",
      "Arcellidae inclui Arcella vulgaris, tecameba cuja carapaça circular geometricamente perfeita serviu de modelo para estudos de morfogênese e auto-organização celular por D'Arcy Thompson.",
    ],
  },

  GENUS: {
    1: [
      "Homo já teve ao menos 6–8 espécies simultâneas — Homo sapiens conviveu com neandertais, denisovanos e possivelmente H. floresiensis até menos de 50.000 anos atrás.",
      "Panthera inclui os únicos felinos capazes de rugir — leão, tigre, leopardo e jaguar — graças a um osso hioide parcialmente cartilaginoso que vibra na expiração.",
      "Canis inclui lobos, coiotes, dingos e todos os cães domésticos — e a domesticação do lobo foi o primeiro ato de manejo animal da história humana, há pelo menos 15.000 anos.",
      "Crocodylus inclui répteis praticamente inalterados em 200 Ma — possuem o coração mais sofisticado entre répteis (4 câmaras) e guardam ninhos, carregando filhotes delicadamente na boca.",
      "Apis (abelhas melíferas) é fundamental para a polinização de 75% das espécies vegetais usadas na alimentação humana — e seu declínio nos últimos anos gera alertas sobre segurança alimentar global.",
      "Turritopsis dohrnii é o único animal conhecido capaz de reverter biologicamente para o estágio juvenil após atingir a maturidade sexual — tornando-o potencialmente imortal em condições ideais.",
      "Octopus tem três corações, sangue azul, neurônios distribuídos nos tentáculos (2/3 do total) e é capaz de abrir potes, resolver labirintos e usar conchas como ferramentas de proteção.",
      "Periplaneta americana existe há mais de 300 Ma praticamente inalterada — sobrevive sem cabeça por semanas, suporta 900× a dose letal de radiação para humanos e resiste à maioria dos inseticidas.",
    ],
    2: [
      "Methanobacterium foi o primeiro gênero metanogênico isolado em cultura pura (1936), e seu RNA ribossomal foi usado por Carl Woese para revelar que Archaea é um domínio separado da vida.",
      "Sulfolobus cresce a 75–80°C em pH 2–3, oxidando enxofre e ferro — e foi a primeira archaea usada para estudar reparo de DNA em condições extremas, revelando homologias com eucariontes.",
      "Halobacterium produz bacteriorodopsina, uma bomba de prótons acionada por luz — tão estável que é estudada em biotecnologia como base para memórias ópticas e baterias biológicas.",
      "Pyrococcus furiosus é a fonte da DNA polimerase Pfu — usada em PCR de alta fidelidade em diagnósticos clínicos e clonagem de genes terapêuticos, onde mutações são absolutamente inaceitáveis.",
      "Nanoarchaeum equitans tem o menor genoma celular funcional (~490 kb) — sem genes para síntese de aminoácidos, lipídios ou nucleotídeos, que rouba diretamente do hospedeiro Ignicoccus hospitalis.",
      "Methanosarcina acetivorans tem o maior genoma entre metanogênicos sequenciados (~5,7 Mb) e o repertório metabólico mais versátil: usa CO, metanol, metilaminas ou acetato para produzir metano.",
      "Thermococcus inclui mais de 30 espécies hipertermófilas e produz DNA polimerases termoestáveis, proteínas de resistência a pressão e enzimas de interesse para biocatálise industrial.",
      "Candidatus Lokiarchaeum é o gênero de archaea mais próximo evolutivamente dos eucariontes, com genes de actina e ESCRT — sugerindo que a origem das células eucarióticas envolveu uma fusão com Archaea.",
    ],
    3: [
      "Escherichia tem E. coli como organismo-modelo mais estudado da história — com mais de 500.000 publicações — e desde 1982 sintetiza insulina humana quando modificada geneticamente.",
      "Streptomyces produz mais de 60% dos antibióticos naturais em uso clínico: estreptomicina, tetraciclina, eritromicina, vancomicina e cloranfenicol vieram todos deste gênero do solo.",
      "Prochlorococcus é a bactéria fotossintética mais abundante do oceano — com apenas 0,6 μm de diâmetro, é provavelmente o organismo fotossintético mais numeroso da Terra.",
      "Mycobacterium inclui tanto M. tuberculosis (tuberculose) quanto M. leprae (hanseníase) — doenças que acompanham a humanidade há milênios e juntas ainda somam mais de 2 milhões de mortes anuais.",
      "Lactobacillus é o gênero bacteriano mais usado em alimentos fermentados e probióticos — e seu estudo por Metchnikoff no início do século XX fundou o campo da imunologia intestinal.",
      "Rhizobium estabelece simbiose com leguminosas tão específica que cepas de R. japonicum nodulam somente soja — e a seleção de cepas eficientes substituiu toneladas de fertilizantes nitrogenados sintéticos.",
      "Vibrio inclui V. cholerae, causador do cólera no século XIX, e V. fischeri, que vive em simbiose bioluminescente com lulas — produzindo luz como sinal de quórum-sensing.",
      "Bacillus anthracis produz o único esporo bacteriano classificado como agente de bioterrorismo — enquanto B. thuringiensis produz cristais proteicos inseticidas usados em bioinseticidas seguros para mamíferos.",
    ],
    4: [
      "Phytophthora ('destruidora de plantas') tem ~150 espécies, a maioria patógenas devastadoras: P. cinnamomi ameaça ecossistemas de jarrah (Austrália) e P. sojae destrói bilhões em soja anualmente.",
      "Emiliania huxleyi é o cocolito mais estudado do mundo — seus blooms oceânicos sequestram carbono e emitem DMS, influenciando a formação de nuvens e o ciclo climático global.",
      "Thalassiosira é a diatomácea mais estudada em oceanografia: T. weissflogii e T. pseudonana são os modelos de laboratório para estudar o ciclo do silício e a produção primária oceânica.",
      "Macrocystis pyrifera (kelp gigante) cresce até 60 cm por dia em condições ideais — e suas florestas submarinas sequestram carbono 20× mais rápido que florestas terrestres tropicais.",
      "Sargassum forma o único habitat pelágico baseado em macroalgas do planeta — o Mar de Sargasso — e desde 2011 prolifera em massas que cobrem praias do Caribe e do Brasil.",
      "Noctiluca scintillans é a maior dinoflagelada unicelular (1–3 mm) e causa bioluminescência azul em ondas do mar — mas em proliferação excessiva libera amônio suficiente para matar peixes.",
      "Pseudo-nitzschia produz ácido domoico acumulado em mexilhões e peixes — causando convulsões, amnésia e morte em mamíferos marinhos, classificada como Amnesic Shellfish Poisoning.",
      "Blastocystis é o protista intestinal mais comum em humanos: encontrado em 10–60% da população global dependendo da região, com patogenicidade ainda debatida pela comunidade científica.",
    ],
    5: [
      "Penicillium chrysogenum produz a penicilina descoberta acidentalmente por Alexander Fleming em 1928 — o antibiótico que transformou a medicina e salvou centenas de milhões de vidas.",
      "Amanita inclui os fungos mais mortais (A. phalloides, A. ocreata) e um dos mais alucinógenos (A. muscaria, com muscimol e ácido ibotênico) — um dos gêneros mais diversos em toxinas.",
      "Aspergillus inclui A. oryzae (fermenta sake, miso e molho de soja), A. niger (produz ácido cítrico industrial) e A. fumigatus (causa aspergilose, matando ~180.000 imunossuprimidos por ano).",
      "Saccharomyces cerevisiae foi domesticada há ~9.000 anos — e seu genoma (1996) foi o primeiro de um eucarioto completamente sequenciado, com 6.275 genes identificados.",
      "Trametes versicolor (rabo-de-peru) tem extrato PSK (krestin) aprovado no Japão como adjuvante de quimioterapia — o medicamento oncológico biológico mais vendido naquele país.",
      "Tuber (trufas) forma micorrizas com carvalhos e aveleiras — e produz compostos voláteis específicos (androstenol, androstenona) que atraem javalis e cães treinados para escavação.",
      "Ophiocordyceps inclui o fungo zumbi (O. unilateralis) que infecta formigas, controla seu comportamento com precisão espacial e temporal e esporula na posição ideal — co-evoluído por milhões de anos.",
      "Trichoderma é o gênero fúngico mais usado em agricultura biológica: como fungicida natural, promotor de crescimento e agente de biocontrole contra Fusarium, Botrytis e Rhizoctonia.",
    ],
    6: [
      "Arabidopsis thaliana é a Drosophila das plantas: com apenas 5 pares de cromossomos e 125 Mb de DNA, foi a primeira planta com o genoma completamente sequenciado (2000) e permanece o modelo-padrão.",
      "Oryza sativa (arroz) alimenta mais da metade da humanidade como principal fonte calórica — e seu genoma de 430 Mb (2002) revelou a base genética de adaptação a solos e climas distintos.",
      "Pinus inclui as árvores mais antigas do mundo: Pinus longaeva 'Methuselah' tem 4.855 anos — e suas resinas formaram o âmbar que preservou organismos do Cretáceo com detalhe microscópico.",
      "Quercus (carvalhos) sustenta a maior biodiversidade de invertebrados entre as árvores temperadas — um único carvalho maduro pode hospedar mais de 500 espécies de insetos.",
      "Solanum inclui tomate (S. lycopersicum), batata (S. tuberosum) e berinjela — e também a mandrágora e a belladona (S. nigrum), com alcaloides tóxicos e longo histórico medicinal.",
      "Eucalyptus tem ~700 espécies quase todas endêmicas da Austrália, é o segundo gênero arbóreo mais plantado no mundo e causa polêmica por seu consumo hídrico e impacto em biodiversidades locais.",
      "Welwitschia mirabilis é o único representante de seu gênero — com dois cotilédones que crescem por mais de 1.000 anos, esta planta do deserto namibiano é um fóssil vivente sem paralelo.",
      "Coffea inclui C. arabica e C. canephora — as plantas cujos grãos, após fermentação e torrefação, produzem o café: a bebida mais consumida no mundo depois da água, com 2,5 bilhões de xícaras diárias.",
    ],
    7: [
      "Plasmodium tem ~250 espécies que infectam aves, répteis e mamíferos — apenas 5 atacam humanos, mas P. falciparum é responsável por ~600.000 mortes anuais, mais do que qualquer outro eucarioto parasita.",
      "Trypanosoma brucei troca sua glicoproteína de superfície mais de 100 vezes para escapar do sistema imune — estratégia baseada em um repertório de ~1.000 genes VSG, a mais sofisticada evasão imune conhecida.",
      "Paramecium é o ciliado mais estudado do mundo por mais de 200 anos — e foi nele que foram descobertos os epigramas, desafiando o dogma central da genética ao mostrar herança citoplasmática.",
      "Giardia lamblia infecta ~280 milhões de pessoas por ano — com dois núcleos, simetria bilateral e sem mitocôndrias típicas (apenas mitossomas vestigiais), é um eucarioto profundamente reduzido.",
      "Leishmania é transmitida por flebotomíneos e pode causar desde lesões cutâneas à destruição de vísceras — e L. donovani mata mais de 20.000 pessoas anuais por calazar, sem vacina aprovada.",
      "Toxoplasma gondii completa seu ciclo sexual apenas em felinos, mas infecta quase todos os mamíferos como hospedeiro intermediário — e modifica o comportamento de ratos para reduzir o medo de gatos.",
      "Acanthamoeba causa ceratite ocular grave em usuários de lente de contato — e é portadora natural do Mimivirus, o maior vírus conhecido, descoberto acidentalmente ao confundi-la com uma bactéria.",
      "Dictyostelium discoideum é modelo único de evolução multicelular: células individuais se agregam, diferenciam-se e formam um corpo de frutificação com caule e esporos quando privadas de alimento.",
    ],
  },
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
