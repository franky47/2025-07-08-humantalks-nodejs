// require-esm.cts (forcing CJS + TS mode)

const { humanTalks } = require('./top-level-await.mts')

// require(ESM)
const chalk = require('chalk').default

console.log(`Hello, ${chalk.green(humanTalks)}!`)
