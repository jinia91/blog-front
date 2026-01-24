'use client'

import { type Command } from '../domain/command'

interface WeatherCondition {
  temp_C: string
  FeelsLikeC: string
  humidity: string
  windspeedKmph: string
  weatherDesc: Array<{ value: string }>
  weatherCode: string
}

interface WeatherDay {
  date: string
  avgtempC: string
  maxtempC: string
  mintempC: string
  astronomy: Array<{ sunrise: string, sunset: string }>
  hourly: Array<{
    weatherCode: string
    weatherDesc: Array<{ value: string }>
  }>
}

interface WeatherData {
  current_condition: WeatherCondition[]
  weather: WeatherDay[]
  nearest_area: Array<{
    areaName: Array<{ value: string }>
    country: Array<{ value: string }>
    latitude: string
    longitude: string
  }>
}

interface AirQualityData {
  current: {
    pm10?: number
    pm2_5?: number
  }
}

// 도시별 좌표
const CITY_COORDS: Record<string, { lat: number, lon: number }> = {
  Seoul: { lat: 37.5665, lon: 126.978 },
  Busan: { lat: 35.1796, lon: 129.0756 },
  Incheon: { lat: 37.4563, lon: 126.7052 },
  Daegu: { lat: 35.8714, lon: 128.6014 },
  Daejeon: { lat: 36.3504, lon: 127.3845 },
  Gwangju: { lat: 35.1595, lon: 126.8526 },
  Ulsan: { lat: 35.5384, lon: 129.3114 },
  Sejong: { lat: 36.4800, lon: 127.2890 },
  Jeju: { lat: 33.4996, lon: 126.5312 }
}

// 날씨 코드를 ASCII 아트로 변환
function getWeatherArt (weatherCode: string): string[] {
  const code = parseInt(weatherCode)

  // 맑음 (113)
  if (code === 113) {
    return [
      '    \\   /    ',
      '     .-.     ',
      '  ― (   ) ―  ',
      '     `-\'     ',
      '    /   \\    '
    ]
  }

  // 부분 흐림 (116)
  if (code === 116) {
    return [
      '   \\  /      ',
      ' _ /"".-.    ',
      '   \\_(   ).  ',
      '   /(___(__) ',
      '             '
    ]
  }

  // 흐림 (119, 122)
  if (code === 119 || code === 122) {
    return [
      '             ',
      '     .--.    ',
      '  .-(    ).  ',
      ' (___.__)__) ',
      '             '
    ]
  }

  // 안개 (143, 248, 260)
  if (code === 143 || code === 248 || code === 260) {
    return [
      '             ',
      ' _ - _ - _ - ',
      '  _ - _ - _  ',
      ' _ - _ - _ - ',
      '             '
    ]
  }

  // 비 (176, 263, 266, 281, 284, 293, 296, 299, 302, 305, 308, 311, 314, 317, 320, 323, 326, 356, 359, 362, 365, 374, 377)
  if ([176, 263, 266, 281, 284, 293, 296, 299, 302, 305, 308, 311, 314, 317, 320, 323, 326, 356, 359, 362, 365, 374, 377].includes(code)) {
    return [
      '     .-.     ',
      '    (   ).   ',
      '   (___(__)  ',
      '  ‚\'‚\'‚\'‚\'   ',
      '  ‚\'‚\'‚\'‚\'   '
    ]
  }

  // 눈 (179, 182, 185, 227, 230, 329, 332, 335, 338, 350, 353, 368, 371)
  if ([179, 182, 185, 227, 230, 329, 332, 335, 338, 350, 353, 368, 371].includes(code)) {
    return [
      '     .-.     ',
      '    (   ).   ',
      '   (___(__)  ',
      '   * * * *   ',
      '  * * * *    '
    ]
  }

  // 천둥번개 (200, 386, 389, 392, 395)
  if ([200, 386, 389, 392, 395].includes(code)) {
    return [
      '     .-.     ',
      '    (   ).   ',
      '   (___(__)  ',
      '  ‚\'⚡‚\'‚\'⚡  ',
      '  ‚\'‚\'‚\'‚\'   '
    ]
  }

  // 기본값
  return [
    '     .-.     ',
    '    (   ).   ',
    '   (___(__)  ',
    '             ',
    '             '
  ]
}

// 날씨 코드를 이모지로 변환
function getWeatherEmoji (weatherCode: string): string {
  const code = parseInt(weatherCode)

  if (code === 113) return '☀️'
  if (code === 116) return '⛅'
  if (code === 119 || code === 122) return '☁️'
  if (code === 143 || code === 248 || code === 260) return '🌫️'
  if ([176, 263, 266, 281, 284, 293, 296, 299, 302, 305, 308, 311, 314, 317, 320, 323, 326, 356, 359, 362, 365, 374, 377].includes(code)) return '🌧️'
  if ([179, 182, 185, 227, 230, 329, 332, 335, 338, 350, 353, 368, 371].includes(code)) return '❄️'
  if ([200, 386, 389, 392, 395].includes(code)) return '⛈️'

  return '🌤️'
}

// 날씨 설명을 한국어로 변환
function translateWeatherDesc (desc: string): string {
  const translations: Record<string, string> = {
    Sunny: '맑음',
    Clear: '맑음',
    'Partly cloudy': '부분 흐림',
    'Partly Cloudy': '부분 흐림',
    Cloudy: '흐림',
    Overcast: '흐림',
    Mist: '안개',
    Fog: '안개',
    'Patchy rain possible': '비 가능성',
    'Patchy rain nearby': '인근 비',
    'Light rain': '약한 비',
    'Moderate rain': '보통 비',
    'Heavy rain': '강한 비',
    'Patchy snow possible': '눈 가능성',
    'Light snow': '약한 눈',
    'Moderate snow': '보통 눈',
    'Heavy snow': '강한 눈',
    'Thundery outbreaks possible': '천둥번개 가능성',
    'Moderate or heavy rain with thunder': '천둥번개를 동반한 비'
  }

  return translations[desc] ?? desc
}

// 요일 변환
function getKoreanDay (dateStr: string): string {
  const date = new Date(dateStr)
  const days = ['일', '월', '화', '수', '목', '금', '토']
  return days[date.getDay()] ?? '?'
}

// 유니코드 문자열 너비 계산 (이모지, 한글은 너비 2)
function getStringWidth (str: string): number {
  let width = 0
  for (const char of str) {
    const code = char.codePointAt(0) ?? 0
    // CJK, 이모지 등은 너비 2
    if (
      (code >= 0x1100 && code <= 0x11FF) || // 한글 자모
      (code >= 0x3000 && code <= 0x9FFF) || // CJK
      (code >= 0xAC00 && code <= 0xD7AF) || // 한글 음절
      (code >= 0x1F300 && code <= 0x1F9FF) // 이모지
    ) {
      width += 2
    } else {
      width += 1
    }
  }
  return width
}

// 유니코드 너비를 고려한 padEnd
function padEndUnicode (str: string, length: number): string {
  const currentWidth = getStringWidth(str)
  const padding = Math.max(0, length - currentWidth)
  return str + ' '.repeat(padding)
}

// 미세먼지 등급 및 이모지 반환
function getAirQualityLevel (value: number, type: 'pm10' | 'pm2_5'): { level: string, emoji: string } {
  if (type === 'pm10') {
    if (value <= 30) return { level: '좋음', emoji: '😊' }
    if (value <= 80) return { level: '보통', emoji: '🙂' }
    if (value <= 150) return { level: '나쁨', emoji: '😷' }
    return { level: '매우나쁨', emoji: '🤢' }
  } else {
    if (value <= 15) return { level: '좋음', emoji: '😊' }
    if (value <= 35) return { level: '보통', emoji: '🙂' }
    if (value <= 75) return { level: '나쁨', emoji: '😷' }
    return { level: '매우나쁨', emoji: '🤢' }
  }
}

// 미세먼지 정보 가져오기
async function fetchAirQuality (lat: number, lon: number): Promise<AirQualityData | null> {
  try {
    const url = `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lat}&longitude=${lon}&current=pm10,pm2_5`
    const response = await fetch(url)

    if (!response.ok) {
      return null
    }

    return await response.json()
  } catch (error) {
    return null
  }
}

export const weatherCommand: Command = {
  name: 'weather',
  description: '한국 날씨를 조회합니다',
  category: 'util',
  usage: 'weather [city]',
  execute: async (setContext, args): Promise<void> => {
    const city = args[0] ?? 'Seoul'

    setContext((prev) => ({
      ...prev,
      view: [...prev.view, `날씨 정보를 가져오는 중... (${city})`]
    }))

    try {
      const response = await fetch(`https://wttr.in/${encodeURIComponent(city)}?format=j1&lang=ko`)

      if (!response.ok) {
        setContext((prev) => ({
          ...prev,
          view: [...prev.view, `오류: 날씨 정보를 가져올 수 없습니다. (HTTP ${response.status})`]
        }))
        return
      }

      const data: WeatherData = await response.json()

      if (data.current_condition.length === 0 || data.weather.length === 0) {
        setContext((prev) => ({
          ...prev,
          view: [...prev.view, '오류: 날씨 데이터가 없습니다.']
        }))
        return
      }

      const current = data.current_condition[0]
      if (current === undefined) return
      const location = data.nearest_area[0]
      const cityName = location?.areaName[0]?.value ?? city

      // ASCII 아트 가져오기
      const weatherArt = getWeatherArt(current.weatherCode)
      const weatherEmoji = getWeatherEmoji(current.weatherCode)
      const weatherDesc = translateWeatherDesc(current.weatherDesc[0]?.value ?? '')

      // 미세먼지 정보 가져오기
      let airQuality: AirQualityData | null = null

      // 1. 도시 이름으로 좌표 찾기
      let coords = CITY_COORDS[city]

      // 2. 없으면 wttr.in 응답의 좌표 사용
      if (coords === undefined && location !== undefined) {
        const lat = parseFloat(location.latitude)
        const lon = parseFloat(location.longitude)
        if (!isNaN(lat) && !isNaN(lon)) {
          coords = { lat, lon }
        }
      }

      // 3. 좌표가 있으면 미세먼지 API 호출
      if (coords !== undefined) {
        airQuality = await fetchAirQuality(coords.lat, coords.lon)
      }

      // 현재 날씨 출력
      const output: string[] = []
      const BOX_WIDTH = 50 // 전체 박스 너비 (│...│ 제외한 내용 너비)

      // 헤더 라인
      const headerText = `${weatherEmoji} ${cityName} 날씨`
      output.push('┌──────────────────────────────────────────────────┐')
      output.push(`│  ${padEndUnicode(headerText, BOX_WIDTH - 2)}│`)
      output.push('├──────────────────────────────────────────────────┤')
      output.push('│                                                  │')

      // ASCII 아트와 날씨 정보 나란히 출력
      const statusLine = `현재: ${weatherDesc}`
      const tempLine = `온도: ${current.temp_C}°C (체감 ${current.FeelsLikeC}°C)`
      const humidityLine = `습도: ${current.humidity}%`
      const windLine = `바람: ${current.windspeedKmph} km/h`

      output.push(`│  ${weatherArt[0]}   ${padEndUnicode(statusLine, 33)}│`)
      output.push(`│  ${weatherArt[1]}   ${padEndUnicode(tempLine, 33)}│`)
      output.push(`│  ${weatherArt[2]}   ${padEndUnicode(humidityLine, 33)}│`)
      output.push(`│  ${weatherArt[3]}   ${padEndUnicode(windLine, 33)}│`)
      output.push(`│  ${weatherArt[4]}                                 │`)
      output.push('│                                                  │')

      // 미세먼지 정보 추가 (있는 경우)
      if (airQuality?.current?.pm10 !== undefined && airQuality?.current?.pm2_5 !== undefined) {
        const pm10 = airQuality.current.pm10
        const pm25 = airQuality.current.pm2_5
        const pm10Info = getAirQualityLevel(pm10, 'pm10')
        const pm25Info = getAirQualityLevel(pm25, 'pm2_5')

        // 미세먼지 섹션 헤더
        output.push('├──────────────────────────────────────────────────┤')
        output.push(`│  ${padEndUnicode('🌫️ 미세먼지', BOX_WIDTH - 2)}│`)
        output.push('├──────────────────────────────────────────────────┤')
        output.push('│                                                  │')

        // 테이블 헤더
        const headerRow = `  ${padEndUnicode('구분', 10)}${padEndUnicode('농도', 14)}${padEndUnicode('등급', 10)}상태  `
        output.push(`│${padEndUnicode(headerRow, BOX_WIDTH)}│`)

        // 구분선
        const divider = '  ──────────────────────────────────────────────  '
        output.push(`│${padEndUnicode(divider, BOX_WIDTH)}│`)

        // PM10 행
        const pm10Row = `  ${padEndUnicode('PM10', 10)}${padEndUnicode(`${Math.round(pm10)} μg/m³`, 14)}${padEndUnicode(pm10Info.level, 10)}${pm10Info.emoji}  `
        output.push(`│${padEndUnicode(pm10Row, BOX_WIDTH)}│`)

        // PM2.5 행
        const pm25Row = `  ${padEndUnicode('PM2.5', 10)}${padEndUnicode(`${Math.round(pm25)} μg/m³`, 14)}${padEndUnicode(pm25Info.level, 10)}${pm25Info.emoji}  `
        output.push(`│${padEndUnicode(pm25Row, BOX_WIDTH)}│`)

        output.push('│                                                  │')
      }
      output.push('├──────────────────────────────────────────────────┤')
      output.push(`│  ${padEndUnicode('📅 3일 예보', BOX_WIDTH - 2)}│`)
      output.push('├──────────────────────────────────────────────────┤')

      // 3일 예보 (세로 목록 형식)
      const forecast = data.weather.slice(0, 3)

      forecast.forEach((day) => {
        const date = new Date(day.date)
        const dayOfWeek = getKoreanDay(day.date)
        const dateStr = `${date.getMonth() + 1}/${date.getDate()}`

        // 대표 날씨 코드 (낮 시간대 12시 기준)
        const noonWeather = day.hourly[4] // 12:00 기준
        const dayWeatherCode = noonWeather?.weatherCode ?? day.hourly[0]?.weatherCode ?? '113'
        const dayEmoji = getWeatherEmoji(dayWeatherCode)

        const forecastLine = `${dayOfWeek} ${dateStr}   ${dayEmoji}   ${day.mintempC}~${day.maxtempC}°C`
        output.push(`│  ${padEndUnicode(forecastLine, BOX_WIDTH - 2)}│`)
      })

      output.push('└──────────────────────────────────────────────────┘')

      setContext((prev) => ({
        ...prev,
        view: prev.view.slice(0, -1).concat(output)
      }))
    } catch (error) {
      setContext((prev) => ({
        ...prev,
        view: [...prev.view.slice(0, -1), `오류: ${error instanceof Error ? error.message : '알 수 없는 오류'}`]
      }))
    }
  }
}
