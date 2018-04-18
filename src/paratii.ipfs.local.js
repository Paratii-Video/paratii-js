/* global File, ArrayBuffer */
'use strict'

import { EventEmitter } from 'events'
const pull = require('pull-stream')
const pullFilereader = require('pull-filereader')
const toPull = require('stream-to-pull-stream')
const fs = require('fs')
const path = require('path')
const { eachSeries, nextTick } = require('async')
const once = require('once')

/**
 * Contains functions to interact with the local IPFS node
 * @extends EventEmitter
 */
export class ParatiiIPFSLocal extends EventEmitter {
  constructor (config) {
    super()
    this.config = config
    this._ipfs = this.config.ipfsInstance
  }

  /**
   * upload an Array of files to the local IPFS node
   * @param  {Array} files    HTML5 File Object Array.
   * @return {EventEmitter} returns EventEmitter with the following events:
   *    - `start`: uploader started.
   *    - `progress (chunkLength, progressPercent)`
   *    - `local:fileReady (file)` triggered when a file is uploaded locally.
   *    - `done (files)` triggered when the uploader is done locally.
   *    - `error (err)` triggered whenever an error occurs.
   * @example paratii.ipfs.local.upload('path/to/file')
   * @example paratii.ipfs.local.upload(['path/to/file', 'path/to/file2'])
   * @example paratii.ipfs.local.upload([file1])
   */
  add (file) {
    let emitter = new EventEmitter()
    let files
    if (Array.isArray(file)) {
      files = file
    } else {
      files = [file]
    }

    let result = []
    for (let i = 0; i < files.length; i++) {
      // check if File is actually available or not.
      // if not it means we're not in the browser land.
      if (typeof File !== 'undefined') {
        if (files[i] instanceof File) {
          result.push(this.html5FileToPull(files[i]))
        } else {
          result.push(this.fsFileToPull(files[i]))
        }
      } else {
        result.push(this.fsFileToPull(files[i]))
      }
    }
    emitter = this.upload(result, emitter)
    emitter.on('done', (hashedFiles) => {
      console.log(hashedFiles)
    })
    // emitter.on('error', (err) => reject(err))
    return emitter
  }

  upload (files, ev) {
    let meta = {} // holds File metadata.
    if (!ev) {
      ev = new EventEmitter()
    }

    this._ipfs.start().then(() => {
      // trigger onStart callback
      ev.emit('start')
      if (files && files[0] && files[0].size > this.config.ipfs.maxFileSize) {
        ev.emit('error', `file size is larger than the allowed ${this.config.ipfs.maxFileSize / 1024 / 1024}MB`)
        return
      }

      pull(
        pull.values(files),
        pull.through((file) => {
          this._ipfs.log('Adding ', file)
          meta.fileSize = file.size
          meta.total = 0
        }),
        pull.asyncMap((file, cb) => pull(
          pull.values([{
            path: file.name,
            content: pull(
              file._pullStream,
              pull.through((chunk) => ev.emit('progress2', chunk.length, Math.floor((meta.total += chunk.length) * 1.0 / meta.fileSize * 100)))
            )
          }]),
          this._ipfs._node.files.addPullStream({chunkerOptions: {maxChunkSize: this.config.ipfs.chunkSize}}), // default size 262144
          pull.collect((err, res) => {
            if (err) {
              return ev.emit('error', err)
            }

            const hashedFile = res[0]
            this._ipfs.log('Adding %s finished as %s, size: %s', hashedFile.path, hashedFile.hash, hashedFile.size)

            ev.emit('local:fileReady', file, hashedFile)
            cb(null, hashedFile)
          })
        )),
        pull.collect((err, hashedFiles) => {
          if (err) {
            ev.emit('error', err)
          }
          this._ipfs.log('uploader is DONE')
          ev.emit('done', hashedFiles)
        })
      )
    })

    return ev
  }

  /**
   * upload an entire directory to IPFS
   * @param  {string}   dirPath path to directory
   * @return {Promise}           returns the {multihash, path, size} for the uploaded folder.
   * @example let dir = paratii.ipfs.local.addDirectory('path')
   */
  addDirectory (dirPath) {
    return new Promise((resolve, reject) => {
      // cb = once(cb)
      let resp = null
      // this._ipfs.log('adding ', dirPath, ' to IPFS')

      const addStream = this._ipfs._node.files.addReadableStream()
      addStream.on('data', (file) => {
        // this._ipfs.log('dirPath ', dirPath)
        // this._ipfs.log('file Added ', file)
        if (file.path === dirPath) {
          // this._ipfs.log('this is the hash to return ')
          resp = file
          nextTick(() => resolve(resp))
        }
      })

      addStream.on('end', () => {
        // this._ipfs.log('addStream ended')
        // nextTick(() => cb(null, resp))
      })

      fs.readdir(dirPath, (err, files) => {
        if (err) return reject(err)
        eachSeries(files, (file, next) => {
          next = once(next)
          try {
            this._ipfs.log('reading file ', file)
            let rStream = fs.createReadStream(path.join(dirPath, file))
            rStream.on('error', (err) => {
              if (err) {
                this._ipfs.error('rStream Error ', err)
                return next()
              }
            })
            if (rStream) {
              addStream.write({
                path: path.join(dirPath, file),
                content: rStream
              })
            }
          } catch (e) {
            if (e) {
              this._ipfs.error('createReadStream Error: ', e)
            }
          } finally {
          }
          // next()
          nextTick(() => next())
        }, (err) => {
          if (err) return reject(err)
          // addStream.destroy()
          addStream.end()
        })
      })
    })
  }
  /**
   * get file from ipfs
   * @param  {string}  hash ipfs multihash of the file
   * @return {Promise}      the file (path,content)
   * @example let result = await paratiiIPFS.add(fileStream)
   * let hash = result[0].hash
   * let fileContent = await paratiiIPFS.get(hash)
   */
  async get (hash) {
    let ipfs = await this._ipfs.getIPFSInstance()
    return ipfs.files.get(hash)
  }

  /**
  * gets a JSON object stored in IPFS
  * @param  {string}  multihash ipfs multihash of the object
  * @return {Promise}           requested Object
  * @example let jsonObj = await paratii.ipfs.getJSON('some-multihash')
  */
  async getJSON (multihash) {
    let ipfs = await this._ipfs.getIPFSInstance()
    let node
    try {
      node = await ipfs.files.cat(multihash)
    } catch (e) {
      if (e) throw e
    }

    return JSON.parse(node.toString())
  }

  /**
   * adds a data Object to the IPFS local instance
   * @param  {Object}  data JSON object to store
   * @return {Promise} promise that resolves as the ipfs multihash
   * @example let result = await paratii.ipfs.local.addJSON(data)
   */
  async addJSON (data) {
    let ipfs = await this._ipfs.getIPFSInstance()
    const obj = {
      Data: Buffer.from(JSON.stringify(data)),
      Links: []
    }
    let node
    try {
      // node = await ipfs.object.put(obj)
      node = await ipfs.files.add(obj.Data)
    } catch (e) {
      if (e) throw e
    }

    return node[0].hash
  }

  // TODO add example
  /**
   * returns a generic File Object with a Pull Stream from an HTML5 File
   * @param  {File} file HTML5 File Object
   * @return {Object}      generic file object.
   * @example ?
   * @private
   */
  html5FileToPull (file) {
    return {
      name: file.name,
      size: file.size,
      path: file.path,
      _html5File: file,
      _pullStream: pullFilereader(file)
    }
  }

  // TODO add example
  /**
   * returns a generic file Object from a file path
   * @param  {string} filePath Path to file.
   * @return {Object} generic file object.
   * @example ?
   * @private
   */
  fsFileToPull (filePath) {
    let stats = fs.statSync(filePath)
    if (stats) {
      return {
        name: path.basename(filePath),
        size: stats.size,
        _pullStream: toPull(fs.createReadStream(filePath))
      }
    } else {
      return null
    }
  }

  /**
   * log messages on the console if verbose is set
   * @param  {string} msg text to log
   * @example ?
   * paratii.ipfs.log("some-text")
   * @private
   */
  log (...msg) {
    if (this.config.verbose) {
      console.log(...msg)
    }
  }
  /**
   * log warns on the console if verbose is set
   * @param  {string} msg warn text
   * @example ?
   * paratii.ipfs.warn("some-text")
   * @private
   */
  warn (...msg) {
    if (this.config.verbose) {
      console.warn(...msg)
    }
  }
  /**
  * log errors on the console if verbose is set
  * @param  {string} msg error message
  * @example ?
  * paratii.ipfs.error("some-text")
  * @private
  */
  error (...msg) {
    if (this.config.verbose) {
      console.error(...msg)
    }
  }
}
