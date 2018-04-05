<a name="paratii"></a>

## paratii
**Kind**: global class  

* [paratii](#paratii)
    * [new paratii(opts)](#new_paratii_new)
    * [.core](#paratii.core)
        * [new core(config)](#new_paratii.core_new)
        * [.users](#paratii.core.users)
            * [new users(config)](#new_paratii.core.users_new)
            * [.ParatiiCoreUsers#create(options)](#paratii.core.users.ParatiiCoreUsers+create) ⇒ <code>Promise</code>
            * [.ParatiiCoreUsers#get(id)](#paratii.core.users.ParatiiCoreUsers+get) ⇒ <code>Object</code>
            * [.ParatiiCoreUsers#update(userId, options)](#paratii.core.users.ParatiiCoreUsers+update) ⇒ <code>Promise</code>
        * [.vids](#paratii.core.vids)
            * [new vids(config)](#new_paratii.core.vids_new)
            * [.ParatiiCoreVids#like(videoId)](#paratii.core.vids.ParatiiCoreVids+like) ⇒ <code>Object</code>
            * [.ParatiiCoreVids#dislike(videoId)](#paratii.core.vids.ParatiiCoreVids+dislike) ⇒ <code>Object</code>
            * [.ParatiiCoreVids#doesLike(videoId)](#paratii.core.vids.ParatiiCoreVids+doesLike) ⇒ <code>Boolean</code>
            * [.ParatiiCoreVids#hasViewedVideo(viewer, videoId)](#paratii.core.vids.ParatiiCoreVids+hasViewedVideo) ⇒ <code>Boolean</code>
            * [.ParatiiCoreVids#doesDislike(videoId)](#paratii.core.vids.ParatiiCoreVids+doesDislike) ⇒ <code>Boolean</code>
            * [.ParatiiCoreVids#create(options)](#paratii.core.vids.ParatiiCoreVids+create) ⇒ <code>Promise</code>
            * [.ParatiiCoreVids#update(videoId, options, dataToUpdate)](#paratii.core.vids.ParatiiCoreVids+update) ⇒ <code>Promise</code>
            * [.ParatiiCoreVids#upsert(options)](#paratii.core.vids.ParatiiCoreVids+upsert) ⇒ <code>Promise</code>
            * [.ParatiiCoreVids#view(options)](#paratii.core.vids.ParatiiCoreVids+view) ⇒ <code>Promise</code>
            * [.ParatiiCoreVids#get(videoId)](#paratii.core.vids.ParatiiCoreVids+get) ⇒ <code>Promise</code>
            * [.ParatiiCoreVids#search(options)](#paratii.core.vids.ParatiiCoreVids+search) ⇒ <code>Promise</code>
        * [.ParatiiCore#migrateAccount()](#paratii.core.ParatiiCore+migrateAccount)
    * [.db](#paratii.db)
        * [new db(config)](#new_paratii.db_new)
        * [.users](#paratii.db.users)
            * [new users(config)](#new_paratii.db.users_new)
            * [.ParatiiDbUsers#get(userId)](#paratii.db.users.ParatiiDbUsers+get) ⇒ <code>Promise</code>
            * [.ParatiiDbUsers#videos(userId)](#paratii.db.users.ParatiiDbUsers+videos) ⇒ <code>Promise</code>
        * [.vids](#paratii.db.vids)
            * [new vids(config)](#new_paratii.db.vids_new)
            * [.ParatiiDbVids#get(videoId)](#paratii.db.vids.ParatiiDbVids+get) ⇒ <code>Promise</code>
            * [.ParatiiDbVids#search(options)](#paratii.db.vids.ParatiiDbVids+search) ⇒ <code>Promise</code>
    * [.eth](#paratii.eth)
        * [new eth(config)](#new_paratii.eth_new)
        * [.events](#paratii.eth.events)
            * [new events()](#new_paratii.eth.events_new)
            * [.ParatiiEthEvents#_getStructuredEvent(eventType)](#paratii.eth.events.ParatiiEthEvents+_getStructuredEvent) ⇒ <code>Object</code>
            * [.ParatiiEthEvents#addListener(eventType, options, listener)](#paratii.eth.events.ParatiiEthEvents+addListener) ⇒ <code>Promise</code>
            * [.ParatiiEthEvents#_addListener(eventType, listener, options)](#paratii.eth.events.ParatiiEthEvents+_addListener) ⇒ <code>Promise</code>
            * [.ParatiiEthEvents#_isFunction(functionToCheck)](#paratii.eth.events.ParatiiEthEvents+_isFunction) ⇒ <code>Boolean</code>
            * [.ParatiiEthEvents#addSubscription(eventType, subscription)](#paratii.eth.events.ParatiiEthEvents+addSubscription)
            * [.ParatiiEthEvents#removeAllSubscriptions(eventType)](#paratii.eth.events.ParatiiEthEvents+removeAllSubscriptions) ⇒ <code>Object</code>
        * [.tcr](#paratii.eth.tcr)
            * [new tcr(context)](#new_paratii.eth.tcr_new)
            * [.ParatiiEthTcr#getTcrContract()](#paratii.eth.tcr.ParatiiEthTcr+getTcrContract) ⇒ <code>Promise</code>
            * [.ParatiiEthTcr#getMinDeposit()](#paratii.eth.tcr.ParatiiEthTcr+getMinDeposit) ⇒ <code>Float</code>
            * [.ParatiiEthTcr#isWhitelisted(videoId)](#paratii.eth.tcr.ParatiiEthTcr+isWhitelisted) ⇒ <code>boolean</code>
            * [.ParatiiEthTcr#didVideoApply(videoId)](#paratii.eth.tcr.ParatiiEthTcr+didVideoApply) ⇒ <code>boolean</code>
            * [.ParatiiEthTcr#apply(videoId, amountToStake)](#paratii.eth.tcr.ParatiiEthTcr+apply) ⇒ <code>boolean</code>
            * [.ParatiiEthTcr#checkEligiblityAndApply(videoId, amountToStake)](#paratii.eth.tcr.ParatiiEthTcr+checkEligiblityAndApply) ⇒ <code>Promise</code>
            * [.ParatiiEthTcr#exit()](#paratii.eth.tcr.ParatiiEthTcr+exit)
        * [.users](#paratii.eth.users)
            * [new users()](#new_paratii.eth.users_new)
            * [.ParatiiEthUsers#getRegistry()](#paratii.eth.users.ParatiiEthUsers+getRegistry) ⇒ <code>Promise</code>
            * [.ParatiiEthUsers#create(options)](#paratii.eth.users.ParatiiEthUsers+create) ⇒ <code>Promise</code>
            * [.ParatiiEthUsers#get(userId)](#paratii.eth.users.ParatiiEthUsers+get) ⇒ <code>Promise</code>
            * [.ParatiiEthUsers#update(userId, options)](#paratii.eth.users.ParatiiEthUsers+update) ⇒ <code>Promise</code>
            * [.ParatiiEthUsers#delete(userId)](#paratii.eth.users.ParatiiEthUsers+delete) ⇒ <code>Promise</code>
        * [.vids](#paratii.eth.vids)
            * [new vids()](#new_paratii.eth.vids_new)
            * [.ParatiiEthVids#getVideoRegistry()](#paratii.eth.vids.ParatiiEthVids+getVideoRegistry) ⇒ <code>Promise</code>
            * [.ParatiiEthVids#getLikesContract()](#paratii.eth.vids.ParatiiEthVids+getLikesContract) ⇒ <code>Promise</code>
            * [.ParatiiEthVids#getViewsContract()](#paratii.eth.vids.ParatiiEthVids+getViewsContract) ⇒ <code>Promise</code>
            * [.ParatiiEthVids#makeId()](#paratii.eth.vids.ParatiiEthVids+makeId) ⇒ <code>String</code>
            * [.ParatiiEthVids#create(options, [retry])](#paratii.eth.vids.ParatiiEthVids+create) ⇒ <code>Promise</code>
            * [.ParatiiEthVids#get(videoId)](#paratii.eth.vids.ParatiiEthVids+get) ⇒ <code>Promise</code>
            * [.ParatiiEthVids#sendLike(options, type)](#paratii.eth.vids.ParatiiEthVids+sendLike) ⇒ <code>Promise</code>
            * [.ParatiiEthVids#view(options)](#paratii.eth.vids.ParatiiEthVids+view) ⇒ <code>Promise</code>
            * [.ParatiiEthVids#userViewedVideo(options)](#paratii.eth.vids.ParatiiEthVids+userViewedVideo) ⇒ <code>Promise</code>
            * [.ParatiiEthVids#like(videoId)](#paratii.eth.vids.ParatiiEthVids+like) ⇒ <code>Promise</code>
            * [.ParatiiEthVids#dislike(videoId)](#paratii.eth.vids.ParatiiEthVids+dislike) ⇒ <code>Promise</code>
            * [.ParatiiEthVids#doesLike(videoId)](#paratii.eth.vids.ParatiiEthVids+doesLike) ⇒ <code>Promise</code>
            * [.ParatiiEthVids#doesDislike(videoId)](#paratii.eth.vids.ParatiiEthVids+doesDislike) ⇒ <code>Promise</code>
            * [.ParatiiEthVids#update(videoId, options)](#paratii.eth.vids.ParatiiEthVids+update) ⇒ <code>Promise</code>
        * [.vouchers](#paratii.eth.vouchers)
            * [new vouchers()](#new_paratii.eth.vouchers_new)
            * [.ParatiiEthVouchers#getVouchersContract()](#paratii.eth.vouchers.ParatiiEthVouchers+getVouchersContract) ⇒ <code>Promise</code>
            * [.ParatiiEthVouchers#create(options)](#paratii.eth.vouchers.ParatiiEthVouchers+create) ⇒ <code>Promise</code>
            * [.ParatiiEthVouchers#test()](#paratii.eth.vouchers.ParatiiEthVouchers+test)
            * [.ParatiiEthVouchers#createVouchers(number, amount)](#paratii.eth.vouchers.ParatiiEthVouchers+createVouchers) ⇒ <code>Promise</code>
            * [.ParatiiEthVouchers#redeem(voucherCode)](#paratii.eth.vouchers.ParatiiEthVouchers+redeem) ⇒ <code>Promise</code>
        * [.wallet](#paratii.eth.wallet)
            * [new wallet(wallet, config)](#new_paratii.eth.wallet_new)
            * [.create(numberOfAccounts, mnemonic)](#paratii.eth.wallet.create) ⇒ <code>Object</code>
            * [.isValidMnemonic(mnemonic)](#paratii.eth.wallet.isValidMnemonic) ⇒ <code>Boolean</code>
            * [.newMnemonic()](#paratii.eth.wallet.newMnemonic) ⇒ <code>String</code>
            * [._decrypt(data, password)](#paratii.eth.wallet._decrypt) ⇒ <code>Object</code>
        * [.ParatiiEth#setAccount(address, privateKey, mnemonic)](#paratii.eth.ParatiiEth+setAccount)
        * [.ParatiiEth#getContract(name)](#paratii.eth.ParatiiEth+getContract) ⇒ <code>Promise</code>
        * [.ParatiiEth#requireContract(contractName)](#paratii.eth.ParatiiEth+requireContract) ⇒ <code>String</code>
        * [.ParatiiEth#deployContract(name, ...args)](#paratii.eth.ParatiiEth+deployContract) ⇒ <code>Promise</code>
        * [.ParatiiEth#sleep(ms)](#paratii.eth.ParatiiEth+sleep) ⇒ <code>Promise</code>
        * [.ParatiiEth#deployContracts()](#paratii.eth.ParatiiEth+deployContracts) ⇒ <code>Promise</code>
        * [.ParatiiEth#setContractsProvider()](#paratii.eth.ParatiiEth+setContractsProvider)
        * [.ParatiiEth#getContracts()](#paratii.eth.ParatiiEth+getContracts) ⇒ <code>Promise</code>
        * [.ParatiiEth#getContractAddress(name)](#paratii.eth.ParatiiEth+getContractAddress) ⇒ <code>Promise</code>
        * [.ParatiiEth#getRegistryAddress()](#paratii.eth.ParatiiEth+getRegistryAddress) ⇒ <code>String</code>
        * [.ParatiiEth#setRegistryAddress(registryAddress)](#paratii.eth.ParatiiEth+setRegistryAddress)
        * [.ParatiiEth#balanceOf(address, symbol)](#paratii.eth.ParatiiEth+balanceOf) ⇒ <code>Promise</code>
        * [.ParatiiEth#_transferETH(beneficiary, amount, description)](#paratii.eth.ParatiiEth+_transferETH) ⇒ <code>Promise</code>
        * [.ParatiiEth#_transferPTI(beneficiary, amount)](#paratii.eth.ParatiiEth+_transferPTI) ⇒ <code>Promise</code>
        * [.ParatiiEth#transfer(beneficiary, amount, symbol, description)](#paratii.eth.ParatiiEth+transfer) ⇒ <code>Promise</code>
    * [.ipfs](#paratii.ipfs)
        * [new ipfs(config)](#new_paratii.ipfs_new)
        * [.uploader](#paratii.ipfs.uploader) ⇐ <code>EventEmitter</code>
            * [new uploader(opts)](#new_paratii.ipfs.uploader_new)
            * [.Uploader#onDrop(ev)](#paratii.ipfs.uploader.Uploader+onDrop) ⇒ <code>?</code>
            * [.Uploader#xhrUpload(file, hashedFile, ev)](#paratii.ipfs.uploader.Uploader+xhrUpload)
            * [.Uploader#add(file)](#paratii.ipfs.uploader.Uploader+add) ⇒ <code>EventEmitter</code>
            * [.Uploader#html5FileToPull(file)](#paratii.ipfs.uploader.Uploader+html5FileToPull) ⇒ <code>Object</code>
            * [.Uploader#fsFileToPull(filePath)](#paratii.ipfs.uploader.Uploader+fsFileToPull) ⇒ <code>Object</code>
            * [.Uploader#upload(files)](#paratii.ipfs.uploader.Uploader+upload) ⇒ <code>EventEmitter</code>
            * [.Uploader#addDirectory(dirPath)](#paratii.ipfs.uploader.Uploader+addDirectory) ⇒ <code>Promise</code>
            * [.Uploader#transcode(fileHash, options)](#paratii.ipfs.uploader.Uploader+transcode) ⇒ <code>EventEmitter</code>
            * [.Uploader#_transcoderRespHander(ev)](#paratii.ipfs.uploader.Uploader+_transcoderRespHander) ⇒ <code>function</code>
            * [.Uploader#addAndTranscode(files)](#paratii.ipfs.uploader.Uploader+addAndTranscode)
            * [.Uploader#_signalTranscoder(files, ev)](#paratii.ipfs.uploader.Uploader+_signalTranscoder) ⇒ <code>Object</code>
            * [.Uploader#getMetaData(fileHash, options)](#paratii.ipfs.uploader.Uploader+getMetaData) ⇒ <code>Object</code>
            * [.Uploader#pinFile(fileHash, options)](#paratii.ipfs.uploader.Uploader+pinFile) ⇒ <code>Object</code>
            * [.Uploader#_pinResponseHandler(ev)](#paratii.ipfs.uploader.Uploader+_pinResponseHandler) ⇒ <code>Object</code>
        * [.ParatiiIPFS#add(fileStream)](#paratii.ipfs.ParatiiIPFS+add) ⇒ <code>Promise</code>
        * [.ParatiiIPFS#get(hash)](#paratii.ipfs.ParatiiIPFS+get) ⇒ <code>Promise</code>
        * [.ParatiiIPFS#log(...msg)](#paratii.ipfs.ParatiiIPFS+log)
        * [.ParatiiIPFS#warn(...msg)](#paratii.ipfs.ParatiiIPFS+warn)
        * [.ParatiiIPFS#error(...msg)](#paratii.ipfs.ParatiiIPFS+error)
        * [.ParatiiIPFS#getIPFSInstance()](#paratii.ipfs.ParatiiIPFS+getIPFSInstance) ⇒ <code>Object</code>
        * [.ParatiiIPFS#addJSON(data)](#paratii.ipfs.ParatiiIPFS+addJSON) ⇒ <code>Promise</code>
        * [.ParatiiIPFS#addAndPinJSON(data)](#paratii.ipfs.ParatiiIPFS+addAndPinJSON) ⇒ <code>string</code>
        * [.ParatiiIPFS#getJSON(multihash)](#paratii.ipfs.ParatiiIPFS+getJSON) ⇒ <code>Promise</code>
        * [.ParatiiIPFS#stop(callback)](#paratii.ipfs.ParatiiIPFS+stop) ⇒ <code>?</code>
    * [.Paratii#setAccount(address, privateKey)](#paratii.Paratii+setAccount)
    * [.Paratii#setRegistryAddress(address)](#paratii.Paratii+setRegistryAddress)
    * [.Paratii#diagnose()](#paratii.Paratii+diagnose) ⇒ <code>Promise</code>

<a name="new_paratii_new"></a>

### new paratii(opts)
Paratii library main object
The Paratii object serves as the general entry point for interacting with the family of Paratii
contracts that are deployed on the blockchain, utilities to run and interact with a local IPFS node,
and utilities to interact with the Paratii index.


| Param | Type | Description |
| --- | --- | --- |
| opts | <code>Object</code> | options object to configure paratii library |
| opts.provider | <code>String</code> | optional - the address of an ethereum node (defaults to localhost:8754) |
| opts.registryAddress | <code>String</code> | optional - the address where the Paratii Contract registry can be found |
| opts.address | <code>String</code> | optional - address of the operator/user |
| opts.privateKey | <code>String</code> | optional - private key of the user |
| opts.ipfs | <code>Object</code> | TODO fix ipfs.repo --> ipfsrepo |
| opts.ipfs.repo | <code>String</code> | optional - namespace of the ipfs repository |
| opts.db | <code>Object</code> | TODO fix db.provider --> dbprovider |
| opts.db.provider | <code>String</code> | optional - baseURL of the mongoDb mirror |
| opts.mnemonic | <code>String</code> | optional - mnemonic of the user |

**Example**  
```js
paratii = new Paratii({ 'eth.provider': 'http://localhost:8545', address: 'some-user-id', privateKey: 'some-user-priv-key'})
```
<a name="paratii.core"></a>

### paratii.core
**Kind**: static class of [<code>paratii</code>](#paratii)  

* [.core](#paratii.core)
    * [new core(config)](#new_paratii.core_new)
    * [.users](#paratii.core.users)
        * [new users(config)](#new_paratii.core.users_new)
        * [.ParatiiCoreUsers#create(options)](#paratii.core.users.ParatiiCoreUsers+create) ⇒ <code>Promise</code>
        * [.ParatiiCoreUsers#get(id)](#paratii.core.users.ParatiiCoreUsers+get) ⇒ <code>Object</code>
        * [.ParatiiCoreUsers#update(userId, options)](#paratii.core.users.ParatiiCoreUsers+update) ⇒ <code>Promise</code>
    * [.vids](#paratii.core.vids)
        * [new vids(config)](#new_paratii.core.vids_new)
        * [.ParatiiCoreVids#like(videoId)](#paratii.core.vids.ParatiiCoreVids+like) ⇒ <code>Object</code>
        * [.ParatiiCoreVids#dislike(videoId)](#paratii.core.vids.ParatiiCoreVids+dislike) ⇒ <code>Object</code>
        * [.ParatiiCoreVids#doesLike(videoId)](#paratii.core.vids.ParatiiCoreVids+doesLike) ⇒ <code>Boolean</code>
        * [.ParatiiCoreVids#hasViewedVideo(viewer, videoId)](#paratii.core.vids.ParatiiCoreVids+hasViewedVideo) ⇒ <code>Boolean</code>
        * [.ParatiiCoreVids#doesDislike(videoId)](#paratii.core.vids.ParatiiCoreVids+doesDislike) ⇒ <code>Boolean</code>
        * [.ParatiiCoreVids#create(options)](#paratii.core.vids.ParatiiCoreVids+create) ⇒ <code>Promise</code>
        * [.ParatiiCoreVids#update(videoId, options, dataToUpdate)](#paratii.core.vids.ParatiiCoreVids+update) ⇒ <code>Promise</code>
        * [.ParatiiCoreVids#upsert(options)](#paratii.core.vids.ParatiiCoreVids+upsert) ⇒ <code>Promise</code>
        * [.ParatiiCoreVids#view(options)](#paratii.core.vids.ParatiiCoreVids+view) ⇒ <code>Promise</code>
        * [.ParatiiCoreVids#get(videoId)](#paratii.core.vids.ParatiiCoreVids+get) ⇒ <code>Promise</code>
        * [.ParatiiCoreVids#search(options)](#paratii.core.vids.ParatiiCoreVids+search) ⇒ <code>Promise</code>
    * [.ParatiiCore#migrateAccount()](#paratii.core.ParatiiCore+migrateAccount)

<a name="new_paratii.core_new"></a>

#### new core(config)
Contains functions that operate transversally over several backend systems. <br />
validates the config file and istantiates ParatiiCoreVids and ParatiiCoreUsers.


| Param | Type | Description |
| --- | --- | --- |
| config | <code>Object</code> | configuration object to initialize Paratii object |

<a name="paratii.core.users"></a>

#### core.users
**Kind**: static class of [<code>core</code>](#paratii.core)  

* [.users](#paratii.core.users)
    * [new users(config)](#new_paratii.core.users_new)
    * [.ParatiiCoreUsers#create(options)](#paratii.core.users.ParatiiCoreUsers+create) ⇒ <code>Promise</code>
    * [.ParatiiCoreUsers#get(id)](#paratii.core.users.ParatiiCoreUsers+get) ⇒ <code>Object</code>
    * [.ParatiiCoreUsers#update(userId, options)](#paratii.core.users.ParatiiCoreUsers+update) ⇒ <code>Promise</code>

<a name="new_paratii.core.users_new"></a>

##### new users(config)
Utilities to create and manipulate information about the users on the blockchain.


| Param | Type | Description |
| --- | --- | --- |
| config | <code>Object</code> | configuration object to initialize Paratii object |

<a name="paratii.core.users.ParatiiCoreUsers+create"></a>

##### users.ParatiiCoreUsers#create(options) ⇒ <code>Promise</code>
Creates a user, fields id, name and email go to the smart contract Users, other fields are stored on IPFS.

**Kind**: static method of [<code>users</code>](#paratii.core.users)  
**Returns**: <code>Promise</code> - the id of the newly created user  

| Param | Type | Description |
| --- | --- | --- |
| options | <code>Object</code> | information about the video ( id, name, email ... ) |

**Example**  
```js
paratii.core.users.create({
             id: 'some-user-id',
             name: 'A user name',
             email: 'some@email.com',
             ...
            })
```
<a name="paratii.core.users.ParatiiCoreUsers+get"></a>

##### users.ParatiiCoreUsers#get(id) ⇒ <code>Object</code>
retrieve data about the user

**Kind**: static method of [<code>users</code>](#paratii.core.users)  
**Returns**: <code>Object</code> - data about the user  

| Param | Type | Description |
| --- | --- | --- |
| id | <code>String</code> | user univocal id |

**Example**  
```js
paratii.core.users.get('some-user-id')
```
<a name="paratii.core.users.ParatiiCoreUsers+update"></a>

##### users.ParatiiCoreUsers#update(userId, options) ⇒ <code>Promise</code>
Updates a user's details. name and email are defined in the smart contract Users, other fields get written to IPFS.

**Kind**: static method of [<code>users</code>](#paratii.core.users)  
**Returns**: <code>Promise</code> - updated data about the user  

| Param | Type | Description |
| --- | --- | --- |
| userId | <code>String</code> | user univocal id |
| options | <code>Object</code> | updated data i.e. { name: 'A new user name' } |

**Example**  
```js
paratii.core.users.update('some-user-id', {name: 'A new user name'})
```
<a name="paratii.core.vids"></a>

#### core.vids
**Kind**: static class of [<code>core</code>](#paratii.core)  

* [.vids](#paratii.core.vids)
    * [new vids(config)](#new_paratii.core.vids_new)
    * [.ParatiiCoreVids#like(videoId)](#paratii.core.vids.ParatiiCoreVids+like) ⇒ <code>Object</code>
    * [.ParatiiCoreVids#dislike(videoId)](#paratii.core.vids.ParatiiCoreVids+dislike) ⇒ <code>Object</code>
    * [.ParatiiCoreVids#doesLike(videoId)](#paratii.core.vids.ParatiiCoreVids+doesLike) ⇒ <code>Boolean</code>
    * [.ParatiiCoreVids#hasViewedVideo(viewer, videoId)](#paratii.core.vids.ParatiiCoreVids+hasViewedVideo) ⇒ <code>Boolean</code>
    * [.ParatiiCoreVids#doesDislike(videoId)](#paratii.core.vids.ParatiiCoreVids+doesDislike) ⇒ <code>Boolean</code>
    * [.ParatiiCoreVids#create(options)](#paratii.core.vids.ParatiiCoreVids+create) ⇒ <code>Promise</code>
    * [.ParatiiCoreVids#update(videoId, options, dataToUpdate)](#paratii.core.vids.ParatiiCoreVids+update) ⇒ <code>Promise</code>
    * [.ParatiiCoreVids#upsert(options)](#paratii.core.vids.ParatiiCoreVids+upsert) ⇒ <code>Promise</code>
    * [.ParatiiCoreVids#view(options)](#paratii.core.vids.ParatiiCoreVids+view) ⇒ <code>Promise</code>
    * [.ParatiiCoreVids#get(videoId)](#paratii.core.vids.ParatiiCoreVids+get) ⇒ <code>Promise</code>
    * [.ParatiiCoreVids#search(options)](#paratii.core.vids.ParatiiCoreVids+search) ⇒ <code>Promise</code>

<a name="new_paratii.core.vids_new"></a>

##### new vids(config)
Utilities to create and manipulate information about the videos on the blockchain.


| Param | Type | Description |
| --- | --- | --- |
| config | <code>Object</code> | configuration object to initialize Paratii object |

<a name="paratii.core.vids.ParatiiCoreVids+like"></a>

##### vids.ParatiiCoreVids#like(videoId) ⇒ <code>Object</code>
Writes a like for the video on the blockchain (contract Likes), and negates a dislike for the video, if it exists.

**Kind**: static method of [<code>vids</code>](#paratii.core.vids)  
**Returns**: <code>Object</code> - information about the transaction recording the like  

| Param | Type | Description |
| --- | --- | --- |
| videoId | <code>String</code> | univocal video identifier |

**Example**  
```js
paratii.core.vids.like('some-video-id')
```
<a name="paratii.core.vids.ParatiiCoreVids+dislike"></a>

##### vids.ParatiiCoreVids#dislike(videoId) ⇒ <code>Object</code>
Writes a dislike for the video on the blockchain (contract Likes), and negates a like for the video, if it exists.

**Kind**: static method of [<code>vids</code>](#paratii.core.vids)  
**Returns**: <code>Object</code> - information about the transaction recording the dislike  

| Param | Type | Description |
| --- | --- | --- |
| videoId | <code>String</code> | univocal video identifier |

**Example**  
```js
paratii.core.vids.dislike('some-video-id')
```
<a name="paratii.core.vids.ParatiiCoreVids+doesLike"></a>

##### vids.ParatiiCoreVids#doesLike(videoId) ⇒ <code>Boolean</code>
Check if the current user has already liked the video

**Kind**: static method of [<code>vids</code>](#paratii.core.vids)  
**Returns**: <code>Boolean</code> - true if the current user already liked the video, false otherwise  

| Param | Type | Description |
| --- | --- | --- |
| videoId | <code>String</code> | univocal video identifier |

**Example**  
```js
paratii.core.vids.doesLike('some-video-id')
```
<a name="paratii.core.vids.ParatiiCoreVids+hasViewedVideo"></a>

##### vids.ParatiiCoreVids#hasViewedVideo(viewer, videoId) ⇒ <code>Boolean</code>
Check if the viewer has already viewed the video

**Kind**: static method of [<code>vids</code>](#paratii.core.vids)  
**Returns**: <code>Boolean</code> - true if the current user already viewed the video, false otherwise  

| Param | Type | Description |
| --- | --- | --- |
| viewer | <code>String</code> | viewer address |
| videoId | <code>String</code> | univocal video identifier |

**Example**  
```js
paratii.core.vids.hasViewedVideo('some-user-id','some-video-id')
```
<a name="paratii.core.vids.ParatiiCoreVids+doesDislike"></a>

##### vids.ParatiiCoreVids#doesDislike(videoId) ⇒ <code>Boolean</code>
Check if the current user has already disliked the video

**Kind**: static method of [<code>vids</code>](#paratii.core.vids)  
**Returns**: <code>Boolean</code> - true if the current user already disliked the video, false otherwise  

| Param | Type | Description |
| --- | --- | --- |
| videoId | <code>String</code> | univocal video identifier |

**Example**  
```js
paratii.core.vids.doesDislike('some-video-id')
```
<a name="paratii.core.vids.ParatiiCoreVids+create"></a>

##### vids.ParatiiCoreVids#create(options) ⇒ <code>Promise</code>
This call will register the video on the blockchain, add its metadata to IPFS, upload file to IPFS, and transcode it

**Kind**: static method of [<code>vids</code>](#paratii.core.vids)  
**Returns**: <code>Promise</code> - information about the video ( id, owner, ipfsHash ... )  

| Param | Type | Description |
| --- | --- | --- |
| options | <code>Object</code> | information about the video ( id, title, FilePath ... ) |

**Example**  
```js
paratii.core.vids.create({
 id: 'some-video-id',
 owner: 'some-user-id',
 title: 'some Title',
 author: 'Steven Spielberg',
 duration: '2h 32m',
 description: 'A long description',
 price: 0,
 file: 'test/data/some-file.txt'
})
```
<a name="paratii.core.vids.ParatiiCoreVids+update"></a>

##### vids.ParatiiCoreVids#update(videoId, options, dataToUpdate) ⇒ <code>Promise</code>
Update the information on the video.
 Only the account that has registered the video, or the owner of the contract, can update the information.

**Kind**: static method of [<code>vids</code>](#paratii.core.vids)  
**Returns**: <code>Promise</code> - Updated video informations  

| Param | Type | Description |
| --- | --- | --- |
| videoId | <code>String</code> | univocal video identifier |
| options | <code>Object</code> | key value pairs of properties and new values e.g. ({title: 'another-title'}) |
| dataToUpdate | <code>Object</code> | optional. old data of the video. If not passed to the method, it will fetch the data itself using the videoId |

**Example**  
```js
paratii.core.vids.update('some-video-id', {title: 'another-title'})
```
<a name="paratii.core.vids.ParatiiCoreVids+upsert"></a>

##### vids.ParatiiCoreVids#upsert(options) ⇒ <code>Promise</code>
Update the information of the video the video already exists, otherwise it creates it

**Kind**: static method of [<code>vids</code>](#paratii.core.vids)  
**Returns**: <code>Promise</code> - updated/new video informations  

| Param | Type | Description |
| --- | --- | --- |
| options | <code>Object</code> | video informations |

**Example**  
```js
paratii.core.vids.upsert({ id: 'some-video-id', owner: 'some-user-id', title: 'videoTitle'}) //insert a new video
```
<a name="paratii.core.vids.ParatiiCoreVids+view"></a>

##### vids.ParatiiCoreVids#view(options) ⇒ <code>Promise</code>
Register a view on the blockchain

**Kind**: static method of [<code>vids</code>](#paratii.core.vids)  
**Returns**: <code>Promise</code> - information about the transaction recording the view  

| Param | Type | Description |
| --- | --- | --- |
| options | <code>Object</code> | should contain keys viewer (address of the viewer) and videoId (univocal video identifier) |

**Example**  
```js
paratii.core.vids.view({viewer:'some-user-id',videoId: 'some-video-id'})
```
<a name="paratii.core.vids.ParatiiCoreVids+get"></a>

##### vids.ParatiiCoreVids#get(videoId) ⇒ <code>Promise</code>
Get the data of the video identified by videoId

**Kind**: static method of [<code>vids</code>](#paratii.core.vids)  
**Returns**: <code>Promise</code> - data about the video  

| Param | Type | Description |
| --- | --- | --- |
| videoId | <code>String</code> | univocal video identifier |

**Example**  
```js
paratii.core.vids.get('some-video-id')
```
<a name="paratii.core.vids.ParatiiCoreVids+search"></a>

##### vids.ParatiiCoreVids#search(options) ⇒ <code>Promise</code>
Get the data of the video

**Kind**: static method of [<code>vids</code>](#paratii.core.vids)  
**Returns**: <code>Promise</code> - data about the video  

| Param | Type | Description |
| --- | --- | --- |
| options | <code>Object</code> | data about the video and (optional) owner i.e {'keyword':'titleOfTheVideo'} |

**Example**  
```js
paratii.core.vids.search({keyword : 'titleOftheVideo'})
the keyword value can be one from the following list
- video title
- description
- owner
- uploader.name
- uploader.address
- tags
```
<a name="paratii.core.ParatiiCore+migrateAccount"></a>

#### core.ParatiiCore#migrateAccount()
migrate all contract data for  paratii.config.account to a new account

**Kind**: static method of [<code>core</code>](#paratii.core)  
<a name="paratii.db"></a>

### paratii.db
**Kind**: static class of [<code>paratii</code>](#paratii)  

* [.db](#paratii.db)
    * [new db(config)](#new_paratii.db_new)
    * [.users](#paratii.db.users)
        * [new users(config)](#new_paratii.db.users_new)
        * [.ParatiiDbUsers#get(userId)](#paratii.db.users.ParatiiDbUsers+get) ⇒ <code>Promise</code>
        * [.ParatiiDbUsers#videos(userId)](#paratii.db.users.ParatiiDbUsers+videos) ⇒ <code>Promise</code>
    * [.vids](#paratii.db.vids)
        * [new vids(config)](#new_paratii.db.vids_new)
        * [.ParatiiDbVids#get(videoId)](#paratii.db.vids.ParatiiDbVids+get) ⇒ <code>Promise</code>
        * [.ParatiiDbVids#search(options)](#paratii.db.vids.ParatiiDbVids+search) ⇒ <code>Promise</code>

<a name="new_paratii.db_new"></a>

#### new db(config)
ParatiiDb contains a functionality to interact with the Paratii Blockchain Index. <br>
validates the config file and istantiates ParatiiDbVids and ParatiiDbUsers.


| Param | Type |
| --- | --- |
| config | <code>Object</code> | 

<a name="paratii.db.users"></a>

#### db.users
**Kind**: static class of [<code>db</code>](#paratii.db)  

* [.users](#paratii.db.users)
    * [new users(config)](#new_paratii.db.users_new)
    * [.ParatiiDbUsers#get(userId)](#paratii.db.users.ParatiiDbUsers+get) ⇒ <code>Promise</code>
    * [.ParatiiDbUsers#videos(userId)](#paratii.db.users.ParatiiDbUsers+videos) ⇒ <code>Promise</code>

<a name="new_paratii.db.users_new"></a>

##### new users(config)
ParatiiDbUsers contains functionalities regarding the users to interact with the Paratii Blockchain Index


| Param | Type | Description |
| --- | --- | --- |
| config | <code>Object</code> | object to initialize Paratii object |

<a name="paratii.db.users.ParatiiDbUsers+get"></a>

##### users.ParatiiDbUsers#get(userId) ⇒ <code>Promise</code>
retrieve data about the user

**Kind**: static method of [<code>users</code>](#paratii.db.users)  
**Returns**: <code>Promise</code> - data about the user  

| Param | Type | Description |
| --- | --- | --- |
| userId | <code>String</code> | user univocal id |

**Example**  
```js
paratii.db.users.get('some-user-id')
```
<a name="paratii.db.users.ParatiiDbUsers+videos"></a>

##### users.ParatiiDbUsers#videos(userId) ⇒ <code>Promise</code>
get information about all the videos of the user

**Kind**: static method of [<code>users</code>](#paratii.db.users)  
**Returns**: <code>Promise</code> - Collection of all the videos of the user  

| Param | Type | Description |
| --- | --- | --- |
| userId | <code>String</code> | univocal user identifier |

**Example**  
```js
paratii.db.users.videos('some-user-id')
```
<a name="paratii.db.vids"></a>

#### db.vids
**Kind**: static class of [<code>db</code>](#paratii.db)  

* [.vids](#paratii.db.vids)
    * [new vids(config)](#new_paratii.db.vids_new)
    * [.ParatiiDbVids#get(videoId)](#paratii.db.vids.ParatiiDbVids+get) ⇒ <code>Promise</code>
    * [.ParatiiDbVids#search(options)](#paratii.db.vids.ParatiiDbVids+search) ⇒ <code>Promise</code>

<a name="new_paratii.db.vids_new"></a>

##### new vids(config)
ParatiiDbUsers contains functionalities regarding the videos to interact with the Paratii Blockchain Index


| Param | Type | Description |
| --- | --- | --- |
| config | <code>Object</code> | object to initialize Paratii object |

<a name="paratii.db.vids.ParatiiDbVids+get"></a>

##### vids.ParatiiDbVids#get(videoId) ⇒ <code>Promise</code>
Get information about this video from the db

**Kind**: static method of [<code>vids</code>](#paratii.db.vids)  
**Returns**: <code>Promise</code> - data about the video  

| Param | Type | Description |
| --- | --- | --- |
| videoId | <code>String</code> | univocal video identifier |

**Example**  
```js
paratii.db.vids.get('some-video-id')
```
<a name="paratii.db.vids.ParatiiDbVids+search"></a>

##### vids.ParatiiDbVids#search(options) ⇒ <code>Promise</code>
Get the data of the video

**Kind**: static method of [<code>vids</code>](#paratii.db.vids)  
**Returns**: <code>Promise</code> - data about the video  

| Param | Type | Description |
| --- | --- | --- |
| options | <code>Object</code> | data about the video and (optional) owner i.e {'keyword':'titleOfTheVideo'} |

**Example**  
```js
paratii.db.vids.search({keyword : 'titleOftheVideo'})
the keyword value can be one from the following list
- video title
- description
- owner
- uploader.name
- uploader.address
- tags
```
<a name="paratii.eth"></a>

### paratii.eth
**Kind**: static class of [<code>paratii</code>](#paratii)  

* [.eth](#paratii.eth)
    * [new eth(config)](#new_paratii.eth_new)
    * [.events](#paratii.eth.events)
        * [new events()](#new_paratii.eth.events_new)
        * [.ParatiiEthEvents#_getStructuredEvent(eventType)](#paratii.eth.events.ParatiiEthEvents+_getStructuredEvent) ⇒ <code>Object</code>
        * [.ParatiiEthEvents#addListener(eventType, options, listener)](#paratii.eth.events.ParatiiEthEvents+addListener) ⇒ <code>Promise</code>
        * [.ParatiiEthEvents#_addListener(eventType, listener, options)](#paratii.eth.events.ParatiiEthEvents+_addListener) ⇒ <code>Promise</code>
        * [.ParatiiEthEvents#_isFunction(functionToCheck)](#paratii.eth.events.ParatiiEthEvents+_isFunction) ⇒ <code>Boolean</code>
        * [.ParatiiEthEvents#addSubscription(eventType, subscription)](#paratii.eth.events.ParatiiEthEvents+addSubscription)
        * [.ParatiiEthEvents#removeAllSubscriptions(eventType)](#paratii.eth.events.ParatiiEthEvents+removeAllSubscriptions) ⇒ <code>Object</code>
    * [.tcr](#paratii.eth.tcr)
        * [new tcr(context)](#new_paratii.eth.tcr_new)
        * [.ParatiiEthTcr#getTcrContract()](#paratii.eth.tcr.ParatiiEthTcr+getTcrContract) ⇒ <code>Promise</code>
        * [.ParatiiEthTcr#getMinDeposit()](#paratii.eth.tcr.ParatiiEthTcr+getMinDeposit) ⇒ <code>Float</code>
        * [.ParatiiEthTcr#isWhitelisted(videoId)](#paratii.eth.tcr.ParatiiEthTcr+isWhitelisted) ⇒ <code>boolean</code>
        * [.ParatiiEthTcr#didVideoApply(videoId)](#paratii.eth.tcr.ParatiiEthTcr+didVideoApply) ⇒ <code>boolean</code>
        * [.ParatiiEthTcr#apply(videoId, amountToStake)](#paratii.eth.tcr.ParatiiEthTcr+apply) ⇒ <code>boolean</code>
        * [.ParatiiEthTcr#checkEligiblityAndApply(videoId, amountToStake)](#paratii.eth.tcr.ParatiiEthTcr+checkEligiblityAndApply) ⇒ <code>Promise</code>
        * [.ParatiiEthTcr#exit()](#paratii.eth.tcr.ParatiiEthTcr+exit)
    * [.users](#paratii.eth.users)
        * [new users()](#new_paratii.eth.users_new)
        * [.ParatiiEthUsers#getRegistry()](#paratii.eth.users.ParatiiEthUsers+getRegistry) ⇒ <code>Promise</code>
        * [.ParatiiEthUsers#create(options)](#paratii.eth.users.ParatiiEthUsers+create) ⇒ <code>Promise</code>
        * [.ParatiiEthUsers#get(userId)](#paratii.eth.users.ParatiiEthUsers+get) ⇒ <code>Promise</code>
        * [.ParatiiEthUsers#update(userId, options)](#paratii.eth.users.ParatiiEthUsers+update) ⇒ <code>Promise</code>
        * [.ParatiiEthUsers#delete(userId)](#paratii.eth.users.ParatiiEthUsers+delete) ⇒ <code>Promise</code>
    * [.vids](#paratii.eth.vids)
        * [new vids()](#new_paratii.eth.vids_new)
        * [.ParatiiEthVids#getVideoRegistry()](#paratii.eth.vids.ParatiiEthVids+getVideoRegistry) ⇒ <code>Promise</code>
        * [.ParatiiEthVids#getLikesContract()](#paratii.eth.vids.ParatiiEthVids+getLikesContract) ⇒ <code>Promise</code>
        * [.ParatiiEthVids#getViewsContract()](#paratii.eth.vids.ParatiiEthVids+getViewsContract) ⇒ <code>Promise</code>
        * [.ParatiiEthVids#makeId()](#paratii.eth.vids.ParatiiEthVids+makeId) ⇒ <code>String</code>
        * [.ParatiiEthVids#create(options, [retry])](#paratii.eth.vids.ParatiiEthVids+create) ⇒ <code>Promise</code>
        * [.ParatiiEthVids#get(videoId)](#paratii.eth.vids.ParatiiEthVids+get) ⇒ <code>Promise</code>
        * [.ParatiiEthVids#sendLike(options, type)](#paratii.eth.vids.ParatiiEthVids+sendLike) ⇒ <code>Promise</code>
        * [.ParatiiEthVids#view(options)](#paratii.eth.vids.ParatiiEthVids+view) ⇒ <code>Promise</code>
        * [.ParatiiEthVids#userViewedVideo(options)](#paratii.eth.vids.ParatiiEthVids+userViewedVideo) ⇒ <code>Promise</code>
        * [.ParatiiEthVids#like(videoId)](#paratii.eth.vids.ParatiiEthVids+like) ⇒ <code>Promise</code>
        * [.ParatiiEthVids#dislike(videoId)](#paratii.eth.vids.ParatiiEthVids+dislike) ⇒ <code>Promise</code>
        * [.ParatiiEthVids#doesLike(videoId)](#paratii.eth.vids.ParatiiEthVids+doesLike) ⇒ <code>Promise</code>
        * [.ParatiiEthVids#doesDislike(videoId)](#paratii.eth.vids.ParatiiEthVids+doesDislike) ⇒ <code>Promise</code>
        * [.ParatiiEthVids#update(videoId, options)](#paratii.eth.vids.ParatiiEthVids+update) ⇒ <code>Promise</code>
    * [.vouchers](#paratii.eth.vouchers)
        * [new vouchers()](#new_paratii.eth.vouchers_new)
        * [.ParatiiEthVouchers#getVouchersContract()](#paratii.eth.vouchers.ParatiiEthVouchers+getVouchersContract) ⇒ <code>Promise</code>
        * [.ParatiiEthVouchers#create(options)](#paratii.eth.vouchers.ParatiiEthVouchers+create) ⇒ <code>Promise</code>
        * [.ParatiiEthVouchers#test()](#paratii.eth.vouchers.ParatiiEthVouchers+test)
        * [.ParatiiEthVouchers#createVouchers(number, amount)](#paratii.eth.vouchers.ParatiiEthVouchers+createVouchers) ⇒ <code>Promise</code>
        * [.ParatiiEthVouchers#redeem(voucherCode)](#paratii.eth.vouchers.ParatiiEthVouchers+redeem) ⇒ <code>Promise</code>
    * [.wallet](#paratii.eth.wallet)
        * [new wallet(wallet, config)](#new_paratii.eth.wallet_new)
        * [.create(numberOfAccounts, mnemonic)](#paratii.eth.wallet.create) ⇒ <code>Object</code>
        * [.isValidMnemonic(mnemonic)](#paratii.eth.wallet.isValidMnemonic) ⇒ <code>Boolean</code>
        * [.newMnemonic()](#paratii.eth.wallet.newMnemonic) ⇒ <code>String</code>
        * [._decrypt(data, password)](#paratii.eth.wallet._decrypt) ⇒ <code>Object</code>
    * [.ParatiiEth#setAccount(address, privateKey, mnemonic)](#paratii.eth.ParatiiEth+setAccount)
    * [.ParatiiEth#getContract(name)](#paratii.eth.ParatiiEth+getContract) ⇒ <code>Promise</code>
    * [.ParatiiEth#requireContract(contractName)](#paratii.eth.ParatiiEth+requireContract) ⇒ <code>String</code>
    * [.ParatiiEth#deployContract(name, ...args)](#paratii.eth.ParatiiEth+deployContract) ⇒ <code>Promise</code>
    * [.ParatiiEth#sleep(ms)](#paratii.eth.ParatiiEth+sleep) ⇒ <code>Promise</code>
    * [.ParatiiEth#deployContracts()](#paratii.eth.ParatiiEth+deployContracts) ⇒ <code>Promise</code>
    * [.ParatiiEth#setContractsProvider()](#paratii.eth.ParatiiEth+setContractsProvider)
    * [.ParatiiEth#getContracts()](#paratii.eth.ParatiiEth+getContracts) ⇒ <code>Promise</code>
    * [.ParatiiEth#getContractAddress(name)](#paratii.eth.ParatiiEth+getContractAddress) ⇒ <code>Promise</code>
    * [.ParatiiEth#getRegistryAddress()](#paratii.eth.ParatiiEth+getRegistryAddress) ⇒ <code>String</code>
    * [.ParatiiEth#setRegistryAddress(registryAddress)](#paratii.eth.ParatiiEth+setRegistryAddress)
    * [.ParatiiEth#balanceOf(address, symbol)](#paratii.eth.ParatiiEth+balanceOf) ⇒ <code>Promise</code>
    * [.ParatiiEth#_transferETH(beneficiary, amount, description)](#paratii.eth.ParatiiEth+_transferETH) ⇒ <code>Promise</code>
    * [.ParatiiEth#_transferPTI(beneficiary, amount)](#paratii.eth.ParatiiEth+_transferPTI) ⇒ <code>Promise</code>
    * [.ParatiiEth#transfer(beneficiary, amount, symbol, description)](#paratii.eth.ParatiiEth+transfer) ⇒ <code>Promise</code>

<a name="new_paratii.eth_new"></a>

#### new eth(config)
contains functions to interact with the Ethereum blockchain and the Paratii contracts deployed there.


| Param | Type | Description |
| --- | --- | --- |
| config | <code>Object</code> | configuration object to initialize Paratii object |

<a name="paratii.eth.events"></a>

#### eth.events
**Kind**: static class of [<code>eth</code>](#paratii.eth)  

* [.events](#paratii.eth.events)
    * [new events()](#new_paratii.eth.events_new)
    * [.ParatiiEthEvents#_getStructuredEvent(eventType)](#paratii.eth.events.ParatiiEthEvents+_getStructuredEvent) ⇒ <code>Object</code>
    * [.ParatiiEthEvents#addListener(eventType, options, listener)](#paratii.eth.events.ParatiiEthEvents+addListener) ⇒ <code>Promise</code>
    * [.ParatiiEthEvents#_addListener(eventType, listener, options)](#paratii.eth.events.ParatiiEthEvents+_addListener) ⇒ <code>Promise</code>
    * [.ParatiiEthEvents#_isFunction(functionToCheck)](#paratii.eth.events.ParatiiEthEvents+_isFunction) ⇒ <code>Boolean</code>
    * [.ParatiiEthEvents#addSubscription(eventType, subscription)](#paratii.eth.events.ParatiiEthEvents+addSubscription)
    * [.ParatiiEthEvents#removeAllSubscriptions(eventType)](#paratii.eth.events.ParatiiEthEvents+removeAllSubscriptions) ⇒ <code>Object</code>

<a name="new_paratii.eth.events_new"></a>

##### new events()
eth.events implements a part of the API of the EventEmitter, that can be used to manage subscriptions to Ethereum events.

<a name="paratii.eth.events.ParatiiEthEvents+_getStructuredEvent"></a>

##### events.ParatiiEthEvents#_getStructuredEvent(eventType) ⇒ <code>Object</code>
parse event from simple string to an object

**Kind**: static method of [<code>events</code>](#paratii.eth.events)  
**Returns**: <code>Object</code> - Event Object  

| Param | Type | Description |
| --- | --- | --- |
| eventType | <code>String</code> | Event type |

**Example**  
```js
let structuredEvent = this._getStructuredEvent('some-event')
```
<a name="paratii.eth.events.ParatiiEthEvents+addListener"></a>

##### events.ParatiiEthEvents#addListener(eventType, options, listener) ⇒ <code>Promise</code>
subscribe to the specified event

**Kind**: static method of [<code>events</code>](#paratii.eth.events)  
**Returns**: <code>Promise</code> - [description]  

| Param | Type | Description |
| --- | --- | --- |
| eventType | <code>String</code> | type of the event |
| options | <code>function</code> | function called when the events occurs |
| listener | <code>?</code> | optional ? |

<a name="paratii.eth.events.ParatiiEthEvents+_addListener"></a>

##### events.ParatiiEthEvents#_addListener(eventType, listener, options) ⇒ <code>Promise</code>
[_addListener description]
TODO RIVEDI I TIPI

**Kind**: static method of [<code>events</code>](#paratii.eth.events)  
**Returns**: <code>Promise</code> - [description]  

| Param | Type | Description |
| --- | --- | --- |
| eventType | <code>Object</code> | [description] |
| listener | <code>Object</code> | [description] |
| options | <code>Object</code> | [description] |

<a name="paratii.eth.events.ParatiiEthEvents+_isFunction"></a>

##### events.ParatiiEthEvents#_isFunction(functionToCheck) ⇒ <code>Boolean</code>
[_isFunction description]
TODO RIVEDI I TIPI

**Kind**: static method of [<code>events</code>](#paratii.eth.events)  
**Returns**: <code>Boolean</code> - [description]  

| Param | Type | Description |
| --- | --- | --- |
| functionToCheck | <code>Object</code> | [description] |

<a name="paratii.eth.events.ParatiiEthEvents+addSubscription"></a>

##### events.ParatiiEthEvents#addSubscription(eventType, subscription)
[addSubscription description]
TODO RIVEDI I TIPI

**Kind**: static method of [<code>events</code>](#paratii.eth.events)  

| Param | Type | Description |
| --- | --- | --- |
| eventType | <code>Object</code> | [description] |
| subscription | <code>Object</code> | [description] |

<a name="paratii.eth.events.ParatiiEthEvents+removeAllSubscriptions"></a>

##### events.ParatiiEthEvents#removeAllSubscriptions(eventType) ⇒ <code>Object</code>
[removeAllSubscriptions description]
TODO RIVEDI I TIPI

**Kind**: static method of [<code>events</code>](#paratii.eth.events)  
**Returns**: <code>Object</code> - [description]  

| Param | Type | Description |
| --- | --- | --- |
| eventType | <code>Object</code> | [description] |

<a name="paratii.eth.tcr"></a>

#### eth.tcr
**Kind**: static class of [<code>eth</code>](#paratii.eth)  

* [.tcr](#paratii.eth.tcr)
    * [new tcr(context)](#new_paratii.eth.tcr_new)
    * [.ParatiiEthTcr#getTcrContract()](#paratii.eth.tcr.ParatiiEthTcr+getTcrContract) ⇒ <code>Promise</code>
    * [.ParatiiEthTcr#getMinDeposit()](#paratii.eth.tcr.ParatiiEthTcr+getMinDeposit) ⇒ <code>Float</code>
    * [.ParatiiEthTcr#isWhitelisted(videoId)](#paratii.eth.tcr.ParatiiEthTcr+isWhitelisted) ⇒ <code>boolean</code>
    * [.ParatiiEthTcr#didVideoApply(videoId)](#paratii.eth.tcr.ParatiiEthTcr+didVideoApply) ⇒ <code>boolean</code>
    * [.ParatiiEthTcr#apply(videoId, amountToStake)](#paratii.eth.tcr.ParatiiEthTcr+apply) ⇒ <code>boolean</code>
    * [.ParatiiEthTcr#checkEligiblityAndApply(videoId, amountToStake)](#paratii.eth.tcr.ParatiiEthTcr+checkEligiblityAndApply) ⇒ <code>Promise</code>
    * [.ParatiiEthTcr#exit()](#paratii.eth.tcr.ParatiiEthTcr+exit)

<a name="new_paratii.eth.tcr_new"></a>

##### new tcr(context)
TCR functionality

**Returns**: <code>TCR</code> - returns instances of Tcr  

| Param | Type | Description |
| --- | --- | --- |
| context | <code>object</code> | ParatiiEth Instance |

<a name="paratii.eth.tcr.ParatiiEthTcr+getTcrContract"></a>

##### tcr.ParatiiEthTcr#getTcrContract() ⇒ <code>Promise</code>
get TCR contract instance.

**Kind**: static method of [<code>tcr</code>](#paratii.eth.tcr)  
**Returns**: <code>Promise</code> - Contract instance.  
<a name="paratii.eth.tcr.ParatiiEthTcr+getMinDeposit"></a>

##### tcr.ParatiiEthTcr#getMinDeposit() ⇒ <code>Float</code>
get the minimum amount required to stake a video.

**Kind**: static method of [<code>tcr</code>](#paratii.eth.tcr)  
**Returns**: <code>Float</code> - amount required in PTI  
**Todo**

- [ ] return amount as bignumber.js Object

<a name="paratii.eth.tcr.ParatiiEthTcr+isWhitelisted"></a>

##### tcr.ParatiiEthTcr#isWhitelisted(videoId) ⇒ <code>boolean</code>
check if video is already whitelisted or not. note that this returns false
till the video is actually whitelisted. use didVideoApply in case you want
to check whether the video is in application process.

**Kind**: static method of [<code>tcr</code>](#paratii.eth.tcr)  
**Returns**: <code>boolean</code> - is video whitelisted or not.  

| Param | Type | Description |
| --- | --- | --- |
| videoId | <code>string</code> | videoId |

<a name="paratii.eth.tcr.ParatiiEthTcr+didVideoApply"></a>

##### tcr.ParatiiEthTcr#didVideoApply(videoId) ⇒ <code>boolean</code>
check whether a video started the application process or not yet.

**Kind**: static method of [<code>tcr</code>](#paratii.eth.tcr)  
**Returns**: <code>boolean</code> - did the video start the TCR process.  

| Param | Type | Description |
| --- | --- | --- |
| videoId | <code>string</code> | videoId |

<a name="paratii.eth.tcr.ParatiiEthTcr+apply"></a>

##### tcr.ParatiiEthTcr#apply(videoId, amountToStake) ⇒ <code>boolean</code>
start the application process.
NOTE that this require the client approves PTI amount first before actually
running this function, use `checkEligiblityAndApply` instead.

**Kind**: static method of [<code>tcr</code>](#paratii.eth.tcr)  
**Returns**: <code>boolean</code> - returns true if all is good, plus _Application
event.  

| Param | Type | Description |
| --- | --- | --- |
| videoId | <code>string</code> | videoId |
| amountToStake | <code>Float</code> | number of tokens to stake. must >= minDeposit |

<a name="paratii.eth.tcr.ParatiiEthTcr+checkEligiblityAndApply"></a>

##### tcr.ParatiiEthTcr#checkEligiblityAndApply(videoId, amountToStake) ⇒ <code>Promise</code>
Stake amountToStake on video with id videoId
does a number of separate steps:
- check preconditions for staking
- approve that the TCR contract can transfer amountToStake tokens
- apply to the TCR

**Kind**: static method of [<code>tcr</code>](#paratii.eth.tcr)  
**Returns**: <code>Promise</code> - [description]  

| Param | Type | Description |
| --- | --- | --- |
| videoId | <code>strin</code> | [description] |
| amountToStake | <code>number</code> | [description] |

<a name="paratii.eth.tcr.ParatiiEthTcr+exit"></a>

##### tcr.ParatiiEthTcr#exit()
remove the video given by videoId from the listing

**Kind**: static method of [<code>tcr</code>](#paratii.eth.tcr)  
<a name="paratii.eth.users"></a>

#### eth.users
**Kind**: static class of [<code>eth</code>](#paratii.eth)  

* [.users](#paratii.eth.users)
    * [new users()](#new_paratii.eth.users_new)
    * [.ParatiiEthUsers#getRegistry()](#paratii.eth.users.ParatiiEthUsers+getRegistry) ⇒ <code>Promise</code>
    * [.ParatiiEthUsers#create(options)](#paratii.eth.users.ParatiiEthUsers+create) ⇒ <code>Promise</code>
    * [.ParatiiEthUsers#get(userId)](#paratii.eth.users.ParatiiEthUsers+get) ⇒ <code>Promise</code>
    * [.ParatiiEthUsers#update(userId, options)](#paratii.eth.users.ParatiiEthUsers+update) ⇒ <code>Promise</code>
    * [.ParatiiEthUsers#delete(userId)](#paratii.eth.users.ParatiiEthUsers+delete) ⇒ <code>Promise</code>

<a name="new_paratii.eth.users_new"></a>

##### new users()
The eth.user namespace contains functions to interact with the video registration on the blockchain.

<a name="paratii.eth.users.ParatiiEthUsers+getRegistry"></a>

##### users.ParatiiEthUsers#getRegistry() ⇒ <code>Promise</code>
Get the contract instance of the user contract

**Kind**: static method of [<code>users</code>](#paratii.eth.users)  
**Returns**: <code>Promise</code> - Object representing the contract  
<a name="paratii.eth.users.ParatiiEthUsers+create"></a>

##### users.ParatiiEthUsers#create(options) ⇒ <code>Promise</code>
Creates a user

**Kind**: static method of [<code>users</code>](#paratii.eth.users)  
**Returns**: <code>Promise</code> - the id of the newly created user  

| Param | Type | Description |
| --- | --- | --- |
| options | <code>Object</code> | information about the user |
| options.id | <code>String</code> | valid address |
| options.name | <code>String</code> | name of the user |
| options.email | <code>String</code> | email of the user |
| options.ipfsData | <code>String</code> | ipfs hash |

**Example**  
```js
let userData = {
                   id: 'some-id',
                   name: 'Humbert Humbert',
                   email: 'humbert@humbert.ru',
                   ipfsData: 'some-hash'
             }
        let result = await paratii.eth.users.create(userData)
```
<a name="paratii.eth.users.ParatiiEthUsers+get"></a>

##### users.ParatiiEthUsers#get(userId) ⇒ <code>Promise</code>
Get a users details from the blockchain

**Kind**: static method of [<code>users</code>](#paratii.eth.users)  
**Returns**: <code>Promise</code> - information about the user  

| Param | Type | Description |
| --- | --- | --- |
| userId | <code>String</code> | valid address |

**Example**  
```js
user = await paratii.eth.users.get('some-id')
```
<a name="paratii.eth.users.ParatiiEthUsers+update"></a>

##### users.ParatiiEthUsers#update(userId, options) ⇒ <code>Promise</code>
Updates a user details on the blockchain.

**Kind**: static method of [<code>users</code>](#paratii.eth.users)  
**Returns**: <code>Promise</code> - updated data  

| Param | Type | Description |
| --- | --- | --- |
| userId | <code>String</code> | valid address |
| options | <code>Object</code> | information to update. Left-out data is kept the same. |

**Example**  
```js
await paratii.eth.users.update('some-id', {ipfsData: 'new-hash'})
```
<a name="paratii.eth.users.ParatiiEthUsers+delete"></a>

##### users.ParatiiEthUsers#delete(userId) ⇒ <code>Promise</code>
Deletes a user from the blockchain. Can only be called by the contract owner or the user him/her-self

**Kind**: static method of [<code>users</code>](#paratii.eth.users)  
**Returns**: <code>Promise</code> - blockchain transaction  

| Param | Type | Description |
| --- | --- | --- |
| userId | <code>String</code> | valid address |

**Example**  
```js
await paratii.eth.users.delete('some-id')
```
<a name="paratii.eth.vids"></a>

#### eth.vids
**Kind**: static class of [<code>eth</code>](#paratii.eth)  

* [.vids](#paratii.eth.vids)
    * [new vids()](#new_paratii.eth.vids_new)
    * [.ParatiiEthVids#getVideoRegistry()](#paratii.eth.vids.ParatiiEthVids+getVideoRegistry) ⇒ <code>Promise</code>
    * [.ParatiiEthVids#getLikesContract()](#paratii.eth.vids.ParatiiEthVids+getLikesContract) ⇒ <code>Promise</code>
    * [.ParatiiEthVids#getViewsContract()](#paratii.eth.vids.ParatiiEthVids+getViewsContract) ⇒ <code>Promise</code>
    * [.ParatiiEthVids#makeId()](#paratii.eth.vids.ParatiiEthVids+makeId) ⇒ <code>String</code>
    * [.ParatiiEthVids#create(options, [retry])](#paratii.eth.vids.ParatiiEthVids+create) ⇒ <code>Promise</code>
    * [.ParatiiEthVids#get(videoId)](#paratii.eth.vids.ParatiiEthVids+get) ⇒ <code>Promise</code>
    * [.ParatiiEthVids#sendLike(options, type)](#paratii.eth.vids.ParatiiEthVids+sendLike) ⇒ <code>Promise</code>
    * [.ParatiiEthVids#view(options)](#paratii.eth.vids.ParatiiEthVids+view) ⇒ <code>Promise</code>
    * [.ParatiiEthVids#userViewedVideo(options)](#paratii.eth.vids.ParatiiEthVids+userViewedVideo) ⇒ <code>Promise</code>
    * [.ParatiiEthVids#like(videoId)](#paratii.eth.vids.ParatiiEthVids+like) ⇒ <code>Promise</code>
    * [.ParatiiEthVids#dislike(videoId)](#paratii.eth.vids.ParatiiEthVids+dislike) ⇒ <code>Promise</code>
    * [.ParatiiEthVids#doesLike(videoId)](#paratii.eth.vids.ParatiiEthVids+doesLike) ⇒ <code>Promise</code>
    * [.ParatiiEthVids#doesDislike(videoId)](#paratii.eth.vids.ParatiiEthVids+doesDislike) ⇒ <code>Promise</code>
    * [.ParatiiEthVids#update(videoId, options)](#paratii.eth.vids.ParatiiEthVids+update) ⇒ <code>Promise</code>

<a name="new_paratii.eth.vids_new"></a>

##### new vids()
The eth.vids namespace contains functions to interact with the video registration on the blockchain.

<a name="paratii.eth.vids.ParatiiEthVids+getVideoRegistry"></a>

##### vids.ParatiiEthVids#getVideoRegistry() ⇒ <code>Promise</code>
Get the contract instance of the videos contract

**Kind**: static method of [<code>vids</code>](#paratii.eth.vids)  
**Returns**: <code>Promise</code> - Object representing the contract  
**Example**  
```js
let contract = await paratii.eth.vids.getVideoRegistry()
```
<a name="paratii.eth.vids.ParatiiEthVids+getLikesContract"></a>

##### vids.ParatiiEthVids#getLikesContract() ⇒ <code>Promise</code>
Get the contract instance of the likes contract

**Kind**: static method of [<code>vids</code>](#paratii.eth.vids)  
**Returns**: <code>Promise</code> - Object representing the contract  
**Example**  
```js
let contract = await paratii.eth.vids.getLikesContract()
```
<a name="paratii.eth.vids.ParatiiEthVids+getViewsContract"></a>

##### vids.ParatiiEthVids#getViewsContract() ⇒ <code>Promise</code>
Get the contract instance of the views contract

**Kind**: static method of [<code>vids</code>](#paratii.eth.vids)  
**Returns**: <code>Promise</code> - Object representing the contract  
**Example**  
```js
let contract = await paratii.eth.vids.getViewsContract()
```
<a name="paratii.eth.vids.ParatiiEthVids+makeId"></a>

##### vids.ParatiiEthVids#makeId() ⇒ <code>String</code>
Creates a random id

**Kind**: static method of [<code>vids</code>](#paratii.eth.vids)  
**Returns**: <code>String</code> - id created  
**Example**  
```js
let id = paratii.eth.vids.makeId()
```
<a name="paratii.eth.vids.ParatiiEthVids+create"></a>

##### vids.ParatiiEthVids#create(options, [retry]) ⇒ <code>Promise</code>
Record the video on the blockchain

**Kind**: static method of [<code>vids</code>](#paratii.eth.vids)  
**Returns**: <code>Promise</code> - the video id  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| options | <code>Object</code> |  | data about the video |
| [retry] | <code>Number</code> | <code>1</code> | optional, default = 1 |

**Example**  
```js
let videoId = await paratii.eth.vids.create({
                                   id: 'some-id',
                                   price: 20,
                                   owner: 'some-address',
                                   ipfsHash: 'some-hash'
                         })
```
<a name="paratii.eth.vids.ParatiiEthVids+get"></a>

##### vids.ParatiiEthVids#get(videoId) ⇒ <code>Promise</code>
get data about the video

**Kind**: static method of [<code>vids</code>](#paratii.eth.vids)  
**Returns**: <code>Promise</code> - data about the video  

| Param | Type | Description |
| --- | --- | --- |
| videoId | <code>String</code> | univocal video id |

**Example**  
```js
let video = eth.vids.get('0x12345')
```
<a name="paratii.eth.vids.ParatiiEthVids+sendLike"></a>

##### vids.ParatiiEthVids#sendLike(options, type) ⇒ <code>Promise</code>
record a like/dislike to the video on the blockchain
TODO RIVEDI I TIPI

**Kind**: static method of [<code>vids</code>](#paratii.eth.vids)  
**Returns**: <code>Promise</code> - transaction recording the like  

| Param | Type | Description |
| --- | --- | --- |
| options | <code>Object</code> | data about the video to like |
| options.videoId | <code>String</code> | univocal video id |
| options.liked | <code>Boolean</code> | true/false |
| type | <code>Object</code> | REMOVE ???? NOT USED |

**Example**  
```js
await paratii.eth.vids.sendLike({ videoId: 'some-id', liked: true })
```
**Example**  
```js
await paratii.eth.vids.sendLike({ videoId: 'some-id', liked: false })
```
<a name="paratii.eth.vids.ParatiiEthVids+view"></a>

##### vids.ParatiiEthVids#view(options) ⇒ <code>Promise</code>
record a views to the video on the blockchain

**Kind**: static method of [<code>vids</code>](#paratii.eth.vids)  
**Returns**: <code>Promise</code> - transaction recording the view  

| Param | Type | Description |
| --- | --- | --- |
| options | <code>Object</code> | data about the video and the viewer |
| options.viewer | <code>String</code> | address of the viewer |
| options.videoId | <code>String</code> | univocal video identifier |
| options.ipfsData | <code>String</code> | ipfs multihash |

**Example**  
```js
await paratii.eth.vids.view({viewer:'some-user-id',videoId: 'some-video-id'})
```
<a name="paratii.eth.vids.ParatiiEthVids+userViewedVideo"></a>

##### vids.ParatiiEthVids#userViewedVideo(options) ⇒ <code>Promise</code>
Check if the viewer has already viewed the video

**Kind**: static method of [<code>vids</code>](#paratii.eth.vids)  
**Returns**: <code>Promise</code> - true if the current user already viewed the video, false otherwise  

| Param | Type | Description |
| --- | --- | --- |
| options | <code>Object</code> | data about the video and the viewer |
| options.viewer | <code>String</code> | viewer address |
| options.videoId | <code>String</code> | univocal video identifier |

**Example**  
```js
let result = await paratii.eth.vids.userViewedVideo({viewer:'some-user-id',videoId: 'some-video-id'})
```
<a name="paratii.eth.vids.ParatiiEthVids+like"></a>

##### vids.ParatiiEthVids#like(videoId) ⇒ <code>Promise</code>
Writes a like for the video on the blockchain (contract Likes), and negates a dislike for the video, if it exists.

**Kind**: static method of [<code>vids</code>](#paratii.eth.vids)  
**Returns**: <code>Promise</code> - transaction recording the like  

| Param | Type | Description |
| --- | --- | --- |
| videoId | <code>String</code> | univocal video identifier |

**Example**  
```js
let result = paratii.eth.vids.like('some-id')
```
<a name="paratii.eth.vids.ParatiiEthVids+dislike"></a>

##### vids.ParatiiEthVids#dislike(videoId) ⇒ <code>Promise</code>
Writes a dislike for the video on the blockchain (contract Likes), and negates a like for the video, if it exists.

**Kind**: static method of [<code>vids</code>](#paratii.eth.vids)  
**Returns**: <code>Promise</code> - transaction recording the dislike  

| Param | Type | Description |
| --- | --- | --- |
| videoId | <code>String</code> | univocal video identifier |

**Example**  
```js
let result = paratii.eth.vids.dislike('some-id')
```
<a name="paratii.eth.vids.ParatiiEthVids+doesLike"></a>

##### vids.ParatiiEthVids#doesLike(videoId) ⇒ <code>Promise</code>
Check if the current user has already liked the video

**Kind**: static method of [<code>vids</code>](#paratii.eth.vids)  
**Returns**: <code>Promise</code> - true if the current user already liked the video, false otherwise  

| Param | Type | Description |
| --- | --- | --- |
| videoId | <code>String</code> | univocal video identifier |

**Example**  
```js
let result = paratii.eth.vids.doesLike('some-id')
```
<a name="paratii.eth.vids.ParatiiEthVids+doesDislike"></a>

##### vids.ParatiiEthVids#doesDislike(videoId) ⇒ <code>Promise</code>
Check if the current user has already disliked the video.

**Kind**: static method of [<code>vids</code>](#paratii.eth.vids)  
**Returns**: <code>Promise</code> - true if the current user already disliked the video, false otherwise  

| Param | Type | Description |
| --- | --- | --- |
| videoId | <code>String</code> | univocal video identifier |

**Example**  
```js
let result = paratii.eth.vids.doesDislike('some-id')
```
<a name="paratii.eth.vids.ParatiiEthVids+update"></a>

##### vids.ParatiiEthVids#update(videoId, options) ⇒ <code>Promise</code>
Update the information on the video.
 Only the account that has registered the video, or the owner of the contract, can update the information.

**Kind**: static method of [<code>vids</code>](#paratii.eth.vids)  
**Returns**: <code>Promise</code> - Updated video informations  

| Param | Type | Description |
| --- | --- | --- |
| videoId | <code>String</code> | univocal video identifier |
| options | <code>Object</code> | key value pairs of properties and new values e.g. ({title: 'another-title'}) |

**Example**  
```js
paratii.eth.vids.update('some-video-id', {title: 'another-title'})
```
<a name="paratii.eth.vouchers"></a>

#### eth.vouchers
**Kind**: static class of [<code>eth</code>](#paratii.eth)  

* [.vouchers](#paratii.eth.vouchers)
    * [new vouchers()](#new_paratii.eth.vouchers_new)
    * [.ParatiiEthVouchers#getVouchersContract()](#paratii.eth.vouchers.ParatiiEthVouchers+getVouchersContract) ⇒ <code>Promise</code>
    * [.ParatiiEthVouchers#create(options)](#paratii.eth.vouchers.ParatiiEthVouchers+create) ⇒ <code>Promise</code>
    * [.ParatiiEthVouchers#test()](#paratii.eth.vouchers.ParatiiEthVouchers+test)
    * [.ParatiiEthVouchers#createVouchers(number, amount)](#paratii.eth.vouchers.ParatiiEthVouchers+createVouchers) ⇒ <code>Promise</code>
    * [.ParatiiEthVouchers#redeem(voucherCode)](#paratii.eth.vouchers.ParatiiEthVouchers+redeem) ⇒ <code>Promise</code>

<a name="new_paratii.eth.vouchers_new"></a>

##### new vouchers()
Functions for redeeming vouchers

<a name="paratii.eth.vouchers.ParatiiEthVouchers+getVouchersContract"></a>

##### vouchers.ParatiiEthVouchers#getVouchersContract() ⇒ <code>Promise</code>
Get the contract instance of the vouchers contract

**Kind**: static method of [<code>vouchers</code>](#paratii.eth.vouchers)  
**Returns**: <code>Promise</code> - Object representing the contract  
**Example**  
```js
let contract = await paratii.eth.vids.getVouchersContract()
```
<a name="paratii.eth.vouchers.ParatiiEthVouchers+create"></a>

##### vouchers.ParatiiEthVouchers#create(options) ⇒ <code>Promise</code>
Function for creating a voucher. Can only be called by the owner of the contract.

**Kind**: static method of [<code>vouchers</code>](#paratii.eth.vouchers)  
**Returns**: <code>Promise</code> - the voucher id  

| Param | Type | Description |
| --- | --- | --- |
| options | <code>Object</code> | data about the voucher |
| options.voucherCode | <code>String</code> | unique string associated to this voucher |
| options.amount | <code>Number</code> | amount of PTI in wei of this voucher |

**Example**  
```js
await paratii.eth.vouchers.create({ voucherCode: 'some-id', amount: 10 })
```
<a name="paratii.eth.vouchers.ParatiiEthVouchers+test"></a>

##### vouchers.ParatiiEthVouchers#test()
throws a test error

**Kind**: static method of [<code>vouchers</code>](#paratii.eth.vouchers)  
<a name="paratii.eth.vouchers.ParatiiEthVouchers+createVouchers"></a>

##### vouchers.ParatiiEthVouchers#createVouchers(number, amount) ⇒ <code>Promise</code>
Generates a given number of vouchers with unique IDs, and the given amount, and returns an array of objects.

**Kind**: static method of [<code>vouchers</code>](#paratii.eth.vouchers)  
**Returns**: <code>Promise</code> - Object containing every voucher created  

| Param | Type | Description |
| --- | --- | --- |
| number | <code>Number</code> | number of voucher to create |
| amount | <code>Number</code> | amount of every voucher |

**Example**  
```js
let vouchers = await paratii.eth.vouchers.createVouchers(10, 10)
```
<a name="paratii.eth.vouchers.ParatiiEthVouchers+redeem"></a>

##### vouchers.ParatiiEthVouchers#redeem(voucherCode) ⇒ <code>Promise</code>
Function for redeeming a voucher to the current account's address.

**Kind**: static method of [<code>vouchers</code>](#paratii.eth.vouchers)  
**Returns**: <code>Promise</code> - true if everything goes well, otherwise throws an error  

| Param | Type | Description |
| --- | --- | --- |
| voucherCode | <code>String</code> | univocal voucher code |

**Example**  
```js
await paratii.eth.vouchers.redeem('some-code')
```
<a name="paratii.eth.wallet"></a>

#### eth.wallet
**Kind**: static class of [<code>eth</code>](#paratii.eth)  

* [.wallet](#paratii.eth.wallet)
    * [new wallet(wallet, config)](#new_paratii.eth.wallet_new)
    * [.create(numberOfAccounts, mnemonic)](#paratii.eth.wallet.create) ⇒ <code>Object</code>
    * [.isValidMnemonic(mnemonic)](#paratii.eth.wallet.isValidMnemonic) ⇒ <code>Boolean</code>
    * [.newMnemonic()](#paratii.eth.wallet.newMnemonic) ⇒ <code>String</code>
    * [._decrypt(data, password)](#paratii.eth.wallet._decrypt) ⇒ <code>Object</code>

<a name="new_paratii.eth.wallet_new"></a>

##### new wallet(wallet, config)
overrides some web3js wallet functionalties

**Returns**: <code>Object</code> - patched wallet  

| Param | Type | Description |
| --- | --- | --- |
| wallet | <code>Object</code> | wallet to patch |
| config | <code>Object</code> | configuration object to initialize Paratii object |

<a name="paratii.eth.wallet.create"></a>

##### wallet.create(numberOfAccounts, mnemonic) ⇒ <code>Object</code>
Create a wallet with a given number of accounts from a BIP39 mnemonic

**Kind**: static method of [<code>wallet</code>](#paratii.eth.wallet)  
**Returns**: <code>Object</code> - the created wallet  

| Param | Type | Description |
| --- | --- | --- |
| numberOfAccounts | <code>Number</code> | number of accounts to be created |
| mnemonic | <code>String</code> | optional - mnemonic of the wallet, if not specified a random one is generated |

**Example**  
```js
wallet = await wallet.create(5, 'some long mnemonic phrase')
```
<a name="paratii.eth.wallet.isValidMnemonic"></a>

##### wallet.isValidMnemonic(mnemonic) ⇒ <code>Boolean</code>
check if the passed mnemonic is bip39 valid

**Kind**: static method of [<code>wallet</code>](#paratii.eth.wallet)  
**Returns**: <code>Boolean</code> - true if the mnemonic is valid, false otherwise  

| Param | Type | Description |
| --- | --- | --- |
| mnemonic | <code>String</code> | mnemonic to check |

**Example**  
```js
paratii.eth.wallet.isValidMnemonic('some long mnemonic phrase')
```
<a name="paratii.eth.wallet.newMnemonic"></a>

##### wallet.newMnemonic() ⇒ <code>String</code>
generates a new mnemonic

**Kind**: static method of [<code>wallet</code>](#paratii.eth.wallet)  
**Returns**: <code>String</code> - newly generated mnemonic  
**Example**  
```js
let newMnemonic = paratii.eth.wallet.generateMnemonic()
```
<a name="paratii.eth.wallet._decrypt"></a>

##### wallet._decrypt(data, password) ⇒ <code>Object</code>
decrypts the wallet

**Kind**: static method of [<code>wallet</code>](#paratii.eth.wallet)  
**Returns**: <code>Object</code> - decrypted wallet  

| Param | Type | Description |
| --- | --- | --- |
| data | <code>Object</code> | encrypted wallet |
| password | <code>String</code> | password to decrypt |

**Example**  
```js
let decryptedWallet = paratii.eth.wallet._decrypt(encryptedWallet,'some-psw')
```
<a name="paratii.eth.ParatiiEth+setAccount"></a>

#### eth.ParatiiEth#setAccount(address, privateKey, mnemonic)
creates an account using the private key or, if not present, using the mnemonic

**Kind**: static method of [<code>eth</code>](#paratii.eth)  

| Param | Type | Description |
| --- | --- | --- |
| address | <code>String</code> | public address |
| privateKey | <code>String</code> | private key related to the previous public address |
| mnemonic | <code>String</code> | mnemonic related to the previous public address |

**Example**  
```js
paratii.eth.setAccount('some-address','some-private-key')
```
**Example**  
```js
paratii.eth.setAccount('some-address','some-mnemonic')
```
<a name="paratii.eth.ParatiiEth+getContract"></a>

#### eth.ParatiiEth#getContract(name) ⇒ <code>Promise</code>
Get the contract instance specified

**Kind**: static method of [<code>eth</code>](#paratii.eth)  
**Returns**: <code>Promise</code> - Object representing the contract  

| Param | Type | Description |
| --- | --- | --- |
| name | <code>String</code> | the name of the token |

**Example**  
```js
paratii.eth.getContract('ParatiiToken')
```
<a name="paratii.eth.ParatiiEth+requireContract"></a>

#### eth.ParatiiEth#requireContract(contractName) ⇒ <code>String</code>
creates the javascript contract object from the json file

**Kind**: static method of [<code>eth</code>](#paratii.eth)  
**Returns**: <code>String</code> - Contract Object  

| Param | Type | Description |
| --- | --- | --- |
| contractName | <code>String</code> | name of the contract |

**Example**  
```js
paratii.eth.requireContract('ParatiiToken')
```
<a name="paratii.eth.ParatiiEth+deployContract"></a>

#### eth.ParatiiEth#deployContract(name, ...args) ⇒ <code>Promise</code>
deploys contract on the blockchain

**Kind**: static method of [<code>eth</code>](#paratii.eth)  
**Returns**: <code>Promise</code> - the deployed contract  

| Param | Type | Description |
| --- | --- | --- |
| name | <code>String</code> | name of the contract |
| ...args | <code>Object</code> | configuration for the contract (strings or numbers). It is allowed to pass more than one parameter |

**Example**  
```js
paratii.eth.deployContract('ParatiiToken')
```
<a name="paratii.eth.ParatiiEth+sleep"></a>

#### eth.ParatiiEth#sleep(ms) ⇒ <code>Promise</code>
TODO: this is for testing - remove this

**Kind**: static method of [<code>eth</code>](#paratii.eth)  
**Returns**: <code>Promise</code> - ?  

| Param | Type | Description |
| --- | --- | --- |
| ms | <code>Number</code> | millisec |

**Example**  
```js
?
```
<a name="paratii.eth.ParatiiEth+deployContracts"></a>

#### eth.ParatiiEth#deployContracts() ⇒ <code>Promise</code>
deploy all the contracts on the blockchain

**Kind**: static method of [<code>eth</code>](#paratii.eth)  
**Returns**: <code>Promise</code> - all the paratii contracts  
**Example**  
```js
let contracts = await paratii.eth.deployContracts()
```
**Example**  
```js
let likes = await this.deployContract('Likes', paratiiRegistryAddress)
```
<a name="paratii.eth.ParatiiEth+setContractsProvider"></a>

#### eth.ParatiiEth#setContractsProvider()
Set the provider on all the contracts

**Kind**: static method of [<code>eth</code>](#paratii.eth)  
**Example**  
```js
paratii.eth.setContractsProvider()
```
<a name="paratii.eth.ParatiiEth+getContracts"></a>

#### eth.ParatiiEth#getContracts() ⇒ <code>Promise</code>
return all the contracts

**Kind**: static method of [<code>eth</code>](#paratii.eth)  
**Returns**: <code>Promise</code> - all the contracts  
**Example**  
```js
let contracts = await paratii.eth.getContracts()
```
<a name="paratii.eth.ParatiiEth+getContractAddress"></a>

#### eth.ParatiiEth#getContractAddress(name) ⇒ <code>Promise</code>
get the address of the contract on the blockchain

**Kind**: static method of [<code>eth</code>](#paratii.eth)  
**Returns**: <code>Promise</code> - Contract address on the blockchain (String)  

| Param | Type | Description |
| --- | --- | --- |
| name | <code>String</code> | name of the contract |

**Example**  
```js
paratii.eth.getContractAddress('ParatiiToken')
```
<a name="paratii.eth.ParatiiEth+getRegistryAddress"></a>

#### eth.ParatiiEth#getRegistryAddress() ⇒ <code>String</code>
get the address of the Registry contract on the blockchain

**Kind**: static method of [<code>eth</code>](#paratii.eth)  
**Returns**: <code>String</code> - address on the blockchain  
**Example**  
```js
let registryAddress = paratii.eth.getRegistryAddress()
```
<a name="paratii.eth.ParatiiEth+setRegistryAddress"></a>

#### eth.ParatiiEth#setRegistryAddress(registryAddress)
set the address of the Registry contract on the blockchain

**Kind**: static method of [<code>eth</code>](#paratii.eth)  

| Param | Type | Description |
| --- | --- | --- |
| registryAddress | <code>String</code> | new address |

**Example**  
```js
await paratii.eth.setRegistryAddress('some-address')
```
<a name="paratii.eth.ParatiiEth+balanceOf"></a>

#### eth.ParatiiEth#balanceOf(address, symbol) ⇒ <code>Promise</code>
When called with a second argument, returns the balance of that Token.<br>
When called without a second argument, returns information about all relevant balances.

**Kind**: static method of [<code>eth</code>](#paratii.eth)  
**Returns**: <code>Promise</code> - information about balances of that address  

| Param | Type | Description |
| --- | --- | --- |
| address | <code>String</code> | ethereum address |
| symbol | <code>String</code> | optional - symbol of the token (ETH,PTI) |

**Example**  
```js
paratii.eth.balanceOf('some-address', 'ETH') // returns the ETH balance of the given address
```
**Example**  
```js
paratii.eth.balanceOf('some-address', 'PTI') // returns the PTI balance of the given address
```
**Example**  
```js
paratii.eth.balanceOf('some-address') // returns both the PTI and the ETH balance of the given address
```
<a name="paratii.eth.ParatiiEth+_transferETH"></a>

#### eth.ParatiiEth#_transferETH(beneficiary, amount, description) ⇒ <code>Promise</code>
send ETH from current account to beneficiary

**Kind**: static method of [<code>eth</code>](#paratii.eth)  
**Returns**: <code>Promise</code> - information about the transaction recording the transfer  

| Param | Type | Description |
| --- | --- | --- |
| beneficiary | <code>String</code> | ETH address |
| amount | <code>Number</code> | amount of ETH to be sent |
| description | <code>String</code> | optional - description of the transaction (will be written in the blockchain) |

**Example**  
```js
return paratii.eth._transferETH('some-address', 20, 'an-optional-description')
```
<a name="paratii.eth.ParatiiEth+_transferPTI"></a>

#### eth.ParatiiEth#_transferPTI(beneficiary, amount) ⇒ <code>Promise</code>
send PTI from current account to beneficiary

**Kind**: static method of [<code>eth</code>](#paratii.eth)  
**Returns**: <code>Promise</code> - information about the transaction recording the transfer  

| Param | Type | Description |
| --- | --- | --- |
| beneficiary | <code>String</code> | ETH address |
| amount | <code>Number</code> | amount of PTI to be sent |

**Example**  
```js
return paratii.eth._transferPTI('some-address', 20)
```
<a name="paratii.eth.ParatiiEth+transfer"></a>

#### eth.ParatiiEth#transfer(beneficiary, amount, symbol, description) ⇒ <code>Promise</code>
Use this to send ETH or PTI from paratii.config.address

**Kind**: static method of [<code>eth</code>](#paratii.eth)  
**Returns**: <code>Promise</code> - information about the transaction recording the transfer  

| Param | Type | Description |
| --- | --- | --- |
| beneficiary | <code>String</code> | ETH address |
| amount | <code>Number</code> | amount of ETH/PTI to be sent |
| symbol | <code>String</code> | symbol of the token to send (ETH,PTI) |
| description | <code>String</code> | optional - description to be inserted in the blockchain |

**Example**  
```js
let result = await paratii.eth.transfer('some-address', 20, 'ETH', 'thanks for all the fish')
```
<a name="paratii.ipfs"></a>

### paratii.ipfs
**Kind**: static class of [<code>paratii</code>](#paratii)  

* [.ipfs](#paratii.ipfs)
    * [new ipfs(config)](#new_paratii.ipfs_new)
    * [.uploader](#paratii.ipfs.uploader) ⇐ <code>EventEmitter</code>
        * [new uploader(opts)](#new_paratii.ipfs.uploader_new)
        * [.Uploader#onDrop(ev)](#paratii.ipfs.uploader.Uploader+onDrop) ⇒ <code>?</code>
        * [.Uploader#xhrUpload(file, hashedFile, ev)](#paratii.ipfs.uploader.Uploader+xhrUpload)
        * [.Uploader#add(file)](#paratii.ipfs.uploader.Uploader+add) ⇒ <code>EventEmitter</code>
        * [.Uploader#html5FileToPull(file)](#paratii.ipfs.uploader.Uploader+html5FileToPull) ⇒ <code>Object</code>
        * [.Uploader#fsFileToPull(filePath)](#paratii.ipfs.uploader.Uploader+fsFileToPull) ⇒ <code>Object</code>
        * [.Uploader#upload(files)](#paratii.ipfs.uploader.Uploader+upload) ⇒ <code>EventEmitter</code>
        * [.Uploader#addDirectory(dirPath)](#paratii.ipfs.uploader.Uploader+addDirectory) ⇒ <code>Promise</code>
        * [.Uploader#transcode(fileHash, options)](#paratii.ipfs.uploader.Uploader+transcode) ⇒ <code>EventEmitter</code>
        * [.Uploader#_transcoderRespHander(ev)](#paratii.ipfs.uploader.Uploader+_transcoderRespHander) ⇒ <code>function</code>
        * [.Uploader#addAndTranscode(files)](#paratii.ipfs.uploader.Uploader+addAndTranscode)
        * [.Uploader#_signalTranscoder(files, ev)](#paratii.ipfs.uploader.Uploader+_signalTranscoder) ⇒ <code>Object</code>
        * [.Uploader#getMetaData(fileHash, options)](#paratii.ipfs.uploader.Uploader+getMetaData) ⇒ <code>Object</code>
        * [.Uploader#pinFile(fileHash, options)](#paratii.ipfs.uploader.Uploader+pinFile) ⇒ <code>Object</code>
        * [.Uploader#_pinResponseHandler(ev)](#paratii.ipfs.uploader.Uploader+_pinResponseHandler) ⇒ <code>Object</code>
    * [.ParatiiIPFS#add(fileStream)](#paratii.ipfs.ParatiiIPFS+add) ⇒ <code>Promise</code>
    * [.ParatiiIPFS#get(hash)](#paratii.ipfs.ParatiiIPFS+get) ⇒ <code>Promise</code>
    * [.ParatiiIPFS#log(...msg)](#paratii.ipfs.ParatiiIPFS+log)
    * [.ParatiiIPFS#warn(...msg)](#paratii.ipfs.ParatiiIPFS+warn)
    * [.ParatiiIPFS#error(...msg)](#paratii.ipfs.ParatiiIPFS+error)
    * [.ParatiiIPFS#getIPFSInstance()](#paratii.ipfs.ParatiiIPFS+getIPFSInstance) ⇒ <code>Object</code>
    * [.ParatiiIPFS#addJSON(data)](#paratii.ipfs.ParatiiIPFS+addJSON) ⇒ <code>Promise</code>
    * [.ParatiiIPFS#addAndPinJSON(data)](#paratii.ipfs.ParatiiIPFS+addAndPinJSON) ⇒ <code>string</code>
    * [.ParatiiIPFS#getJSON(multihash)](#paratii.ipfs.ParatiiIPFS+getJSON) ⇒ <code>Promise</code>
    * [.ParatiiIPFS#stop(callback)](#paratii.ipfs.ParatiiIPFS+stop) ⇒ <code>?</code>

<a name="new_paratii.ipfs_new"></a>

#### new ipfs(config)
Contains functions to interact with the IPFS instance.


| Param | Type | Description |
| --- | --- | --- |
| config | <code>Object</code> | configuration object to initialize Paratii object |

<a name="paratii.ipfs.uploader"></a>

#### ipfs.uploader ⇐ <code>EventEmitter</code>
**Kind**: static class of [<code>ipfs</code>](#paratii.ipfs)  
**Extends**: <code>EventEmitter</code>  

* [.uploader](#paratii.ipfs.uploader) ⇐ <code>EventEmitter</code>
    * [new uploader(opts)](#new_paratii.ipfs.uploader_new)
    * [.Uploader#onDrop(ev)](#paratii.ipfs.uploader.Uploader+onDrop) ⇒ <code>?</code>
    * [.Uploader#xhrUpload(file, hashedFile, ev)](#paratii.ipfs.uploader.Uploader+xhrUpload)
    * [.Uploader#add(file)](#paratii.ipfs.uploader.Uploader+add) ⇒ <code>EventEmitter</code>
    * [.Uploader#html5FileToPull(file)](#paratii.ipfs.uploader.Uploader+html5FileToPull) ⇒ <code>Object</code>
    * [.Uploader#fsFileToPull(filePath)](#paratii.ipfs.uploader.Uploader+fsFileToPull) ⇒ <code>Object</code>
    * [.Uploader#upload(files)](#paratii.ipfs.uploader.Uploader+upload) ⇒ <code>EventEmitter</code>
    * [.Uploader#addDirectory(dirPath)](#paratii.ipfs.uploader.Uploader+addDirectory) ⇒ <code>Promise</code>
    * [.Uploader#transcode(fileHash, options)](#paratii.ipfs.uploader.Uploader+transcode) ⇒ <code>EventEmitter</code>
    * [.Uploader#_transcoderRespHander(ev)](#paratii.ipfs.uploader.Uploader+_transcoderRespHander) ⇒ <code>function</code>
    * [.Uploader#addAndTranscode(files)](#paratii.ipfs.uploader.Uploader+addAndTranscode)
    * [.Uploader#_signalTranscoder(files, ev)](#paratii.ipfs.uploader.Uploader+_signalTranscoder) ⇒ <code>Object</code>
    * [.Uploader#getMetaData(fileHash, options)](#paratii.ipfs.uploader.Uploader+getMetaData) ⇒ <code>Object</code>
    * [.Uploader#pinFile(fileHash, options)](#paratii.ipfs.uploader.Uploader+pinFile) ⇒ <code>Object</code>
    * [.Uploader#_pinResponseHandler(ev)](#paratii.ipfs.uploader.Uploader+_pinResponseHandler) ⇒ <code>Object</code>

<a name="new_paratii.ipfs.uploader_new"></a>

##### new uploader(opts)
IPFS UPLOADER : Paratii IPFS uploader interface.


| Param | Type |
| --- | --- |
| opts | <code>Object</code> | 

<a name="paratii.ipfs.uploader.Uploader+onDrop"></a>

##### uploader.Uploader#onDrop(ev) ⇒ <code>?</code>
????

**Kind**: static method of [<code>uploader</code>](#paratii.ipfs.uploader)  
**Returns**: <code>?</code> - ?  

| Param | Type | Description |
| --- | --- | --- |
| ev | <code>?</code> | ? |

<a name="paratii.ipfs.uploader.Uploader+xhrUpload"></a>

##### uploader.Uploader#xhrUpload(file, hashedFile, ev)
Upload a file over XHR to the transcoder. To be called with an event emitter as the last argument

**Kind**: static method of [<code>uploader</code>](#paratii.ipfs.uploader)  

| Param | Type | Description |
| --- | --- | --- |
| file | <code>Object</code> | file to upload |
| hashedFile | <code>String</code> | hash of the file ?? |
| ev | <code>EventEmitter</code> | event emitter |

**Example**  
```js
this.xhrUpload(file, hashedFile, ev)
```
<a name="paratii.ipfs.uploader.Uploader+add"></a>

##### uploader.Uploader#add(file) ⇒ <code>EventEmitter</code>
uploads a single file to *local* IPFS node

**Kind**: static method of [<code>uploader</code>](#paratii.ipfs.uploader)  
**Returns**: <code>EventEmitter</code> - checkout the upload function below for details.  

| Param | Type | Description |
| --- | --- | --- |
| file | <code>File</code> | HTML5 File Object. |

**Example**  
```js
let uploaderEv = paratiiIPFS.uploader.add(files)
```
<a name="paratii.ipfs.uploader.Uploader+html5FileToPull"></a>

##### uploader.Uploader#html5FileToPull(file) ⇒ <code>Object</code>
returns a generic File Object with a Pull Stream from an HTML5 File

**Kind**: static method of [<code>uploader</code>](#paratii.ipfs.uploader)  
**Returns**: <code>Object</code> - generic file object.  

| Param | Type | Description |
| --- | --- | --- |
| file | <code>File</code> | HTML5 File Object |

**Example**  
```js
?
```
<a name="paratii.ipfs.uploader.Uploader+fsFileToPull"></a>

##### uploader.Uploader#fsFileToPull(filePath) ⇒ <code>Object</code>
returns a generic file Object from a file path

**Kind**: static method of [<code>uploader</code>](#paratii.ipfs.uploader)  
**Returns**: <code>Object</code> - generic file object.  

| Param | Type | Description |
| --- | --- | --- |
| filePath | <code>String</code> | Path to file. |

**Example**  
```js
?
```
<a name="paratii.ipfs.uploader.Uploader+upload"></a>

##### uploader.Uploader#upload(files) ⇒ <code>EventEmitter</code>
upload an Array of files as is to the local IPFS node

**Kind**: static method of [<code>uploader</code>](#paratii.ipfs.uploader)  
**Returns**: <code>EventEmitter</code> - returns EventEmitter with the following events:
   - 'start': uploader started.
   - 'progress': (chunkLength, progressPercent)
   - 'fileReady': (file) triggered when a file is uploaded locally.
   - 'done': (files) triggered when the uploader is done locally.
   - 'error': (err) triggered whenever an error occurs.  

| Param | Type | Description |
| --- | --- | --- |
| files | <code>Array</code> | HTML5 File Object Array. |

**Example**  
```js
?
```
<a name="paratii.ipfs.uploader.Uploader+addDirectory"></a>

##### uploader.Uploader#addDirectory(dirPath) ⇒ <code>Promise</code>
upload an entire directory to IPFS

**Kind**: static method of [<code>uploader</code>](#paratii.ipfs.uploader)  
**Returns**: <code>Promise</code> - returns the {multihash, path, size} for the uploaded folder.  

| Param | Type | Description |
| --- | --- | --- |
| dirPath | <code>String</code> | path to directory |

**Example**  
```js
?
```
<a name="paratii.ipfs.uploader.Uploader+transcode"></a>

##### uploader.Uploader#transcode(fileHash, options) ⇒ <code>EventEmitter</code>
signals transcoder(s) to transcode fileHash

**Kind**: static method of [<code>uploader</code>](#paratii.ipfs.uploader)  
**Returns**: <code>EventEmitter</code> - returns EventEmitter with the following events:
   - 'uploader:progress': (hash, chunkSize, percent) client to transcoder upload progress.
   - 'transcoding:started': (hash, author)
   - 'transcoding:progress': (hash, size, percent)
   - 'transcoding:downsample:ready' (hash, size)
   - 'transcoding:done': (hash, transcoderResult) triggered when the transcoder is done - returns the hash of the transcoded file
   - 'transcoder:error': (err) triggered whenever an error occurs.  

| Param | Type | Description |
| --- | --- | --- |
| fileHash | <code>String</code> | IPFS file hash. |
| options | <code>Object</code> | ref: https://github.com/Paratii-Video/paratii-lib/blob/master/docs/paratii-ipfs.md#ipfsuploadertranscodefilehash-options |

**Example**  
```js
?
```
<a name="paratii.ipfs.uploader.Uploader+_transcoderRespHander"></a>

##### uploader.Uploader#_transcoderRespHander(ev) ⇒ <code>function</code>
handles responses from the paratii-protocol in case of transcoding.

**Kind**: static method of [<code>uploader</code>](#paratii.ipfs.uploader)  
**Returns**: <code>function</code> - returns various events based on transcoder response.  

| Param | Type | Description |
| --- | --- | --- |
| ev | <code>EventEmitter</code> | the transcoding job EventEmitter |

**Example**  
```js
?
```
<a name="paratii.ipfs.uploader.Uploader+addAndTranscode"></a>

##### uploader.Uploader#addAndTranscode(files)
convenience method for adding and transcoding files

**Kind**: static method of [<code>uploader</code>](#paratii.ipfs.uploader)  

| Param | Type | Description |
| --- | --- | --- |
| files | <code>Array</code> | Array of HTML5 File Objects |

<a name="paratii.ipfs.uploader.Uploader+_signalTranscoder"></a>

##### uploader.Uploader#_signalTranscoder(files, ev) ⇒ <code>Object</code>
[_signalTranscoder description]
TODO RIVEDI I TIPI

**Kind**: static method of [<code>uploader</code>](#paratii.ipfs.uploader)  
**Returns**: <code>Object</code> - [description]  

| Param | Type | Description |
| --- | --- | --- |
| files | <code>Object</code> | [description] |
| ev | <code>Object</code> | [description] |

<a name="paratii.ipfs.uploader.Uploader+getMetaData"></a>

##### uploader.Uploader#getMetaData(fileHash, options) ⇒ <code>Object</code>
[getMetaData description]

**Kind**: static method of [<code>uploader</code>](#paratii.ipfs.uploader)  
**Returns**: <code>Object</code> - [description]  

| Param | Type | Description |
| --- | --- | --- |
| fileHash | <code>Object</code> | [description] |
| options | <code>Object</code> | [description] |

<a name="paratii.ipfs.uploader.Uploader+pinFile"></a>

##### uploader.Uploader#pinFile(fileHash, options) ⇒ <code>Object</code>
[pinFile description]

**Kind**: static method of [<code>uploader</code>](#paratii.ipfs.uploader)  
**Returns**: <code>Object</code> - [description]  

| Param | Type | Description |
| --- | --- | --- |
| fileHash | <code>Object</code> | [description] |
| options | <code>Object</code> | [description] |

<a name="paratii.ipfs.uploader.Uploader+_pinResponseHandler"></a>

##### uploader.Uploader#_pinResponseHandler(ev) ⇒ <code>Object</code>
[_pinResponseHandler description]

**Kind**: static method of [<code>uploader</code>](#paratii.ipfs.uploader)  
**Returns**: <code>Object</code> - [description]  

| Param | Type | Description |
| --- | --- | --- |
| ev | <code>Object</code> | [description] |

<a name="paratii.ipfs.ParatiiIPFS+add"></a>

#### ipfs.ParatiiIPFS#add(fileStream) ⇒ <code>Promise</code>
Adds the file to ipfs

**Kind**: static method of [<code>ipfs</code>](#paratii.ipfs)  
**Returns**: <code>Promise</code> - data about the added file (path,multihash,size)  

| Param | Type | Description |
| --- | --- | --- |
| fileStream | <code>ReadStream</code> | ReadStream of the file. Can be created with fs.createReadStream(path) |

**Example**  
```js
let path = 'test/data/some-file.txt'
let fileStream = fs.createReadStream(path)
let result = await paratiiIPFS.add(fileStream)
```
<a name="paratii.ipfs.ParatiiIPFS+get"></a>

#### ipfs.ParatiiIPFS#get(hash) ⇒ <code>Promise</code>
get file from ipfs

**Kind**: static method of [<code>ipfs</code>](#paratii.ipfs)  
**Returns**: <code>Promise</code> - the file (path,content)  

| Param | Type | Description |
| --- | --- | --- |
| hash | <code>String</code> | multihash of the file |

**Example**  
```js
let result = await paratiiIPFS.add(fileStream)
let hash = result[0].hash
let fileContent = await paratiiIPFS.get(hash)
```
<a name="paratii.ipfs.ParatiiIPFS+log"></a>

#### ipfs.ParatiiIPFS#log(...msg)
log messages on the console if verbose is set

**Kind**: static method of [<code>ipfs</code>](#paratii.ipfs)  

| Param | Type | Description |
| --- | --- | --- |
| ...msg | <code>String</code> | text to log |

**Example**  
```js
paratii.ipfs.log("some-text")
```
<a name="paratii.ipfs.ParatiiIPFS+warn"></a>

#### ipfs.ParatiiIPFS#warn(...msg)
log warns on the console if verbose is set

**Kind**: static method of [<code>ipfs</code>](#paratii.ipfs)  

| Param | Type | Description |
| --- | --- | --- |
| ...msg | <code>String</code> | warn text |

**Example**  
```js
paratii.ipfs.warn("some-text")
```
<a name="paratii.ipfs.ParatiiIPFS+error"></a>

#### ipfs.ParatiiIPFS#error(...msg)
log errors on the console if verbose is set

**Kind**: static method of [<code>ipfs</code>](#paratii.ipfs)  

| Param | Type | Description |
| --- | --- | --- |
| ...msg | <code>String</code> | error message |

**Example**  
```js
paratii.ipfs.error("some-text")
```
<a name="paratii.ipfs.ParatiiIPFS+getIPFSInstance"></a>

#### ipfs.ParatiiIPFS#getIPFSInstance() ⇒ <code>Object</code>
get an ipfs instance of jsipfs. Singleton pattern

**Kind**: static method of [<code>ipfs</code>](#paratii.ipfs)  
**Returns**: <code>Object</code> - Ipfs instance  
**Example**  
```js
ipfs = await paratii.ipfs.getIPFSInstance()
```
<a name="paratii.ipfs.ParatiiIPFS+addJSON"></a>

#### ipfs.ParatiiIPFS#addJSON(data) ⇒ <code>Promise</code>
adds a data Object to the IPFS local instance

**Kind**: static method of [<code>ipfs</code>](#paratii.ipfs)  
**Returns**: <code>Promise</code> - promise with the ipfs multihash  

| Param | Type | Description |
| --- | --- | --- |
| data | <code>Object</code> | JSON object to store |

**Example**  
```js
let result = await paratiiIPFS.addJSON(data)
```
<a name="paratii.ipfs.ParatiiIPFS+addAndPinJSON"></a>

#### ipfs.ParatiiIPFS#addAndPinJSON(data) ⇒ <code>string</code>
convenient method to add JSON and send it for persistance storage.

**Kind**: static method of [<code>ipfs</code>](#paratii.ipfs)  
**Returns**: <code>string</code> - returns multihash of the stored object.  

| Param | Type | Description |
| --- | --- | --- |
| data | <code>object</code> | JSON object to store |

**Example**  
```js
let result = await paratiiIPFS.addAndPinJSON(data)
```
<a name="paratii.ipfs.ParatiiIPFS+getJSON"></a>

#### ipfs.ParatiiIPFS#getJSON(multihash) ⇒ <code>Promise</code>
gets a JSON object stored in IPFS

**Kind**: static method of [<code>ipfs</code>](#paratii.ipfs)  
**Returns**: <code>Promise</code> - requested Object  

| Param | Type | Description |
| --- | --- | --- |
| multihash | <code>String</code> | ipfs multihash of the object |

**Example**  
```js
let jsonObj = await paratiiIPFS.getJSON('some-multihash')
```
<a name="paratii.ipfs.ParatiiIPFS+stop"></a>

#### ipfs.ParatiiIPFS#stop(callback) ⇒ <code>?</code>
Stops the IPFS node.

**Kind**: static method of [<code>ipfs</code>](#paratii.ipfs)  
**Returns**: <code>?</code> - DON'T KNOW?  

| Param | Type | Description |
| --- | --- | --- |
| callback | <code>function</code> | callback function |

**Example**  
```js
?
```
<a name="paratii.Paratii+setAccount"></a>

### paratii.Paratii#setAccount(address, privateKey)
Set the ethereum address what will be used to sign all transactions

**Kind**: static method of [<code>paratii</code>](#paratii)  

| Param | Type | Description |
| --- | --- | --- |
| address | <code>String</code> | address of the operator/user |
| privateKey | <code>String</code> | optional - private key of the operator/user |

**Example**  
```js
paratii.setAccount('some-user-id','some-user-pub-key')
```
<a name="paratii.Paratii+setRegistryAddress"></a>

### paratii.Paratii#setRegistryAddress(address)
Set the address of the ParatiiRegistry contract

**Kind**: static method of [<code>paratii</code>](#paratii)  

| Param | Type | Description |
| --- | --- | --- |
| address | <code>String</code> | address of the ParatiiRegistry contract |

**Example**  
```js
paratii.setRegistryAddress('some-address')
```
<a name="paratii.Paratii+diagnose"></a>

### paratii.Paratii#diagnose() ⇒ <code>Promise</code>
return an array of strings with diagnostic info

**Kind**: static method of [<code>paratii</code>](#paratii)  
**Returns**: <code>Promise</code> - array of strings with diagnostic info  
**Example**  
```js
paratii.diagnose()
```
