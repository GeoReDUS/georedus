import { tableVectorSource } from '../util'

export function overture_places_poc({ VECTOR_TILE_SERVER_ENDPOINT }) {
  return {
    collection_id: 'proof_of_concept',
    indicator_id: 'overture_places_poc',
    id: 'overture_places_poc',
    label: 'Pontos de atividade comercial',
    sourceLabel: 'Overture Maps',
    path: 'Infraestrutura e serviços urbanos / 2022 / Atividade comercial',
    metadata: {},
    sources: {
      atividade_comercial: tableVectorSource(
        {
          VECTOR_TILE_SERVER_ENDPOINT,
        },
        'overture_br_places',
        {
          attribution: 'Overture Maps',
          minzoom: 10,
        },
      ),
    },
    layers: {
      atividade_comercial: {
        source: 'atividade_comercial',
        'source-layer': 'overture_br_places.geom',
        filter: ['==', ['get', 'municipio_id'], ['$get', 'app.municipioId']],
        type: 'circle',
        paint: {
          'circle-radius': 2, // small circle size
          'circle-color': '#3E63DD', // red fill
          'circle-opacity': [
            'interpolate',
            ['linear'],
            ['zoom'],
            10,
            0.1,
            16,
            0.4,
          ],
          // 'circle-stroke-width': .5, // no outline
          // 'circle-stroke-color': '#ff0000', // no outline
        },

        // type: 'heatmap',
        // paint: {
        //   // Increase the heatmap weight based on frequency and property magnitude
        //   'heatmap-weight': [
        //     'interpolate',
        //     ['linear'],
        //     ['get', 'mag'],
        //     0,
        //     0,
        //     6,
        //     1,
        //   ],
        //   // Increase the heatmap color weight weight by zoom level
        //   // heatmap-intensity is a multiplier on top of heatmap-weight
        //   'heatmap-intensity': [
        //     'interpolate',
        //     ['linear'],
        //     ['zoom'],
        //     0,
        //     1,
        //     9,
        //     3,
        //   ],
        //   // Color ramp for heatmap.  Domain is 0 (low) to 1 (high).
        //   // Begin color ramp at 0-stop with a 0-transparency color
        //   // to create a blur-like effect.
        //   'heatmap-color': [
        //     'interpolate',
        //     ['linear'],
        //     ['heatmap-density'],
        //     0,
        //     'rgba(33,102,172,0)',
        //     0.2,
        //     'rgb(103,169,207)',
        //     0.4,
        //     'rgb(209,229,240)',
        //     0.6,
        //     'rgb(253,219,199)',
        //     0.8,
        //     'rgb(239,138,98)',
        //     1,
        //     'rgb(178,24,43)',
        //   ],
        //   // Adjust the heatmap radius by zoom level
        //   'heatmap-radius': [
        //     'interpolate',
        //     ['linear'],
        //     ['zoom'],
        //     0,
        //     2,
        //     9,
        //     20,
        //   ],
        // },
      },
    },
  }
}
