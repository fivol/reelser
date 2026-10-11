import {Config} from '@remotion/cli/config';

Config.setCodec('h264');
// No setCrf: 18 is already the h264 default, and a global CRF breaks audio-only renders (--codec=wav).
Config.setPixelFormat('yuv420p');
Config.setVideoImageFormat('jpeg');
Config.setOverwriteOutput(true);
// Hardware GL is ~30x faster than software 'swangle' on full-screen gradients. Linux
// machines often have no usable GPU, so they keep Remotion's software default.
if (process.platform !== 'linux') Config.setChromiumOpenGlRenderer('angle');
