import mongoose from "mongoose";
import data from "./seedData.js";
import Task from "../models/Task.js";
import { DATABASE_URL } from "../env.js";

await mongoose.connect(DATABASE_URL);

await Task.deleteMany({});
await Task.insertMany(data);

await mongoose.connection.close();
