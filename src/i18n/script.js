export const localeScript = `
(function(){
  try {
    var l = localStorage.getItem('nexora-locale') || localStorage.getItem('nexora-locale') || 'en';
    if (l !== 'fa' && l !== 'en') l = 'en';
    var r = document.documentElement;
    r.lang = l;
    r.dir = l === 'fa' ? 'rtl' : 'ltr';
    r.setAttribute('data-locale', l);
  } catch(e) {}
})();
`;
