class ChangeThemeController extends Stimulus.Controller {
    connect(){
        
        for(let i = 0; i < $(".card-body").length; i++){
            $(".card-body")[i].style.backgroundColor = $(".card-body")[i].dataset.theme;
        }
    }

}

window.controllers = window.controllers || {};
window.controllers.changeThemeController = ChangeThemeController;