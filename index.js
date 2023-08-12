require('dotenv').config()
const express = require("express")
const mongoose = require("mongoose")
const cors = require("cors")

//APP config
const app = express()
app.use(express.json())
app.use(express.urlencoded())
app.use(cors())

//DB config
mongoose
  .connect("mongodb://127.0.0.1:27017/reminderAppDB", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("Database connected"))
  .catch((e) => console.log(e));
//DB Schema
const reminderSchema = new mongoose.Schema({
    reminderMsg: String,
    remindAt: String,
    isReminded: Boolean
})

//Create DB Model
const Reminder = new mongoose.model("reminder", reminderSchema)


//Whatsapp reminding functionality

setInterval(async () => {
        try {
            const reminderList = await Reminder.find({});
            
            if (reminderList) {
                for (const reminder of reminderList) {
                    if (!reminder.isReminded) {
                        const now = new Date();
                        if ((new Date(reminder.remindAt) - now) < 0) {
                            const remindObj = await Reminder.findByIdAndUpdate(reminder._id, { isReminded: true });
                            
                            const accountSid = process.env.ACCOUNT_SID;
                            const authToken = process.env.AUTH_TOKEN;
                            const client = require('twilio')(accountSid, authToken); 
                            
                            try {
                                const message = await client.messages.create({ 
                                    body: `Hey Shubham, Reminder from WhatsRemind 🔔: ${reminder.reminderMsg}`, 
                                    from: 'whatsapp:+14155238886',       
                                    to: 'whatsapp:+918349621419',
                                });
                                console.log(message.sid);
                            } catch (error) {
                                console.log(error);
                            }
                        }
                    }
                }
            }
        } catch (error) {
            console.log(error);
        }
    }, 1000);



//API routes
app.get("/getAllReminder", async (req, res) => {
        try {
            const reminderList = await Reminder.find({}).exec();
            res.send(reminderList);
        } catch (err) {
            console.error(err);
            res.status(500).send("Internal Server Error");
        }
});
app.post("/addReminder", async (req, res) => {
        const { reminderMsg, remindAt } = req.body;
        
        try {
            const reminder = new Reminder({
                reminderMsg,
                remindAt,
                isReminded: false
            });
            
            await reminder.save();
    
            const reminderList = await Reminder.find({});
            res.send(reminderList);
        } catch (error) {
            console.log(error);
            // Handle the error and send an appropriate response
            res.status(500).send("An error occurred");
        }
    });
    
    app.post("/deleteReminder", async (req, res) => {
        try {
            await Reminder.deleteOne({ _id: req.body.id });
            const reminderList = await Reminder.find({});
            res.send(reminderList);
        } catch (error) {
            console.log(error);
            res.status(500).send("An error occurred");
        }
    });
app.listen(9000, () => console.log("Be started"))