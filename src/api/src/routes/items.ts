import express from "express";
import { Request } from "express";
import { PagingQueryParams } from "../routes/common";
import { TodoItem, createTodoItem, TodoItemState } from "../models/todoItem";
import { getTodoItemCollection } from "../models/mongo";
import { generateChecklist } from "../services/aiService";

const router = express.Router({ mergeParams: true });

type TodoItemPathParams = {
    listId: string
    itemId: string
    state?: TodoItemState
}

/**
 * Gets a list of Todo item within a list
 */
router.get("/", async (req: Request<TodoItemPathParams, unknown, unknown, PagingQueryParams>, res) => {
    try {
        const collection = getTodoItemCollection();
        const skip = req.query.skip ? parseInt(req.query.skip) : 0;
        const top = req.query.top ? parseInt(req.query.top) : 20;
        
        const resources = await collection.find({ listId: req.params.listId }).skip(skip).limit(top).toArray();
        
        res.json(resources);
    } catch (err: any) {
        console.error("Error getting todo items:", err);
        res.status(500).json({ error: "Internal server error" });
    }
});

/**
 * Creates a new Todo item within a list
 */
router.post("/", async (req: Request<TodoItemPathParams, unknown, TodoItem>, res) => {
    try {
        const collection = getTodoItemCollection();
        const item = createTodoItem(req.params.listId, req.body.name, req.body.description);
        
        await collection.insertOne(item);
        
        res.setHeader("location", `${req.protocol}://${req.get("Host")}/lists/${req.params.listId}/${item.id}`);
        res.status(201).json(item);
    } catch (err: any) {
        console.error("Error creating todo item:", err);
        res.status(500).json({ error: "Internal server error" });
    }
});

/**
 * Creates a new Todo item within a list using an AI-generated step-by-step checklist
 * appended to the description.
 */
router.post("/ai-checklist", async (req: Request<TodoItemPathParams, unknown, { name: string; description?: string }>, res) => {
    try {
        const { name, description } = req.body;

        if (!name || typeof name !== "string" || name.trim() === "") {
            return res.status(400).json({ error: "name is required" });
        }

        let checklist: string;
        try {
            checklist = await generateChecklist(name.trim(), description?.trim());
        } catch (aiErr: any) {
            console.error("Error calling Azure OpenAI:", aiErr);
            return res.status(503).json({ error: "AI service unavailable. Ensure AZURE_OPENAI_ENDPOINT is configured." });
        }

        const combinedDescription = description?.trim()
            ? `${description.trim()}\n\n${checklist}`
            : checklist;

        const collection = getTodoItemCollection();
        const item = createTodoItem(req.params.listId, name.trim(), combinedDescription);

        await collection.insertOne(item);

        res.setHeader("location", `${req.protocol}://${req.get("Host")}/lists/${req.params.listId}/${item.id}`);
        res.status(201).json(item);
    } catch (err: any) {
        console.error("Error creating AI checklist todo item:", err);
        res.status(500).json({ error: "Internal server error" });
    }
});

/**
 * Gets a Todo item with the specified ID within a list
 */
router.get("/:itemId", async (req: Request<TodoItemPathParams>, res) => {
    try {
        const collection = getTodoItemCollection();
        const resource = await collection.findOne({ id: req.params.itemId, listId: req.params.listId });
        
        if (!resource) {
            return res.status(404).send();
        }
        
        res.json(resource);
    } catch (err: any) {
        console.error("Error getting todo item:", err);
        res.status(500).json({ error: "Internal server error" });
    }
});

/**
 * Updates a Todo item with the specified ID within a list
 */
router.put("/:itemId", async (req: Request<TodoItemPathParams, unknown, TodoItem>, res) => {
    try {
        const collection = getTodoItemCollection();
        const item: TodoItem = {
            ...req.body,
            id: req.params.itemId,
            listId: req.params.listId,
            Hash: req.params.itemId,
            updatedDate: new Date()
        };

        const result = await collection.replaceOne({ id: req.params.itemId }, item);
        
        if (result.matchedCount === 0) {
            return res.status(404).send();
        }

        res.json(item);
    } catch (err: any) {
        console.error("Error updating todo item:", err);
        res.status(500).json({ error: "Internal server error" });
    }
});

/**
 * Deletes a Todo item with the specified ID within a list
 */
router.delete("/:itemId", async (req, res) => {
    try {
        const collection = getTodoItemCollection();
        const result = await collection.deleteOne({ id: req.params.itemId });
        
        if (result.deletedCount === 0) {
            return res.status(404).send();
        }

        res.status(204).send();
    } catch (err: any) {
        console.error("Error deleting todo item:", err);
        res.status(500).json({ error: "Internal server error" });
    }
});

/**
 * Get a list of items by state
 */
router.get("/state/:state", async (req: Request<TodoItemPathParams, unknown, unknown, PagingQueryParams>, res) => {
    try {
        const collection = getTodoItemCollection();
        const skip = req.query.skip ? parseInt(req.query.skip) : 0;
        const top = req.query.top ? parseInt(req.query.top) : 20;
        
        const resources = await collection.find({ listId: req.params.listId, state: req.params.state as string }).skip(skip).limit(top).toArray();
        
        res.json(resources);
    } catch (err: any) {
        console.error("Error getting todo items by state:", err);
        res.status(500).json({ error: "Internal server error" });
    }
});

router.put("/state/:state", async (req: Request<TodoItemPathParams, unknown, string[]>, res) => {
    try {
        const collection = getTodoItemCollection();
        const completedDate = req.params.state === TodoItemState.Done ? new Date() : undefined;

        const updatePromises = req.body.map(async (id: string) => {
            await collection.updateOne(
                { id, listId: req.params.listId },
                {
                    $set: {
                        state: req.params.state,
                        completedDate,
                        updatedDate: new Date()
                    }
                }
            );
        });

        await Promise.all(updatePromises);

        res.status(204).send();
    } catch (err: any) {
        console.error("Error updating todo items state:", err);
        res.status(500).json({ error: "Internal server error" });
    }
});

export default router;