let NGA = (function(){
	const 	APIKEY = "b432ab4c30b70e77ba87cefd375e0e8d",
			APIURL = "http://words.bighugelabs.com/api/2/b432ab4c30b70e77ba87cefd375e0e8d/";
	let wordParts = {};

	let buildUrl = function(word){
		modifiedUrl = APIURL + word + "/json";
		return modifiedUrl;
	},

	randomItem = function(array){
		let itemNum = Math.floor(Math.random() * array.length);
			return array[itemNum];
	},
	randomChance = function(integer){
		const MAX = 10;
		let rand = Math.floor((Math.random() * MAX) + 1);
		if (rand <= integer) {
		    return true;
		}else{return false}
	},
	titleCase = function(string){

	    return string
	        .toLowerCase()
	        .split(' ')
	        .map(function(word) {
	            return word[0].toUpperCase() + word.substr(1);
	        })
	        .join(' ');
		
	},
	camelize = function(string){
		/* capitalize first letter of each word */
		string = titleCase(string);

		/* replace hyphens with no space and next capitalized letter*/
		string = string.replace(/(-|^)([^-]?)/g, function(_, prep, letter) {
	        return (prep && '') + letter.toUpperCase();
	    });
	    /* remove white space */
	 	string = string.replace(/\s/g,"");

		return string
	};

	return{
		init : function(fetch){
			/* get local word parts file */
			let promise = new Promise ((resolve, reject) => {
				fetch.request({url : "./wordParts.json", resolve, reject});
			})
			.then(function(data){
				wordParts = data;
			});
			

			document.addEventListener('keyup',function(e){
				if(e.keyCode === 13){
					e.preventDefault();
					e.stopPropagation();
					analyzeInput.onSubmit();
				}
			});

		},
		result : function(name){
			document.getElementById('wordContainer').classList.remove('hide');
			document.getElementById('wordDiv').innerHTML = name;
		},
		reset : function(){
			if(document.getElementById('errorContainer').classList.value.indexOf("hide") === -1){
				document.getElementById('errorContainer').classList.add('hide');
			}
		},
		error : function(){
			document.getElementById('errorContainer').classList.remove('hide');
			document.getElementById('wordContainer').classList.add('hide');
		},
		userIsLazy : function(){
			document.getElementById("noun").value = randomItem(wordParts.test.nouns);
			document.getElementById("verb").value = randomItem(wordParts.test.verbs);
			document.getElementById("adjective").value = randomItem(wordParts.test.adjectives);
			//this.analyzeInput.onSubmit();
		},
		fetch : (function(){
			return{
				
				request : function(config){
					let request = new XMLHttpRequest(),
						url = config.url ? config.url : buildUrl(config.word),
						that = this;

						NGA.reset();

					    request.open('GET', url, true);
					    
					    request.onload = function() {
					      if (request.status >= 200 && request.status < 400) {
					        // Success!
					        const DATA = JSON.parse(request.responseText);
					        	
					      
					        	
					      config.resolve(DATA);
					      } else {
					        // We reached our target server, but it returned an error
					        console.log('word error');
					        config.resolve({});
					      }
					    };
					    
					    request.onerror = function() {
					      // There was a connection error of some sort
					      console.log("Connection Error");
					      //NGA.error();
					    };
					    
					    request.send();
				}
				
			}
		})(),
		analyzeInput : (function(){
			let builtName = "",
				gotWordParts = [];
			return {
				onSubmit : function(){
					builtName = "";
					gotWordParts = [];

					if(!document.getElementById("noun").value){
						NGA.error();
					}else{
						let fetchObj = {
								noun : document.getElementById("noun").value,
								adjective : document.getElementById("adjective").value,
								verb : document.getElementById("verb").value
							};
						let promiseArray = [];

						// Verb
						if(fetchObj.verb){
							let retrieveVerb = new Promise ((resolve, reject) => {
								NGA.fetch.request({word : fetchObj.verb, resolve, reject});
							}).then((data) =>{
								if(data.hasOwnProperty("verb")){
									console.log('matching verb - ', data.verb);
									gotWordParts.push("verb");
									let randomVerb = randomItem(data.verb.syn);
									
									randomVerb = camelize(randomVerb);
									
									// possibly use prefix or suffix 
									if(randomChance(2)){
										// 20% chance to add prefix, otherwise add suffix 
										if(randomChance(4)){
											randomVerb = randomItem(wordParts.prefix) + randomVerb;
										}else{
											randomVerb += randomItem(wordParts.suffix.verb);
										}
										
									}else if(randomChance(2)){
										randomVerb += randomItem(wordParts.preposition);
									}

									builtName += randomVerb;
								}
							});
							promiseArray.push(retrieveVerb);
						}
						
						// Adjective
						if(fetchObj.adjective){
							let retrieveAdjective = new Promise ((resolve, reject) => {
								NGA.fetch.request({word : fetchObj.adjective, resolve, reject});
							}).then((data) =>{
								if(data.hasOwnProperty("adjective")){
									console.log('matching adjective - ', data.adjective);
									gotWordParts.push("adjective");
									let randomAdjective = randomItem(data.adjective.sim);
									
									randomAdjective = camelize(randomAdjective);

									// possibly use prefix or suffix
									if(randomChance(2)){
										// 20% chance to add prefix, otherwise add suffix
										if(randomChance(4)){
											randomAdjective = randomItem(wordParts.prefix) + randomAdjective;
										}else{
											randomAdjective += randomItem(wordParts.suffix.adjective);
										}
										
									}

									builtName += randomAdjective;
								}
							});
							promiseArray.push(retrieveAdjective);
						}
						
						
						
						/* Noun */
						let retrieveNoun = new Promise ((resolve, reject) => {
							setTimeout(function(){
								NGA.fetch.request({word : fetchObj.noun, resolve, reject});
							},200);
							
						}).then((data) =>{
							if(data.hasOwnProperty("noun")){
								console.log('matching noun - ', data.noun);
								gotWordParts.push("noun");
								let randomNoun = randomItem(data.noun.syn);

								randomNoun = camelize(randomNoun);
								

								/* possibly use prefix or suffix */
								if(randomChance(2)){
									/* 20% chance to add prefix, otherwise add suffix */
									if(randomChance(4)){
										randomNoun = randomItem(wordParts.prefix) + randomNoun;
									}else{
										randomNoun += randomItem(wordParts.suffix.noun);
									}
									
								}

								
								builtName += randomNoun;

									
								
								
							}
						});
						
						promiseArray.push(retrieveNoun);

						
						
							
						// Build Name 
						Promise.all(promiseArray)
						.then(() => {
							console.log('in finished then');
							if(builtName){
								NGA.result(builtName);
							}else{
								NGA.error();
							}
						});
					}
				}
			}	
				
		})()
	}
})();

NGA.init(NGA.fetch);