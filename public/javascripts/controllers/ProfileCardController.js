class ProfileCardController extends Stimulus.Controller {
  connect() {
    $('.span.profileIcons .eye-icon-regular').mouseenter((icon) => {
      icon.currentTarget.parentElement.previousSibling.style.display = 'block';
    });

    $('.span.profileIcons .eye-icon-regular').mouseleave((icon) => {
      icon.currentTarget.parentElement.previousSibling.style.display = 'none';
    });

    $('.span.profileIcons .tick-in-circle').mouseenter((icon) => {
      icon.currentTarget.parentElement.previousSibling.style.display = 'block';
    });

    $('.span.profileIcons .tick-in-circle').mouseleave((icon) => {
      icon.currentTarget.parentElement.previousSibling.style.display = 'none';
    });

    $('.span.profileIcons .unfilled-star-icon').mouseenter((icon) => {
      icon.currentTarget.parentElement.previousSibling.style.display = 'block';
    });

    $('.span.profileIcons .unfilled-star-icon').mouseleave((icon) => {
      icon.currentTarget.parentElement.previousSibling.style.display = 'none';
    });
  }
}

window.controllers = window.controllers || {};
window.controllers.profilecardcontroller = ProfileCardController;
