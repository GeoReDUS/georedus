type Dict = Record<any, (string | number) | (string | number)[]>

type MatchExpFromDictProps = {
  valueExp: string | any[]
  dict: Dict
  defaultValue: any
}

//
// Utility function that takes in a dict containing
// target values as keys and criteria as values
// and returns a maplibre match expression.
//
export function matchExpFromDict({
  valueExp,
  dict,
  defaultValue,
}: MatchExpFromDictProps): any[] {
  const matchExp = [
    'match',
    typeof valueExp === 'string' ? ['get', valueExp] : valueExp,
    ...Object.entries(dict).flatMap(([caseValue, caseCriteria]) => [
      caseCriteria,
      caseValue,
    ]),
    defaultValue,
  ]

  return matchExp
}
