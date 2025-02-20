/* global Fluid, CONFIG */

(function(window, document) {
  for (const each of document.querySelectorAll('img[lazyload]')) {
    if(each.src.includes('/randomImg?d=')){
      let randN = (Math.floor(Math.random() * 99) + 1).toString().padStart(2, '0');
      each.src = `https://img.limour.top/randImg/${randN}.webp`;
    }
    Fluid.utils.waitElementVisible(each, function() {
      each.removeAttribute('srcset');
      each.removeAttribute('lazyload');
    }, CONFIG.lazyload.offset_factor);
  }
})(window, document);
