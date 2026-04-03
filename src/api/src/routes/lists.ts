import express, { Request } from "express";
import { PagingQueryParams } from "../routes/common";
import { TodoList, createTodoList } from "../models/todoList";
import { getTodoListCollection } from "../models/mongo";

const router = express.Router();

type TodoListPathParams = {
    listId: string
}

/**
 * Gets a list of Todo list
 */
router.get("/", async (req: Request<unknown, unknown, unknown, PagingQueryParams>, res) => {
    try {
        const collection = getTodoListCollection();
        const skip = req.query.skip ? parseInt(req.query.skip) : 0;
        const top = req.query.top ? parseInt(req.query.top) : 20;
        
        const resources = await collection.find({}).skip(skip).limit(top).toArray();
        
        res.json(resources);
    } catch (err: any) {
        console.error("Error getting todo lists:", err);
        res.status(500).json({ error: "Internal server error" });
    }
});

/**
 * Creates a new Todo list
 */
router.post("/", async (req: Request<unknown, unknown, TodoList>, res) => {
    try {
        const collection = getTodoListCollection();
        const list = createTodoList(req.body.name, req.body.description);
        
        await collection.insertOne(list);
        
        res.setHeader("location", `${req.protocol}://${req.get("Host")}/lists/${list.id}`);
        res.status(201).json(list);
    } catch (err: any) {
        console.error("Error creating todo list:", err);
        res.status(500).json({ error: "Internal server error" });
    }
});

/**
 * Gets a Todo list with the specified ID
 */
router.get("/:listId", async (req: Request<TodoListPathParams>, res) => {
    try {
        const collection = getTodoListCollection();
        const resource = await collection.findOne({ id: req.params.listId });
        
        if (!resource) {
            return res.status(404).send();
        }
        
        res.json(resource);
    } catch (err: any) {
        console.error("Error getting todo list:", err);
        res.status(500).json({ error: "Internal server error" });
    }
});

/**
 * Updates a Todo list with the specified ID
 */
router.put("/:listId", async (req: Request<TodoListPathParams, unknown, TodoList>, res) => {
    try {
        const collection = getTodoListCollection();
        const list: TodoList = {
            ...req.body,
            id: req.params.listId,
            Hash: req.params.listId,
            updatedDate: new Date()
        };

        const result = await collection.replaceOne({ id: req.params.listId }, list);
        
        if (result.matchedCount === 0) {
            return res.status(404).send();
        }

        res.json(list);
    } catch (err: any) {
        console.error("Error updating todo list:", err);
        res.status(500).json({ error: "Internal server error" });
    }
});

/**
 * Deletes a Todo list with the specified ID
 */
router.delete("/:listId", async (req: Request<TodoListPathParams>, res) => {
    try {
        const collection = getTodoListCollection();
        const result = await collection.deleteOne({ id: req.params.listId });
        
        if (result.deletedCount === 0) {
            return res.status(404).send();
        }

        res.status(204).send();
    } catch (err: any) {
        console.error("Error deleting todo list:", err);
        res.status(500).json({ error: "Internal server error" });
    }
});

export default router;