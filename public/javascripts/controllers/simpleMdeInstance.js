class SimpleMdeInstance extends Stimulus.Controller {
    connect() {
        const simplemde = new SimpleMDE();
        const presentationMarkdown = JSON.parse($('#presentationEditor')[0].dataset.presentation).slides;
        simplemde.value(presentationMarkdown);

        $('.update-presentation-button').click(() => {
            editPresentation();
        });

        function editPresentation() {
            const presentationId = JSON.parse($('#presentationEditor')[0].dataset.presentation).id;
            const presentationValue = simplemde.value();
            $.ajax({
                url: '/admin/editPresentation',
                type: 'PUT',
                contentType: 'application/json; charset=utf-8',
                dataType: 'json',
                data: JSON.stringify({
                    presentationId: presentationId,
                    title: $('input.presentation-input-title')[0].value,
                    theme: $('.dropdown-presentation-theme .select-one-text')[0].textContent,
                    transition: $('.dropdown-presentation-transition .select-one-text')[0].textContent,
                    slides: presentationValue,
                }),
            })
                .done(() => {
                    const presentationId = JSON.parse($('#presentationEditor')[0].dataset.presentation).id;
                    Turbolinks.visit(`/admin/editPresentation/${presentationId}`);
                })
                .fail(() => {
                    console.log('request to update presentation was not sent successfully');
                })
        }
    }
}

window.controllers = window.controllers || {};
window.controllers.simplemdeinstance = SimpleMdeInstance;