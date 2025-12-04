-- Inserir Super Admin
-- A senha '123' terá o hash gerado pelo backend no primeiro uso ou se o campo estiver vazio.
INSERT INTO `users` (`id`, `username`, `password_hash`, `role`, `name`, `email`, `active`, `latitude`, `longitude`)
VALUES (1, 'admin', '$2a$10$f9bSgH5pL7eN2cR3iJ4k5O.zVnE6yX8uW0iT2jK7lM4pQ9oR8uD3e', 'ADMIN', 'ADMINISTRADOR', 'admin@sie.com', 1, -22.6180, -43.7120)
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
