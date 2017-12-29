
/**
 * ParatiiDb contains a functionality to interact with the Paratii Blockchain Index
 *
 */
export class ParatiiDbVids {
  constructor (config) {
    this.config = config
  }

  async get (videoId) {
    // This should be a request on the web API (that is not there yet)
    let paratii = this.config.paratii
    // TODO: optimize and do these requests in parallel
    let videoFromBC = await paratii.eth.vids.get(videoId)
    let videoFromIPFS = await paratii.ipfs.getJSON(videoFromBC.ipfsData)
    return Object.assign({}, videoFromIPFS, videoFromBC)
  }
}
