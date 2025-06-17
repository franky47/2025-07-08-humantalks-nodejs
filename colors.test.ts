import { describe, it } from 'node:test'
import { applyColor } from './colors.ts'

describe('colors', () => {
  it('renders ansi colors', ({ assert }) => {
    const expected = '\x1b[32mHello\x1b[39m'
    const actual = applyColor('green', 'Hello')
    assert.equal(actual, expected, 'should render green text')
  })
  it('renders ansi background colors', ({ assert }) => {
    const expected = '\x1b[41mHello\x1b[49m'
    const actual = applyColor('bgRed', 'Hello')
    assert.equal(actual, expected, 'should render red background text')
  })
})
