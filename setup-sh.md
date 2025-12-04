# Script de Instalação Automatizada (Guia para Ubuntu)

Copie e cole os blocos de comando no terminal da sua VPS Ubuntu 22.04.

## 1. Atualização e Pacotes Essenciais
```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y curl git build-essential nginx ufw
```

## 2. Instalação do MySQL 8
```bash
sudo apt install -y mysql-server
sudo mysql_secure_installation
# Siga as instruções:
# - Defina uma senha forte para o root.
# - Remova usuários anônimos.
# - Desabilite o login remoto do root.
# - Remova o banco de dados de teste.
# - Recarregue os privilégios.
```
### Configuração do Banco de Dados
```bash
sudo mysql -u root -p
# Digite a senha que você acabou de criar.

# Dentro do MySQL, execute:
CREATE DATABASE sie_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'sie_user'@'localhost' IDENTIFIED BY 'SuaSenhaForteAqui!';
GRANT ALL PRIVILEGES ON sie_db.* TO 'sie_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

## 3. Instalação do Node.js (via NVM)
```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.3/install.sh | bash
source ~/.nvm/nvm.sh
source ~/.bashrc
nvm install --lts
nvm use --lts
nvm alias default 'lts/*'
```

## 4. Instalação do PM2 (Gerenciador de Processos)
```bash
npm install pm2 -g
```

## 5. Clonar e Configurar a Aplicação
```bash
# Navegue para o diretório onde deseja instalar (ex: /var/www)
cd /var/www

# Clone o repositório
git clone https://seu-repositorio/sie-sistema.git
cd sie-sistema

# Instale as dependências
npm install

# Configure as variáveis de ambiente
cp .env.example .env
nano .env
# Preencha DB_HOST, DB_USER, DB_PASS, DB_NAME, JWT_SECRET, API_KEY

# Rode o script para popular o banco de dados
mysql -u sie_user -p sie_db < schemaBD.md

# Faça o build do frontend
npm run build
```

## 6. Configuração do Nginx (Servidor Web)
```bash
sudo nano /etc/nginx/sites-available/sie
```
Cole a configuração abaixo, ajustando `server_name` e `root`:
```nginx
server {
    listen 80;
    server_name seu-dominio.com;

    root /var/www/sie-sistema/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
    
    location /uploads {
        alias /var/www/sie-sistema/uploads;
    }
}
```
Ative o site e reinicie o Nginx:
```bash
sudo ln -s /etc/nginx/sites-available/sie /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

## 7. Iniciar a Aplicação com PM2
```bash
# Dentro da pasta /var/www/sie-sistema
pm2 start server.js --name "sie-api"
pm2 save
pm2 startup
# Siga as instruções do último comando para garantir que o PM2 inicie com o sistema.
```

## 8. Firewall e HTTPS
```bash
# Firewall
sudo ufw allow 'Nginx Full'
sudo ufw allow ssh
sudo ufw enable

# Certificado SSL (HTTPS)
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d seu-dominio.com
```

**Pronto!** Seu sistema está no ar.