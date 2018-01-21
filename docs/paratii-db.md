# Paratii DB API

The `ParatiiDb` is used for reading data from the Paratii Blockchain Index.


## `paratii.db`

    import { ParatiiDb } from 'paratii-lib'
    paratiiDb = new ParatiiDb({})


It is also available as `db` in `Paratii` instances:

    import { Paratii } from 'paratii-lib'
    paratii = new Paratii()
    paratii.db // is a ParatiiDb instance

- TBD: https://github.com/Paratii-Video/paratii-lib/issues/18

## configuration

Here is an example with default options:

    paratiiDb = new ParatiiDb({
      'db.provider': 'https://db.paratii.video',
      address: '0x12345', // your address is used as an access token
    })

## `db.vids.get(videoId)`

Get information aboutthis video from the db
## `db.vids.search(qry)`

    db.vids.search({
      title: 'foo'
    })

## `db.users.get(userId)`

Get info about user
