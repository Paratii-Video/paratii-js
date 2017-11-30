import { Paratii } from '../../lib/paratii.js'

contract('Paratii:', function (accounts) {
  it('should work with a non-testprc provider', async function () {
    let paratii = Paratii({
      provider: 'https://chain.paratii.video',
      registryAddress: '0x00000000000000000000000000000000000123455'
    })
    // we are not actually testing the connection - just checking if our configuration is going well
    assert.equal(paratii.web3.currentProvider.host, 'https://chain.paratii.video')
  })
})
