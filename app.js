// This loads the environment variables from the .env file
require('dotenv-extended').load();

var builder = require('botbuilder');
var restify = require('restify');
let date = require('date-and-time');
// Setup Restify Server
var server = restify.createServer();
server.listen(process.env.port || process.env.PORT || 3978, function () {
    console.log('%s listening to %s', server.name, server.url);
});
// Create connector and listen for messages
var connector = new builder.ChatConnector({
    appId:process.env.MICROSOFT_APP_ID || `9fd83633-e680-400a-98d4-57ce92fd3578`,
    appPassword: process.env.MICROSOFT_APP_PASSWORD || `wpoiZHG364-@gnlWKJJ50_)`
});
server.post('/api/messages', connector.listen());


var bot = new builder.UniversalBot(connector, function (session) {
    session.send("Welcome to pizza ordering bot");
    session.beginDialog("Order");
});

var luisAppUrl = 'https://westus.api.cognitive.microsoft.com/luis/v2.0/apps/eafd1e94-89c3-4d89-9dff-918a3c0d79bd?subscription-key=137d934f7aea4f45a2216f250237285a&verbose=true&timezoneOffset=0&q=';

bot.recognizer(new builder.LuisRecognizer(luisAppUrl));

bot.dialog("OrderPizza",[
  function(session,args,next){
    var intent=args.intent;
    console.log("intent",intent);
    var pizzakind=builder.EntityRecognizer.findEntity(intent.entities,'pizzaKind');
    console.log("pizzakind : ",pizzakind);
    var quantity=builder.EntityRecognizer.parseNumber(intent.entities,'number');
    console.log("quantity : ",quantity);
    var date=builder.EntityRecognizer.findEntity(intent.entities,'builtin.datetimeV2.date');
    console.log("date : ",date);
    console.log(intent);
    var order= session.dialogData.order ={
      pizzakind: pizzakind ? pizzakind.entity : null,
      quantity: quantity ? quantity : null,
      date : date ? date.resolution.values[0] : null
    }
    console.log(order.pizzakind);
    console.log(order.quantity);
    console.log(order.date);
    var obj =order.date;
    if(obj){
      var result = Object.keys(obj).map(function(key) {
        return [ obj[key]];
      });
      console.log(result[2]);
      order.date=result[2];
    }
/*if(order.pizzakind && order.quantity && order.date ){
  session.send(`Order confirmed. Order details: <br/>Type: ${order.pizzakind} <br/>quantity: ${order.quantity} <br/> date:${result[2]} `);
}*/
    if(!order.pizzakind){
      builder.Prompts.text(session,"sure, what type of pizza would you want me to order?");
    }else{
      next();
    }

  },
    function(session,results,next){
    var order = session.dialogData.order
            if (results.response) {
              var array=["veg","chicken","cheese","double cheese","margarita","panner","fresh pan pizza"];
              if(array.indexOf(results.response)!=-1){
                order.pizzakind=results.response;
                if(!order.quantity){
                  builder.Prompts.number(session,"how many of them would you like to order?");
                }else {
                    next();
                }
              }else{
                var msg="session cancelled due to wrong response.";
                session.endConversation(msg);
              }
  }
},
function(session,results,next){
  var order = session.dialogData.order;
          if (results.response) {
            if (isNaN(results.response)) {
              var msg="session cancelled due to wrong response."
              session.endConversation(msg);
}
else{
  order.quantity=results.response;
  if(!order.date){
    builder.Prompts.time(session,"when do you prefer your order to be delivered?");
  }
  else {
      next();
  }
}
}
},
function(session,results){
  var order = session.dialogData.order;
  if (results.response){
    session.dialogData.time = builder.EntityRecognizer.resolveTime([results.response]);
    //order.date=session.dialogData.time;
       order.date=date.format(session.dialogData.time, 'MM/DD/YYYY');

  }

  session.send(`Order confirmed. Order details: <br/>Type: ${order.pizzakind} <br/>quantity: ${order.quantity} <br/> date:${order.date} `);
  session.endDialog();

}
]).triggerAction({
    matches: 'PizzaOrdering',
    confirmPrompt: "This will cancel the ordering. Are you sure?"
}).cancelAction('cancelpizza', "pizza order canceled.", {
    matches: /^(cancel|nevermind)/i,
    confirmPrompt: "Are you sure?"
});


bot.dialog("Order",[
  function(session){
    var pizzakind=null;
    var quantity=null;
    var orderdate=null;
      builder.Prompts.text(session,"okay, what kind of pizza would you like?");
  },
  function(session,results){
    var order = session.dialogData.order

            if (results.response) {
              var array=["veg","chicken","cheese","double cheese","margarita","panner","fresh pan pizza"];
              if(array.indexOf(results.response)!=-1){
                 pizzakind=results.response;
                 builder.Prompts.number(session,"how many of them would you like to order?");
              }
              else{
                var msg="session cancelled due to wrong response."
                session.endConversation(msg);
              }
  }
},
function(session,results){
  var order = session.dialogData.order;
          if (results.response) {
            if (isNaN(results.response)) {
              var msg="session cancelled due to wrong response."
              session.endConversation(msg);
}
else{
   quantity=results.response;
   builder.Prompts.time(session,"when do you prefer your order to be delivered?");
}
}



},
function(session,results){
  var order = session.dialogData.order;
  if (results.response){
    session.dialogData.time = builder.EntityRecognizer.resolveTime([results.response]);
    //order.date=session.dialogData.time;
     orderdate=date.format(session.dialogData.time, 'MM/DD/YYYY');
  }
  else{
    var msg="session cancelled due to wrong response."
    session.endConversation(msg);
  }
  session.send(`Order confirmed. Order details: <br/>Type: ${pizzakind} <br/>quantity: ${quantity} <br/> date:${orderdate} `);
  session.endDialog();

}
]).triggerAction({
    matches: 'PizzaOrdering',
    confirmPrompt: "This will cancel the ordering. Are you sure?"
}).cancelAction('cancelpizza', "pizza order canceled.", {
    matches: /^(cancel|nevermind)/i,
    confirmPrompt: "Are you sure?"
});
