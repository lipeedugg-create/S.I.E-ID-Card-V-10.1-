import { UserRole, SystemInfo, Permission, FinancialRecord, Incident, Notice, UnitData, Bill, Poll, User, Survey, AgendaEvent, Reservation, Visitor, MaintenanceRecord, DemographicStats, IdCardTemplate } from './types';
import { LayoutDashboard, Wallet, Users, Bell, ShieldAlert, CalendarClock, Settings, ClipboardList, BarChart3 } from 'lucide-react';

// Informações Padrão do Sistema (Fallback)
export const DEFAULT_SYSTEM_INFO: SystemInfo = {
  name: 'S.I.E',
  cnpj: '00.000.000/0001-00',
  address: 'Endereço não configurado',
  email: 'contato@sistema.com',
  phone: '(00) 00000-0000',
  website: 'www.sistema.com.br',
  primaryColor: '#4f46e5', // Indigo-600
  registrationMode: 'APPROVAL',
  enableMaps: true,
  enableQuestionnaire: true
};

// FIX: Added missing mock data and templates
export const MOCK_SYSTEM_INFO: SystemInfo = DEFAULT_SYSTEM_INFO;

export const MOCK_UNITS: UnitData[] = [
  { id: 'u001', block: 'A', number: '101', status: 'OK', residentName: 'João Silva', vulnerabilityLevel: 'LOW', tags: ['NONE'], coordinates: { lat: -22.6180, lng: -43.7120 }, cep: '27175-000' },
  { id: 'u002', block: 'A', number: '102', status: 'DEBT', residentName: 'Maria Pereira', vulnerabilityLevel: 'MEDIUM', tags: ['LOW_INCOME', 'HELP_REQUEST'], coordinates: { lat: -22.6182, lng: -43.7125 }, cep: '27175-000' },
  { id: 'u003', block: 'B', number: '201', status: 'WARNING', residentName: 'Carlos Souza', vulnerabilityLevel: 'HIGH', tags: ['ELDERLY_ALONE', 'DISABILITY'], coordinates: { lat: -22.6185, lng: -43.7130 }, cep: '27175-000' }
];

export const MOCK_DEMOGRAPHICS: DemographicStats = {
  totalPopulation: 350,
  averageAge: 38,
  averageIncome: 2100,
  unemploymentRate: 15,
  ageDistribution: {
    children: 25,
    adults: 60,
    seniors: 15,
  },
  infrastructureNeeds: {
    sanitation: 20,
    water: 10,
    lighting: 5,
    trashCollection: 2,
  },
};

export const DEFAULT_ID_CARD_TEMPLATE: IdCardTemplate = {
  id: 'tpl_default',
  name: 'Modelo Padrão',
  width: 340,
  height: 215,
  orientation: 'landscape',
  frontBackground: '#ffffff',
  backBackground: '#f3f4f6',
  elements: [
      { id: 'el_name_front', type: 'text-dynamic', label: 'Nome Completo', field: 'name', x: 25, y: 40, style: { fontSize: '18px', color: '#1e293b', fontWeight: 'bold' }, layer: 'front' },
      { id: 'el_role_front', type: 'text-dynamic', label: 'Cargo/Função', field: 'role', x: 25, y: 55, style: { fontSize: '12px', color: '#475569', fontWeight: 'bold' }, layer: 'front' },
      { id: 'el_avatar', type: 'image', label: 'Foto do Usuário', field: 'avatarUrl', x: 5, y: 30, width: 80, height: 100, style: { objectFit: 'cover' }, layer: 'front' },
      { id: 'el_logo', type: 'image', label: 'Logo do Sistema', field: 'system.logo', x: 75, y: 5, width: 60, height: 60, style: { objectFit: 'contain' }, layer: 'front' },
      { id: 'el_system_name', type: 'text-dynamic', label: 'Nome do Sistema', field: 'system.name', x: 5, y: 90, style: { fontSize: '10px', color: '#64748b' }, layer: 'back' },
  ]
};


export const MENU_ITEMS = [
  { id: 'dashboard', label: 'Visão Geral', icon: LayoutDashboard, roles: ['ALL'] },
  { id: 'users', label: 'Cadastros & Famílias', icon: Users, roles: [UserRole.ADMIN, UserRole.PRESIDENT, UserRole.VICE_PRESIDENT, UserRole.SINDIC, UserRole.CONCIERGE] },
  { id: 'demographics', label: 'Análise Demográfica', icon: BarChart3, roles: [UserRole.ADMIN, UserRole.PRESIDENT, UserRole.VICE_PRESIDENT, UserRole.SINDIC] },
  { id: 'surveys', label: 'Censo & Pesquisas', icon: ClipboardList, roles: ['ALL'] },
  { id: 'finance', label: 'Financeiro', icon: Wallet, roles: [UserRole.ADMIN, UserRole.PRESIDENT, UserRole.VICE_PRESIDENT, UserRole.SINDIC, UserRole.RESIDENT] },
  { id: 'social', label: 'Comunicação', icon: Bell, roles: ['ALL'] },
  { id: 'operations', label: 'Operacional', icon: ShieldAlert, roles: [UserRole.ADMIN, UserRole.PRESIDENT, UserRole.SINDIC, UserRole.CONCIERGE] },
  { id: 'timeline', label: 'Agenda & Timeline', icon: CalendarClock, roles: ['ALL'] },
  { id: 'settings', label: 'Configurações', icon: Settings, roles: [UserRole.ADMIN, UserRole.PRESIDENT] },
];

export const AVAILABLE_ROLES = [
  'ADMIN', 'PRESIDENT', 'VICE_PRESIDENT', 'SINDIC', 'RESIDENT', 'CONCIERGE', 'MERCHANT', 'COUNCIL'
];

export const SYSTEM_PERMISSIONS: Permission[] = [
  { id: 'view_dashboard', label: 'Visualizar Dashboard', module: 'Geral' },
  { id: 'manage_users', label: 'Gerenciar Cadastros', module: 'Cadastros' },
  { id: 'financial_view', label: 'Visualizar Financeiro', module: 'Financeiro' },
  { id: 'financial_edit', label: 'Editar Financeiro', module: 'Financeiro' },
  { id: 'send_notices', label: 'Enviar Comunicados', module: 'Comunicação' },
  { id: 'manage_settings', label: 'Acessar Configurações', module: 'Sistema' },
  { id: 'studio_ia', label: 'Acessar Studio IA', module: 'Studio IA' },
];

// O MOCK a seguir é apenas para referência de estrutura, não é mais usado pela aplicação.
export const MOCK_FINANCIALS: FinancialRecord[] = [];