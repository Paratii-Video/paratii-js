# Paratii  CORE

TBD: implement this

## `paratii.core`

Contains functions that operate transversally over several backend systems.

It is available as a `core` attribute in `Paratii` instances:

    import { Paratii } from 'paratii-lib'
    paratii = new Paratii()
    paratii.core // is a ParatiiCore instance


## configuration

Takes all configuration options of the Paratii object


# API

## core.vids.add(videoInfo)

    // this call will register the vid on the blockchain, add its metadata to ipfs, upload file to ipfs, and transcode it
    core.vids.add({title: 'A very loooong title', file: 'path/to/file'})

It returns a structure like the following:

    { id: 'some-id',
    owner: '0xffcf8fdee72ac11b5c542428b35eef5769c409f0',
    price: 0,
    title: 'A very loooong title',
    ipfsHash: 'Qmck5q3uDvp4tD1j18E5g5VqXCcd9zpKT3cQpp1idAvDUR' }


## core.vids.search(qry)

    // search in videos
    // this call will send a request the db index, i.e. simply forward this request to paratii.db.vids.search()
    core.vids.search({'title': 'xyz'})
