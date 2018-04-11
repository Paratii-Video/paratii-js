/* global ArrayBuffer */
// import Protocol from 'paratii-protocol'
import { ipfsSchema, accountSchema } from './schemas.js'
import joi from 'joi'
import { EventEmitter } from 'events'
import { ParatiiIPFSRemote } from './paratii.ipfs.remote.js'
import { ParatiiIPFSLocal } from './paratii.ipfs.local.js'
import { ParatiiTranscoder } from './paratii.transcoder.js'
import { Uploader } from './paratii.ipfs.uploader.old.js'
global.Buffer = global.Buffer || require('buffer').Buffer

/**
 * Contains functions to interact with the IPFS instance.
 * @param {ParatiiIPFSSchema} config configuration object to initialize Paratii object
 */
export class ParatiiIPFS extends EventEmitter {
  /**
  * @typedef {Array} ParatiiIPFSSchema
  * @property {?ipfsSchema} ipfs
  * @property {?accountSchema} account
  * @property {?boolean} verbose
 */
  constructor (config) {
    super()
    const schema = joi.object({
      ipfs: ipfsSchema,
      account: accountSchema,
      verbose: joi.bool().default(true)
    })

    const result = joi.validate(config, schema, {allowUnknown: true})
    if (result.error) throw result.error
    this.config = config
    this.config.ipfs = result.value.ipfs
    this.config.account = result.value.account
    this.config.ipfsInstance = this
    this.local = new ParatiiIPFSLocal(config)
    this.remote = new ParatiiIPFSRemote({ipfs: this.config.ipfs, paratiiIPFS: this})
    this.transcoder = new ParatiiTranscoder({ipfs: this.config.ipfs, paratiiIPFS: this})
    this.uploader = new Uploader({ipfs: this.config.ipfs, paratiiIPFS: this})
  }
  /**
   * log messages on the console if verbose is set
   * @param  {string} msg text to log
   * @example
   * paratii.ipfs.log("some-text")
   */
  log (...msg) {
    if (this.config.verbose) {
      console.log(...msg)
    }
  }
  /**
   * log warns on the console if verbose is set
   * @param  {string} msg warn text
   * @example
   * paratii.ipfs.warn("some-text")
   */
  warn (...msg) {
    if (this.config.verbose) {
      console.warn(...msg)
    }
  }
  /**
  * log errors on the console if verbose is set
  * @param  {string} msg error message
  * @example
  * paratii.ipfs.error("some-text")
  */
  error (...msg) {
    if (this.config.verbose) {
      console.error(...msg)
    }
  }

  /**
   * add a JSON to local IPFS instance, sends a message to paratii.config.ipfs.remoteIPFSNode to pin the mesage
   * @param  {object}  data JSON object to store
   * @return {Promise} resolves in the hash of the added file, after confirmation from the remove node
   * @example let hash = await paratii.ipfs.addAndPinJSON(data)
   */
  async addAndPinJSON (data) {
    let hash = await this.addJSON(data)
    let pinFile = () => {
      let pinEv = this.remote.pinFile(hash,
        { author: this.config.account.address }
      )
      pinEv.on('pin:error', (err) => {
        console.warn('pin:error:', hash, ' : ', err)
        pinEv.removeAllListeners()
      })
      pinEv.on('pin:done', (hash) => {
        this.log('pin:done:', hash)
        pinEv.removeAllListeners()
      })
      return pinEv
    }

    let pinEv = pinFile()

    pinEv.on('pin:error', (err) => {
      console.warn('pin:error:', hash, ' : ', err)
      console.log('trying again')
      pinEv = pinFile()
    })

    return hash
  }
}
