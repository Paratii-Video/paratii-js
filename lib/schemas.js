const joi = require('joi')

const accountSchema = joi.object({
  address: joi.string().default(null).allow(null),
  privateKey: joi.string().default(null).allow(null),
  mnemonic: joi.string().default(null).allow(null)
}).default()

const ethSchema = joi.object({
  provider: joi.string().default('ws://localhost:8546'),
  registryAddress: joi.string().default(null).allow(null)
}).default()

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
  'bitswap.maxMessageSize': joi.number().default(256 * 1024)
}).default()

const dbSchema = joi.object({
  provider: joi.string()
}).default()

export { accountSchema, ethSchema, ipfsSchema, dbSchema }
