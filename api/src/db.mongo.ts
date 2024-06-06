import mongoose from 'mongoose'
import {mongodb} from "../config/config";

const mongoUri = mongodb.mongoUri
const clientOptions = {serverApi: {version: '1', strict: true, deprecationErrors: true}}

const connect = async () => {
    // Create a Mongoose clint with a MongoClientOptions object to set the Stable API version
    await mongoose.connect(mongoUri, clientOptions)
    await mongoose.connection.db.admin().command({ping: 1})
    console.log('Pinged pizza deployment!')
}

export default async function () {
    await connect()
    return {
        connect
    }
}
