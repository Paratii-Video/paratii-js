// Perhaps this is not really necessary
export class ParatiiPersonal {
  constructor (options) {
    this.config = options
  }

  setAccount (address, privateKey) {
    return this.context.setAccount(address, privateKey)
  }
}
