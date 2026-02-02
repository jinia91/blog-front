/**
 * LexoRank - 문자열 기반 정렬 시스템
 * 알파벳 소문자 'a'~'z'를 사용한 26진법 기반 순서 관리
 *
 * 디폴트 값: '' (빈 문자열)
 * - 빈 문자열은 가장 앞에 정렬됨
 * - 새 항목 추가 시 'm'부터 시작
 */

const MIN_CHAR = 'a'
const MAX_CHAR = 'z'
const MID_CHAR = 'm'
const CHAR_CODE_BASE = MIN_CHAR.charCodeAt(0)

/** 기본 sequence 값 */
export const DEFAULT_SEQUENCE = ''

/**
 * 빈 문자열이나 null을 정규화
 */
function normalizeSequence (seq: string | null | undefined): string | null {
  if (seq === null || seq === undefined || seq === '') {
    return null
  }
  return seq
}

/**
 * 두 렉사랭크 값 사이의 중간값을 생성
 * @param prev 이전 항목의 sequence (null/빈문자열이면 맨 앞)
 * @param next 다음 항목의 sequence (null/빈문자열이면 맨 뒤)
 * @returns 새로운 sequence 값
 */
export function generateLexoRank (prev: string | null, next: string | null): string {
  const normalizedPrev = normalizeSequence(prev)
  const normalizedNext = normalizeSequence(next)

  // 둘 다 null/빈값: 중간값 반환
  if (normalizedPrev === null && normalizedNext === null) {
    return MID_CHAR
  }

  // prev만 null: next보다 앞에 오는 값
  if (normalizedPrev === null && normalizedNext !== null) {
    return generateBefore(normalizedNext)
  }

  // next만 null: prev보다 뒤에 오는 값
  if (normalizedPrev !== null && normalizedNext === null) {
    return generateAfter(normalizedPrev)
  }

  // 둘 다 같은 값: 뒤에 중간값 추가
  if (normalizedPrev === normalizedNext) {
    return normalizedPrev + MID_CHAR
  }

  // 둘 다 존재하고 다름: 중간값 생성
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  return generateBetween(normalizedPrev!, normalizedNext!)
}

/**
 * sequence 값 기준으로 정렬하는 비교 함수
 * 빈 문자열은 가장 앞에 정렬됨
 */
export function compareLexoRank (a: string | undefined, b: string | undefined): number {
  const seqA = a ?? ''
  const seqB = b ?? ''
  return seqA.localeCompare(seqB)
}

/**
 * sequence와 id를 포함한 2차 정렬 비교 함수
 * - id가 null인 항목(uncategorized)은 항상 맨 뒤
 * - sequence가 같을 때 id로 정렬하여 안정적인 순서 보장
 */
export function compareBySequenceAndId (
  a: { sequence?: string, id: number | null },
  b: { sequence?: string, id: number | null }
): number {
  // id가 null인 항목(uncategorized)은 항상 맨 뒤
  if (a.id === null && b.id !== null) return 1
  if (a.id !== null && b.id === null) return -1

  const seqA = a.sequence ?? ''
  const seqB = b.sequence ?? ''
  const seqCompare = seqA.localeCompare(seqB)

  // sequence가 다르면 sequence로 정렬
  if (seqCompare !== 0) {
    return seqCompare
  }

  // sequence가 같으면 id로 정렬 (null은 맨 뒤)
  const idA = a.id ?? Number.MAX_SAFE_INTEGER
  const idB = b.id ?? Number.MAX_SAFE_INTEGER
  return idA - idB
}

/**
 * target보다 앞에 오는 값 생성
 */
function generateBefore (target: string): string {
  const firstChar = target.charCodeAt(0)
  if (firstChar > CHAR_CODE_BASE) {
    const midCode = Math.floor((CHAR_CODE_BASE + firstChar) / 2)
    return String.fromCharCode(midCode)
  }

  // 'a'로 시작하면 'a'의 중간값 찾기
  let i = 0
  while (i < target.length && target.charCodeAt(i) === CHAR_CODE_BASE) {
    i++
  }

  if (i === target.length) {
    return target + MID_CHAR
  }

  const midCode = Math.floor((CHAR_CODE_BASE + target.charCodeAt(i)) / 2)
  return target.substring(0, i) + String.fromCharCode(midCode)
}

/**
 * target보다 뒤에 오는 값 생성
 */
function generateAfter (target: string): string {
  const firstChar = target.charCodeAt(0)
  const maxCode = MAX_CHAR.charCodeAt(0)

  if (firstChar < maxCode) {
    const midCode = Math.floor((firstChar + maxCode + 1) / 2)
    return String.fromCharCode(midCode)
  }

  let i = 0
  while (i < target.length && target.charCodeAt(i) === maxCode) {
    i++
  }

  if (i === target.length) {
    return target + MID_CHAR
  }

  const midCode = Math.floor((target.charCodeAt(i) + maxCode + 1) / 2)
  return target.substring(0, i) + String.fromCharCode(midCode)
}

/**
 * prev와 next 사이의 중간값 생성
 */
function generateBetween (prev: string, next: string): string {
  const maxLen = Math.max(prev.length, next.length)
  const prevPadded = prev.padEnd(maxLen, MIN_CHAR)
  const nextPadded = next.padEnd(maxLen, MIN_CHAR)

  let result = ''
  let i = 0

  while (i < maxLen) {
    const prevCode = prevPadded.charCodeAt(i)
    const nextCode = nextPadded.charCodeAt(i)

    if (prevCode === nextCode) {
      result += prevPadded[i]
      i++
      continue
    }

    if (nextCode - prevCode === 1) {
      result += prevPadded[i] + MID_CHAR
      break
    }

    const midCode = Math.floor((prevCode + nextCode) / 2)
    result += String.fromCharCode(midCode)
    break
  }

  if (i === maxLen && result.length === maxLen) {
    result += MID_CHAR
  }

  return result
}
