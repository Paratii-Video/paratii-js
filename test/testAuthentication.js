import { Paratii } from '../lib/paratii.js'
import { account } from './utils.js'

let assert = require('assert')

describe('Testing Authentication:', function () {
      
    let paratii;
    let validatedSig = '0x83e6c47a05bdc0cd59e22e8983ea666266ca961ba80cf805ef7a0eaecd6827b4716c5f9115297e049ccaf9607f6653d8dbd587626677387418c31258c5a573d81c'
    let prvKey = '0x4f3edf983ac636a65a842ce7c78d9aa706d3b113bce9c46f30d7d21715b23b1d'

    beforeEach(async function () {

        paratii = Paratii({
            // this address and key are the first accounts on testrpc when started with the --deterministic flag
            account: account,
            privateKey: '4f3edf983ac636a65a842ce7c78d9aa706d3b113bce9c46f30d7d21715b23b1d'
          })

    });

    it('Check if we can log the user in', async function() {

        var sig = await paratii.signMessage('Signing in', prvKey);

        var getAccount = await paratii.recoverAccount(sig, 'Signing in');

        assert.equal(getAccount, account);

    });

    it('Check if we validate requests', async function() {
        
        var validated = await paratii.isValidRequest('1234', '0x123456', prvKey, validatedSig);
        
        assert.equal(true, validated);

    });
        

});