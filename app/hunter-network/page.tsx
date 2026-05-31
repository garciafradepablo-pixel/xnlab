import Overview from "./_overview";
import { getOverviewSnapshot } from "./actions";

// The Overview is rendered from a server-built snapshot so first paint shows
// real (seeded) network state, then the client takes over for live ticks.
export default async function Page() {
  const initial = await getOverviewSnapshot();
  return <Overview initial={initial} />;
}
