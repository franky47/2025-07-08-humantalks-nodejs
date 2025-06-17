export function applyColor(color: AnsiColor, text: string): string {
  const ctlEsc = `\x1b[`
  const colorCode = {
    black: '30',
    red: '31',
    green: '32',
    yellow: '33',
    blue: '34',
    magenta: '35',
    cyan: '36',
    white: '37',
    bgBlack: '40',
    bgRed: '41',
    bgGreen: '42',
    bgYellow: '43',
    bgBlue: '44',
    bgMagenta: '45',
    bgCyan: '46',
    bgWhite: '47',
  }[color]
  const reset = color.startsWith('bg') ? '49' : '39'
  return `${ctlEsc}${colorCode}m${text}${ctlEsc}${reset}m`
}

export type Color =
  | 'black'
  | 'red'
  | 'green'
  | 'yellow'
  | 'blue'
  | 'magenta'
  | 'cyan'
  | 'white'

export type AnsiColor = Color | `bg${Capitalize<Color>}`

export const rainbowColors = [
  'red',
  'yellow',
  'green',
  'cyan',
  'blue',
  'magenta',
] satisfies Color[]
