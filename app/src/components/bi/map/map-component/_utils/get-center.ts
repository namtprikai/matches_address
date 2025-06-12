import { wktToGeoJSON } from "betterknown";
import { type LngLatLike } from "maplibre-gl";
import { type SelectDataSetDetailBuilding } from "../../../../../schema";

export async function getCenter(
  geometry: SelectDataSetDetailBuilding["geometry"] | undefined,
): Promise<LngLatLike | undefined> {
  if (!geometry) return;

  const geojson = wktToGeoJSON(geometry);
  if (!geojson) return;
  const center: LngLatLike | undefined = (() => {
    if (!geojson) return;
    if (geojson.type === "Polygon") {
      const [lng, lat] = geojson.coordinates[0][0];
      return [lng, lat];
    }
    if (geojson.type === "MultiPolygon") {
      const [lng, lat] = geojson.coordinates[0][0][0];
      return [lng, lat];
    }
    return;
  })();

  return center;
}
