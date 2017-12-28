# Paratii  CORE

TBD: implement this

## `paratii.core`

Contains functions that operate transversally over several backend systems.

It is available as a `core` attribute in `Paratii` instances:

    import { Paratii } from 'paratii-lib'
    paratii = new Paratii()
    paratii.core // is a ParatiiCore instance


# API

## core.vids.add(videoInfo)

This call will register the video on the blockchain, add its metadata to IPFS, upload file to IPFS, and transcode it

    core.vids.add({title: 'A very loooong title', file: 'path/to/file'})

It returns a structure like the following:

    { id: 'some-id',
    owner: '0xffcf8fdee72ac11b5c542428b35eef5769c409f0',
    price: 0,
    title: 'A very loooong title',
    ipfsHash: 'Qmck5q3uDvp4tD1j18E5g5VqXCcd9zpKT3cQpp1idAvDUR' }


## core.vids.get(videoId)


## core.vids.search(qry)

_not implemented yet_

    // search in videos
    // this call will send a request the db index, i.e. simply forward this request to paratii.db.vids.search()
    core.vids.search({'title': 'xyz'})
