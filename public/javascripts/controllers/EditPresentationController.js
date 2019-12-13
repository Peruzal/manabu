class EditPresentationController extends Stimulus.Controller {
  connect() {
    $('#edit-transition-theme-modal').on('show.bs.modal', (e) => {
      this.presentationTitle = e.relatedTarget.attributes.presentationTitle.value;
      this.presentationTheme = e.relatedTarget.attributes.presentationTheme.value;
      this.presentationTransition = e.relatedTarget.attributes.presentationTransition.value;
      $('input.title').val(e.relatedTarget.attributes.presentationTitle.value);
      $("option#theme").text(this.presentationTheme);
      $("option#transition").text(this.presentationTransition);
      var transitions = ["none", "convex", "concave", "zoom"];
      var themes = ["black", "moon", "zenburn", "beige"];

      if($("select.theme.form-control")[0].options.length == 1 && $("select.transition.form-control")[0].options.length == 1){
        themes.forEach(theme => {
          if (theme != this.presentationTheme) {
            const option = new Option(theme);
            $("select.theme.form-control").append(option);
          }
        });
  
        transitions.forEach(transition => {
          if (transition != this.presentationTransition) {
            const option = new Option(transition);
            $("select.transition.form-control").append(option);
          }
        });
      }
    });
  }

  editPresentationProperties() {
    $.ajax({
      url: `/editPresentation/${this.presentationTitle}`,
      type: 'POST',
      contentType: 'application/json; charset=utf-8',
      dataType: 'json',
      data: JSON.stringify({
        title: $('input.title.form-control').val(),
        theme: $('select.theme.form-control').val(),
        transitionType: $('select.transition.form-control').val(),
      }),
    })
    Turbolinks.visit('/presentations');
  }

}

window.controllers = window.controllers || {};
window.controllers.EditPresentationController = EditPresentationController;