# Presets

Presets são funções prontas que geram uma **view** completa (fontes e camadas MapLibre GL, legendas, tooltip e download) a partir de uma configuração declarativa (`style`).

## Uso geral

Todos os presets têm a mesma assinatura:

```ts
preset(viewSpecInput, allViewSpecs, context) => ViewSpec
```

- **`viewSpecInput`**: objeto de configuração da view. Contém os campos base (`id`, `path`, `label`, `tiles`, `source_layer`, `download_url`, etc.) mais o campo `style`, cujo formato é específico de cada preset.
- **`allViewSpecs`**: array com os demais `viewSpecInput` do mesmo lote (disponibilizado para os presets, mas não usado diretamente pela maioria deles).
- **`context`**: `{ METADATA_API_ENDPOINT, VECTOR_TILE_SERVER_ENDPOINT, app: { municipioId, ... } }`, usado para resolver URLs de tiles e de dados de metadata/download.

### Placeholders em URLs

Os campos que aceitam URLs como template (`tiles`, `download_url`, o `values` dos presets contínuos e o `categories` dos presets categóricos) podem conter os seguintes placeholders `${...}`, resolvidos a partir do `context`:

- `${VECTOR_TILE_SERVER_ENDPOINT}` / `${METADATA_API_ENDPOINT}` — endpoints estáticos da aplicação (tile server e API de metadata/dados), não mudam durante a sessão.
- `${app.municipioId}` — código IBGE do **município atualmente selecionado** na interface (corresponde à coluna `cd_mun` das views PostgREST). Permite escopar os dados/quebras a uma cidade, ex.: `&cd_mun=eq.${app.municipioId}`. Como a view é reprocessada quando o município muda, os dados/quebras são recalculados para cada cidade.

O namespace `app.*` reúne o estado de aplicação — valores que mudam durante a sessão do usuário (município selecionado, e outros que venham a ser padronizados no futuro) — em contraste com os endpoints acima, que são configuração estática do deployment.

Todo campo de URL deve ser resolvido com o helper `parseUrl`/`parseTiles` (`viewSpecs/presets/util/url.ts`), que repassa o `context` inteiro para o `interpolate()` do `@orioro/util`. Isso significa que qualquer novo valor adicionado a `context.app` fica automaticamente disponível como `${app.novoValor}` em todos os presets, sem precisar alterar cada preset individualmente:

```js
import { parseUrl } from '../util'

// dentro de um resolver de metadata/download:
parseUrl(style.values, context) // resolve ${METADATA_API_ENDPOINT}, ${app.municipioId}, etc.
```

Exemplo de uso em `style.values`/`style.categories`:

```js
{
  style: {
    valueKey: 'renda_media',
    // `&cd_mun=eq.${app.municipioId}` restringe os dados ao município selecionado
    values: `${METADATA_API_ENDPOINT}/censo_2022_renda?select=value&cd_mun=eq.${app.municipioId}`,
  },
}
```
