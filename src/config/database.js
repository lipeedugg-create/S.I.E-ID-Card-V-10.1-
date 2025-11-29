const mysql = require('mysql2');
const dotenv = require('dotenv');

// Carregar variáveis de ambiente
dotenv.config();

// Criar Pool de Conexões
// O Pool gerencia múltiplas conexões simultâneas de forma eficiente
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASS || '',
  database: process.env.DB_NAME || 'sie_db',
  port: process.env.DB_PORT || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  // Converter tipos SQL para JS automaticamente
  typeCast: function (field, next) {
    if (field.type === 'JSON') {
        return (JSON.parse(field.string()));
    }
    return next();
  }
});

// Wrapper para usar Async/Await com o Pool
const promisePool = pool.promise();

// Teste de conexão ao iniciar
pool.getConnection((err, connection) => {
  if (err) {
    console.error('❌ Erro ao conectar ao MySQL:', err.code, err.message);
    if (err.code === 'PROTOCOL_CONNECTION_LOST') {
      console.error('A conexão com o banco de dados foi fechada.');
    }
    if (err.code === 'ER_CON_COUNT_ERROR') {
      console.error('O banco de dados tem muitas conexões.');
    }
    if (err.code === 'ECONNREFUSED') {
      console.error('A conexão com o banco de dados foi recusada.');
    }
  }

  if (connection) {
    console.log('✅ Conectado ao MySQL com sucesso! ID da Thread:', connection.threadId);
    connection.release();
  }
});

module.exports = promisePool;