/**
 * http://usejsdoc.org/
 */
var Botkit = require('botkit');
var fs = require('fs');
var socket = require("slack_to_bdorg_server_side");
var programme_ur_reader = require('./programme_ur_reader');
var assert = require("assert");




var controller = Botkit.slackbot();

/**
 * Le token à ne pas commiter
 */
var bot = controller.spawn({
  token: "do not commit"
});

/**
 * Démarrage du bot
 */
bot.startRTM(function(err,bot,payload) {
  if (err) {
    throw new Error('Could not connect to Slack');
  }
});

/**
 * Gestion du bonjour et de la première aide en ligne
 */
controller.hears(['hello', 'hi', 'salut', 'bonjour'], 'direct_message,direct_mention,mention', function(bot, message) {

	// ajoute une réaction sur le message de l'emetteur. 
    bot.api.reactions.add({
        timestamp: message.ts,
        channel: message.channel,
        name: 'robot_face',
    }, function(err, res) {
        if (err) {
            bot.botkit.log('Failed to add emoji reaction :(', err);
        }
    });

    // réponds salut
    controller.storage.users.get(message.user, function(err, user) {
        if (user && user.name) {
            bot.reply(message, 'Salut ' + user.name + "!! Je suis "+bot.identity.name+" pour t'aider");
        } else {
            bot.reply(message, "Salut, je suis "+bot.identity.name+" pour t'aider.");
            bot.reply(message, "Je peux te donner des informations sur les congés, les plannings, sur la bdorg.");
            bot.reply(message, "Je suis génial ! :smile:");
        }
    });
    console.log ("appel de la bdorg");
    socket.emit_to_bdorg("bla");
});

///**
// * Gestion des programme cobol UR
// */
//controller.hears(['Que sais tu sur (.*)', ], 'direct_message,direct_mention,mention', function(bot, message) {
//	bot.reply(message, "Je cherche...à propos de "+message.match[1]+" :smile:");
//    bot.reply(message, ""+JSON.stringify(programme_ur_reader.trouve_programme(message.match[1])));
//    });

	
/**
 * fonction banalisé pour traiter le JSON et manager la conversation
 */
function ecoute (keywords,confirmation,answer){
controller.hears(keywords, 'direct_message,direct_mention,mention', function(bot, message) {
		
		bot.startConversation(message, function(err, convo) {
			convo.ask(confirmation, 
					[
	                 {
	                     pattern: 'oui',
	                     callback: function(response, convo) {
	                         // since no further messages are queued after this,
	                         // the conversation will end naturally with status == 'completed'
	                    	 convo.say(answer);	                    	
	                         convo.next();
	                     }
	                 },
	                 {
	                     pattern: 'non',
	                     callback: function(response, convo) {
	                         // stop the conversation. this will cause it to end with status == 'stopped'
	                    	 // convo.stop();
	                    	 convo.say("je ne connais pas d'autres informations à ce sujet. :confused:");
	                         convo.next();
	                     }
	                 },
	                 {
	                     default: true,
	                     callback: function(response, convo) {
	                    	 convo.say("je ne comprends pas ta réponse (oui ou non ?).  :confused:");
	                         convo.repeat();
	                         convo.next();
	                     }
	                 }
	             ]);		
					
		});		

	});
}

/**
 * lecture du json permettant de répondre à des questions. 
 */
fs.readFile('data_for_bot.json', 'utf8', function (err, data) {
	  if (err) throw err;
	  var root = JSON.parse(data);
	  var conversations = root.conversations;
	  for (var int = 0; int < conversations.length; int++) {
	  	conversation = conversations[int];
	  	keywords = conversation.keywords; 
	    for (var i in keywords) {
	  	  console.log(keywords[i]);
	  	}
	  	  
	    confirmation = conversation.confirmation;
	    console.log(confirmation);
	    answer = conversation.answer;
	    console.log(answer); 
	    ecoute (keywords,confirmation,answer);
		}	 
	  	
	});

//lets require/import the mongodb native drivers.
var mongodb = require('mongodb');
//We need to work with "MongoClient" interface in order to connect to a mongodb server.
var MongoClient = mongodb.MongoClient;
//Connection URL. This is where your mongodb server is running.
var url = 'mongodb://localhost:27017/my_database_name';

/**
 * Gestion des programme cobol UR
 */
controller.hears(['Apprends (.*)', ], 'direct_message,direct_mention,mention', function(bot, message) {
	// Use connect method to connect to the Server
	MongoClient.connect(url, function (err, db) {
	  if (err) {
	    console.log('Unable to connect to the mongoDB server. Error:', err);
	  } else {
	    //HURRAY!! We are connected. :)
	    console.log('Connection established to', url);
	    collection = db.collection('connaissances');
	    db.ensureIndex("connaissances", {  
	    	texte: "text"
	    	}, function(err, indexname) {
	    	  assert.equal(null, err);
	    	});
	    collection.insert({texte:message.match[1]},function(err,result){
	    	console.log(result);
	    });
	    // do some work here with the database.

	    //Close connection
	    db.close();
	  }
	});
    });


/**
* db.connaissances.createIndex( { texte: "text" } )
*/
controller.hears(['Que sais tu sur (.*)', ], 'direct_message,direct_mention,mention', function(bot, message) {
	// Use connect method to connect to the Server
	MongoClient.connect(url, function (err, db) {
	  if (err) {
	    console.log('Unable to connect to the mongoDB server. Error:', err);
	  } else {
	    //HURRAY!! We are connected. :)
	    console.log('Connection established to', url);
	    collection = db.collection('connaissances');
	    var cursor = collection.find({ $text: { $search: message.match[1] } });
	    cursor.each(function(err, doc) {
	        assert.equal(err, null);
	        if (doc != null) {
	           console.dir(doc);
	           bot.reply(message, ""+doc.texte);
	        } else {
	          console.log('fin')
	        }
	     });
	    
	    
	    db.close();
	  }
	});
    });







      