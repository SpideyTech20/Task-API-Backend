require("dotenv").config();
const express = require("express");
const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json());

let nextId = 1;

class Animal {
    constructor(name, numLegs) {
        this.id = nextId++;
        this.name = name.toUpperCase();
        this.numLegs = numLegs;
    }
}

const animals = [
    new Animal("Dog", 4),
    new Animal("bird", 2),
    new Animal("spider", 8),
    new Animal("ant", 6),
    new Animal("human", 2)
];

console.log(animals);

app.get("/", (req, res) => {
    res.json({ message: "Animal API is running" });
});

// GET /animals – filter by numLegs (optional)
app.get("/animals", (req, res) => {
    const { numLegs } = req.query;

    // If no filter, return all
    if (numLegs === undefined) {
        return res.json({ animals });
    }

    // Convert query to number and filter
    const legs = Number(numLegs);
    if (isNaN(legs)) {
        return res.status(400).json({ message: "numLegs must be a number" });
    }

    const filtered = animals.filter(a => a.numLegs === legs);
    res.json({ animals: filtered });
});

// GET /animal/:id – get one by ID
app.get("/animal/:id", (req, res) => {
    const id = Number(req.params.id);
    const animal = animals.find(a => a.id === id);
    if (!animal) {
        return res.status(404).json({ message: "Animal not found" });
    }
    res.json(animal);
});

// POST /animals – create a new animal (with validation)
app.post("/animals", (req, res) => {
    const { name, numLegs } = req.body;

    // Validate required fields
    if (!name || numLegs === undefined) {
        return res.status(400).json({ message: "name and numLegs are required" });
    }
    if (typeof name !== "string" || !name.trim()) {
        return res.status(400).json({ message: "name must be a non-empty string" });
    }
    const legs = Number(numLegs);
    if (isNaN(legs) || legs < 0) {
        return res.status(400).json({ message: "numLegs must be a non-negative number" });
    }

    const newAnimal = new Animal(name.trim(), legs);
    animals.push(newAnimal);
    res.status(201).json(newAnimal);
});

// PUT /animals/:id – full/partial update (with validation)
app.put("/animals/:id", (req, res) => {
    const id = Number(req.params.id);
    const animal = animals.find(a => a.id === id);
    if (!animal) {
        return res.status(404).json({ message: "Animal not found" });
    }

    const { name, numLegs } = req.body;

    // Update name if provided
    if (name !== undefined) {
        if (typeof name !== "string" || !name.trim()) {
            return res.status(400).json({ message: "name must be a non-empty string" });
        }
        animal.name = name.trim().toUpperCase();
    }

    // Update numLegs if provided
    if (numLegs !== undefined) {
        const legs = Number(numLegs);
        if (isNaN(legs) || legs < 0) {
            return res.status(400).json({ message: "numLegs must be a non-negative number" });
        }
        animal.numLegs = legs;
    }

    res.json({ message: "Animal updated", animal });
});

// PATCH /animals/:id – explicit partial update (same logic as PUT, but different intent)
app.patch("/animals/:id", (req, res) => {
    const id = Number(req.params.id);
    const animal = animals.find(a => a.id === id);
    if (!animal) {
        return res.status(404).json({ message: "Animal not found" });
    }

    const { name, numLegs } = req.body;

    if (name !== undefined) {
        if (typeof name !== "string" || !name.trim()) {
            return res.status(400).json({ message: "name must be a non-empty string" });
        }
        animal.name = name.trim().toUpperCase();
    }

    if (numLegs !== undefined) {
        const legs = Number(numLegs);
        if (isNaN(legs) || legs < 0) {
            return res.status(400).json({ message: "numLegs must be a non-negative number" });
        }
        animal.numLegs = legs;
    }

    res.json({ message: "Animal partially updated (PATCH)", animal });
});

// DELETE /animals/:id – remove an animal
app.delete("/animals/:id", (req, res) => {
    const id = Number(req.params.id);
    const index = animals.findIndex(a => a.id === id);
    if (index === -1) {
        return res.status(404).json({ message: "Animal not found" });
    }
    const removed = animals.splice(index, 1)[0];
    res.json({ message: "Animal deleted", animal: removed });
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});