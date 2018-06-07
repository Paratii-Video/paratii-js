'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
var joi = require('joi');

/**
  * @typedef {Array} userSchema
  * @property {string=} id public address of the user
  * @property {string=} email email of the user
  * @property {string=} ipfsHash ipfsHash for extra data
  * @property {string=} name nicename of the user
 */
var userSchema = joi.object({
  id: joi.string().default(null).required(),
  email: joi.string().email().default(null).allow(null),
  ipfsHash: joi.string().default(null).allow(null),
  name: joi.string().empty('').default(null).allow(null)
}).default();

/**
  * @typedef {Array} accountSchema
  * @property {string=} address public address of the account
  * @property {string=} privateKey private key of the account
  * @property {string=} mnemonic mnemonic that generates private key and address
 */
var accountSchema = joi.object({
  address: joi.string().default(null).allow(null),
  privateKey: joi.string().default(null).allow(null),
  mnemonic: joi.string().default(null).allow(null)
}).default();

/**
  * @typedef {Array} ethSchema
  * @property {string=} provider provider of the parity node
  * @property {string=} registryAddress address of the TCR
  * @property {boolean=} isTestNet true if it's on test net, false otherwise
  * @property {string=} tcrConfigFile path of the config file chosen for the tcr
 */
var ethSchema = joi.object({
  provider: joi.string().default('http://localhost:8545'),
  registryAddress: joi.string().default(null).allow(null),
  tcrConfigFile: joi.string().default('sol-tcr/conf/config.json')
}).default();

/**
 * @typedef {Array} ipfsSchema
 * @property {number} bitswap.maxMessageSize the maximum msg size allowed for paratii-ipfs-bitswap
 * @property {Array=} bootstrap bootstrap nodes that ipfs connects to when it starts
 * @property {number=} chunkSize max size allowed per file chunk
 * @property {string=} defaultTranscoder the default multiaddress of the main paratii-node
 * @property {number=} maxFileSize max size for an original video (default to 300MB)
 * @property {string=} remoteIFPFSNode the default multiaddress of the main paratii-node
 * @property {string=} repo path to the ipfs repo
 * @property {Array=} swarm signaling server for finding ipfs nodes
 * @property {string=} transcoderDropUrl url for the express uploader
 * @property {number=} xhrChunkSize max chunk size for the express uploader
 * @property {Ipfs=} instance a pre-existing IPFS instance.
 * @example {
 *   bitswap.maxMessageSize: 262144
 *   chunkSize : 131072
 *   defaultTranscoder : "/dns4/bootstrap.paratii.video/tcp/443/wss/ipfs/QmeUmy6UtuEs91TH6bKnfuU1Yvp63CkZJWm624MjBEBazW"
 *   maxFileSize : 314572800
 *   remoteIPFSNode : "/dns4/bootstrap.paratii.video/tcp/443/wss/ipfs/QmeUmy6UtuEs91TH6bKnfuU1Yvp63CkZJWm624MjBEBazW"
 *   repo: null
 *   transcoderDropUrl: "https://uploader.paratii.video/api/v1/transcode"
 *   xhrChunkSize: 1048576
 * }
 */
var ipfsSchema = joi.object({
  repo: joi.string().default(null).allow(null),
  // passed to IPFS constructor as `config.Addresses.Swarm`
  swarm: joi.array().ordered(joi.string().default('/dns4/star.paratii.video/tcp/443/wss/p2p-webrtc-star'), joi.string().default('/dns/ws.star.paratii.video/wss/p2p-websocket-star/')),
  bootstrap: joi.array().ordered(joi.string().default('/dns4/bootstrap.paratii.video/tcp/443/wss/ipfs/QmeUmy6UtuEs91TH6bKnfuU1Yvp63CkZJWm624MjBEBazW')),
  chunkSize: joi.number().default(128 * 1024),
  xhrChunkSize: joi.number().default(1 * 1024 * 1024),
  maxFileSize: joi.number().default(800 * 1024 * 1024),
  defaultTranscoder: joi.string().default('/dns4/bootstrap.paratii.video/tcp/443/wss/ipfs/QmeUmy6UtuEs91TH6bKnfuU1Yvp63CkZJWm624MjBEBazW'),
  remoteIPFSNode: joi.string().default('/dns4/bootstrap.paratii.video/tcp/443/wss/ipfs/QmeUmy6UtuEs91TH6bKnfuU1Yvp63CkZJWm624MjBEBazW'),
  transcoderDropUrl: joi.string().default('https://uploader.paratii.video/api/v1/transcode'),
  instance: joi.any().default(null)
}).default();

/**
  * @typedef {Array} dbSchema
  * @property {string} [provider=https://db.paratii.video/api/v1/] provider of the db
 */
var dbSchema = joi.object({
  provider: joi.string().default('https://db.paratii.video/api/v1/')
}).default();

/**
 * @todo some description are still not written
 * @typedef {Array} videoSchema
 * @property {string=} id id of the video
 * @property {string=} author author of the video
 * @property {string=} ownershipProof ownership proof for the video
 * @property {string=} description description of the video
 * @property {string=} duration duration of the video
 * @property {string=} filename filename of the video
 * @property {number} filesize size of the video
 * @property {string=} ipfsHashOrig original ipfs multihash of the video
 * @property {string=} ipfsHash ipfs multihash of the video
 * @property {string} owner owner of the video
 * @property {number=} price price of the video
 * @property {string=} title title of the video
 * @property {Array} thumbnails thumbnails of the video
 * @property {Object=} transcodingStatus
 * @property {string} transcodingStatus.name
 * @property {Object=} transcodingStatus.data
 * @property {Object=} uploadStatus
 * @property {string} uploadStatus.name
 * @property {Object=} uploadStatus.data
 */
var videoSchema = joi.object({
  id: joi.string().default(null),
  author: joi.string().empty('').default('').allow(null),
  ownershipProof: joi.string().empty('').default('').allow(null),
  description: joi.string().empty('').default(''),
  duration: joi.string().empty('').default('').allow(null),
  filename: joi.string().empty('').default('').allow(null).allow(''),
  filesize: [joi.string().allow(''), joi.number()],
  free: joi.string().empty('').default(null).allow(null),
  ipfsHashOrig: joi.string().empty('').default(''),
  ipfsHash: joi.string().empty('').default(''),
  owner: joi.string().required(),
  price: joi.number().default(0),
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
});

exports.accountSchema = accountSchema;
exports.ethSchema = ethSchema;
exports.ipfsSchema = ipfsSchema;
exports.dbSchema = dbSchema;
exports.videoSchema = videoSchema;
exports.userSchema = userSchema;