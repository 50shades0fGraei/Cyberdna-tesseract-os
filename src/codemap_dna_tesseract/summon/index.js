import { Vortex } from '../../Vortex/Vortex';
const vortex = new Vortex();
vortex.addListener((message) => {
    const { segment, strand, traits, cyclone } = message;
    // Process the message
});
