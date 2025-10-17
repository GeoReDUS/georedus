"use client";

import React, { useEffect, useState } from "react";
// import { ThemeProvider } from "styled-components";
//
import {
  AssistantRuntimeProvider,
  useAssistantInstructions,
  useAssistantTool,
} from "@assistant-ui/react";
import {
  useChatRuntime,
  AssistantChatTransport,
} from "@assistant-ui/react-ai-sdk";
import { AssistantModal } from "@/components/assistant-ui/assistant-modal";

import queryString from "query-string";

import Map, { Layer, Source } from "react-map-gl/maplibre";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import memoize from "memoizee";

// import { useControl } from "react-map-gl/maplibre";
// import "@maplibre/maplibre-gl-inspect/dist/maplibre-gl-inspect.css";
import { dataMergeProtocol, makeMemoFetch } from "@orioro/vector-tile-util";

// import { uniq } from "lodash-es";
import { duckQuery } from "./duckdb";
import { z } from "zod";
import { PROMPT } from "./prompt";
import memoizee from "memoizee";
import { ducktilesProtocolHandler } from "./ducktiles";

const MAP_STYLE = `https://api.maptiler.com/maps/streets/style.json?key=${process.env.NEXT_PUBLIC_MAP_TILER_API_KEY}`;

const { protocolHandler, memoFetchData } = dataMergeProtocol({
  memoFetchData: memoizee(async (query) => {
    // return []

    const result = await duckQuery(atob(query));

    return result;
  }),
});

// maplibregl.addProtocol("ducktiles", protocolHandler);
maplibregl.addProtocol("ducktiles", ducktilesProtocolHandler);

function _searchParams(params) {
  return queryString.stringify(
    //
    // By default, stringify non primitive values using
    // JSON.stringify before passing on to queryString,
    // AS by default queryString ignores non-primitive values.
    //
    // This still allows for ducktiles formatting, throgh the array
    // searchParams input, w/ second arg AS options passed
    // to queryString
    //
    Object.fromEntries(
      Object.entries(params).map(([key, value]) => [
        key,
        typeof value === "object" && value !== null
          ? JSON.stringify(value)
          : value,
      ]),
    ),
  );
}

///////////////////
// Salvador data //
///////////////////

const SALVADOR_UF_CODE = "29";
const SALVADOR_MUN_CODE = "2927408";

const SALVADOR_BOUNDS = [
  -38.9, // min longitude (west)
  -13.125, // min latitude  (south)
  -38.1, // max longitude (east)
  -12.65, // max latitude  (north)
];

const SALVADOR_CENTER = {
  latitude: -12.9777,
  longitude: -38.5016,
};

const SALVADOR_CONFIG = {
  ufCode: SALVADOR_UF_CODE,
  munCode: SALVADOR_MUN_CODE,
  bounds: SALVADOR_BOUNDS,
  center: SALVADOR_CENTER,
};

////////////////////
// São Paulo data //
////////////////////

const SP_UF_CODE = "35";
const SP_MUN_CODE = "3550308";

const SP_BOUNDS = [
  -46.8256, // min longitude (west)
  -24.0086, // min latitude  (south)
  -46.3656, // max longitude (east)
  -23.3567, // max latitude  (north)
];

const SP_CENTER = {
  longitude: -46.6333,
  latitude: -23.5505,
};

const SP_CONFIG = {
  ufCode: SP_UF_CODE,
  munCode: SP_MUN_CODE,
  bounds: SP_BOUNDS,
  center: SP_CENTER,
};

//////////////////
// APPLIED DATA //
//////////////////

const FINAL_CONFIG = SALVADOR_CONFIG;
// const FINAL_CONFIG = SP_CONFIG;

// const MAP_BOUNDS = SALVADOR_BOUNDS;

const QUERY_PRESETS = {};
QUERY_PRESETS.idade = `SELECT
  b.code_tract AS code_tract,
  (
    (
      p.demografia_V01013 + -- Sexo masculino, 20 a 24 anos
      p.demografia_V01014 + -- Sexo masculino, 25 a 29 anos
      p.demografia_V01015 + -- Sexo masculino, 30 a 39 anos
      p.demografia_V01024 + -- Sexo feminino, 20 a 24 anos
      p.demografia_V01025 + -- Sexo feminino, 25 a 29 anos
      p.demografia_V01026   -- Sexo feminino, 30 a 39 anos
    )
    /
    b.V0001 -- Total de pessoas
  ) AS map_color_value
FROM
  'http://localhost:3000/censo/2022_tracts_Basico_v0.5.0.parquet' AS b
JOIN
  'http://localhost:3000/censo/2022_tracts_Pessoas_v0.5.0.parquet' AS p
ON b.code_tract = p.code_tract
WHERE b.code_muni = ${FINAL_CONFIG.munCode};`;

QUERY_PRESETS.idade2 = `SELECT
  b.code_tract AS code_tract,
  (
    (
      p.demografia_V01010 + -- Sexo masculino, 5 a 9 anos
      p.demografia_V01011 + -- Sexo masculino, 10 a 14 anos
      p.demografia_V01021 + -- Sexo feminino, 5 a 9 anos
      p.demografia_V01022   -- Sexo feminino, 10 a 14 anos
    )::DOUBLE
    /
    b.V0001                 -- Total de pessoas
  ) AS map_color_value
FROM
  'http://localhost:3000/censo/2022_tracts_Basico_v0.5.0.parquet'   AS b
JOIN
  'http://localhost:3000/censo/2022_tracts_Pessoas_v0.5.0.parquet'  AS p
ON b.code_tract = p.code_tract
WHERE b.code_muni = ${FINAL_CONFIG.munCode};`;

QUERY_PRESETS.densidade = `WITH base AS (
  SELECT
    m.code_tract,
    m.geom,
    b.V0001 AS hab, -- total de pessoas
    (b.V0001 / ST_Area(m.geom)) AS hab_km2
  FROM
    'http://localhost:3000/censo/${FINAL_CONFIG.ufCode}census_tract_2020_simplified.parquet' AS m
  JOIN
    'http://localhost:3000/censo/2022_tracts_Basico_v0.5.0.parquet' AS b
  ON m.code_tract = b.code_tract
  WHERE m.code_muni = ${FINAL_CONFIG.munCode}
)
SELECT
  *,
  NTILE(5) OVER (ORDER BY hab_km2)::INT AS map_color_value
FROM base;`;

QUERY_PRESETS.google_sheets = `
  SELECT
    m.code_tract,
    m.geom,
    g.valor_teste_1::INT AS map_color_value
  FROM
    'http://localhost:3000/censo/${FINAL_CONFIG.ufCode}census_tract_2020_simplified.parquet'
    AS m
  JOIN
    read_csv(
      'https://docs.google.com/spreadsheets/d/e/2PACX-1vSYNpj0ZG30ghpkrssr4uUUMh0G9JnbTusqH6CEE4kkZwROFJ7sni9PN6Jt9AqkQO6yODAgAR7uY2Pv/pub?gid=1681333778&single=true&output=csv',
      header = true,
      delim = ',',
      columns = {'cod_setor': 'VARCHAR', 'valor_teste_1': 'DOUBLE', 'valor_teste_2': 'DOUBLE'}
    )
    AS g
  ON m.code_tract = g.cod_setor
  WHERE m.code_muni = ${FINAL_CONFIG.munCode}
`;

function ViewDuckDbSQLMapTool({ setSqlQuery }) {
  useAssistantInstructions(PROMPT(FINAL_CONFIG));

  useAssistantTool({
    toolName: "viewDuckDbSQLMap",
    description: "Ver mapa usando SQL",
    parameters: z.object({
      sqlQuery: z.string("SQL para geração de mapa coroplético"),
    }),
    execute: async ({ sqlQuery }) => {
      setSqlQuery(sqlQuery);
      console.log("viewDuckDbSQLMap ran with query", sqlQuery);
      //
    },
    // Re-register when data source changes
    enabled: true,
  });

  return null;
}

export default function Page() {
  const runtime = useChatRuntime({
    transport: new AssistantChatTransport({
      api: "/api/chat",
    }),
  });

  const [liveSqlQuery, setLiveSqlQuery] = useState(QUERY_PRESETS.idade2);

  const [appliedSqlQuery, setAppliedSqlQuery] = useState(liveSqlQuery);

  const year = "2022";
  // const cd_mun = "3550308";
  const cd_mun = FINAL_CONFIG.munCode;
  // const variable_id = 'V0001'

  const buildingsTileUrl = `https://staging-geo-vector-tile-server-de3cacd0424b.herokuapp.com/dvt/{z}/{x}/{y}?${_searchParams(
    {
      view: "overture_br_buildings",
      select: [`setor_${year}_id`],
      where: {
        municipio_id: [cd_mun],
      },
    },
  )}`;

  const sectorsTileUrl = `https://staging-geo-vector-tile-server-de3cacd0424b.herokuapp.com/dvt/{z}/{x}/{y}?${_searchParams(
    {
      select: ["cd_setor"],
      view: `ibge_malha_br_setor_censitario_${year}`,
      where: {
        cd_mun: [cd_mun],
      },
    },
  )}`;

  const dataUrl = btoa(appliedSqlQuery);

  const [colorScale, setColorScale] = useState(null);

  useEffect(() => {
    (async () => {
      const data = await memoFetchData(dataUrl);

      const values = data.map((entry) => entry.map_color_value);
      const nonEmptyValues = values.filter(
        (v) => typeof v === "number" && !Number.isNaN(v),
      );

      const min = Math.min(...nonEmptyValues);
      const max = Math.max(...nonEmptyValues);
      // console.log('values', { min, max }, values, nonEmptyValues)

      // Build MapLibre 'fill-color' expression
      const fillColorExpr = [
        "case",
        ["has", "map_color_value"],
        [
          "interpolate",
          ["linear"],
          ["get", "map_color_value"],
          min,
          "skyblue",
          max,
          "red",
        ],
        "#efefef",
      ];

      setColorScale(fillColorExpr);
    })();
  }, [dataUrl]);

  return (
    <AssistantRuntimeProvider runtime={runtime}>
      <Map
        initialViewState={{
          // longitude: -46.6333,
          // latitude: -23.5505,
          ...FINAL_CONFIG.center,
          zoom: 12,
        }}
        style={{ width: "100vw", height: "100vh" }}
        mapStyle={MAP_STYLE}
      >
        <Source
          type="vector"
          tiles={[
            `ducktiles://{t:'${sectorsTileUrl}',d:[['cd_setor:code_tract', '${dataUrl}']]}`,
          ]}
          bounds={FINAL_CONFIG.bounds}
          minzoom={8}
          maxzoom={13}
        >
          <Layer
            type="fill"
            source-layer="dvt"
            paint={{
              "fill-color": colorScale || "#efefef",
              // 'fill-opacity': 1,
              "fill-opacity": [
                "step",
                ["zoom"],
                0.8, // default (zoom < 14)
                14,
                0.2, // at zoom ≥ 14
              ],
            }}
          />
        </Source>
        <Source
          type="vector"
          tiles={[
            `ducktiles://{t:'${buildingsTileUrl}',d:[['setor_${year}_id:code_tract', '${dataUrl}']]}`,
          ]}
          bounds={FINAL_CONFIG.bounds}
          minzoom={14}
          maxzoom={14}
        >
          <Layer
            type="fill"
            source-layer="dvt"
            paint={{
              "fill-color": colorScale || "#efefef",
              "fill-opacity": 1,
            }}
          />
        </Source>
      </Map>
      <AssistantModal />
      <ViewDuckDbSQLMapTool
        setSqlQuery={(query) => {
          setAppliedSqlQuery(query);
          setLiveSqlQuery(query);
        }}
      />

      <form
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          position: "fixed",
          bottom: 10,
          left: 10,
          width: "calc(100% - 20px)",
          maxWidth: 600,
          boxSizing: "border-box",
        }}
        onSubmit={(e) => {
          e.preventDefault();

          setAppliedSqlQuery(liveSqlQuery);
        }}
      >
        <select
          style={{
            marginBottom: 10,
          }}
          onChange={(e) => {
            setLiveSqlQuery(e.target.value);
          }}
        >
          <option>---</option>
          {Object.entries(QUERY_PRESETS).map(([key, value]) => (
            <option value={value}>{key}</option>
          ))}
        </select>
        <textarea
          style={{
            height: 300,
            width: "100%",
            boxSizing: "border-box",
            padding: 10,
            color: "white",
            background: "black",
            marginBottom: 10,
            fontFamily: "monospace",
          }}
          value={liveSqlQuery}
          onChange={(e) => {
            setLiveSqlQuery(e.target.value);
          }}
        />
        <button type="submit">Aplicar</button>
      </form>
    </AssistantRuntimeProvider>
  );
}
