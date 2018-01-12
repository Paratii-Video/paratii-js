# Paratii  CORE

## `paratii.core`

Contains functions that operate transversally over several backend systems.

It is available as a `core` attribute in `Paratii` instances:

    import { Paratii } from 'paratii-lib'
    paratii = new Paratii()
    paratii.core // is a ParatiiCore instance


# API

## `core.vids`

Utilities to create and manipulate information on the blockchain.

##  `core.vids.create(params)`

This call will register the video on the blockchain, add its metadata to IPFS, upload file to IPFS, and transcode it


    core.vids.create({
      id: 'some-id',
      title: 'A very loooong title',
      file: 'path/to/file',
    })


It takes the following arguments:

    id // must be a string
    owner // must be a string
    price // must be a number, optional, default is 0
    title // must be a string
    file // must be string, optional
    ipfsHash // must be a string, optional, default is ''


It returns a structure like the following:

    {
      id: 'some-id',
      owner: '0xffcf8fdee72ac11b5c542428b35eef5769c409f0',
      price: 0,
      title: 'A very loooong title',
      ipfsHash: 'Qmck5q3uDvp4tD1j18E5g5VqXCcd9zpKT3cQpp1idAvDUR'
    }


Anyone can register a new video.


## core.vids.update(videoId, params)

Update the information on the video.

Only the account that has registered the video, or the owner of the contract, can update the information.

## core.vids.get(videoId)

Get the data of the video identified by `videoId`.


## core.vids.delete(videoId)

Remove the data of this video from the register. This method can only be called by the owner of the contract, or by the original registrar of the video.


## core.vids.like(videoId, [proof])


## core.vids.dislike(videoId, [proof])

## core.vids.view(videoId, [proof])

Register a view on the blockchain

## core.vids.buy(videoId)

Buy a video


## core.vids.search(qry)

_not implemented yet_

    // search in videos
    // this call will send a request the db index, i.e. simply forward this request to paratii.db.vids.search()
    core.vids.search({'title': 'xyz'})

# core.users

## `core.users.create`

    core.users.create({
      id: 'some-id',
      name: 'A user name',
      email: 'some@email.com',
      ... (other fields to be defined)
    })

## `core.users.get`

    core.users.get('some-id')

returns
    {
      id: 'some-id',
      name: 'A user name',
      email: 'some@email.com',
      ... (other fields to be defined)
    }

## `core.users.update`


    core.users.ipdate('some-id', {
      name: 'A user name',
    })
