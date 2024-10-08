// require('dotenv').config({path: './env'});
import dotenv from "dotenv"
import connectDB from "./db/index.js";
import { app } from "./app.js";

dotenv.config({
    path: './.env'
})

const port = process.env.PORT || 8000;

connectDB()
    .then(() => {
        app.on("error", (error) => {
            throw new Error(`Error: ${error}`);
        })
        app.listen(port, () => {
            console.log(`Server is running at port : ${port}`);
        })
    })
    .catch((err) => {
        console.log("MONGO db connection failed !!!", err);
    })










/*
import express from "express"
const app = express()

;( async () => {
    try {
        await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
        app.on("error", (error) =>{
            throw new Error(`Error: ${error}`);
        })
        app.listen(process.env.PORT, () => {
            console.log(`App is listening on port ${process.env.PORT}`);
            
        })
    } catch (error) {
        throw new Error(`Error: ${error}`);
    }
})()
    */