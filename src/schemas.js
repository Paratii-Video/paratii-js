const joi = require('joi')

/**
  * @typedef {Array} accountSchema
  * @property {?string} address
  * @property {?string} privateKey
  * @property {?string} mnemonic
 */
const accountSchema = joi.object({
  address: joi.string().default(null).allow(null),
  privateKey: joi.string().default(null).allow(null),
  mnemonic: joi.string().default(null).allow(null)
}).default()

/**
  * @typedef {Array} ethSchema
  * @property {?string} provider
  * @property {?string} registryAddress
  * @property {?boolean} isTestNet
 */
const ethSchema = joi.object({
  provider: joi.string().default('ws://localhost:8546'),
  registryAddress: joi.string().default(null).allow(null),
  isTestNet: joi.boolean().optional()
}).default()

/**
  * @typedef {Array} ipfsSchema
  * @property {?string} repo
  * @property {?string} registryAddress
  * @property {?boolean} isTestNet
 */
const ipfsSchema = joi.object({
  repo: joi.string().default(null).allow(null),
  // passed to IPFS constructor as `config.Addresses.Swarm`
  swarm: joi
    .array()
    .ordered(
        joi.string().default('/dns4/star.paratii.video/tcp/443/wss/p2p-webrtc-star'),
        joi.string().default('/dns/ws.star.paratii.video/wss/p2p-websocket-star/')
    ),
  bootstrap: joi
    .array()
    .ordered(
        joi.string().default('/dns4/bootstrap.paratii.video/tcp/443/wss/ipfs/QmeUmy6UtuEs91TH6bKnfuU1Yvp63CkZJWm624MjBEBazW')
    ),
  'bitswap.maxMessageSize': joi.number().default(256 * 1024),
  chunkSize: joi.number().default(128 * 1024),
  xhrChunkSize: joi.number().default(1 * 1024 * 1024),
  maxFileSize: joi.number().default(300 * 1024 * 1024),
  defaultTranscoder: joi.string().default('/dns4/bootstrap.paratii.video/tcp/443/wss/ipfs/QmeUmy6UtuEs91TH6bKnfuU1Yvp63CkZJWm624MjBEBazW'),
  transcoderDropUrl: joi.string().default('https://uploader.paratii.video/api/v1/transcode')

}).default()

const dbSchema = joi.object({
  provider: joi.string().default('https://db.paratii.video/api/v1/')
}).default()

// this is the data structure of a video
const videoSchema = joi.object({
  id: joi.string().default(null),
  author: joi.string().empty('').default('').allow(null),
  description: joi.string().empty('').default(''),
  duration: joi.string().empty('').default('').allow(null),
  filename: joi.string().empty('').default('').allow(null).allow(''),
  filesize: joi.any(),
  free: joi.string().empty('').default(null).allow(null),
  ipfsHashOrig: joi.string().empty('').default(''),
  ipfsHash: joi.string().empty('').default(''),
  owner: joi.string().required(),
  price: joi.any().default(0),
  // published: joi.any().default(false).allow(null),
  title: joi.string().empty('').default(''),
  thumbnails: joi.array(),
  storageStatus: joi.object({
    name: joi.string().required(),
    data: joi.object().allow(null)
  }).optional().default({}),
  transcodingStatus: joi.object({
    name: joi.string().required(),
    data: joi.object().allow(null)
  }).allow(null).default({}),
  uploadStatus: joi.object({
    name: joi.string().required(),
    data: joi.object().allow(null)
  }).allow(null).default({})
})

/**
  * @typedef {Array} configSchema
  * @property {?accountSchema} account
  * @property {?object} eth
  * @property {?object} db
  * @property {?Object} ipfs
 */
export { accountSchema, ethSchema, ipfsSchema, dbSchema, videoSchema }
