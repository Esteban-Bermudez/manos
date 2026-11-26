import { profileUrl, type Mano } from "./data";
import { Icon } from "./Icons";
import { TipQr } from "./TipQr";

/**
 * The printable origami hat. It is the real-world source of truth:
 * hat on = FREE, hat off = BUSY. One printed design, one sheet.
 */
export function PaperHat({ mano }: { mano: Mano }) {
  const first = mano.name.split(" ")[0];

  return (
    <div id="print-card">
      <section className="hat-sheet hat-free">
        <div className="hat-kicker">
          <span>MANOS · KWENCH</span>
          <span>One hat · A4 or Letter · print at 100%</span>
        </div>
        <div className="hat-face">
          <p className="hat-status"><span />FREE</p>
          <p className="hat-invite">Ask me for a hand.</p>
          <h2>{mano.name}</h2>
          <div className="hat-skills">
            {mano.skills.map((skill) => <span key={skill}>{skill}</span>)}
          </div>
          <div className="hat-qr-row">
            <TipQr value={mano.kofiUrl} size={190} />
            <div>
              <strong>Scan to say thanks</strong>
              <p>Optional tip, 100% to {first}. No payment happens inside MANOS.</p>
              <span className="hat-demo">Ko-fi tip QR · real public link</span>
            </div>
          </div>
          <p className="hat-wear">
            <Icon name="hat" size={22} /> Hat on = free. Hat off = busy. Fold it so the
            name, skills, and thank-you QR sit on the outside.
          </p>
          <p className="hat-url">{profileUrl(mano)}</p>
        </div>
        <div className="hat-fold">
          <h3>Fold your hat</h3>
          <ol>
            <li>Print this single sheet at 100% on A4 or Letter, printed side up.</li>
            <li>Fold the sheet in half, top to bottom, keeping the printed side facing out.</li>
            <li>Fold both top corners down to the centre line to make a triangle.</li>
            <li>Fold the bottom edge up over the triangle, front and back, to make the brim.</li>
            <li>Open it up and tuck the corners. The FREE panel, your name, skills, and tip QR stay on the outside.</li>
            <li>Wear it when you’re free. Hat off = busy; the app follows the hat.</li>
          </ol>
        </div>
      </section>
    </div>
  );
}
