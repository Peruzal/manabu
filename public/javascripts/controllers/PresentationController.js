class PresentationController extends Stimulus.Controller {
    connect() {
        $('.presentation-container #theme .dropdown-item').click((clickedElement) => {
            $('.presentation-container #theme .select-one-text')[0].textContent = clickedElement.currentTarget.textContent;
        });

        $('.presentation-container #transition .dropdown-item').click((clickedElement) => {
            $('.presentation-container #transition .select-one-text')[0].textContent = clickedElement.currentTarget.textContent;
        });

        getPresentationsAuthoredByUser();

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