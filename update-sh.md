# Script de Atualização da Aplicação (Guia)

Este script automatiza o processo de atualização do S.I.E em produção.

## update.sh
Crie um arquivo chamado `update.sh` na raiz do seu projeto com o seguinte conteúdo:

```bash
#!/bin/bash

echo "🚀 Iniciando atualização do S.I.E..."

# 1. Navega para o diretório da aplicação
cd /var/www/sie-sistema || { echo "❌ Falha ao encontrar o diretório da aplicação."; exit 1; }

# 2. Puxa as últimas alterações da branch 'main'
echo "📥 Puxando atualizações do repositório..."
git pull origin main

# 3. Instala/Atualiza dependências (se houver mudanças no package.json)
echo "📦 Instalando dependências..."
npm install

# 4. Gera o build de produção do frontend
echo "🏗️  Construindo o frontend..."
npm run build

# 5. Reinicia a API com PM2 para aplicar as mudanças do backend
echo "🔄 Reiniciando o servidor da API..."
pm2 restart sie-api

echo "✅ Atualização concluída com sucesso!"

```

### Como Usar:
1.  **Salve o arquivo:** `nano update.sh`
2.  **Dê permissão de execução:** `chmod +x update.sh`
3.  **Execute:** `./update.sh`

Sempre que precisar atualizar a aplicação, basta rodar este script.