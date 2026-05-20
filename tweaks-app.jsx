/* global React, ReactDOM, TweaksPanel, TweakSection, TweakSlider, useTweaks */

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "glassOpacity": 0.15,
  "glassBlur": 40
}/*EDITMODE-END*/;

function applyTweaks(t) {
  const root = document.documentElement;
  root.style.setProperty('--glass-bg', `rgba(5,7,12,${t.glassOpacity})`);
  root.style.setProperty('--glass-blur', `${t.glassBlur}px`);
}

function TweaksApp() {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);

  React.useEffect(() => { applyTweaks(t); }, [t]);

  return (
    <TweaksPanel title="Tweaks">
      <TweakSection title="Panel oscuro">
        <TweakSlider
          label="Opacidad del fondo"
          value={t.glassOpacity}
          min={0} max={1} step={0.01}
          format={(v) => `${Math.round(v * 100)}%`}
          onChange={(v) => setTweak('glassOpacity', v)}
        />
        <TweakSlider
          label="Desenfoque (blur)"
          value={t.glassBlur}
          min={0} max={60} step={1}
          format={(v) => `${v}px`}
          onChange={(v) => setTweak('glassBlur', v)}
        />
      </TweakSection>
    </TweaksPanel>
  );
}

// Apply defaults immediately so first paint matches.
applyTweaks(TWEAK_DEFAULTS);

const tweakRoot = document.createElement('div');
document.body.appendChild(tweakRoot);
ReactDOM.createRoot(tweakRoot).render(<TweaksApp />);
