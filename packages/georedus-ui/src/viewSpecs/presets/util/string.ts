const LOWERCASE_WORDS = new Set([
  'de',
  'da',
  'do',
  'das',
  'dos',
  'e',
  'a',
  'o',
  'as',
  'os',
  'em',
  'no',
  'na',
  'nos',
  'nas',
  'por',
  'para',
  'com',
  'sem',
])

export function humanize(str: string) {
  if (typeof str === 'undefined' || str === null) return ''

  return (str + '')
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/[-_]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase()
    .replace(/(^\S+|\s\S+)/g, (match, _, offset) => {
      const word = match.trim()
      const isFirst = offset === 0
      return isFirst || !LOWERCASE_WORDS.has(word)
        ? match.replace(word[0], word[0].toUpperCase())
        : match
    })
}
