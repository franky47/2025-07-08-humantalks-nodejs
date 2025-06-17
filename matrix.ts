#!/usr/bin/env node

import { ArgumentParser } from 'argparse'
import fs from 'fs'
import { dirname } from 'path'
import { fileURLToPath } from 'url'
import ansi from './ansi.ts'
import { env } from './env.ts'

type CharRange =
  | 'ascii'
  | 'binary'
  | 'braille'
  | 'katakana'
  | 'picto'
  | 'emoji'
  | 'file'

type Droplet = {
  column: number
  color: string
  alive: number
  curRow: number
  height: number
  speed: number
  chars: string[]
}

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const npmPackage = JSON.parse(
  fs.readFileSync(`${__dirname}/package.json`, 'utf-8')
)

const argParser = new ArgumentParser({
  description: `The famous Matrix rain effect of falling green characters as a cli command`,
})

;[
  {
    flags: [`-v`, `--version`],
    opts: {
      action: `version`,
      version: npmPackage.version,
    },
  },
  {
    flags: [`-d`, `--direction`],
    opts: {
      choices: [`h`, `v`],
      default: `v`,
      help: `Change direction of rain. h=horizontal, v=vertical.`,
    },
  },
  {
    flags: [`-c`, `--color`],
    opts: {
      choices: [`green`, `red`, `blue`, `yellow`, `magenta`, `cyan`, `white`],
      default: `green`,
      dest: `color`,
      help: `Rain color. NOTE: droplet start is always white.`,
    },
  },
  {
    flags: [`-k`, `--char-range`],
    opts: {
      choices: [`ascii`, `binary`, `braille`, `emoji`, `katakana`, `picto`],
      default: `ascii`,
      dest: `charRange`,
      help: `Use rain characters from char-range.`,
    },
  },
  {
    flags: [`-f`, `--file-path`],
    opts: {
      dest: `filePath`,
      help: `Read characters from a file instead of random characters from char-range.`,
    },
  },
  {
    flags: [`-m`, `--mask-path`],
    opts: {
      dest: `maskPath`,
      help: `Use the specified image to build a mask for the raindrops.`,
    },
  },
  {
    flags: [`-i`, `--invert-mask`],
    opts: {
      action: `store_true`,
      dest: `invertMask`,
      help: `Invert the mask specified with --mask-path.`,
    },
  },
  {
    flags: [`--offset-row`],
    opts: {
      type: `int`,
      default: 0,
      dest: `offsetRow`,
      help: `Move the upper left corner of the mask down n rows.`,
    },
  },
  {
    flags: [`--offset-col`],
    opts: {
      type: `int`,
      default: 0,
      dest: `offsetCol`,
      help: `Move the upper left corner of the mask right n columns.`,
    },
  },
  {
    flags: [`--font-ratio`],
    opts: {
      type: `int`,
      default: 2,
      dest: `fontRatio`,
      help: `ratio between character height over width in the terminal.`,
    },
  },
  {
    flags: [`--print-mask`],
    opts: {
      action: `store_true`,
      dest: `printMask`,
      help: `Print mask and exit.`,
    },
  },
].forEach(({ flags, opts }) => argParser.add_argument(...flags, opts))

// Simple string stream buffer + stdout flush at once
let outBuffer: string[] = []
function write(chars: string) {
  return outBuffer.push(chars)
}

function flush() {
  process.stdout.write(outBuffer.join(``))
  return (outBuffer = [])
}

function rand(start, end) {
  return start + Math.floor(Math.random() * (end - start))
}

class MatrixRain {
  private color: string
  private charRange: CharRange
  private colDroplets: Droplet[][]
  private numCols: number
  private numRows: number
  private fileChars?: string[]
  private filePos: number

  constructor(opts: any) {
    this.color = opts.color
    this.charRange = opts.charRange
    this.colDroplets = []
    this.numCols = 0
    this.numRows = 0
    this.filePos = 0

    if (opts.filePath) {
      this.fileChars = fs.readFileSync(opts.filePath, `utf-8`).trim().split(``)
      this.filePos = 0
      this.charRange = `file`
    }
  }

  generateChars(len: number, charRange: CharRange): string[] {
    // by default charRange == ascii
    let chars = new Array(len)

    if (charRange === `ascii`) {
      for (let i = 0; i < len; i++) {
        chars[i] = String.fromCharCode(rand(0x21, 0x7e))
      }
    } else if (charRange === `binary`) {
      for (let i = 0; i < len; i++) {
        chars[i] = String.fromCharCode(rand(0x30, 0x32))
      }
    } else if (charRange === `braille`) {
      for (let i = 0; i < len; i++) {
        chars[i] = String.fromCharCode(rand(0x2840, 0x28ff))
      }
    } else if (charRange === `katakana`) {
      for (let i = 0; i < len; i++) {
        chars[i] = String.fromCharCode(rand(0x30a0, 0x30ff))
      }
    } else if (charRange === `picto`) {
      for (let i = 0; i < len; i++) {
        chars[i] = String.fromCharCode(rand(0x4e00, 0x9fa5))
      }
    } else if (charRange === `emoji`) {
      // emojis are two character widths, so use a prefix
      const emojiPrefix = String.fromCharCode(0xd83d)
      for (let i = 0; i < len; i++) {
        chars[i] = emojiPrefix + String.fromCharCode(rand(0xde01, 0xde4a))
      }
    } else if (charRange === `file` && this.fileChars) {
      for (let i = 0; i < len; i++, this.filePos++) {
        this.filePos = this.filePos < this.fileChars.length ? this.filePos : 0
        chars[i] = this.fileChars[this.filePos]
      }
    }

    return chars
  }

  makeDroplet(column: number): Droplet {
    const colors = [`red`, `yellow`, `green`, `cyan`, `blue`, `magenta`]
    const numColsPerColor = Math.ceil(this.numCols / colors.length)
    const color = env.RAINBOW
      ? colors[Math.floor(column / numColsPerColor) % colors.length]
      : this.color
    return {
      column,
      color,
      alive: 0,
      curRow: rand(0, this.numRows),
      height: rand(
        Math.round(env.MIN_LENGTH * this.numRows),
        Math.round(env.MAX_LENGTH * this.numRows)
      ),
      speed: rand(env.MIN_SPEED, env.MAX_SPEED),
      chars: this.generateChars(this.numRows, this.charRange),
    }
  }

  public resizeDroplets(): void {
    ;[this.numCols, this.numRows] = process.stdout.getWindowSize()
    // Create droplets per column
    // add/remove droplets to match column size
    if (this.numCols > this.colDroplets.length) {
      for (let col = this.colDroplets.length; col < this.numCols; ++col) {
        // make two droplets per row that start in random positions
        this.colDroplets.push([this.makeDroplet(col), this.makeDroplet(col)])
      }
    } else {
      this.colDroplets.splice(
        this.numCols,
        this.colDroplets.length - this.numCols
      )
    }
  }

  private writeAt(
    row: number,
    col: number,
    str: string,
    color: string = this.color
  ): void {
    if (row < 0 || col < 0 || row >= this.numRows || col >= this.numCols) {
      return
    }
    const pos = ansi.cursorPos(row, col)
    write(`${pos}${color || ``}${str || ``}`)
  }

  renderFrame() {
    for (const droplets of this.colDroplets) {
      for (const droplet of droplets) {
        const { curRow, column: curCol, height, color } = droplet
        droplet.alive++
        const ansiColor =
          ansi.colors[`fg${color.charAt(0).toUpperCase()}${color.slice(1)}`]()
        if (droplet.alive % droplet.speed === 0) {
          this.writeAt(curRow - 1, curCol, droplet.chars[curRow - 1], ansiColor)
          this.writeAt(
            curRow,
            curCol,
            droplet.chars[curRow],
            ansi.colors.fgWhite()
          )
          this.writeAt(curRow - height, curCol, ` `, ansi.colors.fgBlack())
          droplet.curRow++
        }

        if (curRow - height > this.numRows) {
          // reset droplet
          Object.assign(droplet, this.makeDroplet(droplet.column), {
            curRow: 0,
          })
        }
      }
    }

    flush()
  }
}

//// main ////

const args = argParser.parse_args()
const matrixRain = new MatrixRain(args)

function start() {
  if (!process.stdout.isTTY) {
    console.error(`Error: Output is not a text terminal`)
    process.exit(1)
  }
  process.on(`SIGINT`, () => {
    resetScreen()
    process.exit(0)
  })
  process.stdin.setRawMode(true)
  process.stdin.resume()
  process.stdin.setEncoding(`utf8`)
  process.stdin.on(`data`, (data) => {
    const input = data.toString().trim()
    if (
      input === `q` ||
      input === `\u001b` || // esc
      input === `\u0003` // ctrl+c
    ) {
      resetScreen()
      process.exit(0)
    }
  })
  process.stdout.on(`resize`, () => matrixRain.resizeDroplets())

  // clear terminal and use alt buffer
  process.stdin.setRawMode(true)
  write(ansi.useAltBuffer())
  write(ansi.cursorInvisible())
  write(ansi.clearScreen())
  flush()
  matrixRain.resizeDroplets()
  matrixRain.renderFrame()
  setInterval(() => matrixRain.renderFrame(), 16) // 60FPS
}

function resetScreen() {
  write(ansi.cursorVisible())
  write(ansi.clearScreen())
  write(ansi.cursorHome())
  write(ansi.useNormalBuffer())
  flush()
}

start()
