let deferredPrompt;

window.addEventListener('beforeinstallprompt', (e) => {
  deferredPrompt = e;
});

window.addEventListener('appinstalled', (evt) => {
  // Log install to analytics
  //alert('App INSTALL: Success')
  console.log('INSTALL: Success');
});