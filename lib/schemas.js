const joi = require('joi')

const accountSchema = joi.object({
  address: joi.string().default(null),
  privateKey: joi.string().default(null),
  mnemonic: joi.string().default(null)
}).default()

const ethSchema = joi.object({
  provider: joi.string().default('ws://localhost:8546'),
  registryAddress: joi.string().default(null)
}).default()

const ipfsSchema = joi.object({
  repo: joi.string().default(null),
  AddressesSwarm: joi
    .array()
    .ordered(
        joi.string().default('/dns4/star.paratii.video/tcp/443/wss/p2p-webrtc-star'),
        joi.string().default('/dns/ws.star.paratii.video/wss/p2p-websocket-star/')
    ),
  'config.Bootstrap': joi
    .array()
    .ordered(
        joi.string().default('/dns4/bootstrap.paratii.video/tcp/443/wss/ipfs/QmeUmy6UtuEs91TH6bKnfuU1Yvp63CkZJWm624MjBEBazW')
    ),
  'bitswap.maxMessageSize': joi.number().default(128 * 1024)
}).default()

const dbSchema = joi.object({
  provider: joi.string()
}).default()

export { accountSchema, ethSchema, ipfsSchema, dbSchema }
