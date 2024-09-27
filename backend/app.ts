import express, { Request, Response } from 'express';
import colors from 'colors'
import axios from 'axios';

const app = express();
const port = 5000

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.get('/health', async (_: Request, res: Response) => {
  res.status(200).json({ status: "healthy" })
})

app.get('/authors-with-books', async (req: Request, res: Response) => {
  try {
    const { data } = await axios.get('http://localhost:5001/author')
    res.status(200).json(data)

  } catch (error) {
    res.status(200).json(error)
  }
});

app.listen(port, async () => {
  console.log(colors.bgYellow(` Backend running at http://localhost:${port} `));
});