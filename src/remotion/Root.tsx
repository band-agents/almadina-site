/**
 * Remotion composition registry. `npm run video:studio` opens these for
 * editing; `npm run video:render` writes the MP4 the site actually ships.
 */

import { Composition } from "remotion";
import { HeroLoop, HERO_DURATION, HERO_FPS, HERO_HEIGHT, HERO_WIDTH } from "./HeroLoop";

export function RemotionRoot() {
  return (
    <Composition
      id="HeroLoop"
      component={HeroLoop}
      durationInFrames={HERO_DURATION}
      fps={HERO_FPS}
      width={HERO_WIDTH}
      height={HERO_HEIGHT}
    />
  );
}
