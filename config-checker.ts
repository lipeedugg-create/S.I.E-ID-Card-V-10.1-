// Este script deve ser executado antes de iniciar o servidor para validar a configuração.
// Use: node --loader ts-node/esm config-checker.ts
// Certifique-se de ter `ts-node` instalado: npm install -g ts-node

import dotenv from 'dotenv';

dotenv.config();

const requiredEnvVars: string[] = [
    'DB_HOST', 
    'DB_USER', 
    'DB_PASS', 
    'DB_NAME', 
    'JWT_SECRET',
    'API_KEY' // Chave para Google Gemini
];

const checkConfig = (): void => {
    console.log("🔍 Verificando variáveis de ambiente...");
    let hasError = false;

    for (const v of requiredEnvVars) {
        if (!process.env[v]) {
            console.error(`❌ Erro Crítico: Variável de ambiente "${v}" não está definida no arquivo .env`);
            hasError = true;
        } else {
            // Ofuscar valor para segurança no log
            const value = process.env[v] as string;
            const obfuscated = value.length > 8 ? `${value.substring(0, 4)}...${value.substring(value.length - 4)}` : '***';
            console.log(`✅ ${v} = ${obfuscated}`);
        }
    }

    if (hasError) {
        console.error("\n⚠️ Configuração incompleta. O servidor não pode ser iniciado. Verifique seu arquivo .env");
        process.exit(1);
    } else {
        console.log("\n🚀 Configuração validada com sucesso!");
    }
};

checkConfig();
