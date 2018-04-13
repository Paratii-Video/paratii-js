let assert = require('assert')
export const NULL_ADDRESS = '0x0000000000000000000000000000000000000000'

export function add0x (input) {
  if (typeof (input) !== 'string') {
    return input
  } else if (input.length < 2 || input.slice(0, 2) !== '0x') {
    return `0x${input}`
  }
  return input
}

export function getInfoFromLogs (tx, eventName, arg, index = 0) {
  // use this as follows:
  //    getInfoFromLogs(tx, 'LogRegisterVideo', 'videoId',  0)
  // tx.events look like this:
  //
  //  events:
  // { LogRegisterVideo:
  //    { logIndex: 0,
  //      transactionIndex: 0,
  //      transactionHash: '0xe7a3ba74915a5de07a7b43ebc16fcd2556e31a6e27a1771a70b85b05546ae8bd',
  //      blockHash: '0x8d56ab2c2f424555d2cf7b48d30023d18ba3ece372c0da5220c1a521e266e613',
  //      blockNumber: 3720,
  //      address: '0xCc478840004288c18a6BaA51Bbf95AbF58A653C4',
  //      type: 'mined',
  //      id: 'log_52a925c3',
  //      returnValues: [Object],
  //      event: 'LogRegisterVideo',
  //      signature: '0x19a6411db3231a980d3d18e397c33cd812f3754bc383db69ce3f7bf8287233b1',
  //      raw: [Object] } } }
  let log = tx.events[eventName]
  if (!log) {
    let msg = `There is no event logged with eventName ${eventName}`
    throw Error(msg)
  }
  assert(log.logIndex === index)
  return log.returnValues[arg]
}

export function makeId () {
  const LENGTH = 12
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  var text = ''

  for (var i = 0; i < LENGTH; i++) {
    text += chars.charAt(Math.floor(Math.random() * chars.length))
  }

  return text
}

// borrowed from: https://gist.github.com/dmvaldman/12a7e46be6c3097aae31
var EventEmitter = require('events').EventEmitter

export class PromiseEventEmitter extends EventEmitter {
    // Define a Promise with a function taking two parameters:
    // a `resolve` function and `reject` function
  constructor (executor) {
    super() // Extend the EventEmitter super class

        // When `resolve` is called with a value, it emits a `resolve` event
        // passing the value downstream. Similarly for `reject`
    var resolve = (value) => { this.emit('resolve', value) }
    var reject = (reason) => { this.emit('reject', reason) }

    if (executor) executor(resolve, reject)
  }

    // Add downstream resolve and reject listeners
  then (resolveHandler, rejectHandler) {
    var promise = new PromiseEventEmitter()

        // When a `resolve` event upstream is fired, execute the `resolveHandler`
        // and pass the `resolve` event downstream with the result
    if (resolveHandler) {
      var resolve = (data) => {
        var result = resolveHandler(data)
        promise.emit('resolve', result)
      }

      this.on('resolve', resolve)
    }

        // When a `reject` event upstream is fired, execute the `rejectHandler`
        // and pass the `reject` event downstream with the result
    if (rejectHandler) {
      var reject = (data) => {
        var result = rejectHandler(data)
        promise.emit('reject', result)
      }

      this.on('reject', reject)
    } else {
            // Downstream listeners always listen to `reject` so that an
            // eventual `catch` can intercept them
      this.on('reject', (data) => { promise.emit('reject', data) })
    }

    return promise
  }

    // Handle an error from a rejected Promise upstream
  catch (handler) {
    this.on('reject', handler)
  }
}
