import 'dotenv/config';

const required = ['DB_HOST', 'DB_PORT', 'DB_USER', 'DB_NAME', 'JWT_SECRET', 'CLIENT_URL'];

for (const key of required) {
    if (!process.env[key]) {
        console.error(`Variable manquante dans .env : ${key}`);
        process.exit(1);
    }
}

if ((process.env.JWT_SECRET as string).length < 32) {
    console.error('JWT_SECRET trop court : 32 caractères minimum, générés aléatoirement');
    process.exit(1);
}