
var Smile = (function() {

    var apiUrl = 'https://partain-warmup.herokuapp.com';    //Flask-Python backend

    var smileSpace = 'zaneSpace'; // The smile space to use. 
    var smiles; // smiles container, value set in the "start" method below
    var smileTemplateHtml; // a template for creating smiles. Read from index.html in start method below

    var create; // create form, value set in the "start" method below


    /*
    * HTTP GET request 
    */
   var makeGetRequest = function(url, onSuccess, onFailure) {
       $.ajax({
           type: 'GET',
           url: apiUrl + url,
           dataType: "json",
           success: onSuccess,
           error: onFailure
       });
   };

    /**
     * HTTP POST request
     */
    var makePostRequest = function(url, data, onSuccess, onFailure) {
        $.ajax({
            type: 'POST',
            url: apiUrl + url,
            data: JSON.stringify(data),
            contentType: "application/json",
            dataType: "json",
            success: onSuccess,
            error: onFailure
        });
        console.log("In Post Request");
    };
        
    /**
     * Insert smile into smiles container in UI
     */
    var insertSmile = function(smile, beginning) {
        // Start with the template, make a new DOM element using jQuery
        var newElem = $(smileTemplateHtml);
        console.log($(smileTemplateHtml));;
        // Populate the data in the new element
        // Set the "id" attribute 
        newElem.attr('id', smile.id); 
        // Now fill in the data that we retrieved from the server
        newElem.find('.myTitle').text(smile.title);
        newElem.find('.story').text(smile.story);
        newElem.find('.count').text(smile.like_count); 
        newElem.find('.timestamp').text(smile.created_at);
        var happyClass = "happiness happiness-level-" + smile.happiness_level;
        var happyClassTemp = "happiness" + smile.happiness_level;
        var happyClassTemp2 = "happiness-level-2" + smile.happiness_level;

        newElem.find('.happiness').addClass(happyClass);

        if (beginning) {
            smiles.prepend(newElem);
        } else {
            smiles.append(newElem);
        }
    };


     /**
     * Get recent smiles from API and display 10 most recent smiles
     */
    var displaySmiles = function() {
        // Prepare the AJAX handlers for success and failure
        
        var onSuccess = function(data) {
            console.log(data);
            var count = 0;
            while(count != data.smiles.length){
                insertSmile(data.smiles[count], true);
                count++;
            }
            
        };
        var onFailure = function() { 
            console.error('display smiles failed'); 

        };
        makeGetRequest("/api/smiles?space=zaneSpace&count=5&order_by=created_at", onSuccess, onFailure); //making GET request
        
    };

    /**
     * Event handlers for clicking like.
     */
    var attachLikeHandler = function(e) {
        // Handler to the 'click' action for elements with class 'like'
        smiles.on('click', '.Like', function(e) {
            var temp = $(this).parents()[1];
            var smileId = $(this).parents()[1].id;
            // Prepare the AJAX handlers for success and failure
            var onSuccess = function(data) {
                console.log(data);
                $(temp).find('.count').text(data.smile.like_count);
                
            };
            var onFailure = function() { 
                console.error('like smile error'); 
            };
            console.log(typeof(smileId));
            makePostRequest("/api/smiles/"+ smileId + "/like",smileId, onSuccess, onFailure);
        });
    };


    /**
     * Event handlers for submitting the create form.
     */
    var attachCreateHandler = function(e) {
        // First, hide the form, initially 
        create.find('form').hide();

        //show the 'form' and hide the button
        create.find('.my-button').click(function(e){
           create.find('.my-button').hide();
            create.find('form').show();
        });

        // and show the 'Shared a smile...' button
        create.find('.return').click(function(e){
            create.find('.my-button').show();
            create.find('form').hide(); 
        });

        // The handler for the Post button in the form
        create.on('click','.submit-input',function (e) {
            e.preventDefault (); // Tell the browser to skip its default click action
            var smile = {}; // Prepare the smile object to send to the server
            smile.title = create.find('.title-input').val()
            smile.story = create.find('.story-input').val()
            smile.happiness_level = create.find('.happiness-level-input').val();
            smile.like_count = 0;
            smile.space = smileSpace;
            
            if(smile.title.length == 0 || smile.title.length > 64)
                {
                    alert("invalid title");
                    return false;
                }
            if(smile.happiness_level == 0)
                {
                    alert("Please select happiness level");
                    return false;
                }
            if(smile.story.length == 0 || smile.story.length > 2048)
                {
                    alert("invalid story");
                    return false;
                }
            
            create.find('form').hide();
            create.find('.my-button').show();
    
            // FINISH ME (Task 4): collect the rest of the data for the smile
            
            var onSuccess = function(data) {
                // FINISH ME (Task 4): insert smile at the beginning of the smiles container
                insertSmile(data.smile,true);
                  
            };
            var onFailure = function() { 
                console.error('create smile failed'); 
            };

            makePostRequest("/api/smiles",smile, onSuccess, onFailure);
        })

    };

    
    /**
     * Start the app by displaying the most recent smiles and attaching event handlers.
     */
    var start = function() {
        smiles = $(".smiles");
        create = $(".create");
        mainb = $(".mainbody")

        // Grab the first smile, to use as a template
        smileTemplateHtml = $(".smiles .smile")[0].outerHTML;
        // Delete everything from .smiles
        smiles.html('');
        displaySmiles();
        attachLikeHandler();
        attachCreateHandler();
    };
    

    // PUBLIC METHODS
    return {
        start: start
    };
    
})();
