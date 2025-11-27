import { BlueprintCanvas } from "./components/BlueprintCanvas";

export default function Home() {
  return (
    <main className="page">
      <div className="hero">
        <div>
          <p className="eyebrow">Minimal ABAP visual programming</p>
          <h1>Blueprints for ABAP</h1>
          <p className="lede">
            Stitch ABAP statements together by linking ports and dragging blocks into place.
            The prototype stays monochrome so the focus is on program flow rather than chrome.
          </p>
        </div>
        <div className="legend" aria-label="Node legend">
          <div>
            <span className="chip" aria-hidden />
            <span>Event or control output</span>
          </div>
          <div>
            <span className="chip chip--outline" aria-hidden />
            <span>Data input</span>
          </div>
        </div>
      </div>
      <BlueprintCanvas />
      <section className="notes">
        <h2>Why ABAP blueprints?</h2>
        <p>
          This minimal prototype leans on black and white contrast to keep the focus on program
          flow. Each node mirrors familiar ABAP commands—START-OF-SELECTION, SELECT, LOOP AT,
          and WRITE—so you can reason about data paths and events without syntax overhead.
        </p>
      </section>
    </main>
  );
}
