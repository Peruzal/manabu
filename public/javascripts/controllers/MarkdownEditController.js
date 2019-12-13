class MarkdownEditController extends Stimulus.Controller {

  save() {
    const presentationTitle = $("#presentation").data().presentationtitle;
    const presentationTheme = $("#presentation").data().presentationtheme;
    const presentationTransition = $("#presentation").data().presentationtransition;
    $.ajax({
      url: `/uploadPresentation/${presentationTitle}`,
      type: 'POST',
      data: {
        markdown: this.simpleMde.value()
      },
      dataType: 'json'
    })
      .done(() => {
        if (!presentationTheme === undefined && !presentationTransition === undefined){
          Turbolinks.visit(`/uploadPresentation/${presentationTitle}/${presentationTheme}/${presentationTransition}`);
        }
        console.log('presentation saved successfully');
      })
      .fail(() => {
        console.error('Could not save presentation');
      });
  }

  refreshPresentation(){
    var state = {
      condition: true,
    }

    localStorage.setItem('status', JSON.stringify(state));
  }

  saveMarkdown() {
    const lessonTitle = $("#markdown").data().lessontitle;
    $.ajax({
      url: `/admin/uploadMarkdown/${lessonTitle}`,
      type: 'POST',
      data: {
        markdown: this.simpleMde.value()
      },
      dataType: 'json'
    })
      .done(() => {
        console.log('markdown saved successfully');
      })
      .fail(() => {
        console.error('Could not save markdown');
      });
  }

  saveMarkdownAndExit() {
    const lessonTitle = $("#markdown").data().lessontitle;
    const courseId = $("#markdown").data().courseid;
    $.ajax({
      url: `/admin/uploadMarkdown/${lessonTitle}`,
      type: 'POST',
      data: {
        markdown: this.simpleMde.value()
      },
      dataType: 'json'
    })
      .done(() => {
        console.log('markdown saved successfully');
        Turbolinks.visit(`/admin/${courseId}`);
      })
      .fail(() => {
        console.error('Could not save markdown');
      });
  }

  preview() {
    const presentationTitle = $("#presentation").data().presentationtitle;
    const presentationTheme = $("#presentation").data().presentationtheme;
    const presentationTransition = $("#presentation").data().presentationtransition;

    $.ajax({
      url: `/uploadTempPresentation/${presentationTitle}`,
      type: 'POST',
      data: {
        markdown: this.simpleMde.value(),
        presentationTheme: presentationTheme,
        presentationTransition: presentationTransition
      },
      dataType: 'json'
    })
      .done(() => {
        console.log('presentation saved successfully');
      })
      .fail(() => {
        console.error('Could not save presentation');
      });
  }

  connect() {
    this.simpleMde = new SimpleMDE({
      showIcons: ['code'],
    });

    $('.editor-toolbar').append(`
      <a
      id="save-btn"
      title="Save"
      
      data-action="click->markdown-edit#save"
      ></a>
    `);
  }
  saveAndExit() {
    const presentationTitle = $("#presentation").data().presentationtitle;
    $.ajax({
      url: `/uploadPresentation/${presentationTitle}`,
      type: 'POST',
      data: {
        markdown: this.simpleMde.value()
      },
      dataType: 'json'
    })
      .done(() => {
        Turbolinks.visit('/presentations');
        console.log('presentation saved successfully');
      })
      .fail(() => {
        console.error('Could not save presentation');
      });
  }

  saveAndExitAdmin() {
    const presentationTitle = $("#presentation").data().presentationtitle;
    const courseId = $("#presentation").data().courseid;
    $.ajax({
      url: `/uploadPresentation/${presentationTitle}`,
      type: 'POST',
      data: {
        markdown: this.simpleMde.value()
      },
      dataType: 'json'
    })
      .done(() => {
        Turbolinks.visit(`/admin/${courseId}`);
        console.log('presentation saved successfully');
      })
      .fail(() => {
        console.error('Could not save presentation');
      });
  }
}

// necessary for app script to register with stimulus
window.controllers = window.controllers || {};
window.controllers['markdown-edit'] = MarkdownEditController;
