
// check if browser supports service workers
// if so register service worker to go Offline First!
const registerSW = () => {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker
      .register('/sw.js')
      .then(() => console.log('Service worker registered!'));
  }
};

export default registerSW;