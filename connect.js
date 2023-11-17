const { MongoClient } = require("mongodb");
 
// Replace the following with your Atlas connection string                                                                                                                                        
const url = "mongodb+srv://manjujanzen:rlFLlQtmVBshDFXN@cluster0.uw4khhv.mongodb.net/myFlix";

// Connect to your Atlas cluster
const client = new MongoClient(url);

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