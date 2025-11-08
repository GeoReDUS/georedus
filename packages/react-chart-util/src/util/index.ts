type NumberFmt = [string, Intl.NumberFormatOptions]

type FmtNumberOptions = {
  fmt?: NumberFmt
  prefix?: string
  suffix?: string
}

export function fmtNumber(
  number: number,
  { fmt, prefix, suffix }: FmtNumberOptions,
) {
  const num = fmt
    ? new Intl.NumberFormat(fmt[0], fmt[1]).format(number)
    : new Intl.NumberFormat().format(number)

  return [prefix, num, suffix].filter(Boolean).join('')
}
