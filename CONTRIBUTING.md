
# Contributing

Bug reports and pull requests very much welcomed.

## Prerequisties:

Make sure you have a recent version of [node.js](https://nodejs.org/) (8.10 and above) and [yarn](https://yarnpkg.com) package manager.

* nodejs >= 9.1.0 ([nodejs.org](https://nodejs.org/))
* [yarn](https://yarnpkg.com/lang/en/docs/install/)
* Install [parity](https://github.com/paritytech/parity) (ethereum client):
    * ```$ bash <(curl https://get.parity.io -Lk)```

If you are on a Mac, you may need to set the path to parity:

    * add the following line to your `.bash_profile`:
      `export PATH=/Applications/Parity\ Ethereum.app/Contents/MacOS:$PATH`
    * ``` $ source path/to/.bash_profile```

## Installation

    $ git clone https://github.com/Paratii-Video/paratii-js
    $ cd paratii-js
    $ yarn install

## Running tests

The package comes bundled with the `parity` ethereum client.
To run the test locally, first  run:

    $ yarn parity

In a second terminal, you can now run the tests:

    $ yarn test

## Style

Code should survive Javascript Standard linting:

    $ yarn lint

# Contribute

Look at the issues https://github.com/Paratii-Video/paratii-js/issues

Or reach out on Gitter: https://gitter.im/Paratii-Video/dev

# Deploying

Run the following commands:

  ```
  $ git checkout master && git pull
  $ yarn version --new-version <patch|minor|major>
  $ git push --follow-tags
  ```
This will tell `CircleCI` to build and then publish a new version `x.x.x` to the `npm` registry

# Generating documentation

  ```
  $ yarn docs
  ```
