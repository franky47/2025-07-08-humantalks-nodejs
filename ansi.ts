const ctlEsc = `\x1b[`

export const ansi = {
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
}
