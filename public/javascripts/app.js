(() => {
  window.application = Stimulus.Application.start();
  Object.keys(window.controllers).forEach(k =>
    window.application.register(k, window.controllers[k]));

  document.addEventListener('turbolinks:load', () => {
      $('#menuButton').popover({html:true});
  });
})();
