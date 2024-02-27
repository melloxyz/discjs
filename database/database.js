const sqlite3 = require('sqlite3').verbose();

class Database {
    constructor(dbPath) {
        this.db = new sqlite3.Database(dbPath, sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE, (err) => {
            if (err) {
                console.error(`MAINBASE: Erro ao conectar ao banco de dados no caminho ${dbPath}:`, err.message);
                throw err;
            }
            console.log('MAINBASE: Conectado ao banco de dados.');
        });
    }

    async run(sql, params = []) {
        return new Promise((resolve, reject) => {
            this.db.run(sql, params, function(err) {
                if (err) {
                    console.error(`MAINBASE: Erro ao executar SQL: "${sql}"`, err.message);
                    reject(err);
                } else {
                    resolve({ id: this.lastID, changes: this.changes });
                }
            });
        });
    }

    async get(sql, params = []) {
        return new Promise((resolve, reject) => {
            this.db.get(sql, params, (err, row) => {
                if (err) {
                    console.error(`MAINBASE: Erro ao buscar dados com SQL: "${sql}"`, err.message);
                    reject(err);
                } else {
                    resolve(row);
                }
            });
        });
    }

    async all(sql, params = []) {
        return new Promise((resolve, reject) => {
            this.db.all(sql, params, (err, rows) => {
                if (err) {
                    console.error(`MAINBASE: Erro ao buscar todos os dados com SQL: "${sql}"`, err.message);
                    reject(err);
                } else {
                    resolve(rows);
                }
            });
        });
    }

    async initDb() {
        try {
            await this.run(`
                CREATE TABLE IF NOT EXISTS users (
                    id TEXT PRIMARY KEY,
                    username TEXT NOT NULL,
                    reputation INTEGER DEFAULT 0,
                    last_given_reputation DATETIME,
                    reputations_given INTEGER DEFAULT 0
                )`);
            console.log('MAINBASE: Usuários = OK');

            await this.run(`
                CREATE TABLE IF NOT EXISTS reputation_logs (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    giver_id TEXT NOT NULL,
                    receiver_id TEXT NOT NULL,
                    date_given DATETIME DEFAULT CURRENT_TIMESTAMP
                )`);
            console.log('MAINBASE: Reputações = OK');

            await this.run(`
                CREATE TABLE IF NOT EXISTS user_reports (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    reported_user_id TEXT NOT NULL,
                    reporter_user_id TEXT NOT NULL,
                    reason TEXT,
                    report_time DATETIME DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (reported_user_id) REFERENCES users(id),
                    FOREIGN KEY (reporter_user_id) REFERENCES users(id)
                )`);
            console.log('MAINBASE: Reports = OK');

            await this.run(`
                CREATE TABLE IF NOT EXISTS user_vips (
                    user_id TEXT PRIMARY KEY,
                    vip_level INTEGER NOT NULL,
                    start_date DATETIME NOT NULL,
                    expiration_date DATETIME NOT NULL,
                    FOREIGN KEY (user_id) REFERENCES users(id)
                )`);
            console.log('MAINBASE: VIPS = OK');

            await this.run(`
                CREATE TABLE IF NOT EXISTS ban_list (
                    user_id TEXT PRIMARY KEY,
                    ban_date DATETIME DEFAULT CURRENT_TIMESTAMP,
                    reason TEXT,
                    banido_por TEXT
                )`);
            console.log('MAINBASE: Banimentos = OK');

        await this.run(`
        CREATE TABLE IF NOT EXISTS anuncios (
            anuncio_id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id TEXT NOT NULL,
            titulo TEXT NOT NULL,
            valor REAL NOT NULL,
            estoque INTEGER NOT NULL,
            tipo TEXT NOT NULL,
            venda_minima INTEGER,
            imagem_url TEXT,
            data_publicacao DATETIME DEFAULT CURRENT_TIMESTAMP,
            status TEXT NOT NULL DEFAULT 'ativo',
            FOREIGN KEY (user_id) REFERENCES users(id)
        )`);
    console.log('MAINBASE: Anuncios = OK');


    // Log Erro Critico
        } catch (err) {
            console.error('MAINBASE: ERRO Crítico ao inicializar o banco de dados:', err.message);
            throw err;
        }
    }
}

const dbPath = './database/mainbase.db';
const db = new Database(dbPath);

// Iniciando o banco de dados e capturando erros de inicialização
db.initDb().catch(err => {
    console.error('MAINBASE: Falha ao inicializar o banco de dados:', err);
});

module.exports = db;
