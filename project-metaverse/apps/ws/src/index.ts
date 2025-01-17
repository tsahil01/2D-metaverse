import { WebSocketServer } from 'ws';
import { User } from './User';

export const JWT_SECRET = process.env.JWT_SECRET || "secret";
const wss = new WebSocketServer({ port: 3001 });

wss.on('connection', function connection(ws) {
  console.log("USER CONNECTED")
  let user: User = new User(ws);

  ws.on('error', console.error);

  ws.on('close', () => {
    console.log("USER DISCONNECTED")
    user?.destroy()
  })
});