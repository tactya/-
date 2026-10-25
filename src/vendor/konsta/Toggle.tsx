/** Adapted from konstaui/konsta Toggle.jsx, MIT, Vladimir Kharlampidi.
 * iOS-only controlled input; Tailwind/theme/ripple dependencies removed.
 * Classic iOS metrics supplied by local tokens rather than upstream iOS26 glass.
 */
export function IOSToggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
}) {
  return (
    <label className="k-toggle ios-toggle">
      <input
        type="checkbox"
        role="switch"
        aria-label={label}
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
      />
      <span className="toggle-track" />
      <span className="toggle-thumb-wrap">
        <span className="toggle-thumb" />
      </span>
    </label>
  );
}
