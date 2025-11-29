# S.I.E - Schema do Banco de Dados (MySQL)

Execute este script no seu servidor MySQL para criar a estrutura completa do banco de dados.

## 1. Criação do Banco

```sql
CREATE DATABASE IF NOT EXISTS sie_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE sie_db;
```

## 2. Tabelas de Sistema e Usuários

```sql
-- Configurações Globais (Armazena JSON para flexibilidade)
CREATE TABLE system_settings (
    setting_key VARCHAR(50) PRIMARY KEY,
    setting_value JSON NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Tabela Principal de Usuários
CREATE TABLE users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE,
    password_hash VARCHAR(255), -- Nullable se for cadastro via Google/Social
    role ENUM('ADMIN', 'PRESIDENT', 'VICE_PRESIDENT', 'SINDIC', 'RESIDENT', 'CONCIERGE', 'MERCHANT', 'COUNCIL') NOT NULL DEFAULT 'RESIDENT',
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150),
    phone VARCHAR(20),
    cpf_cnpj VARCHAR(20),
    unit VARCHAR(50), -- Bloco e Apto
    address TEXT,
    avatar_url TEXT,
    admission_date DATE,
    active BOOLEAN DEFAULT TRUE,
    qr_code_data VARCHAR(255) UNIQUE,
    profile_completion INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Configurações Financeiras do Usuário
CREATE TABLE user_financial_settings (
    user_id BIGINT PRIMARY KEY,
    monthly_fee DECIMAL(10, 2) DEFAULT 0.00,
    due_day INT DEFAULT 10,
    is_donor BOOLEAN DEFAULT FALSE,
    donation_amount DECIMAL(10, 2) DEFAULT 0.00,
    auto_generate_charge BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Templates de Carteirinha (Design Studio)
CREATE TABLE id_card_templates (
    id VARCHAR(50) PRIMARY KEY, -- Usando ID string gerado pelo front ou UUID
    name VARCHAR(100) NOT NULL,
    width INT NOT NULL,
    height INT NOT NULL,
    orientation ENUM('landscape', 'portrait') DEFAULT 'landscape',
    front_background VARCHAR(255),
    back_background VARCHAR(255),
    elements_json JSON NOT NULL, -- Array com posições e estilos
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## 3. Módulo Financeiro

```sql
-- Lançamentos (Receitas e Despesas)
CREATE TABLE financial_records (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    description VARCHAR(255) NOT NULL,
    amount DECIMAL(12, 2) NOT NULL,
    type ENUM('INCOME', 'EXPENSE') NOT NULL,
    status ENUM('PAID', 'PENDING', 'OVERDUE') NOT NULL,
    date DATE NOT NULL,
    due_date DATE,
    category VARCHAR(50),
    user_id BIGINT NULL,
    attachment_url TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- Boletos Gerados
CREATE TABLE bills (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    month_ref VARCHAR(7), -- 'MM/YYYY'
    due_date DATE NOT NULL,
    status ENUM('PAID', 'PENDING', 'OVERDUE') DEFAULT 'PENDING',
    barcode VARCHAR(100),
    pdf_url TEXT,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

## 4. Comunicação e Alertas

```sql
-- Mural de Avisos
CREATE TABLE notices (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    content TEXT NOT NULL,
    urgency ENUM('LOW', 'MEDIUM', 'HIGH') DEFAULT 'LOW',
    author_id BIGINT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE SET NULL
);

-- Histórico de Alertas Disparados
CREATE TABLE alerts (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(200),
    message TEXT,
    type ENUM('INFO', 'WARNING', 'EMERGENCY', 'SUCCESS'),
    target_audience VARCHAR(50),
    channels_json JSON, -- ['APP', 'EMAIL']
    sent_by_id BIGINT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## 5. Operacional

```sql
-- Reservas de Áreas Comuns
CREATE TABLE reservations (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    area_name VARCHAR(100) NOT NULL,
    user_id BIGINT NOT NULL,
    date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    status ENUM('CONFIRMED', 'PENDING', 'CANCELLED') DEFAULT 'PENDING',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Ocorrências
CREATE TABLE incidents (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(150),
    location VARCHAR(100),
    priority ENUM('LOW', 'MEDIUM', 'HIGH'),
    status ENUM('OPEN', 'IN_PROGRESS', 'RESOLVED'),
    reported_by BIGINT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (reported_by) REFERENCES users(id)
);

-- Visitantes e Portaria
CREATE TABLE visitors (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100),
    document VARCHAR(50),
    type ENUM('VISITOR', 'DELIVERY', 'SERVICE'),
    destination_unit VARCHAR(50),
    entry_time DATETIME,
    exit_time DATETIME,
    registered_by BIGINT
);
```

## 6. Pesquisas e Censo

```sql
CREATE TABLE surveys (
    id VARCHAR(50) PRIMARY KEY,
    title VARCHAR(200),
    description TEXT,
    type ENUM('CENSUS', 'SATISFACTION', 'VOTING'),
    status ENUM('DRAFT', 'ACTIVE', 'CLOSED'),
    start_date DATE,
    end_date DATE,
    external_access BOOLEAN DEFAULT FALSE,
    questions_json JSON NOT NULL, -- Estrutura flexível das perguntas
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE survey_responses (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    survey_id VARCHAR(50),
    user_id BIGINT NULL, -- Null se anônimo
    answers_json JSON NOT NULL, -- Respostas
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (survey_id) REFERENCES surveys(id) ON DELETE CASCADE
);
```

## 7. Inserção do Super Admin (Obrigatório)

```sql
INSERT INTO users (username, password_hash, role, name, active, profile_completion)
VALUES ('admin', '$2b$10$Xw..HASH_SENHA_BCRYPT..', 'ADMIN', 'ADMINISTRADOR DO SISTEMA', TRUE, 100);
-- Nota: Em produção, gere um hash bcrypt real para a senha. A senha '123' não funcionará diretamente se o backend usar bcrypt.
```
