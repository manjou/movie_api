/** @module mongodb */
const { MongoClient } = require("mongodb");

/** 
 * Connection string for MongoDB Atlas cluster
 * @type {string}
 */
const url = "mongodb+srv://manjujanzen:rlFLlQtmVBshDFXN@cluster0.uw4khhv.mongodb.net/myFlix";

/** 
 * MongoDB client connected to Atlas cluster
 * @type {MongoClient}
 */
const client = new MongoClient(url);

/**
 * @function run
 * @description Connects to MongoDB Atlas cluster, logs success or error, and then closes the connection.
 * @returns {Promise<void>}
 */
async function run() {
    try {
        await client.connect();
        console.log("Successfully connected to Atlas");

    } catch (err) {
        console.log(err.stack);
    }
    finally {
        await client.close();
    }
}

run().catch(console.dir);