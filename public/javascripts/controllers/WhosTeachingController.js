class WhosTeachingController extends Stimulus.Controller {
    connect() {
        hideAuthorTitlesWhenThereIsThreeOrMore();
        $('.inner-courses-card-author-image').hover((hoveredImage)=>{
            hoveredImage.currentTarget.nextSibling.style.display = 'block';
        });
        $('.inner-courses-card-author-image').mouseleave(()=>{
            hideAuthorTitlesWhenThereIsThreeOrMore();
        });

        function hideAuthorTitlesWhenThereIsThreeOrMore(){
            let numberOfCards = $('.courses-card').length;
            for(let a = 0; a < numberOfCards; a++){
                let coursesCardChildren = $('.courses-card')[a].children;
                let numberOfAuthorTitles = 0;
                for(let b = 0; b < coursesCardChildren.length; b++){
                    if(coursesCardChildren[b].className == 'inner-courses-card-author-name'){
                        numberOfAuthorTitles++;
                        if(numberOfAuthorTitles >= 3){
                            for(let c = 0; c < coursesCardChildren.length; c++){
                                if(coursesCardChildren[c].className == 'inner-courses-card-author-name'){
                                        coursesCardChildren[c].style.display = 'none';
                                }
                            }  
                        }
                    }
                }            
            }
        }
    }
  
}
  
window.controllers = window.controllers || {};
window.controllers.whosTeachingController = WhosTeachingController;