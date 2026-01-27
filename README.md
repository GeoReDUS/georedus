# GeoReDUS

## 📖 Sobre

Este repositório representa a biblioteca de componentes frontend desenvolvida em React para visualização e análise de dados geoespaciais urbanos do projeto GeoReDUS (Plataforma de Dados Intraurbanos da ReDUS - Rede para Desenvolvimento Urbano Sustentável). O projeto está organizado em sistema de `monorepo` (clique [aqui](https://github.com/joelparkerhenderson/monorepo-vs-polyrepo?tab=readme-ov-file#introduction) para entender o que é um monorepo).

## 🛠️ ⚙️ Configuração de ambiente e Instalação do Projeto

Este projeto utiliza Yarn Workspaces para gerenciar múltiplos pacotes em um único repositório.
Siga o mesmo passo a passo de **configuração de ambiente** e **instalação do projeto** do repositório `redus-web-ui` neste [link](https://github.com/orioro/redus-web-ui). Após a instalação correta do projeto continue no passo a passo abaixo.

**Obs:** No comando `yarn build` provavelmente vai aparecer alguns erros de chatbot e typescript, pode ignorar, o importante é o `dist` estar sendo criado no diretório de casa componente.

## 🚀 Desenvolvimento

### Orientação Genérica:

No projeto, usamos o padrão:

```bash
yarn workspace <name> <comando>
```

**Obs:** Verifique o `name` e os comandos do `workspace` em `package.json` no diretório de cada um em `packages`.

**Acesse: http://localhost:6006**

O Storybook exibe todos os componentes da biblioteca com exemplos interativos. Você pode explorar os componentes através dos arquivos `.stories.jsx` localizados em:

```
packages/[workspace]/src/[componente]/*.stories.jsx
```

### Aplicação para o pacote `georedus-ui`:

Primeiramente será necessário inserir configuraçoes de ambiente no arquivo `.env` dentro do diretório `georedus-ui`. Solicite as variáveis de ambiente para alguém da equipe de tecnologia:

```
STORYBOOK_METADATA_API_ENDPOINT
STORYBOOK_VECTOR_TILE_SERVER_ENDPOINT
NEXT_PUBLIC_MAP_TILER_API_KEY
STORYBOOK_RASTER_TILE_SERVER_ENDPOINT
STORYBOOK_RASTER_TILE_ROOT_PATH
```

⚠️ **Importante**: O arquivo `.env` não deve ser incluido no commit, apesar de estar no `.gitignore`, é bom ficar atento a isso.

Rode o storybook localmente:

```bash
yarn dev
```

Esse comando executa, na prática (veja o arquivo `package.json` na raiz do projeto):

```bash
yarn workspace @redus/georedus-ui dev
```

Acesse o storybook em: http://localhost:6006

Explore a bilioteca através dos arquivos: `packages/georedus-ui/src/[componente]/*.stories.jsx`

### Aplicação para o pacote `react-maplibre-util`:

Insira as configuraçoes de ambiente no arquivo `.env` dentro do diretório `react-maplibre-util`. Solicite as variáveis de ambiente para alguém da equipe de tecnologia:

```
STORYBOOK_MAP_TILER_API_KEY
```

⚠️ Importante: O arquivo .env não deve ser incluido no commit, apesar de estar no .gitignore, é bom ficar atento a isso.

Rode o storybook localmente:

```bash
yarn workspace @orioro/react-maplibre-util dev
```

Acesse o storybook em: http://localhost:6006

Explore a bilioteca através dos arquivos: `packages/react-maplibre-util/src/[componente]/*.stories.jsx`

## 📁 Estrutura do Projeto

O projeto está organizado em pacotes modulares dentro do diretório `packages/`:

### **`georedus-ui`**

Componente principal da GeoReDUS:

- Interface de mapa interativo com múltiplas camadas de dados
- Visualização de dados censitários, educação, saúde e infraestrutura urbana
- Sistema de filtros e controles de visualização
- Suporte a Vector Tiles e dados raster
- Integração com Google Sheets para especificações de visualização
- Exportação e compartilhamento de visualizações

### **`chatbot-poc`**

Prova de conceito de chatbot assistente para navegação e análise de dados

### **`react-maplibre-util`**

Componentes React para integração avançada com o **MapLibre GL** por meio do `react-map-gl`, que atua como camada de integração entre o **MapLibre GL** e o React.

Esta biblioteca fornece um conjunto de ferramentas e componentes React construídos sobre o `react-map-gl`, adicionando funcionalidades para gestão, sobreposição, ordenação de camadas e composição de visualizações no MapLibre.

#### 📚 Recursos úteis:
Para entender melhor sobre essas duas bibliotecas consulte suas respectivas documentaçoes

- [MapLibre](https://maplibre.org/maplibre-gl-js/docs/)
- [React Map GL](https://visgl.github.io/react-map-gl/docs)

#### 🧩 Componentes:

- **Controls**
  - Controles customizados para o mapa, como navegação, inspeção e terreno.
  - Subcomponentes: `ControlContainer`, `InspectControl`, `TerrainControl`.

- **CustomSprite**
  - Sistema para sprites customizados no mapa.
  - Permite adicionar ícones e imagens personalizadas.

- **DynamicImages**
  - Renderização dinâmica de imagens e padrões SVG como preenchimento de camadas.

- **GeocoderCtrl_MapLibre**
  - Controle de geocodificação integrado ao MapLibre.
  - Suporte a APIs como Mapbox e Nominatim.

- **HoverTooltip**
  - Tooltips interativos exibindo dados das features ao passar o mouse.

- **LayeredMap**
  - Sistema de camadas para múltiplas visualizações sobrepostas.
  - Controle de ordem, visibilidade e z-index das camadas.
  - Propriedades: - `views`: propriedade chave, usadas para especificação das fontes de dados e camadas de renderizadores. - `layers`: define como renderizar os dados na tela. - `paint`: faz a estilização dos dados renderizados.

- **MapWindow**
  - Mini-mapas e janelas de visualização sincronizadas.

- **MapboxGeocoderControl**
  - Controle de busca geográfica usando Mapbox.

- **SyncedMaps**
  - Sincronização de múltiplos mapas para comparação.
  - Monta dois `LayeredMap` lado a lado para comparação ou análise sincronizada
  - Possibilita múltiplos mapas sincronizados por viewport
  - Suporte a layouts lado-a-lado ou empilhados

- **scales**
  - Utilitários para escalas de cores e símbolos.

- **useHover**
  - Hook para interação de hover em features do mapa.

- **util**
  - Funções utilitárias para manipulação de estilos, geometria e expressões.

Cada componente pode ser explorado individualmente para compor visualizações avançadas e interativas com MapLibre GL.

É possivel ver uma aplicação simples desta biblioteca em um estudo de caso feito na branch `tmp/studies` em `packages/react-maplibre-util/src/Studies/ReactMapGl.stories.jsx`.

### **`react-chart-util`**

Biblioteca de componentes para visualização de dados e legendas.

- Tipos de legendas:
  - CategoricalLegend: para dados categóricos
  - ContinuousColorLegend: para escalas contínuas de cor
  - ProportionalSymbolLegend: para símbolos proporcionais
- Layout flexível com suporte a múltiplas legendas
- Integração com sistemas de cores e escalas

### **`react-dir-nav`**

Biblioteca que contrói o sistema de navegação hierárquica em árvore para organização de conteúdo:

- Estrutura de diretórios com suporte a níveis aninhados, ou seja, pasta com subpasta
- Busca e filtros por conteúdo
- Seções expansíveis (Dir, DirSection, NavSection)
- Componentes customizáveis de itens e navegação

**Casos de uso:** Menu de visualizações, organização de camadas temáticas, catálogo de dados

### **`vector-tile-util`**

Utilitários para manipulação e renderização de Vector Tiles:

- Protocolo de mesclagem de dados (dataMergeProtocol):
  - Combinação de tiles vetoriais com dados tabulares
  - Cache otimizado de consultas
  - Suporte a múltiplas fontes de dados
- Processamento client-side:
  - Geometrias vetoriais enviadas ao cliente
  - Renderização customizável no navegador
  - Redução significativa de tráfego de rede
  - Integração com MapLibre via protocolos customizados

**Conceito:**

Para evitar o carregamento de todos os dados de uma vez, as informações são organizadas em tiles (quadrados), cada um identificado por um sistema de coordenadas próprio: nível de zoom, eixo x e eixo y (z, x, y).

Tradicionalmente, cada tile contém uma imagem (raster tile). Já o vector tile carrega dados vetoriais. Em vez de renderizar imagens no servidor, o servidor envia ao cliente as geometrias (polígonos, linhas e pontos), que são renderizadas dinamicamente no navegador ou aplicação cliente.

Isso permite:

- Arquivos mais leves
- Transmissão mais rápida
- Customização de estilos em tempo real
- Interatividade com features individuais

**Tecnologias:** MapLibre GL, Protocol Handlers, DuckDB (integração)
