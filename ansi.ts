const ctlEsc = `\x1b[`

type Color =
  | '30'
  | '31'
  | '32'
  | '33'
  | '34'
  | '35'
  | '36'
  | '37'
  | '40'
  | '41'
  | '42'
  | '43'
  | '44'
  | '45'
  | '46'
  | '47'

const ansi = {
  reset: () => `${ctlEsc}c`,
  clearScreen: () => `${ctlEsc}2J`,
  cursorHome: () => `${ctlEsc}H`,
  cursorPos: (row: number, col: number) => `${ctlEsc}${row};${col}H`,
  cursorVisible: () => `${ctlEsc}?25h`,
  cursorInvisible: () => `${ctlEsc}?25l`,
  useAltBuffer: () => `${ctlEsc}?47h`,
  useNormalBuffer: () => `${ctlEsc}?47l`,
  underline: () => `${ctlEsc}4m`,
  off: () => `${ctlEsc}0m`,
  bold: () => `${ctlEsc}1m`,
  color: (c: Color) => `${ctlEsc}${c};1m`,

  colors: {
    fgRgb: (r: number, g: number, b: number) => `${ctlEsc}38;2;${r};${g};${b}m`,
    bgRgb: (r: number, g: number, b: number) => `${ctlEsc}48;2;${r};${g};${b}m`,
    fgBlack: () => ansi.color(`30`),
    fgRed: () => ansi.color(`31`),
    fgGreen: () => ansi.color(`32`),
    fgYellow: () => ansi.color(`33`),
    fgBlue: () => ansi.color(`34`),
    fgMagenta: () => ansi.color(`35`),
    fgCyan: () => ansi.color(`36`),
    fgWhite: () => ansi.color(`37`),
    bgBlack: () => ansi.color(`40`),
    bgRed: () => ansi.color(`41`),
    bgGreen: () => ansi.color(`42`),
    bgYellow: () => ansi.color(`43`),
    bgBlue: () => ansi.color(`44`),
    bgMagenta: () => ansi.color(`45`),
    bgCyan: () => ansi.color(`46`),
    bgWhite: () => ansi.color(`47`),
  },
}

export default ansi
