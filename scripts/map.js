let mapInstance = null;

async function initYandexMap(mapEl) {
  if (mapEl.dataset.mapInited === '1') return;
  mapEl.dataset.mapInited = '1';

  await ymaps3.ready;

  const {
    YMap,
    YMapDefaultSchemeLayer,
    YMapDefaultFeaturesLayer,
  } = ymaps3;

  const center = [37.588144, 55.733842];

  mapInstance = new YMap(mapEl, {
    location: { center, zoom: 14 }
  });

  mapInstance.addChild(new YMapDefaultSchemeLayer());
  mapInstance.addChild(new YMapDefaultFeaturesLayer());
}

function watchSnoskaForMap() {
  const snoskaRoot = document.querySelector('.footnote__content');
  if (!snoskaRoot) return;

  const observer = new MutationObserver(() => {
    const mapEl = snoskaRoot.querySelector('.map');
    if (mapEl) {
      initYandexMap(mapEl);
      observer.disconnect();
    }
  });

  observer.observe(snoskaRoot, { childList: true, subtree: true });
  const mapElNow = snoskaRoot.querySelector('.map');
  if (mapElNow) initYandexMap(mapElNow);
}

watchSnoskaForMap();
