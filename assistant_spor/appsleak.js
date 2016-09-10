/**
 * http://usejsdoc.org/
 */
var Botkit = require('botkit');
var fs = require('fs');
//var socket = require("slack_to_bdorg_server_side");
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
            bot.reply(message, "Tu peux m'apprendre des choses en écrivant *Apprends <et le texte que tu veux que j'apprenne.>*");
            bot.reply(message, "Ttu peux me questionner en écrivant  *Que sais tu sur <et le mot que tu veux que je cherche.>*");
        }
    });
    //console.log ("appel de la bdorg");
    //socket.emit_to_bdorg("bla");
});



//lets require/import the mongodb native drivers.
var mongodb = require('mongodb');
//We need to work with "MongoClient" interface in order to connect to a mongodb server.
var MongoClient = mongodb.MongoClient;
//Connection URL. This is where your mongodb server is running.
var url = 'mongodb://localhost:27017/slack';

/**
 * apprentissage
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
	    	bot.reply(message, "Merci, je suis heureux d'apprendre une chose nouvelle.");
	    	bot.reply(message, "Tu pourras me demander de te rappeller cette information en écrivant,");
	    	 bot.reply(message, "*Que sais tu sur <et le mot que tu veux que je cherche.>*");
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
	    bot.reply(message, "Je cherche...");
	    var cursor = collection.find({ $text: { $search: message.match[1] } });
	    cursor.each(function(err, doc) {
	        assert.equal(err, null);
	        if (doc != null) {
	          //console.dir(doc);
	           bot.reply(message, "je sais *"+doc.texte+"*");
	        } else {
	          console.log('fin')
	        }
	     });
	    bot.reply(message, "Voilà");
	    
	    db.close();
	  }
	});
    });







      