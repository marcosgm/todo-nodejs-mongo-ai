import { MongoClient, Db, Collection } from "mongodb";
import { DatabaseConfig } from "../config/appConfig";
import { logger } from "../config/observability";

let mongoClient: MongoClient;
let database: Db;
let todoListCollection: Collection;
let todoItemCollection: Collection;

export const configureMongo = async (config: DatabaseConfig) => {
    try {
        logger.info("Configuring Mongo DB client...");

        mongoClient = new MongoClient(config.connectionString);
        await mongoClient.connect();

        database = mongoClient.db(config.databaseName);
        todoListCollection = database.collection("TodoList");
        todoItemCollection = database.collection("TodoItem");

        logger.info("Mongo DB client configured successfully!");
    }
    catch (err) {
        logger.error(`Mongo DB client configuration error: ${err}`);
        throw err;
    }
};

export const getTodoListCollection = (): Collection => {
    if (!todoListCollection) {
        throw new Error("Mongo DB client not configured. Call configureMongo first.");
    }
    return todoListCollection;
};

export const getTodoItemCollection = (): Collection => {
    if (!todoItemCollection) {
        throw new Error("Mongo DB client not configured. Call configureMongo first.");
    }
    return todoItemCollection;
};
