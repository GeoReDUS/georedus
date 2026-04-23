## Estilizando Camadas

Para estilizar camadas do na plataforma da GeoReDUS nós usamos os parâmetros da bibliteca do [MapLibre](https://maplibre.org/maplibre-style-spec/layers/) na [tabela de Cadastro](https://docs.google.com/spreadsheets/d/1Y2Pt8fXzhGUA_Nhwz7vOyEZUKi6FEP71DChfYBSTa7U/edit?gid=1006885047#gid=1006885047)

Nesta tabela existem 4 campos de estilização:

- color
- fill
- fill_pattern
- line

### Color

Temos uma padronização de paleta de cores de acordo com o tipo de dado. Para preencher o campo `color` deve-se usar o padrão nomeDaPaleta.colors.index

- **Dados Categóricos**

  Usamos a paleta [schemePaired](https://d3js.org/d3-scale-chromatic/categorical#schemePaired) da biblioteca D3. É possível também ver a aplicação dessa paleta no [colorBrewer](https://colorbrewer2.org/#type=qualitative&scheme=Paired&n=12).

  Assim para preencher o campo colors para dados categóricos siga a tabela abaixo

  | visualização                                              | hexadecimal | código                   |
  | --------------------------------------------------------- | ----------- | ------------------------ |
  | <img src="docs/assets/color_imgs/a6cee3.png" width="40"/> | `#a6cee3`   | `schemePaired.colors.0`  |
  | <img src="docs/assets/color_imgs/1f78b4.png" width="40"/> | `#1f78b4`   | `schemePaired.colors.1`  |
  | <img src="docs/assets/color_imgs/b2df8a.png" width="40"/> | `#b2df8a`   | `schemePaired.colors.2`  |
  | <img src="docs/assets/color_imgs/33a02c.png" width="40"/> | `#33a02c`   | `schemePaired.colors.3`  |
  | <img src="docs/assets/color_imgs/fb9a99.png" width="40"/> | `#fb9a99`   | `schemePaired.colors.4`  |
  | <img src="docs/assets/color_imgs/e31a1c.png" width="40"/> | `#e31a1c`   | `schemePaired.colors.5`  |
  | <img src="docs/assets/color_imgs/fdbf6f.png" width="40"/> | `#fdbf6f`   | `schemePaired.colors.6`  |
  | <img src="docs/assets/color_imgs/ff7f00.png" width="40"/> | `#ff7f00`   | `schemePaired.colors.7`  |
  | <img src="docs/assets/color_imgs/cab2d6.png" width="40"/> | `#cab2d6`   | `schemePaired.colors.8`  |
  | <img src="docs/assets/color_imgs/6a3d9a.png" width="40"/> | `#6a3d9a`   | `schemePaired.colors.9`  |
  | <img src="docs/assets/color_imgs/ffff99.png" width="40"/> | `#ffff99`   | `schemePaired.colors.10` |
  | <img src="docs/assets/color_imgs/b15928.png" width="40"/> | `#b15928`   | `schemePaired.colors.11` |

### Fill

É possível customizar como será preenchida a camada, no caso de poligonos usando a coluna `fill` com a inserção de um `json`. Para isso siga os parâmetros da bibliteca [MapLibre](https://maplibre.org/maplibre-style-spec/layers/#fill).

No exemplo abaixo ele preenche zona urbana com a cor `#808080`, zona rural com a cor `#8B4513` e caso não se encaixe em nenhuma das duas categorias, preenche com a cor `#ff0000`.

```json
{
    "layout": {
        "visibility": "none"
    },
    "paint": {
        "fill-opacity": 0.4,
        "fill-color": [
            "match",
            ["get", "layer"],
            "Zona Urbana",
            "#808080",
            "Zona Rural",
            "#8B4513",
            "#ff0000"
        ]
    }
}
```

### Fill_pattern

É possível inserir hashuras na coluna `fill_pattern`, para isto basta inserir o nome de uma hachura existente no projeto, são elas:
| visualização | nome hachura |
|--------------|--------------|
| <img src="docs/assets/hash_imgs/squares_1.png" width="40"/> | `squares_1` |
| <img src="docs/assets/hash_imgs/triangles_1.png" width="40"/> | `triangles_1` |
| <img src="docs/assets/hash_imgs/diamonds_1.png" width="40"/> | `diamonds_1` |
| <img src="docs/assets/hash_imgs/cross_1.png" width="40"/> | `cross_1` |
| <img src="docs/assets/hash_imgs/mosaic_1.png" width="40"/> | `mosaic_1` |
| <img src="docs/assets/hash_imgs/herringbone_8.png" width="40"/> | `mosaic_2` |
| <img src="docs/assets/hash_imgs/waves_1.png" width="40"/> | `waves_1` |
| <img src="docs/assets/hash_imgs/circles_1.png" width="40"/> | `circles_1` |
| <img src="docs/assets/hash_imgs/lines_1.png" width="40"/> | `lines_1` |

Todas as hachuras foram extraídas de [Pattern Monster](https://pattern.monster/). Para inserir novas hachuras, será necerrário importar o svg e inseri-lo em `svgPatterns` seguindo o padrão de código dos demais.

### Line

Para customizar uma linha, é muito parecido com a customização de um preenchimento (`fill`). Siga os parâmetros da bibliteca [MapLibre](https://maplibre.org/maplibre-style-spec/layers/#line), dentro de um `json`.

No exemplo abaixo estamos definindo o preenchimento e espaçamento de uma linha tracejada, bem como sua espessura:

```json
{
    "paint": {
        "line-color": "#9f846a",
        "line-width": 5,
        "line-dasharray": [2, 4],
        "visible": "none"
    }
}
```
