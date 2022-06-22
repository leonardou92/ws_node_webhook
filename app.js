/*
 * Starter Project for WhatsApp Echo Bot Tutorial
 *
 * Remix this as the starting point for following the WhatsApp Echo Bot tutorial
 *
 */

"use strict";

// Access token for your app
// (copy token from DevX getting started page
// and save it as environment variable into the .env file)
const token = process.env.WHATSAPP_TOKEN;

// Imports dependencies and set up http server
const request = require("request"),
  express = require("express"),
  body_parser = require("body-parser"),
  axios = require("axios").default,
  app = express().use(body_parser.json()); // creates express http server

// Sets server port and logs message on success
app.listen(process.env.PORT || 1337, () => console.log("webhook is listening"));

// Accepts POST requests at /webhook endpoint
app.post("/webhook", (req, res) => {
  // Parse the request body from the POST
  let body = req.body;

  // Check the Incoming webhook message
  console.log(JSON.stringify(req.body, null, 2));
  //insert webhook icaro
  const my_json = JSON.stringify(req.body, null, 2);
  axios.post('http://scryptcase.tecnovenca.net:8091/scriptcase/app/webservice/ws_web/',my_json)
        .then((result) => {
         console.log(result.data);
        });
  //insert webhook icarosoft
  // info on WhatsApp text message payload: https://developers.facebook.com/docs/whatsapp/cloud-api/webhooks/payload-examples#text-messages
  if (req.body.object) {
    if (
      req.body.entry &&
      req.body.entry[0].changes &&
      req.body.entry[0].changes[0] &&
      req.body.entry[0].changes[0].value.messages &&
      req.body.entry[0].changes[0].value.messages[0]
    ) {
      let phone_number_id = req.body.entry[0].changes[0].value.metadata.phone_number_id;
      let from = req.body.entry[0].changes[0].value.messages[0].from; // extract the phone number from the webhook payload
      let name = req.body.entry[0].changes[0].value.contacts[0].profile.name; //name
      let type = req.body.entry[0].changes[0].value.messages[0].type; //type
      let me = "584246303491"; //me
      var id = req.body.entry[0].changes[0].value.messages[0].image.id;
      var caption = req.body.entry[0].changes[0].value.messages[0].image.caption;
      if(type === "audio"){
        var params = {
          "messaging_product": "whatsapp",
          "recipient_type": "individual",
          "to": me,
          "type": type,
          "image": {
            "id": id,
          }
        }
      }
      else if(type === "image" || type === "video"){
        var params = {
          "messaging_product": "whatsapp",
          "recipient_type": "individual",
          "to": me,
          "type": type,
          "image": {
            "id": id,
            "caption": "De: "+ name +"\nNumero: "+ from +"\n"+caption,
          }
        }
      }
      else if(type === "document"){
        "document": {
          "id": "your-media-id",
          "caption": "your-document-caption-to-be-sent",
          "filename": "your-document-filename"
        }
      }
      
     
        
        axios({
          method: "POST", // Required, HTTP method, a string, e.g. POST, GET
          url:
            "https://graph.facebook.com/v12.0/"+ phone_number_id +"/messages?access_token="+ token,
            data:params,
            headers: { "Content-Type": "application/json" },
        });
        console.log(params);
      }
      else if(type === "sticker" || type === "video" || 
        type === "audio" || type === "location" || type === "contacts" || 
        type === "unsupported" || type === "document" 
      ) {
        var msg_body = type;  
      } 
      else if(type === "text") {
        var msg_body = req.body.entry[0].changes[0].value.messages[0].text.body;
      }
      
      // extract the message text from the webhook payload
      //resp text
      axios({
        method: "POST", // Required, HTTP method, a string, e.g. POST, GET
        url:
          "https://graph.facebook.com/v12.0/"+ phone_number_id +"/messages?access_token="+ token,
          data: {
            messaging_product: "whatsapp",
            to: me,
            text: { body: "De: "+ name +"\nNumero: "+ from +"\nMensaje: " + msg_body },
          },
          headers: { "Content-Type": "application/json" },
      });
      //resp template
      axios({
        method: "POST", // Required, HTTP method, a string, e.g. POST, GET
        url:
          "https://graph.facebook.com/v12.0/"+ phone_number_id +"/messages?access_token="+ token,
          data: {
            "messaging_product": "whatsapp",
            "to": from,
            "type": "template",
            "template": {
              "name": "no_disponible",
              "language": {
                "code": "es"
              }
            }
          },
          headers: { "Content-Type": "application/json" },
      });
    }
    res.sendStatus(200);
  } 
  else {
    // Return a '404 Not Found' if event is not from a WhatsApp API
    res.sendStatus(404);
  }
});

// Accepts GET requests at the /webhook endpoint. You need this URL to setup webhook initially.
// info on verification request payload: https://developers.facebook.com/docs/graph-api/webhooks/getting-started#verification-requests 
app.get("/webhook", (req, res) => {
  //res.send(JSON.stringify(req.body, null, 2));
  /**
   * UPDATE YOUR VERIFY TOKEN
   *This will be the Verify Token value when you set up webhook
  **/
  const verify_token = process.env.VERIFY_TOKEN;

  // Parse params from the webhook verification request
  let mode = req.query["hub.mode"];
  let token = req.query["hub.verify_token"];
  let challenge = req.query["hub.challenge"];
  
  // Check if a token and mode were sent
  if (mode && token) {
    // Check the mode and token sent are correct
    if (mode === "subscribe" && token === verify_token) {
      // Respond with 200 OK and challenge token from the request
      console.send("WEBHOOK_VERIFIED");
      res.status(200).send(challenge);
    } 
    else {
      // Responds with '403 Forbidden' if verify tokens do not match
      res.sendStatus(403);
    }
  }
});
