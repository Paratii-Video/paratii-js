
# Contributing

Bug reports and pull requests very much welcomed.

Please make sure test pass before submitting a PR.


The development id done on unix based systems.  



## Installation

Make sure you have a recent version of [node.js](https://nodejs.org/) (7.6 and above) and [yarn](https://yarnpkg.com) package manager.

Installation of dependencies. After cloning the repository run:

    yarn

## Run the tests

To run the test locally use a local blockchain using testrpc, just run:

    yarn testrpc

On a second terminal, run the tests:

    yarn test


# Style

Code should survive Javascript Standard linting:

    yarn lint

# Breakpoints

if you run tests with:

    node debug ./node_modules/truffle/build/cli.bundled.js test

it is possible to use `debugger` statements and inspect the state

# Contribute

Look at the issues https://github.com/Paratii-Video/paratii-lib/issues

Or reach out on Gitter: https://gitter.im/Paratii-Video/paratii-contracts
