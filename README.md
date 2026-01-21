# GeoReDUS

## 📖 Sobre

Este repositório representa a biblioteca de componentes frontend desenvolvida em React para visualização e análise de dados geoespaciais urbanos do projeto GeoReDUS (Plataforma de Dados Intraurbanos da ReDUS - Rede para Desenvolvimento Urbano Sustentável). O projeto está organizado em sistema de `monorepo` (clique [aqui](https://github.com/joelparkerhenderson/monorepo-vs-polyrepo?tab=readme-ov-file#introduction) para entender o que é um monorepo).

## 🛠️ ⚙️ Configuração de ambiente e Instalação do Projeto

Este projeto utiliza Yarn Workspaces para gerenciar múltiplos pacotes em um único repositório.
Siga o mesmo passo a passo de **configuração de ambiente** e **instalação do projeto** do repositório `redus-web-ui` neste link **(colocar link que direciona para readme do `redus-web-ui`)**. Após a instalação correta do projeto continue no passo a passo abaixo.

## 🚀 Desenvolvimento para o pacote `redus/georedus-ui`
Antes de rodar o projeto será necessário inserir configuraçoes de ambiente no arquivo `.env` dentro do diretório georedus-ui. Solicite as variáveis de ambiente para alguém da equipe de tecnologia.

⚠️ **Importante**: O arquivo `.env` não deve ser commitado, apesar de estar no `.gitignore`, é bom ficar atento a isso.

```bash
yarn workspace @redus/georedus-ui dev
```

Acesse: **http://localhost:6006**

O Storybook exibe todos os componentes da biblioteca `georedus-ui` com exemplos interativos. Você pode explorar os componentes através dos arquivos `.stories.jsx` localizados em:

```
packages/georedus-ui/src/[componente]/*.stories.jsx
```

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
<!-- Componentes React para integração com MapLibre através do ReactMapGL. Nesse diretório adicionamos mais uma camada de componentes ao MapLibre que ajuda a fazer gestão, sobreposição e ordenação de camadas e composição de visualizações.  -->
Componentes React para integração avançada com MapLibre GL através do react-map-gl:

- Sistema de camadas (LayeredMap):
    - Gestão de múltiplas visualizações sobrepostas
    - Controle de ordem e visibilidade de camadas
    - Sistema de z-index para organização de camadas
- Componentes de UI:
    - Tooltips interativos com dados de features
    - Controles customizados (terreno, geocoder, navegação)
    - Mini-mapas (MapWindow)
    - Sistema de sprites customizáveis
- Sincronização de mapas (SyncedMaps):
    - Múltiplos mapas sincronizados por viewport
    - Suporte a layouts lado-a-lado ou empilhados
- Utilitários:
    - Hooks para interação (hover, click)
    - Escalas de cores e símbolos
    - Renderização de imagens dinâmicas

### **`react-chart-util`**
Biblioteca de componentes para visualização de dados e legendas:

- Tipos de legendas:
    - CategoricalLegend: para dados categóricos
    - ContinuousColorLegend: para escalas contínuas de cor
    - ProportionalSymbolLegend: para símbolos proporcionais
- Layout flexível com suporte a múltiplas legendas
- Integração com sistemas de cores e escalas


### **`react-dir-nav`**
Sistema de navegação hierárquica em árvore para organização de conteúdo:

- Estrutura de diretórios com suporte a níveis aninhados
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
    
**Conceito:** Em vez de renderizar imagens no servidor (tiles raster), o sistema transmite dados vetoriais (polígonos, linhas, pontos) que são renderizados dinamicamente no cliente. Isso permite:
- Arquivos mais leves
- Transmissão mais rápida
- Customização de estilos em tempo real
- Interatividade com features individuais

**Tecnologias:** MapLibre GL, Protocol Handlers, DuckDB (integração)