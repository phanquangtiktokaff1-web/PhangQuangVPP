require('dotenv').config();

const express = require('express');
const cors = require('cors');
const { initDatabase } = require('./libs/initDb');
const { closePool } = require('./libs/db');
const authRoute = require('./routes/authRoute');
const catalogRoute = require('./routes/catalogRoute');
const orderRoute = require('./routes/orderRoute');
const voucherRoute = require('./routes/voucherRoute');
const dashboardRoute = require('./routes/dashboardRoute');
const userRoute = require('./routes/userRoute');
const chatRoute = require('./routes/chatRoute');
const { notFound, errorHandler } = require('./middlewares/errorMiddleware');

const app = express();

app.use(cors());
app.use(express.json({ limit: '2mb' }));

app.get('/api/health', (_req, res) => {
	res.json({ status: 'ok', service: 'backend', timestamp: new Date().toISOString() });
});

app.use('/api/auth', authRoute);
app.use('/api/catalog', catalogRoute);
app.use('/api/orders', orderRoute);
app.use('/api/vouchers', voucherRoute);
app.use('/api/dashboard', dashboardRoute);
app.use('/api/users', userRoute);
app.use('/api/chat', chatRoute);

app.use(notFound);
app.use(errorHandler);

const PORT = Number(process.env.PORT || 5000);

async function bootstrap() {
	try {
		await initDatabase();
		app.listen(PORT, () => {
			console.log(`[server] Backend listening on port ${PORT}`);
		});
	} catch (error) {
		console.error('[server] Failed to start:', error.message);
		process.exit(1);
	}
}

process.on('SIGINT', async () => {
	await closePool();
	process.exit(0);
});

process.on('SIGTERM', async () => {
	await closePool();
	process.exit(0);
});

bootstrap();
