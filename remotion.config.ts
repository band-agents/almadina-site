/**
 * Remotion build settings.
 *
 * The hero is a background loop behind white text: JPEG artefacts in a dark
 * blue gradient are very visible, so quality is pushed up and the CRF pulled
 * down from the default. It costs a few hundred KB on a file that is served
 * once and cached.
 */
import { Config } from "@remotion/cli/config";

Config.setVideoImageFormat("jpeg");
Config.setJpegQuality(92);
Config.setCrf(20);
Config.setOverwriteOutput(true);
Config.setChromiumOpenGlRenderer("angle");
