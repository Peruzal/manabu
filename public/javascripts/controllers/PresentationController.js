class PresentationController extends Stimulus.Controller {
    connect() {
        const simplemde = new SimpleMDE();
        updateEditorWithPresentatoinSlideMarkdown();
        function updateEditorWithPresentatoinSlideMarkdown() {
            if ($('#presentationEditor')[0]) {
                
                const presentationMarkdown = JSON.parse($('#presentationEditor')[0].dataset.presentation).slides;
                simplemde.value(presentationMarkdown);
            }
        }

        $('.presentation-container #theme .dropdown-item').click((clickedElement) => {
            $('.presentation-container #theme .select-one-text')[0].textContent = clickedElement.currentTarget.textContent;
        });

        $('.presentation-container #transition .dropdown-item').click((clickedElement) => {
            $('.presentation-container #transition .select-one-text')[0].textContent = clickedElement.currentTarget.textContent;
        });

        getPresentationsAuthoredByUser();
        $('.update-presentation-button').click(() => {
            editPresentation();
        });

        $('.view-presentation-button').click((clickedElement) => {
            const presentationId = clickedElement.currentTarget.dataset.presentationId;
            gotoRevealPresentationPage(presentationId);
        });

        function gotoRevealPresentationPage() {
            const presentationId = JSON.parse($('#presentationEditor')[0].dataset.presentation).id;
            window.open(`/reveal/${presentationId}`, '_blank');
        }

        function getPresentationsAuthoredByUser() {
            $.ajax({
                url: '/admin/presentations',
                type: 'GET',
                contentType: 'application/json; charset=utf-8',
                dataType: 'json',
            })
                .done((response) => {
                    for (let counter = 0; counter < response.presentations.length; counter++) {
                        $('.row#addPresentationAndArchiveSection').append(`
                        <div class="courseAuthoredByUser activeCourses" data-presentation-id=${response.presentations[counter].id}>${response.presentations[counter].title}</div>
                    `)
                    .ready(() => {
                        gotoPresentation();
                    });
                    }
                })
                .fail(() => {
                    console.error('request to get presentations authored by user was not successful');
                });
        }

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

        function gotoPresentation() {
            $('.row#addPresentationAndArchiveSection .courseAuthoredByUser').click((clickedElement) => {
                Turbolinks.visit(`/admin/editPresentation/${clickedElement.currentTarget.dataset.presentationId}`);
            });

            $('.row#addPresentationAndArchiveSection .courseAuthoredByUser')[0].style.borderTop = '2px solid white';
        }
    }
}

window.controllers = window.controllers || {};
window.controllers.presentationController = PresentationController;