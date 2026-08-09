const express = require("express")
const Message = require("../models/Message")
const router = express.Router();


router.post("/", async (req, res) => {
    try {
        const { userId, username, text } = req.body;
        const message = new Message({
            userId,
            username,
            text
        })
        await message.save();
        res.status(201).json(message);
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: "failed to send message " })
    }
})
router.get("/", async (req, res) => {
    try {
        const { after } = req.query;
        if (!after) {
            const message = await Message.find();

            res.status(200).json(message);
        }
        else {
            
            const lastMessage = await Message.findById(after);
            if (!lastMessage) {
                return res.status(400).json({
                    message: "Message not found"
                });
            }
            const message = await Message.find({
                createdAt: {
                    $gt: lastMessage.createdAt
                }
            })
            res.json(message);
        }

    }
    catch (err) {
        console.log(err);
        res.status(500).json({ message: "failed to send message " })
    }
})

module.exports = router;