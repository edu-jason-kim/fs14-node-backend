import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from 'cors';
import Task from "./models/Task.js";
dotenv.config()

// process.env: nodejs에서 환경변수가 등록돼있는 공간
const DATABASE_URL = process.env.DATABASE_URL;
await mongoose.connect(DATABASE_URL);
console.log("Connected to DB");

const port = process.env.PORT;
const app = express();

// middlewares
app.use(cors());
app.use(express.json());

app.get("/tasks", async (req, res) => {
  const sort = req.query.sort;
  const count = Number(req.query.count) || 0;

  const sortOption = { createdAt: sort === "oldest" ? "asc" : "desc" };
  const tasks = await Task.find({
    $or: [{ title: { $regex: "공부" } }, { title: { $regex: "운동" } }],
  });

  res.send(tasks);
});

app.get("/tasks/:id", async (req, res) => {
  const targetId = req.params.id;
  const task = await Task.findById(targetId);

  if (task) {
    res.send(task);
  } else {
    res.status(404).send({ message: "Cannot find given id." });
  }
});

app.post("/tasks", async (req, res) => {
  const newTask = await Task.create(req.body);
  res.status(201).send(newTask);
});

app.patch("/tasks/:id", async (req, res) => {
  // id로 task 찾아서,
  const task = await Task.findById(req.params.id);

  if (task) {
    // task를 req.body의 내용으로 업데이트 한다.
    Object.keys(req.body).forEach((key) => {
      task[key] = req.body[key];
    });
    await task.save();
    res.send(task);
  } else {
    // task가 없으면 404를 응답한다.
    res.status(404).send({ message: "Cannot find given id." });
  }
});

app.delete("/tasks/:id", async (req, res) => {
  const task = await Task.findByIdAndDelete(req.params.id);
  if (task) {
    res.sendStatus(204);
  } else {
    res.status(404).send({ message: "Cannot find given id." });
  }
});

app.use((err, req, res, next) => {
  switch (err.name) {
    case "ValidationError": {
      res.status(400).send({ message: err.message });
      return;
    }
    case "CastError": {
      res.status(404).send({ message: "Cannot find given id." });
      return;
    }
    default: {
      res.status(500).send({ message: err.message });
      return;
    }
  }
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
