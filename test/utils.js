var chai = require('chai')
var chaiAsPromised = require('chai-as-promised')

chai.use(chaiAsPromised)

let address = '0x9e2d04eef5b16CFfB4328Ddd027B55736407B275'
let privateKey = '399b141d0cc2b863b2f514ffe53edc6afc9416d5899da4d9bd2350074c38f1c6'

let address1 = '0xa99dBd162ad5E1601E8d8B20703e5A3bA5c00Be7'

// a valid address
let address99 = '0xa99dBd162ad5E1601E8d8B20703e5A3bA5c00Be7'

// an address and privatey key not known in testrpc
let address17 = '0xb8CE9ab6943e0eCED004cDe8e3bBed6568B2Fa01'
let privateKey17 = '0x348ce564d427a3311b6536bbcff9390d69395b06ed6c486954e971d960fe8709'

// an address generated from a seed phrase
let mnemonic23 = 'jelly better achieve collect unaware mountain thought cargo oxygen act hood bridge'
// this is the first HD address generated
let address23 = '0x9e2d04eef5b16CFfB4328Ddd027B55736407B275'

// auth testing
let challenge1 = 'd2aa70afd1d9ba25104bfb2193493ccf'
let signedMessage3 = '0x8fbfd66142afe511247398d752cd419a09d0cf04fe11f3e5eff507fd7f2b815e73740f4218ec676e749836057afc3b4c3261b614513d1b5cdd987d2944f2beb11c'

export { address, address1, address99, privateKey, address17, privateKey17, mnemonic23, address23, challenge1, signedMessage3 }
