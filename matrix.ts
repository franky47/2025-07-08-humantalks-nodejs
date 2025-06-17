#!/usr/bin/env node

import { ansi } from './ansi.ts'
import { type AnsiColor, applyColor, rainbowColors } from './colors.ts'
import { env } from './env.ts'

type Droplet = {
  column: number
  color: AnsiColor
  alive: number
  curRow: number
  height: number
  speed: number
  chars: string[]
}

// Simple string stream buffer + stdout flush at once
let outBuffer: string[] = []
function write(chars: string) {
  return outBuffer.push(chars)
}

function flush() {
  process.stdout.write(outBuffer.join(``))
  return (outBuffer = [])
}

function rand(start: number, end: number) {
  return start + Math.floor(Math.random() * (end - start))
}

class MatrixRain {
  private colDroplets: Droplet[][]
  private numCols: number
  private numRows: number

  constructor() {
    this.colDroplets = []
    this.numCols = 0
    this.numRows = 0
  }

  resetDroplets() {
    this.colDroplets = []
  }

  generateChars(len: number): string[] {
    return Array.from({ length: len }, () =>
      String.fromCharCode(rand(0x21, 0x7e))
    )
  }

  makeDroplet(column: number): Droplet {
    const numColsPerColor = Math.ceil(this.numCols / rainbowColors.length)
    const color =
      env.THEME === `rainbow`
        ? rainbowColors[
            Math.floor(column / numColsPerColor) % rainbowColors.length
          ]!
        : env.THEME
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
      chars: this.generateChars(this.numRows),
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
    color: AnsiColor
  ): void {
    if (row < 0 || col < 0 || row >= this.numRows || col >= this.numCols) {
      return
    }
    const pos = ansi.cursorPos(row, col)
    write(`${pos}${applyColor(color, str ?? '')}`)
  }

  renderFrame() {
    for (const droplets of this.colDroplets) {
      for (const droplet of droplets) {
        const { curRow, column: curCol, height, color } = droplet
        droplet.alive++
        if (droplet.alive % droplet.speed === 0) {
          this.writeAt(curRow - 1, curCol, droplet.chars[curRow - 1], color)
          this.writeAt(curRow, curCol, droplet.chars[curRow], 'white')
          this.writeAt(curRow - height, curCol, ` `, 'black')
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

const matrixRain = new MatrixRain()

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
    if (input === `r`) {
      write(ansi.clearScreen())
      flush()
      matrixRain.resetDroplets()
      matrixRain.resizeDroplets()
      matrixRain.renderFrame()
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
