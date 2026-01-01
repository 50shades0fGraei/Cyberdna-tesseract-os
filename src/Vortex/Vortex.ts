export interface VortexMessage {
  type: string;
  payload?: any;
}

export class Vortex {
  constructor() {
    // minimal stub
  }

  send(msg: VortexMessage) {
    console.log('Vortex.send', msg);
  }

  on(type: string, handler: (msg: VortexMessage) => void) {
    // no-op stub
  }
}

export default Vortex;
