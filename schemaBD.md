# S.I.E - Schema do Banco de Dados (MySQL - Final)

Execute este script completo no seu servidor MySQL para criar a estrutura final e validada da aplicação.

## 1. DDL (Data Definition Language) - Criação das Tabelas

```sql
CREATE DATABASE IF NOT EXISTS sie_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE sie_db;

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- Tabela de Usuários (Moradores, Staff, etc.)
CREATE TABLE IF NOT EXISTS `users` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `username` VARCHAR(50) UNIQUE,
  `password_hash` VARCHAR(255),
  `role` VARCHAR(50) NOT NULL DEFAULT 'RESIDENT',
  `name` VARCHAR(100) NOT NULL,
  `email` VARCHAR(150),
  `phone` VARCHAR(20),
  `cpf_cnpj` VARCHAR(20),
  `rg` VARCHAR(20),
  `birth_date` DATE,
  `unit` VARCHAR(50),
  `address` TEXT,
  `avatar_url` TEXT,
  `admission_date` DATE,
  `active` BOOLEAN DEFAULT TRUE,
  `qr_code_data` VARCHAR(255) UNIQUE,
  `profile_completion` INT DEFAULT 0,
  `social_data_json` JSON,
  `permissions` JSON,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Configurações Financeiras por Usuário
CREATE TABLE IF NOT EXISTS `user_financial_settings` (
  `user_id` BIGINT PRIMARY KEY,
  `monthly_fee` DECIMAL(10, 2) DEFAULT 0.00,
  `due_day` INT DEFAULT 10,
  `is_donor` BOOLEAN DEFAULT FALSE,
  `donation_amount` DECIMAL(10, 2) DEFAULT 0.00,
  `auto_generate_charge` BOOLEAN DEFAULT TRUE,
  CONSTRAINT `fk_financial_settings_user` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Lançamentos Financeiros (Receitas e Despesas)
CREATE TABLE IF NOT EXISTS `financial_records` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `description` VARCHAR(255) NOT NULL,
  `amount` DECIMAL(12, 2) NOT NULL,
  `type` ENUM('INCOME', 'EXPENSE') NOT NULL,
  `status` ENUM('PAID', 'PENDING', 'OVERDUE') NOT NULL,
  `date` DATE NOT NULL,
  `due_date` DATE,
  `category` VARCHAR(50),
  `user_id` BIGINT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_financial_user` (`user_id`),
  CONSTRAINT `fk_financial_record_user` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Boletos Gerados
CREATE TABLE IF NOT EXISTS `bills` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `user_id` BIGINT NOT NULL,
    `amount` DECIMAL(10, 2) NOT NULL,
    `month_ref` VARCHAR(7),
    `due_date` DATE NOT NULL,
    `status` ENUM('PAID', 'PENDING', 'OVERDUE') DEFAULT 'PENDING',
    `barcode` VARCHAR(100),
    `pdf_url` TEXT,
    CONSTRAINT `fk_bill_user` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Mural de Avisos
CREATE TABLE IF NOT EXISTS `notices` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `title` VARCHAR(200) NOT NULL,
    `content` TEXT NOT NULL,
    `urgency` ENUM('LOW', 'MEDIUM', 'HIGH') DEFAULT 'LOW',
    `author_id` BIGINT,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT `fk_notice_author` FOREIGN KEY (`author_id`) REFERENCES `users`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Alertas (Notificações Push, etc.)
CREATE TABLE IF NOT EXISTS `alerts` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `title` VARCHAR(200),
  `message` TEXT,
  `type` ENUM('INFO','WARNING','EMERGENCY','SUCCESS'),
  `target_audience` VARCHAR(50),
  `channels_json` JSON,
  `sent_by_id` BIGINT,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Reservas de Áreas Comuns
CREATE TABLE IF NOT EXISTS `reservations` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `area_name` VARCHAR(100) NOT NULL,
    `user_id` BIGINT NOT NULL,
    `date` DATE NOT NULL,
    `start_time` TIME NOT NULL,
    `end_time` TIME NOT NULL,
    `status` ENUM('CONFIRMED', 'PENDING', 'CANCELLED') DEFAULT 'PENDING',
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT `fk_reservation_user` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Ocorrências (Incidentes)
CREATE TABLE IF NOT EXISTS `incidents` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `title` VARCHAR(150),
    `location` VARCHAR(100),
    `priority` ENUM('LOW', 'MEDIUM', 'HIGH'),
    `status` ENUM('OPEN', 'IN_PROGRESS', 'RESOLVED'),
    `reported_by` BIGINT,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT `fk_incident_reporter` FOREIGN KEY (`reported_by`) REFERENCES `users`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Portaria (Visitantes)
CREATE TABLE IF NOT EXISTS `visitors` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `name` VARCHAR(100),
    `document` VARCHAR(50),
    `type` ENUM('VISITOR', 'DELIVERY', 'SERVICE'),
    `destination_unit` VARCHAR(50),
    `entry_time` DATETIME,
    `exit_time` DATETIME,
    `registered_by` BIGINT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Pesquisas, Censo e Votações
CREATE TABLE IF NOT EXISTS `surveys` (
    `id` VARCHAR(50) PRIMARY KEY,
    `title` VARCHAR(200),
    `description` TEXT,
    `type` ENUM('CENSUS', 'SATISFACTION', 'VOTING'),
    `status` ENUM('DRAFT', 'ACTIVE', 'CLOSED'),
    `start_date` DATE,
    `end_date` DATE,
    `external_access` BOOLEAN DEFAULT FALSE,
    `questions_json` JSON NOT NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Respostas das Pesquisas
CREATE TABLE IF NOT EXISTS `survey_responses` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `survey_id` VARCHAR(50),
    `user_id` BIGINT NULL,
    `answers_json` JSON NOT NULL,
    `submitted_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT `fk_response_survey` FOREIGN KEY (`survey_id`) REFERENCES `surveys`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Agenda e Timeline
CREATE TABLE IF NOT EXISTS `agenda_events` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `title` VARCHAR(200) NOT NULL,
    `description` TEXT,
    `type` ENUM('MEETING', 'MAINTENANCE', 'EVENT', 'DEADLINE') NOT NULL,
    `status` ENUM('UPCOMING', 'COMPLETED', 'CANCELLED') DEFAULT 'UPCOMING',
    `date` DATETIME NOT NULL,
    `location` VARCHAR(150),
    `reminder` ENUM('NONE', '1_HOUR', '24_HOURS') DEFAULT 'NONE',
    `created_by` BIGINT,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT `fk_event_creator` FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Configurações do Sistema
CREATE TABLE IF NOT EXISTS `system_settings` (
  `setting_key` VARCHAR(50) PRIMARY KEY,
  `setting_value` JSON NOT NULL,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Templates de Carteirinha (Studio IA)
CREATE TABLE IF NOT EXISTS `id_card_templates` (
    `id` VARCHAR(50) PRIMARY KEY,
    `name` VARCHAR(100) NOT NULL,
    `width` INT NOT NULL,
    `height` INT NOT NULL,
    `orientation` ENUM('landscape', 'portrait') DEFAULT 'landscape',
    `front_background` VARCHAR(255),
    `back_background` VARCHAR(255),
    `elements_json` JSON NOT NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Documentos Oficiais (Secretária Ativa)
CREATE TABLE IF NOT EXISTS `official_documents` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `title` VARCHAR(200) NOT NULL,
  `type` VARCHAR(50) NOT NULL,
  `content` LONGTEXT,
  `status` ENUM('DRAFT','FINAL') DEFAULT 'DRAFT',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET FOREIGN_KEY_CHECKS = 1;

```

## 2. DML (Data Manipulation Language) - Seeds Iniciais

```sql
-- Inserir Super Admin (Senha: 123)
-- NOTA: O hash é apenas um exemplo. O backend irá gerar um real no primeiro login ou cadastro.
INSERT INTO `users` (`id`, `username`, `password_hash`, `role`, `name`, `email`, `active`)
VALUES (1, 'admin', '$2a$10$f9bSgH5pL7eN2cR3iJ4k5O.zVnE6yX8uW0iT2jK7lM4pQ9oR8uD3e', 'ADMIN', 'ADMINISTRADOR', 'admin@sie.com', 1)
ON DUPLICATE KEY UPDATE name=VALUES(name);

-- Inserir Configuração Inicial do Sistema
INSERT INTO `system_settings` (`setting_key`, `setting_value`)
VALUES ('general_info', JSON_OBJECT(
    'name', 'S.I.E - Sistema Ativo',
    'cnpj', '00.000.000/0001-00',
    'address', 'Endereço da Associação',
    'enableMaps', true,
    'enableQuestionnaire', true,
    'registrationMode', 'APPROVAL'
))
ON DUPLICATE KEY UPDATE setting_value=VALUES(setting_value);

-- Inserir Template Padrão de Carteirinha
INSERT INTO `id_card_templates` (id, name, width, height, orientation, front_background, back_background, elements_json)
VALUES (
    'tpl_default_green', 
    'Padrão Associação Verde', 
    600, 375, 'landscape', '#ffffff', '#f3f4f6', 
    '[{"id":"header_bg","type":"shape","label":"Fundo Cabeçalho","x":0,"y":0,"width":600,"height":80,"style":{"backgroundColor":"#15803d"},"layer":"front"}]'
) ON DUPLICATE KEY UPDATE name=VALUES(name);
```
