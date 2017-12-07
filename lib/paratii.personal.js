export class ParatiiPersonal {
  constructor (context) {
    this.context = context
  }

  setAccount (address, privateKey) {
    return this.context.setAccount(address, privateKey)
  }
}
