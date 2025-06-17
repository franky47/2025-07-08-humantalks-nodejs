import { describe, it } from 'node:test'
import { applyColor } from './colors.ts'

describe('colors', () => {
  it('renders ansi colors', ({ assert }) => {
    const expected = '\x1b[32mHello\x1b[0m'
    const returned = applyColor('green', 'Hello')
    assert.equal(returned, expected, 'should render green text')
  })
  it('renders ansi background colors', ({ assert }) => {
    const expected = '\x1b[41mHello\x1b[0m'
    const returned = applyColor('bgRed', 'Hello')
    assert.equal(returned, expected, 'should render red background text')
  })
})
