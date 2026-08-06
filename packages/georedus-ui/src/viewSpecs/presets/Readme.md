# Presets

Presets são funções prontas que geram uma **view** completa (fontes e camadas MapLibre GL, legendas, tooltip e download) a partir de uma configuração declarativa (`style`), sem que seja necessário escrever manualmente `sources`/`layers`/`tooltip` como descrito no tutorial ["Criando uma view"](../../../../../README.md#-exemplo-prático) do monorepo.

Este documento cobre os 9 presets disponíveis (8 vetoriais + 1 raster):

### Vector Presets
| Geometria | Estilo único | Estilo categórico | Estilo contínuo | Densidade |
|---|---|---|---|---|
| Ponto | [`vector_point_single`](#vector_point_single) | — | [`vector_point_continuous`](#vector_point_continuous) | [`vector_heatmap`](#vector_heatmap) |
| Linha | [`vector_line_single`](#vector_line_single) | [`vector_line_categorical`](#vector_line_categorical) | — | — |
| Polígono | [`vector_polygon_single`](#vector_polygon_single) | [`vector_polygon_categorical`](#vector_polygon_categorical) | [`vector_polygon_continuous`](#vector_polygon_continuous) | — |

### Raster Presets
| Geometria | Estilo único | Estilo categórico | Estilo contínuo | Densidade |
|---|---|---|---|---|
| Raster | — | [`raster_categorical`](#raster_categorical) | — | — |


### Sobre os estilos
- **Estilo único**: toda a camada é renderizada com uma única cor/estilo fixo.
- **Estilo categórico**: a cor/padrão varia de acordo com o valor de uma propriedade categórica (`categoryKey` nos presets vetoriais; classes pré-definidas no raster), com uma cor por categoria.
- **Estilo contínuo**: a cor (ou o raio, no caso de pontos) varia de acordo com uma propriedade numérica (`valueKey`), usando uma escala de cores e um método de classificação.
- **Densidade**: a intensidade da cor reflete a concentração de pontos em uma área (mapa de calor).
- `raster_categorical` é o único preset **não vetorial** da lista — a geometria já vem rasterizada (por pixel) a partir do tile server, em vez de features vetoriais.



## Uso geral

Todos os presets têm a mesma assinatura:

```ts
preset(viewSpecInput, allViewSpecs, context) => ViewSpec
```

- **`viewSpecInput`**: objeto de configuração da view. Contém os campos base abaixo mais o campo `style`, cujo formato é específico de cada preset (ver seções seguintes).
- **`allViewSpecs`**: array com os demais `viewSpecInput` do mesmo lote (disponibilizado para os presets, mas não usado diretamente pelos 7 presets vetoriais).
- **`context`**: `{ METADATA_API_ENDPOINT, VECTOR_TILE_SERVER_ENDPOINT, municipioId, ...outrosDadosDaAplicação }`, usado para resolver URLs de tiles e de dados de metadata/download.

#### Placeholders em URLs

Os campos que aceitam URLs como template (`tiles`, `download_url` e o `values` dos presets contínuos) podem conter os seguintes placeholders `${...}`, resolvidos a partir do `context`:

- `${VECTOR_TILE_SERVER_ENDPOINT}` / `${METADATA_API_ENDPOINT}` — endpoints da aplicação (tile server e API de metadata/dados).
- `${municipioId}` — código IBGE do **município atualmente selecionado** na interface (corresponde à coluna `cd_mun` das views PostgREST). Permite escopar os dados/quebras a uma cidade, ex.: `&cd_mun=eq.${municipioId}`. Como a view é reprocessada quando o município muda, as quebras (natural breaks/quantis) são recalculadas para cada cidade.

Um preset é tipicamente selecionado dinamicamente através do campo `preset` (nome da função) em conjunto com `parseViewSpec`, que despacha o `viewSpecInput` para o preset correspondente — mas os presets também podem ser importados e chamados diretamente.

### Campos base do `viewSpecInput`

Além de `style`, todo preset aceita:

| Campo | Tipo | Obrigatório | Descrição |
|---|---|---|---|
| `id` | `string` | recomendado | Identificador único da view. |
| `path` | `string` | não | Caminho de navegação (separado por `/`) usado para organizar a view no menu latera, ex.: `'Censo 2022 / Domicílios'`. |
| `label` | `string` | não | Nome legível exibido na interface. |
| `sourceLabel` | `string` | não | Atribuição da fonte de dados, ex.: `'IBGE'`. |
| `shortDescription` | `string` | não | Descrição curta do indicador. |
| `metodology` | `ReactNode` | não | Conteúdo para nota metodológica do indicador. |
| `tiles` | `string \| string[]` | **sim** | URL do tile, podendo conter `{z}/{x}/{y}` e placeholders como `${VECTOR_TILE_SERVER_ENDPOINT}`. Lança erro se ausente. |
| `source_layer` | `string` | **sim**, exceto em `raster_categorical` | Nome do layer dentro do vector tile a ser renderizado (um mesmo tile pode conter várias camadas de dados). Lança erro se ausente. Não se aplica a `raster_categorical`, cuja fonte é raster (não vetorial). |
| `tooltip` | `{ title?, entries? }` | não | Configuração do tooltip exibido ao passar o mouse sobre uma feature. Ver [Tooltip](#tooltip). |
| `download_url` | `string` | não | URL dos dados brutos para exportação (aceita o placeholder `${METADATA_API_ENDPOINT}`). Ver [Download](#download). |
| `style` | específico do preset | depende do preset | Configuração de estilo. Ver cada preset abaixo. |

### O que cada preset retorna

```ts
{
  id, path, label, sourceLabel, metodology, shortDescription, // repassados do input
  confSchema, // schema dos controles de estilo editáveis pelo usuário em tempo real (quando aplicável)
  metadata,   // dados assíncronos necessários para montar a camada (categorias, escalas de cor, valores min/max...)
  sources,    // { main: MapViewSource } — fonte vetorial MapLibre GL montada a partir de `tiles`
  layers,     // um ou mais MapViewLayer (`main_circle` | `main_line` | `main_fill` | `main_heatmap` | `main_raster`) prontos para o MapLibre GL
  download,   // handler de download dos dados brutos
}
```

> `raster_categorical` é uma exceção: retorna apenas `{ id, path, label, sourceLabel, metodology, shortDescription, sources, layers }` — não expõe `confSchema`, `metadata` nem `download`.

---

## `vector_point_single`

Renderiza pontos com cor, raio e opacidade definidos.

**`style`** pode receber um objeto ou uma string, que é tratada como `color`:

| Campo | Tipo | Obrigatório | Default | Descrição |
|---|---|---|---|---|
| `color` | `string` | não | laranja GeoReDUS (`#FF7F00`) | Cor de preenchimento do ponto. Aceita hex (`'#1f78b4'`) ou path de um esquema de cores (`'schemeGeoReDUS.laranja'`). |
| `radius` | `number` | não | `10` | Raio do círculo, em pixels. |
| `opacity` | `number` | não | `1` | Opacidade do preenchimento (0 a 1). |
| `border` | `boolean` | não | `true` | Se `true`, desenha uma borda branca de 2px ao redor do círculo. |
<!-- | `tooltip` | objeto | não | — | Alternativa a definir `tooltip` no nível raiz do `viewSpecInput`. | -->

```js
{
  preset: 'vector_point_single',
  id: 'escolas_municipais',
  label: 'Escolas municipais',
  path: 'Educação / Infraestrutura',
  sourceLabel: 'INEP',
  tiles: `${VECTOR_TILE_SERVER_ENDPOINT}/escolas_municipais/{z}/{x}/{y}`,
  source_layer: 'escolas_municipais',
  style: {
    color: '#1f78b4',
    radius: 6,
    opacity: 0.9,
    border: true,
  },
  tooltip: {
    title: 'nome',
    entries: ['endereco', 'matriculas'],
  },
}
```

Atalho com string (usa os `defaults` de raio/opacidade/borda):

```js
{
  preset: 'vector_point_single',
  // ...
  style: 'schemeGeoReDUS.verde_agua',
}
```

---

## `vector_point_continuous`

Renderiza pontos cujo **raio** varia proporcionalmente a um valor numérico (símbolos proporcionais). A cor é fixa.

**`style`**:

| Campo | Tipo | Obrigatório | Default | Descrição |
|---|---|---|---|---|
| `color` | `string` | não | laranja GeoReDUS (`#FF7F00`) | Cor fixa dos pontos. |
| `radius` | objeto | não | {} |  Propriedades para calcular o raio. |
<!-- | `tooltip` | objeto | não | - | Ver [Tooltip](#tooltip). | -->

objeto `radius`:

| Campo | Tipo | Obrigatório | Descrição |
|---|---|---|---|
| `valueKey` | `string` | **sim** (se `radius` definido) | Nome da propriedade da feature usada para calcular o raio. |
| `values` | `string \| number[] \| { value: number }[]` | **sim** (se `radius` definido) | URL (retornando JSON) ou array com os valores usados para calcular a escala min/max do raio. Aceita o placeholder `${municipioId}` para escopar os valores ao município selecionado (ex.: `&cd_mun=eq.${municipioId}`). |
| `numberFormat` | `any` | não | Formato numérico usado na legenda. |
<!-- | `classificationMethod` | objeto | não | Método de distribuição de valores a ser usado | -->
<!-- | `legend.format` | objeto | não | Formatação adicional da legenda de símbolo proporcional. | -->

Pontos cuja feature não possua valor numérico em `radius.valueKey` são renderizados em cinza claro (`#CCCCCC`), sinalizando "sem dados".

```js
{
  preset: 'vector_point_continuous',
  id: 'ubs_atendimentos',
  label: 'Unidades básicas de saúde — atendimentos/mês',
  path: 'Saúde / Infraestrutura',
  sourceLabel: 'DataSUS',
  tiles: `${VECTOR_TILE_SERVER_ENDPOINT}/ubs/{z}/{x}/{y}`,
  source_layer: 'ubs',
  style: {
    color: 'schemeGeoReDUS.laranja',
    radius: {
      valueKey: 'atendimentos_mes',
      // `&cd_mun=eq.${municipioId}` restringe a escala do raio ao município selecionado
      values: `${METADATA_API_ENDPOINT}/ubs_atendimentos?select=value&cd_mun=eq.${municipioId}`,
      numberFormat: ['pt-BR'],
    },
  },
}
```

---

## `vector_line_single`

Renderiza linhas com cor, espessura e padrão definidos.

**`style`** (aceita também uma string, tratada como `color`):

| Campo | Tipo | Obrigatório | Default | Descrição |
|---|---|---|---|---|
| `color` | `string` | não | laranja GeoReDUS | Cor da linha. |
| `linePattern` | `'solid' \| 'dashed' \| 'dotted' \| 'none'` | não | `'solid'` | Padrão do traçado. `'none'` oculta a camada. |
| `lineWidth` | `number` | não | `1` | Espessura da linha em pixels. |

```js
{
  preset: 'vector_line_single',
  id: 'malha_ciclovia',
  label: 'Ciclovias',
  path: 'Mobilidade / Infraestrutura cicloviária',
  sourceLabel: 'Prefeitura',
  tiles: `${VECTOR_TILE_SERVER_ENDPOINT}/ciclovias/{z}/{x}/{y}`,
  source_layer: 'ciclovias',
  style: {
    color: '#33a02c',
    linePattern: 'dashed',
    lineWidth: 3,
  },
}
```

---

## `vector_line_categorical`

Renderiza linhas com uma cor por categoria, de acordo com o valor de uma propriedade da feature.

**`style`** (obrigatório — lança erro se `style` não for informado):

| Campo | Tipo | Obrigatório | Default | Descrição |
|---|---|---|---|---|
| `categoryKey` | `string` | **sim** | - | Nome da propriedade da feature usada para determinar a categoria. |
| `categories` | `string \| Array<string \| { value, label?, color? }>` | **sim** | - | URL (retornando JSON) ou array de categorias. Itens string viram `{ value }`. `label` default é `humanize(value)`; `color`, se omitido, vem do `colorScheme`. |
| `colorScheme` | ver [Esquemas de cor categóricos](#esquemas-de-cor-categóricos) | não | `'schemeGeoReDUSSafe'` | Paleta usada para colorir categorias sem `color` explícito. |
| `linePattern` | `'solid' \| 'dashed' \| 'dotted' \| 'none'` | não | `'solid'` | Padrão do traçado (compartilhado entre todas as categorias). |
| `lineWidth` | `number` | não | `1` | Espessura da linha em pixels. |

```js
{
  preset: 'vector_line_categorical',
  id: 'malha_viaria_hierarquia',
  label: 'Hierarquia viária',
  path: 'Mobilidade / Malha viária',
  sourceLabel: 'IBGE',
  tiles: `${VECTOR_TILE_SERVER_ENDPOINT}/malha_viaria/{z}/{x}/{y}`,
  source_layer: 'malha_viaria',
  style: {
    categoryKey: 'hierarquia',
    colorScheme: 'schemeSet1',
    categories: [
      { value: 'arterial', label: 'Via arterial' },
      { value: 'coletora', label: 'Via coletora' },
      { value: 'local', label: 'Via local' },
    ],
    lineWidth: 2,
  },
}
```

---

## `vector_polygon_single`

Renderiza polígonos com preenchimento e borda de estilo definidos.

**`style`** (aceita também uma string, tratada como `color`):

| Campo | Tipo | Obrigatório | Default | Descrição |
|---|---|---|---|---|
| `color` | `string` | não | laranja GeoReDUS | Cor de preenchimento (aplicada com opacidade de 0.5). |
| `fillPattern` | ver [Padrões de preenchimento](#padrões-de-preenchimento) | não | `'solid'` | Hachura aplicada sobre o preenchimento. |
| `borderStyle` | `'solid' \| 'dashed' \| 'dotted' \| 'none'` | não |  `'solid'` | Estilo da borda do polígono. `'none'` oculta a borda. |

```js
{
  preset: 'vector_polygon_single',
  id: 'area_protegida',
  label: 'Área de proteção ambiental',
  path: 'Meio ambiente / Áreas protegidas',
  sourceLabel: 'ICMBio',
  tiles: `${VECTOR_TILE_SERVER_ENDPOINT}/area_protegida/{z}/{x}/{y}`,
  source_layer: 'area_protegida',
  style: {
    color: 'schemeGeoReDUS.verde_agua',
    fillPattern: 'lines_1',
    borderStyle: 'dashed',
  },
}
```

---

## `vector_polygon_categorical`

Renderiza polígonos com preenchimento e borda coloridos por categoria.

**`style`** (obrigatório — lança erro se `style` não for informado):

| Campo | Tipo | Obrigatório | Descrição |
|---|---|---|---|
| `categoryKey` | `string` | **sim** | Nome da propriedade da feature usada para determinar a categoria. |
| `categories` | `string \| Array<string \| { value, label?, color? }>` | **sim** | URL ou array de categorias — mesmo formato de `vector_line_categorical`. Cada categoria pode definir sua própria `color`. |
| `colorScheme` | ver [Esquemas de cor categóricos](#esquemas-de-cor-categóricos) | `'schemeGeoReDUSSafe'` | Paleta usada para colorir categorias sem `color` explícito. |
| `fillPattern` | ver [Padrões de preenchimento](#padrões-de-preenchimento) | `'solid'` | Hachura aplicada sobre o preenchimento (compartilhada entre categorias, cada uma usando sua própria cor). |
| `borderStyle` | `'solid' \| 'dashed' \| 'dotted' \| 'none'` | `'solid'` | Estilo da borda (compartilhado entre categorias). |

```js
{
  preset: 'vector_polygon_categorical',
  id: 'uso_do_solo',
  label: 'Uso do solo',
  path: 'Território / Uso e ocupação',
  sourceLabel: 'IBGE',
  tiles: `${VECTOR_TILE_SERVER_ENDPOINT}/uso_do_solo/{z}/{x}/{y}`,
  source_layer: 'uso_do_solo',
  style: {
    categoryKey: 'classe_uso',
    colorScheme: 'schemeGeoReDUSSafe',
    categories: [
      { value: 'urbano', label: 'Zona urbana', color: '#808080' },
      { value: 'rural', label: 'Zona rural', color: '#8B4513' },
      { value: 'preservacao', label: 'Área de preservação' },
    ],
    fillPattern: 'solid',
  },
}
```

---

## `vector_polygon_continuous`

Renderiza polígonos com preenchimento em coroplético — a cor varia continuamente de acordo com uma propriedade numérica, usando uma escala de cores e um método de classificação.

**`style`**:

| Campo | Tipo | Obrigatório | Descrição |
|---|---|---|---|
| `valueKey` | `string` | **sim** | Nome da propriedade numérica da feature. |
| `values` | `string \| number[] \| { value: number }[]` | **sim** | URL (retornando JSON) ou array com os valores usados para calcular as classes/quebras da escala. Aceita o placeholder `${municipioId}` — sem o filtro `cd_mun=eq.${municipioId}` na URL, as quebras são calculadas sobre **todos** os municípios; com ele, apenas sobre a cidade selecionada. |
| `colorScheme` | ver [Esquemas de cor contínuos](#esquemas-de-cor-contínuos) | `'schemeOrRd'` | Paleta sequencial/divergente ou array custom de cores. |
| `classificationMethod` | `'naturalBreaks' \| 'quantile' \| { type: 'naturalBreaks' \| 'quantile', k: number } \| { type: 'custom', breaks: number[] }` | `{ type: 'naturalBreaks', k: 5 }` | Método de classificação dos valores em faixas de cor. `k` é o número de classes. |
| `numberFormat` | `any` | não | Formato numérico usado na legenda. |
| `legend.format` | objeto | não | Formatação adicional da legenda sequencial. |
| `tooltip` | objeto | não | Ver [Tooltip](#tooltip). |

```js
{
  preset: 'vector_polygon_continuous',
  id: 'renda_media_setor',
  label: 'Renda média domiciliar por setor censitário',
  path: 'Censo 2022 / Renda',
  sourceLabel: 'IBGE',
  tiles: `${VECTOR_TILE_SERVER_ENDPOINT}/setores_censitarios/{z}/{x}/{y}`,
  source_layer: 'setores_censitarios',
  style: {
    valueKey: 'renda_media',
    // `&cd_mun=eq.${municipioId}` restringe as quebras ao município selecionado
    values: `${METADATA_API_ENDPOINT}/censo_2022_renda?select=value&cd_mun=eq.${municipioId}`,
    colorScheme: 'schemeBlues',
    classificationMethod: { type: 'quantile', k: 5 },
    numberFormat: ['pt-BR', { style: 'currency', currency: 'BRL' }],
  },
}
```

---

## `vector_heatmap`

Renderiza um mapa de calor (heatmap) a partir da densidade de pontos, com a opção de exibir os pontos individuais ao aproximar o zoom.

**`style`**:

| Campo | Tipo | Obrigatório | Default | Descrição |
|---|---|---|---|---|
| `weight` | `number` | não | `1` | Peso de cada ponto no cálculo de densidade. |
| `radius` | `number \| number[]` | não | raio de 2px (zoom 9) a 30px (zoom 17) | Raio de influência de cada ponto, em pixels. Se array, é interpretado como pares `[zoom, valor, zoom, valor, ...]`, variando o raio por nível de zoom. |
| `opacity` | `number \| number[]` | não | `1` (ou esmaecendo a partir do zoom 14 se `circle: true`) | Opacidade do heatmap. Aceita o mesmo formato de pares `[zoom, valor, ...]` de `radius`. |
| `steps` | `{ step: number, label: string, color?: string }[]` | não | 5 faixas: `Muito Baixa` (0.2), `Baixa` (0.4), `Média` (0.6), `Alta` (0.8), `Muito Alta` (1) | Faixas de densidade relativa (0 a 1) usadas tanto para colorir o heatmap quanto para montar a legenda. `color`, se omitido, é resolvido a partir de `colorScheme`. |
| `colorScheme` | ver [Esquemas de cor contínuos](#esquemas-de-cor-contínuos) (inclui variantes invertidas, ex.: `'-schemeSpectral'`) | não | `'-schemeSpectral'` | Paleta usada para colorir os `steps` sem `color` explícito. |
| `circle` | `boolean` | não | `false` | Se `true`, adiciona uma camada de pontos individuais (círculos), visível a partir do zoom 14, enquanto o heatmap permanece visível a partir do zoom 7. |

```js
{
  preset: 'vector_heatmap',
  id: 'ocorrencias_acidentes',
  label: 'Concentração de acidentes de trânsito',
  path: 'Mobilidade / Segurança viária',
  sourceLabel: 'Prefeitura',
  tiles: `${VECTOR_TILE_SERVER_ENDPOINT}/ocorrencias_acidentes/{z}/{x}/{y}`,
  source_layer: 'ocorrencias_acidentes',
  style: {
    weight: 1,
    colorScheme: '-schemeSpectral',
    circle: true,
  },
}
```

---

## `raster_categorical`

Renderiza uma camada **raster** (não vetorial) cujas cores por pixel vêm de um mapa de cores (`colormap`) categórico aplicado pelo próprio tile server a partir de `style.categories`. Não usa `source_layer`.

⚠️ **Atenção:** a fonte é do tipo `raster`, não `vector`.

**`style`**:

| Campo | Tipo | Obrigatório | Default | Descrição |
|---|---|---|---|---|
| `categories` | `{ value: string, label: string, color?: string }[]` | **sim** | — | Lista das classes/valores representados no raster. `color`, se omitido, é resolvido a partir de `colorScheme` (por índice, ou usando `k` quando informado). |
| `colorScheme` | ver [Esquemas de cor categóricos](#esquemas-de-cor-categóricos), mais `'schemeYlOrRd'` como caso especial (esquema sequencial usado como paleta categórica) | não | `'schemeGeoReDUSSafe'` | Paleta usada para colorir categorias sem `color` explícito. |
| `k` | `number` | não | — | Repassado à resolução de cor da categoria; usado apenas junto de esquemas sequenciais tratados como categóricos (ex.: `'schemeYlOrRd'`). |

⚠️ **Importane:** `style` é obrigatório — o preset lança erro se não for informado.

```js
{
  preset: 'raster_categorical',
  id: 'uso_solo_satelite',
  label: 'Uso do solo (classificação por satélite)',
  path: 'Território / Sensoriamento remoto',
  sourceLabel: 'MapBiomas',
  tiles: `${RASTER_TILE_SERVER_ENDPOINT}/uso_solo/{z}/{x}/{y}`,
  style: {
    colorScheme: 'schemeGeoReDUSSafe',
    categories: [
      { value: '1', label: 'Floresta', color: '#1f7a1f' },
      { value: '2', label: 'Agropecuária', color: '#c9a227' },
      { value: '3', label: 'Área urbana', color: '#808080' },
    ],
  },
}
```

---

## Referência de valores compartilhados

### Padrões de preenchimento

`fillPattern` (presets de polígono) aceita: 
  - `'solid'`
  - `'circles_1'`
  - `'cross_1'`
  - `'diamonds_1'`
  - `'lines_1'`
  - `'mosaic_1'`
  - `'mosaic_2'`
  - `'squares_1'`
  - `'triangles_1'`
  - `'waves_1'`

### Esquemas de cor categóricos

`colorScheme` (presets `*_categorical`) aceita: 
  - `'schemeGeoReDUSSafe'` (default, paleta própria do GeoReDUS)
  - `'schemeCategory10'`
  - `'schemeAccent'`
  - `'schemeDark2'`
  - `'schemeObservable10'`
  - `'schemePaired'`
  - `'schemePastel1'`
  - `'schemePastel2'`
  - `'schemeSet1'`
  - `'schemeSet2'`
  - `'schemeSet3'`
  - `'schemeTableau10'`

### Esquemas de cor contínuos

`colorScheme` (presets `*_continuous`) aceita:

- **Sequenciais**: 
  - `'schemeBlues'`
  - `'schemeGreens'`
  - `'schemeGreys'`
  - `'schemeOranges'`
  - `'schemePurples'`
  - `'schemeReds'`
  - `'schemeBuGn'`
  - `'schemeBuPu'`
  - `'schemeGnBu'`
  - `'schemeOrRd'` (default)
  - `'schemePuBuGn'`
  - `'schemePuBu'`
  - `'schemePuRd'`
  - `'schemeRdPu'`
  - `'schemeYlGnBu'`
  - `'schemeYlGn'`
  - `'schemeYlOrBr'`
  - `'schemeYlOrRd'`.
- **Divergentes**:
  - `'schemeBrBG'`
  - `'schemePRGn'`
  - `'schemePiYG'`
  - `'schemePuOr'`
  - `'schemeRdBu'`
  - `'schemeRdGy'`
  - `'schemeRdYlBu'`
  - `'schemeRdYlGn'`
  - `'schemeSpectral'`.
- **Custom**: um array de cores (`string[]`).

> Em [`vector_heatmap`](#vector_heatmap), qualquer um desses esquemas também aceita uma variante invertida, prefixada com `-` (ex.: `'-schemeSpectral'`, `'-schemeBlues'`).

### Tooltip

O campo `tooltip` (no nível raiz do `viewSpecInput`) controla o balão exibido ao passar o mouse sobre uma feature:

```ts
{
  title?: string,   // nome da propriedade usada como título (default: 'name')
  entries?:
    | Array<string | { key: string, label?: string, format?: object }>
    | { [key: string]: { label?: string, format?: object } },
    // se omitido, exibe todas as propriedades da feature (exceto o título)
}
```

### Download

Quando `download_url` é informado, os presets expõem um botão de download que abre um diálogo para o usuário escolher o formato (GeoPackage, GeoJSON ou KML) e converte os dados buscados em `download_url` via `ogr2ogr`/GDAL antes de disparar o download.
