const sql = require('mssql');

let poolPromise;

function getConfig() {
	return {
		user: process.env.DB_USER,
		password: process.env.DB_PASSWORD,
		server: process.env.DB_SERVER,
		port: Number(process.env.DB_PORT || 1433),
		database: process.env.DB_NAME,
		options: {
			encrypt: String(process.env.DB_ENCRYPT || 'false') === 'true',
			trustServerCertificate: String(process.env.DB_TRUST_SERVER_CERT || 'true') === 'true',
		},
		pool: {
			max: 10,
			min: 0,
			idleTimeoutMillis: 30000,
		},
	};
}

function getPool() {
	if (!poolPromise) {
		poolPromise = sql.connect(getConfig());
	}
	return poolPromise;
}

async function closePool() {
	if (poolPromise) {
		const pool = await poolPromise;
		await pool.close();
		poolPromise = null;
	}
}

module.exports = {
	sql,
	getPool,
	closePool,
};
