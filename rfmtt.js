// jquery.countdown clocks will be compact
$.countdown.setDefaults({compact: true});

// the initial guess for font size in px
var START_FONT_SIZE = 20;

// synchronously load the list of events
var list = (function () {
    var json = null;
    $.ajax({
        'async': false,
        'global': false,
        'url': "media/media.json",
        'dataType': "json",
        'success': function (data) {
            json = data;
        }
    });
    return json;
})(); 

// keep track of the current event we're on
var index;

// change the element by calling its change_function with parameters
// and then resize it to fill the window's width times a factor
function updateElement(element, change_function, parameters, factor){
    // the default factor is 1, or 100% of the width
    factor = factor || 1;

    // using the factor we decide the final font size factor
    var end_font_multiple = START_FONT_SIZE * factor - 1;
    
    // initially set the font to something small
    element.css({fontSize: START_FONT_SIZE});
    if(change_function) {
        // modify the element
        element[change_function](parameters);
    }

    // we need to multiply the font size by the ratio of the
    // element's width to the window's width
    var change_ratio = $(window).width()/element.width();

    // cacluate the vertical portion of the page the final result will take
    var height_ratio = (element.height() *  change_ratio)/$(window).height();
    // if it is more than 1/3rd of the screen then
    if (height_ratio > .33/factor){
        // change the ratio so it only is 1/3rd of the screen
        change_ratio = (.33/factor * $(window).height())/element.height()
    }    
    
    // finally set the font size to the ratio and factor
    element.css({'fontSize': change_ratio * end_font_multiple});
};

// update all the dynamic RFMTT/event-based elements on the page
function updateRFMTT(){
    // keep track of the previous index
    var previous_index = index;
    if(this.id == "forward"){
        index++;
    } else if(this.id == "backward"){
        index--;
    } else if (!index){
        // first time being run, index was never set
        index = list.length-1;
    }
    // keep the index in a sane range for accessing the events
    index = (index + list.length) % list.length;

    event = list[index];

    // only if the event has changed do we update dynamic elements
    if(previous_index != index){
        // if we're at the first or last event, gray out (but don't disable) the forward/backward icons
        $("#backward").toggleClass("disabled", index == 0);
        $("#forward").toggleClass("disabled", index == list.length-1);

        // load the event's audio
        $("#audio-mp3").attr("src", "media/" + event.name + "/audio.mp3");
        $("#audio-ogg").attr("src", "media/" + event.name + "/audio.ogg");
        audio.load();

        // load the event's background
        $("html").css({'background-image': ('url(media/' + event.name + '/background.gif)')});
    }

    // resize all the text fields

    date = new Date(event.date);
    $('#countdown').countdown('destroy');
    updateElement($('#countdown'), "countdown", (date < new Date()) ? {since: date} : {until: date});
    
    updateElement($("#title"), "text", "REFRESHMENTERTAINMENT " + event.title + ":");
    updateElement($("#subtitle"), "text", event.subtitle);

    updateElement($("#controls"), false, false, 0.3);
};

$(function() {
    var audio = $("#audio").get(0);

    // if the audio is playing then pause it, if it isn't then play it
    $("#playpause").click(function(){
        if(audio.paused){
            audio.play();
        } else {
            audio.pause();
        }
    });

    // change the icon according to whether the audio is playing
    $(audio).bind('play pause', function() {
        $('#playpause').toggleClass('icon-pause', !audio.paused);
        $('#playpause').toggleClass('icon-play', audio.paused);
    });

    // going forward or back changes the event
    $("#forward").click(updateRFMTT);
    $("#backward").click(updateRFMTT);

    // load the initial event in the beginning
    updateRFMTT();
});

// resize all the text fields with the windows
$(window).resize(updateRFMTT);