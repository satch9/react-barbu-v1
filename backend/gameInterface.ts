/** Interface de GameState pour le jeu du barbu */
export interface GameState {
    players: Player[];
    currentPlayer: Player;
    winner: Player | null;
    contracts: Contract[];
    currentContract: Contract | null;
}

/** Interface de player pour le jeu du barbu */
export interface Player {
    uid: string;
    name: string;
    socketId: string;
    score: number;
    isReady: boolean;
    isPlaying: boolean;
    isWinner: boolean;
    isDisconnected: boolean;
}

/** Interface de GameState pour le jeu du barbu */
export interface GameState {
    players: Player[];
    currentPlayer: Player;
    winner: Player | null;
    contracts: Contract[];
}

/** Interface de Contract pour le jeu du barbu */
export interface Contract {
    name: string;
    description: string;
    value: number;
}