"use client";

import * as duckdb from "@duckdb/duckdb-wasm";

let dbPromise = null;
let connPromise = null;

function getDb() {
  if (dbPromise) return dbPromise;

  dbPromise = (async () => {
    if (typeof window === "undefined") {
      throw new Error("DuckDB-wasm can only run in the browser");
    }

    const bundles = duckdb.getJsDelivrBundles();
    const bundle = await duckdb.selectBundle(bundles);

    const workerUrl = URL.createObjectURL(
      new Blob([`importScripts("${bundle.mainWorker}");`], {
        type: "text/javascript",
      }),
    );

    const worker = new Worker(workerUrl);
    const logger = new duckdb.ConsoleLogger();
    const db = new duckdb.AsyncDuckDB(logger, worker);

    await db.instantiate(bundle.mainModule, bundle.pthreadWorker);

    // Optional: don’t revoke immediately; can break in some browsers.
    // URL.revokeObjectURL(workerUrl)

    return db;
  })();

  return dbPromise;
}

async function getConn() {
  if (connPromise) return connPromise;

  connPromise = (async () => {
    const db = await getDb();
    const conn = await db.connect();

    // Only if spatial is included in the selected bundle
    await conn.query(`INSTALL spatial; LOAD spatial;`);

    return conn;
  })();

  return connPromise;
}

export async function duckQuery(query) {
  const conn = await getConn();
  const table = await conn.query(query);

  return table.toArray().map((row) => ({
    ...row.toJSON(),
    id: String(row.code_tract),
  }));
}
