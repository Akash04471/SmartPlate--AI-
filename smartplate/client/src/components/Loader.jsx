import { useEffect, useState } from 'react';

const loaderStyles = `
  .sp-loader {
    position: fixed; inset: 0;
    background: #050f08;
    z-index: 9000;
    display: flex; flex-direction: column;
    align-items: center; justify-content: center;
    transition: opacity 0.8s ease, visibility 0.8s ease;
  }
  .sp-loader.hidden { opacity: 0; visibility: hidden; pointer-events: none; }

  .sp-plate-wrap {
    position: relative; width: 200px; height: 200px;
    margin-bottom: 32px;
  }
  .sp-plate {
    width: 180px; height: 180px;
    border-radius: 50%;
    background: radial-gradient(circle at 35% 35%, #1a4a2e, #0a2218);
    border: 3px solid rgba(34,197,94,0.3);
    box-shadow: 0 0 60px rgba(22,163,74,0.2), inset 0 0 40px rgba(0,0,0,0.5);
    position: absolute; top: 10px; left: 10px;
    animation: spPlateAppear 0.6s 0.3s both;
  }
  @keyframes spPlateAppear {
    from { transform: scale(0) rotate(-180deg); opacity: 0; }
    to { transform: scale(1) rotate(0deg); opacity: 1; }
  }
  .sp-food {
    position: absolute; font-size: 28px;
    animation: spFoodFall 0.5s ease-out both;
  }
  @keyframes spFoodFall {
    from { transform: translateY(-80px) rotate(-20deg); opacity: 0; }
    to { transform: translateY(0) rotate(0deg); opacity: 1; }
  }
  .sp-loader-logo {
    font-family: 'Playfair Display', serif;
    font-size: 36px; font-weight: 900;
    background: linear-gradient(135deg, #22c55e, #a3e635);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    animation: spLogoReveal 0.6s 1.8s both;
  }
  @keyframes spLogoReveal {
    from { opacity: 0; transform: translateY(20px); letter-spacing: 20px; }
    to { opacity: 1; transform: translateY(0); letter-spacing: -1px; }
  }
  .sp-loader-sub {
    font-size: 13px; color: #6b9e7a;
    margin-top: 12px; letter-spacing: 2px;
    text-transform: uppercase;
    animation: spFadeIn 0.6s 2.1s both;
  }
  @keyframes spFadeIn { from { opacity: 0; } to { opacity: 1; } }
  .sp-bar-wrap {
    width: 200px; height: 2px;
    background: rgba(34,197,94,0.1);
    border-radius: 2px; margin-top: 32px;
    overflow: hidden;
    animation: spFadeIn 0.3s 0.5s both;
  }
  .sp-bar {
    height: 100%;
    background: linear-gradient(90deg, #16a34a, #a3e635);
    border-radius: 2px;
    animation: spLoadBar 2s 0.5s cubic-bezier(0.4,0,0.2,1) both;
  }
  @keyframes spLoadBar { from { width: 0; } to { width: 100%; } }
`;

const foods = [
    { e: '🥦', top: '55px', left: '40px', delay: '0.6s' },
    { e: '🥕', top: '55px', left: '95px', delay: '0.8s' },
    { e: '🍅', top: '55px', left: '145px', delay: '1.0s' },
    { e: '🫒', top: '110px', left: '52px', delay: '1.2s' },
    { e: '🫑', top: '110px', left: '130px', delay: '1.4s' },
    { e: '🥗', top: '95px', left: '85px', delay: '1.6s' },
];

export default function Loader({ duration = 3000, onDone }) {
    const [hidden, setHidden] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => {
            setHidden(true);
            if (onDone) setTimeout(onDone, 800);
        }, duration);
        return () => clearTimeout(timer);
    }, [duration, onDone]);

    return (
        <>
            <style>{loaderStyles}</style>
            <div className={`sp-loader ${hidden ? 'hidden' : ''}`}>
                <div className="sp-plate-wrap">
                    <div className="sp-plate" />
                    {foods.map((f, i) => (
                        <span key={i} className="sp-food"
                            style={{ top: f.top, left: f.left, animationDelay: f.delay }}>
                            {f.e}
                        </span>
                    ))}
                </div>
                <div className="sp-loader-logo">SmartPlate</div>
                <div className="sp-loader-sub">Preparing your experience…</div>
                <div className="sp-bar-wrap"><div className="sp-bar" /></div>
            </div>
        </>
    );
}
