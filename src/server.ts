import express, { Request, Response } from "express";
import fs from "fs";
import path from "path";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json()); // to parse JSON bodies

const postsFilePath = path.join(__dirname, "..", "db.json", "posts.json");

interface Post {
    id: number;
    title: string;
    content: string;
    author: string;
    createdAt: Date;
    updatedAt?: Date;
}

const readPostsFromFile = (): Post[] => {
    try {
        const data = fs.readFileSync(postsFilePath, "utf-8");
        return JSON.parse(data) as Post[];
    } catch (err) {
        return [];
    }
};

const savePostsToFile = (posts: Post[]): void => {
    fs.writeFileSync(postsFilePath, JSON.stringify(posts, null, 2));
};

app.get("/posts", (req: Request, res: Response) => {
    const posts = readPostsFromFile();
    res.json(posts);
});

app.get("/posts/:id", (req: Request, res: Response) => {
    const posts = readPostsFromFile();
    const post = posts.find((p) => p.id === parseInt(req.params.id));
    if (!post) return res.status(404).send("Post not found");
    res.json(post);
});

app.post("/posts", (req: Request, res: Response) => {
    const posts = readPostsFromFile();
    const newPost: Post = {
        id: posts.length + 1,
        title: req.body.title,
        content: req.body.content,
        author: req.body.author,
        createdAt: new Date(),
    };
    posts.push(newPost);
    savePostsToFile(posts);
    res.status(201).json(newPost);
});

app.put("/posts/:id", (req: Request, res: Response) => {
    const posts = readPostsFromFile();
    const post = posts.find((p) => p.id === parseInt(req.params.id));
    if (!post) return res.status(404).send("Post not found");

    post.title = req.body.title || post.title;
    post.content = req.body.content || post.content;
    post.author = req.body.author || post.author;
    post.updatedAt = new Date();

    savePostsToFile(posts);
    res.json(post);
});

app.delete("/posts/:id", (req: Request, res: Response) => {
    let posts = readPostsFromFile();
    posts = posts.filter((p) => p.id !== parseInt(req.params.id));
    savePostsToFile(posts);
    res.status(204).send();
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
