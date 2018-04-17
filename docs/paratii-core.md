# Paratii  CORE

## `paratii.core`

Contains functions that operate transversally over several backend systems.

It is available as a `core` attribute in `Paratii` instances:

    import Paratii from 'paratii-js'
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

## core.vids.like(videoId)

Writes a like for the video on the blockchain (contract `Likes`), and negates a dislike for the video, if it exists.

## core.vids.dislike(videoId)

Writes a dislike for the video on the blockchain (contract `Likes`), and negates a like for the video, if it exists.

## core.vids.view(data)

Register a view on the blockchain.

Accepts parameter data that contains keys `viewer`, which is an address of the viewer, and `videoId`, which is the ID of the video for which the view will be registered.

All other parameters are stored on IPFS and passed as `ipfsData` on the blockchain.

## core.vids.buy(videoId)

Buy a video


## core.vids.search(qry)

_not implemented yet_

    // search in videos
    // this call will send a request the db index, i.e. simply forward this request to paratii.db.vids.search()
    core.vids.search({'title': 'xyz'})

# core.users


Remarks:

  * The `id` of a user is his/her public Ethereum address

## `core.users.create`

    core.users.create({
      id: 0x1234,
      name: 'A user name',
      email: 'some@email.com',
      // ... (other fields to be defined)
    })

Creates a user, fields `id`, `name` and `email` go to the smart contract `Users`, other fields are stored on IPFS.

## `core.users.get`

    core.users.get(0x1234)

Calls paratii-db and returns user's details for a given ID.

Sample output:

    {
      id: 0x1234,
      name: 'A user name',
      email: 'some@email.com',
      // ... (other fields to be defined)
    }

## `core.users.update`

Updates a user's details. `name` and `email` are defined in the smart contract `Users`, other fields get written to IPFS.

    core.users.update(0x1234, {
      name: 'A new user name',
    })
