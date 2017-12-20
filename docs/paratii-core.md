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


# Example

    // register a video
    // this call will register the vid on the blockchain, add its metadata to ipfs, upload file to ipfs, and transcode it
    core.vids.create({title: 'A very loooong title', file: myFileStream, foo: 'bar'})

    // search in videos
    // this call will send a request the db index, i.e. simply forward this request to paratii.db.vids.search()
    core.vids.search({'title': 'xyz'})
