# Guia de Instalação e Deploy - S.I.E (Ubuntu VPS)

Este guia cobre a instalação do zero em um servidor Ubuntu 20.04 ou 22.04.

## 1. Preparação do Sistema

Acesse sua VPS via SSH e atualize os pacotes:

```bash
sudo apt update && sudo apt upgrade -y
sudo apt install curl git build-essential -y
```

## 2. Instalação do MySQL (Banco de Dados)

```bash
# Instalar Servidor MySQL
sudo apt install mysql-server -y

# Configuração de Segurança (Defina senha root, remova usuários anônimos)
sudo mysql_secure_installation
```

### Criar Banco de Dados e Usuário
Acesse o MySQL:
```bash
sudo mysql
```

Execute os comandos SQL:
```sql
CREATE DATABASE sie_db;
CREATE USER 'sie_user'@'localhost' IDENTIFIED BY 'SuaSenhaSegura123!';
GRANT ALL PRIVILEGES ON sie_db.* TO 'sie_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

*Agora, copie e cole o conteúdo do arquivo `DATABASE_SCHEMA.md` para criar as tabelas.*

## 3. Instalação do Node.js

Usaremos o NVM (Node Version Manager) para instalar o Node.js LTS.

```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.3/install.sh | bash
source ~/.bashrc
nvm install --lts
node -v # Verifique a versão
```

## 4. Configuração do Backend (API)

*Nota: Este guia assume que você tem os arquivos do backend em uma pasta `backend` ou na raiz.*

```bash
# Clone seu repositório (exemplo)
git clone https://github.com/seu-usuario/sie-sistema.git
cd sie-sistema

# Instale dependências
npm install

# Configure as variáveis de ambiente
cp .env.example .env
nano .env
```
*Edite o arquivo `.env` com as credenciais do banco de dados criadas no Passo 2.*

### Gerenciador de Processos (PM2)
Para manter o sistema rodando 24/7.

```bash
npm install pm2 -g
pm2 start server.js --name "sie-backend" # Ajuste 'server.js' para seu entrypoint
pm2 save
pm2 startup
```

## 5. Build do Frontend (React)

```bash
# Instale dependências do frontend (se separado) e faça o build
npm run build
```
Isso criará uma pasta `dist` ou `build` com os arquivos estáticos.

## 6. Configuração do Nginx (Servidor Web)

O Nginx servirá o frontend (arquivos estáticos) e fará o proxy reverso para a API.

```bash
sudo apt install nginx -y
```

Crie a configuração do site:
```bash
sudo nano /etc/nginx/sites-available/sie-app
```

Cole o seguinte conteúdo (ajuste o domínio e caminhos):

```nginx
server {
    listen 80;
    server_name seu-dominio.com www.seu-dominio.com;

    # Servir Frontend (React Build)
    location / {
        root /var/www/sie-sistema/dist; # Caminho para a pasta 'dist' ou 'build'
        index index.html;
        try_files $uri $uri/ /index.html;
    }

    # Proxy para Backend (API)
    location /api {
        proxy_pass http://localhost:3000; # Porta definida no .env
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Ative o site e reinicie o Nginx:
```bash
sudo ln -s /etc/nginx/sites-available/sie-app /etc/nginx/sites-enabled/
sudo nginx -t # Testa configuração
sudo systemctl restart nginx
```

## 7. Configuração SSL (HTTPS)

Use o Certbot para HTTPS gratuito:

```bash
sudo apt install certbot python3-certbot-nginx -y
sudo certbot --nginx -d seu-dominio.com -d www.seu-dominio.com
```

## 8. Conclusão

Seu sistema S.I.E deve estar acessível em `https://seu-dominio.com`.

- O Frontend carrega via Nginx.
- As chamadas `/api` são enviadas para o Node.js.
- O Node.js se comunica com o MySQL usando as credenciais do `.env`.
