import { Server as HttpServer } from 'http';
import { Socket, Server as ServerSocketIo } from 'socket.io';
import { v4 as uuidv4 } from 'uuid';

import { GameState } from './gameInterface';

export class ServerSocket {
    public static instance: ServerSocket;
    public io: ServerSocketIo;

    public users: { [uid: string]: string };
    public randomCurrentPlayer: () => number;

    public gameState: GameState;

    constructor(httpServer: HttpServer) {
        ServerSocket.instance = this;
        this.users = {};
        this.io = new ServerSocketIo(httpServer, {
            serveClient: false,
            pingInterval: 10000,
            pingTimeout: 5000,
            cookie: false,
            cors: {
                origin: 'http://localhost:5173',
                methods: ['GET', 'POST'],
                credentials: true,
            }
        });

        /** Fonction randomCurrentPlayer pour le jeu du barbu avec 4 joueurs */
        this.randomCurrentPlayer = (): number => {
            return Math.floor(Math.random() * 4) + 1;
        };

        /** Initialisation du gameState */
        this.gameState = {
            players: [],
            currentPlayer: {
                uid: '',
                name: '',
                socketId: '',
                score: 0,
                isReady: false,
                isPlaying: false,
                isWinner: false,
                isDisconnected: false,
            },
            winner: null,
            contracts: [],
            currentContract: null,
        };


        this.io.on('connection', this.StartListeners.bind(this));
        console.log('Socket IO started')
    }

    StartListeners(socket: Socket) {

        console.info(`Message received from ${socket.id}`);

        socket.on('handshake', (callback: (uid: string, users: string[]) => void) => {
            console.log(`Handshake received from ${socket.id}`);

            /** Check if this is a reconnection */
            const reconnected = Object.values(this.users).includes(socket.id);
            //console.log('reconnected', reconnected)
            if (reconnected) {
                console.info('This user has reconnected');

                const uid = this.GetUidFromSocketID(socket.id);
                const users = Object.values(this.users);

                if (uid) {
                    console.info('Sending callback for reconnect ...');

                    callback(uid, users);
                    return;
                }
            }

            /** Generate new user */
            const uid = uuidv4();
            this.users[uid] = socket.id;
            //console.log("Generate this.users", this.users)
            const users = Object.values(this.users);


            //console.log("X player id generate", this.xPlayerId)
            //console.log("O player id generate", this.oPlayerId)

            callback(uid, users);

            // Send new user to all connected users 

            this.io.emit('new-user', uid);


        });

        // ----------------------------------------- //
        //             Game section
        // ----------------------------------------- //

        // Send initial state to all connected users
        this.io.emit('gameState', this.gameState);



        socket.on('disconnect', () => {
            console.info(`User disconnected: ${socket.id}`);

            /** Remove user from users */
            const uid = this.GetUidFromSocketID(socket.id);
            if (uid) {
                delete this.users[uid];
            }

            /** Send disconnected user to all connected users */
            this.io.emit('user_disconnected', uid);

        });

        socket.on('message', (message: string) => {
            console.info(`Message received from ${socket.id}: ${message}`);

            /** Send message to all connected users */
            socket.broadcast.emit('message', message);
        });
    }

    GetUidFromSocketID = (id: string) => {
        return Object.keys(this.users).find((uid) => this.users[uid] === id);
    }

    /**
     * Send a message through the socket
     * @param name the name of the event, ex: handshake
     * @param users List of socket id's
     * @param payload any information needed by the user for state updates
     */

    SendMessage = (name: string, users: string[], payload?: object) => {
        console.info(`Emitting event: ${name} to ${users} users`);
        users.forEach((id) => (payload ? this.io.to(id).emit(name, payload) : this.io.to(id).emit(name)));
    }

}
