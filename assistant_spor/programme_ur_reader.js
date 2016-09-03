var Converter = require("csvtojson").Converter;
var converter = new Converter({delimiter: ';'});

var liste_des_programmes; 

converter.on("end_parsed", function (lu) {
	liste_des_programmes = lu;	
});

require("fs").createReadStream("./progUR.csv").pipe(converter);


var trouve_programme = function(programme_name){
	 console.log(programme_name);
	var array_filtrer = liste_des_programmes.filter(function(elm){
			return elm.programme == programme_name;
			 })
	   console.log(array_filtrer);
	 	console.log(array_filtrer.size);
	   if (array_filtrer.length != 1) return "Je ne sais rien !" 
	  	 else {
	  		 resultat = array_filtrer[0];
	  		 resultat.commentaires = "C'est un programme UR !";
	  		 return resultat;
	  	 }
	};
	

//les exports
exports.trouve_programme = trouve_programme;
