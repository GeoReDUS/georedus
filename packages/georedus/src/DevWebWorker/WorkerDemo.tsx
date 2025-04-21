'use client' // optional for Next.js App Router

import React, { useEffect, useState } from 'react'
import * as Comlink from 'comlink'

type WorkerAPI = {
  double(x: number): number
}

export const WorkerDemo = () => {
  const [result, setResult] = useState<number | null>(null)

  useEffect(() => {
    const worker = new Worker(
      new URL('./math.worker.ts', import.meta.url),
      {
        type: 'module',
      },
    )

    const run = async () => {
      const proxy = Comlink.wrap<WorkerAPI>(worker)
      const value = await proxy.double(21)
      setResult(value)
    }

    run()
    return () => worker.terminate()
  }, [])

  return <div>Result from worker: {result ?? 'Calculating...'}</div>
}
