import nock from 'nock'
import chai from 'chai'

chai.use(require('chai-as-promised'))
chai.use(require('chai-bignumber')())

let address = '0xCbe4f07b343171ac37055B25a5266f48f6945b7d'
let privateKey = '0x399b141d0cc2b863b2f514ffe53edc6afc9416d5899da4d9bd2350074c38f1c6'

let address1 = '0xa99dBd162ad5E1601E8d8B20703e5A3bA5c00Be7'

// a valid address
let address99 = '0xa99dBd162ad5E1601E8d8B20703e5A3bA5c00Be7'

// an address and privatey key not known in testrpc
let address17 = '0xb8CE9ab6943e0eCED004cDe8e3bBed6568B2Fa01'
let privateKey17 = '0x348ce564d427a3311b6536bbcff9390d69395b06ed6c486954e971d960fe8709'

// an address generated from a seed phrase
let mnemonic23 = 'jelly better achieve collect unaware mountain thought cargo oxygen act hood bridge'
// this is the first HD address generated
let address23 = '0x627ac4c2d731E12fB386BD649114a08ebCc0C33f'

// a voucher code and an amount
let voucherCode11 = 'ZJLUaMqLR1'
let voucherAmount11 = 0.3141 * 10 ** 18
let voucherAmountInitial11 = 2 * 10 ** 18
let hashedVoucherCode11 = '0x182b41b125c1c14efaf188d95b6a7e2074d8b746237fc47b48beb63551d742f9'

const testAccount = {
  address,
  privateKey
}

const testConfig = {
  eth: { provider: 'http://localhost:8545' },
  account: {
    address: address,
    privateKey: privateKey
  }
}

const vidsFixture = [
  {
    id: 'some-id',
    author: 'Steven Spielberg',
    filename: 'test/data/some-file.txt',
    // filesize: '',
    free: null,
    title: 'some Title',
    description: 'A long description',
    // published: false,
    price: 0,
    ipfsData: 'QmTtwZ1sLncFqmcP6YZfB6hJCCau5jgkCgT1GF3n2Qnd4h',
    ipfsHash: '',
    ipfsHashOrig: '',
    duration: '2h 32m',
    storageStatus: {},
    transcodingStatus: {},
    uploadStatus: {},
    owner: address1
        // published: false
  },
  {
    id: 'id-2',
    owner: address1,
    title: 'some title 2',
    description: 'A long description',
    price: 0,
    ipfsData: 'QmUUMpwyWBbJKeNCbwDySXJCay5TBBuur3c59m1ajQufmn',
    ipfsHash: 'some-hash',
    ipfsHashOrig: ''
  },
  {
    id: 'id-3',
    owner: address1,
    title: 'another-title',
    description: 'A long description',
    price: 0,
    ipfsData: 'QmUUMpwyWBbJKeNCbwDySXJCay5TBBuur3c59m1ajQufmn',
    ipfsHash: 'some-hash',
    ipfsHashOrig: ''
  }
]

const searchVidsFixture =
  {
    results: [
      {
        id: 'id-2',
        owner: address,
        title: 'some title 2',
        description: 'A long description',
        price: 0,
        ipfsData: 'QmUUMpwyWBbJKeNCbwDySXJCay5TBBuur3c59m1ajQufmn',
        ipfsHash: 'some-hash',
        ipfsHashOrig: ''
      },
      {
        id: 'id-3',
        owner: address,
        title: 'another-title',
        description: 'A long description',
        price: 0,
        ipfsData: 'QmUUMpwyWBbJKeNCbwDySXJCay5TBBuur3c59m1ajQufmn',
        ipfsHash: 'some-hash',
        ipfsHashOrig: ''
      }
    ],
    query: {owner: address},
    total: 2
  }

const mockDb = function () {
  const vids = vidsFixture
  const search = searchVidsFixture
  nock.cleanAll()
  nock.enableNetConnect()
  nock('https://db.paratii.video')
    .persist()
    .get('/api/v1/videos/some-id')
    .reply(200, vids[0])
    .get('/api/v1/videos/id-2')
    .reply(200, vids[1])
    .get('/api/v1/videos/id-3')
    .reply(200, vids[2])
    .get('/api/v1/videos/?owner=0xCbe4f07b343171ac37055B25a5266f48f6945b7d')
    .reply(200, search)
}

export {
  address,
  address1,
  address17,
  address23,
  address99,
  privateKey,
  privateKey17,
  mnemonic23,
  mockDb,
  vidsFixture,
  searchVidsFixture,
  voucherAmount11,
  voucherAmountInitial11,
  voucherCode11,
  hashedVoucherCode11,
  testConfig,
  testAccount
}
