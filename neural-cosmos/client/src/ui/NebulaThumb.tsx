/**
 * A small 2D nebula thumbnail of an archetype, for UI chrome (node cards). Uses
 * the same procedural nebula as the scene, rendered to a data URL. If the entity
 * has its own image, the caller passes it via `src` instead.
 */
import { animalArtDataURL } from "../engine/animal-art";

export default function NebulaThumb({
  animal,
  color,
  src,
  className,
}: {
  animal: string;
  color: string;
  src?: string;
  className?: string;
}) {
  const url = src ?? animalArtDataURL(animal, color);
  if (!url) return null;
  return <img className={className} src={url} alt="" aria-hidden draggable={false} />;
}
