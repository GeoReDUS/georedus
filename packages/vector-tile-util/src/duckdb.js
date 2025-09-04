import * as duckdb from '@duckdb/duckdb-wasm'

const JSDELIVR_BUNDLES = duckdb.getJsDelivrBundles()

// Select a bundle based on browser checks
const bundle = await duckdb.selectBundle(JSDELIVR_BUNDLES)

const worker_url = URL.createObjectURL(
  new Blob([`importScripts("${bundle.mainWorker}");`], {
    type: 'text/javascript',
  }),
)

// Instantiate the asynchronous version of DuckDB-wasm
const worker = new Worker(worker_url)
const logger = new duckdb.ConsoleLogger()
const db = new duckdb.AsyncDuckDB(logger, worker)
const connPromise = await db
  .instantiate(bundle.mainModule, bundle.pthreadWorker)
  .then(async () => {
    const conn = await db.connect()
    // 3) Load extensions that are INCLUDED in the bundle
    await conn.query(`
      INSTALL spatial; LOAD spatial;
    `)

    return conn
  })

export async function duckQuery(query) {
  await connPromise

  const conn = await db.connect()

  // 2022_tracts_Basico_v0.5.0.parquet
  // 2022_tracts_ResponsavelRenda_v0.5.0.parquet

  const table = await conn.query(query)

  return table.toArray().map((i) => {
    const d = {
      ...i.toJSON(),
      id: i.code_tract + '',
    }

    return d
  })

  // return ['code_']

  console.log('query table', table)
  for (const row of table) {
    console.log(row.toJSON()) // row is { a: 1, b: 2 }
  }
}

// URL.revokeObjectURL(worker_url)
