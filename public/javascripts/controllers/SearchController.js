class SearchController extends Stimulus.Controller {
  connect() {
    console.log('Search controller connected');
    $('.emptyList#empty').hide();
  }
  search() {
    const searchValue = $('#search')[0].value;
    let results = 0;
    for (let i = 0; i < $('.card.manabu-card.border-0.mb-3').length; i++) {
      if ($('.card.manabu-card.border-0.mb-3')[i].outerText.toLowerCase().includes(searchValue.toLowerCase())) {
        $('.card.manabu-card.border-0.mb-3')[i].style.display = '';
        results++;
        $('.emptyList#empty').hide();
      } else {
        $('.card.manabu-card.border-0.mb-3')[i].style.display = 'none';
        $('.emptyList#empty').hide();
      }
    }
    if (results === 0) {
      $('.emptyList#empty').show();
    }
  }
}

window.controllers = window.controllers || {};
window.controllers.searchcontroller = SearchController;
