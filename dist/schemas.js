'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
var joi = require('joi');

var accountSchema = joi.object({
  address: joi.string().default(null).allow(null),
  privateKey: joi.string().default(null).allow(null),
  mnemonic: joi.string().default(null).allow(null)
}).default();

var ethSchema = joi.object({
  provider: joi.string().default('ws://localhost:8546'),
  registryAddress: joi.string().default(null).allow(null)
}).default();

var ipfsSchema = joi.object({
  repo: joi.string().default(null),
  AddressesSwarm: joi.array().ordered(joi.string().default('/dns4/star.paratii.video/tcp/443/wss/p2p-webrtc-star'), joi.string().default('/dns/ws.star.paratii.video/wss/p2p-websocket-star/')),
  'config.Bootstrap': joi.array().ordered(joi.string().default('/dns4/bootstrap.paratii.video/tcp/443/wss/ipfs/QmeUmy6UtuEs91TH6bKnfuU1Yvp63CkZJWm624MjBEBazW')),
  'bitswap.maxMessageSize': joi.number().default(128 * 1024)
}).default();

var dbSchema = joi.object({
  provider: joi.string()
}).default();

exports.accountSchema = accountSchema;
exports.ethSchema = ethSchema;
exports.ipfsSchema = ipfsSchema;
exports.dbSchema = dbSchema;