import { Vortex, VortexMessage } from '../../Vortex/Vortex';

const vortex = new Vortex();

vortex.addListener((message: VortexMessage) => {
  const { segment, strand, traits, cyclone } = message;

  // Process the message
});
