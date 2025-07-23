# 🌱 LifeBranch - Gamificação Taxonômica

## 💡 Ideia

O projeto **LifeBranch** tem como objetivo exibir uma **árvore taxonômica interativa**, onde cada nó pode ser expandido até chegar na **espécie**. Para tornar o projeto mais atrativo e educativo, surgiu a ideia de **gamificar** a experiência do usuário com desafios diários, sistema de pontuação, tempo e compartilhamento dos resultados.

### 🎯 Objetivo do Desafio

- O usuário recebe diariamente o nome de uma **espécie-alvo** (ex: `Homo sapiens`).
- A missão do usuário é **navegar pela árvore taxonômica**, clicando nos nós corretos até encontrar a espécie.
- A navegação correta segue o caminho taxonômico (ex: `Reino → Filo → Classe → Ordem → Família → Gênero → Espécie`).
- O desafio envolve **raciocínio, memória biológica e estratégia**, e visa tornar o aprendizado divertido e interativo.

---

## 📌 Exemplo de Caminho (Desafio)

### Espécie do dia: `Homo sapiens`

```txt
Reino: Animalia
└── Filo: Chordata
    └── Classe: Mammalia
        └── Ordem: Primates
            └── Família: Hominidae
                └── Gênero: Homo
                    └── Espécie: Homo sapiens ✅
```

## ✅ MVP (Produto Mínimo Viável)

O foco inicial do projeto é **100% frontend**, sem necessidade de backend ou persistência remota. O MVP deve conter:

### Funcionalidades Essenciais

- [ ] Interface da árvore taxonômica com nós expansíveis.
- [ ] Sistema de **Desafio do Dia**, com uma espécie-alvo exibida para o usuário.
- [ ] Permitir que o usuário clique e expanda nós até encontrar a espécie correta.
- [ ] **Verificação de acerto** ao alcançar a espécie correta.
- [ ] Contador de cliques.
- [ ] **Cronômetro justo**, que:
  - Inicia no **primeiro clique válido** (não ao carregar a árvore).
  - **Pausa automaticamente durante requisições de dados** para não prejudicar usuários com conexão lenta.
  - Finaliza quando a espécie correta for alcançada.
- [ ] Tela de resultado com:
  - Tempo final (ajustado, sem contar latência de rede)
  - Total de cliques
  - Mensagem de sucesso
- [ ] Reset do desafio (recomeçar).
- [ ] Tudo salvo em memória (usando apenas `useState`, `useEffect` e `localStorage` para cache/local).

---

## 🌟 Funcionalidades Desejáveis (100% Frontend)

Após o MVP estar concluído, estas são as melhorias desejáveis **ainda sem backend**:

### UI / UX / Feedback

- [ ] Feedback visual para cliques corretos/errados (cores, animações).
- [ ] Animação na expansão dos nós.
- [ ] Som opcional ao clicar ou acertar a espécie.
- [ ] Botão "Desafio Aleatório" para treinar além do desafio do dia.
- [ ] Exibição da **linha taxonômica** durante a navegação (tipo breadcrumb).
- [ ] Tela de resultado com botão de **compartilhar o desafio nas redes sociais** (usando `navigator.share()` ou copiar link).

### Sistema de Pontuação (Local)

- [ ] Sistema de pontuação local (armazenado em `localStorage`):
  - Baseado no tempo
  - Número de cliques
  - Bônus por sequência diária (streak)
- [ ] Barra de progresso com **nível e experiência (XP)**.
- [ ] Conquistas locais (ex: "Desafio completado em menos de 30s").

### Retenção e Engajamento

- [ ] Sistema de **streak** diário (dias consecutivos completando o desafio).
- [ ] Notificação in-app (ex: “Desafio do dia disponível!”).
- [ ] Ficha educativa da espécie encontrada com curiosidades.

---

### 🧩 Dicas (Hints)

Nem todo usuário terá conhecimento biológico suficiente para acertar com facilidade. Serão oferecidas **dicas contextuais** para ajudar o jogador a encontrar a espécie correta sem apelar para busca externa.

- [ ] Sistema de dicas progressivas que o usuário pode solicitar manualmente.
- [ ] Exemplos de dicas:
  - 📍 **Habitat típico**: (ex: "Habita regiões costeiras tropicais").
  - 🍽️ **Alimentação**: (ex: "É herbívoro, alimenta-se principalmente de gramíneas").
  - 🌎 **Distribuição geográfica**: (ex: "Ocorre na América do Sul").
  - ⚠️ **Nível de ameaça/conservação**: (ex: "Considerada uma espécie ameaçada").
  - 📏 **Tamanho médio**: (ex: "Mede cerca de 1 metro de comprimento").

**Importante**: As dicas devem ser textuais e indiretas para evitar que o usuário facilmente pesquise e encontre a resposta fora do jogo.

---

### 📌 Observações Finais sobre Dicas e Dificuldade

- No **Desafio do Dia**, as dicas serão mais simples e diretas (modo casual).
- Para modos mais avançados no futuro, será possível:
  - Ativar **níveis de dificuldade** (Fácil, Médio, Difícil).
  - No modo **Difícil**:
    - Nenhuma dica disponível.
    - Detectar e penalizar se o usuário **trocar de aba** (ex: perdendo tempo, pontos, ou cancelando o desafio).
    - Timer mais rigoroso.

> ⚠️ O modo com dificuldade e detecção de aba deve **ficar fora do Desafio Diário**, sendo exclusivo de modos mais competitivos no futuro.

---

## 🔮 Futuro: Funcionalidades com Backend (desejos para a próxima fase)

Essas funcionalidades envolvem persistência remota, autenticação e mais infraestrutura. Só devem ser implementadas após o desejável frontend estar completo.

### Conta e Ranking

- [ ] Criação de conta (login social ou por e-mail).
- [ ] Salvamento da pontuação no servidor.
- [ ] Ranking global/diário/semanal dos jogadores.
- [ ] Histórico de desafios concluídos.
- [ ] Conquistas sincronizadas em conta.
- [ ] Desafios entre amigos (enviar desafios personalizados).
- [ ] Modo multiplayer (PvP): quem encontra a espécie primeiro.
