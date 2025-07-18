import React, { useState, useEffect } from 'react';
import { 
  User, 
  Building2, 
  Shield, 
  Menu, 
  X, 
  Home, 
  FileText, 
  Calendar, 
  MessageSquare, 
  CreditCard, 
  Settings, 
  Users, 
  BarChart3,
  Bell,
  Search,
  Plus,
  Eye,
  TrendingUp,
  DollarSign,
  Clock,
  CheckCircle,
  AlertCircle,
  Phone,
  Mail,
  MapPin,
  Star,
  ChevronRight,
  Zap,
  ShieldCheck,
  BookOpen,
  Calculator,
  PlusCircle,
  Target
} from 'lucide-react';

const MonBizz = () => {
  const [currentView, setCurrentView] = useState('login');
  const [userType, setUserType] = useState(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [notifications, setNotifications] = useState([]);

  // Données simulées
  const [users, setUsers] = useState([
    { id: 1, name: 'Marie Dubois', email: 'marie@example.com', type: 'btoc', status: 'active', subscription: 'premium', created: '2024-01-15' },
    { id: 2, name: 'TechCorp SARL', email: 'contact@techcorp.fr', type: 'btob', status: 'active', subscription: 'enterprise', created: '2024-02-20' },
    { id: 3, name: 'Pierre Martin', email: 'pierre@example.com', type: 'btoc', status: 'pending', subscription: 'starter', created: '2024-03-10' }
  ]);

  const [revenue, setRevenue] = useState({
    monthly: 15420,
    subscriptions: 8900,
    consulting: 4200,
    services: 2320
  });

  // Composant d'authentification
  const LoginScreen = () => (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-full mb-4">
            <Building2 className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">MonBizz</h1>
          <p className="text-gray-600 mt-2">Votre assistant entrepreneurial</p>
        </div>

        <div className="space-y-4">
          <button 
            onClick={() => {
              setUserType('btoc');
              setCurrentView('btoc-dashboard');
              setCurrentUser({ name: 'Marie Dubois', type: 'btoc' });
            }}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            <User className="w-5 h-5" />
            Connexion Particulier
          </button>
          
          <button 
            onClick={() => {
              setUserType('btob');
              setCurrentView('btob-dashboard');
              setCurrentUser({ name: 'TechCorp SARL', type: 'btob' });
            }}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            <Building2 className="w-5 h-5" />
            Connexion Entreprise
          </button>
          
          <button 
            onClick={() => {
              setUserType('admin');
              setCurrentView('admin-dashboard');
              setCurrentUser({ name: 'Admin', type: 'admin' });
            }}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white font-medium py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            <Shield className="w-5 h-5" />
            Panneau Administrateur
          </button>
        </div>

        <div className="mt-8 text-center">
          <p className="text-sm text-gray-600">
            Pas encore de compte ? 
            <button className="text-blue-600 hover:underline ml-1">
              Créer un compte
            </button>
          </p>
        </div>
      </div>
    </div>
    );
  
    // Render logic
    let sidebar = null;
    if (currentView.startsWith('btoc')) sidebar = <BtoCSidebar />;
    else if (currentView.startsWith('btob')) sidebar = <BtoBSidebar />;
    else if (currentView.startsWith('admin')) sidebar = <AdminSidebar />;
  
    let content = null;
    if (currentView === 'login') content = <LoginScreen />;
    else if (currentView === 'btoc-dashboard') content = <BtoCDashboard />;
    else if (currentView === 'btoc-creation') content = <BtoCCreation />;
    else if (currentView === 'btoc-ai') content = <AIAssistant />;
    else if (currentView === 'btob-dashboard') content = <BtoBDashboard />;
    // Add other views as needed...
  
    if (currentView === 'login') {
      return content;
    }
  
    return (
      <div className="min-h-screen bg-gray-50 flex">
        {/* Sidebar */}
        <div className="hidden lg:block">{sidebar}</div>
        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="fixed inset-0 z-40 flex lg:hidden">
            <div className="flex-1 bg-black bg-opacity-25" onClick={() => setIsMenuOpen(false)}></div>
            <div className="w-64 bg-white shadow-lg h-full">
              <button
                className="absolute top-4 right-4 text-gray-600"
                onClick={() => setIsMenuOpen(false)}
              >
                <X className="w-6 h-6" />
              </button>
              {sidebar}
            </div>
          </div>
        )}
        <div className="flex-1 flex flex-col min-h-screen">
          <Header />
          <main className="flex-1">{content}</main>
        </div>
      </div>
    );
  };
  
  export default MonBizz;

  // Header commun
  const Header = () => (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <button 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 rounded-md text-gray-600 hover:bg-gray-100 lg:hidden"
            >
              <Menu className="w-6 h-6" />
            </button>
            <div className="flex items-center ml-2 lg:ml-0">
              <Building2 className="w-8 h-8 text-blue-600" />
              <span className="text-xl font-bold text-gray-900 ml-2">MonBizz</span>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-full">
              <Bell className="w-6 h-6" />
            </button>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-700">{currentUser?.name}</span>
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-medium">
                  {currentUser?.name?.charAt(0) || 'U'}
                </span>
              </div>
            </div>
            <button 
              onClick={() => setCurrentView('login')}
              className="text-sm text-gray-600 hover:text-gray-900"
            >
              Déconnexion
            </button>
          </div>
        </div>
      </div>
    </header>
  );

  // Sidebar BtoC
  const BtoCSidebar = () => (
    <div className="bg-white shadow-sm border-r border-gray-200 w-64 fixed h-full lg:relative lg:h-auto">
      <nav className="mt-6 px-4">
        <div className="space-y-2">
          <button 
            onClick={() => setCurrentView('btoc-dashboard')}
            className="w-full flex items-center px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
          >
            <Home className="w-5 h-5 mr-3" />
            Tableau de bord
          </button>
          <button 
            onClick={() => setCurrentView('btoc-creation')}
            className="w-full flex items-center px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
          >
            <PlusCircle className="w-5 h-5 mr-3" />
            Créer mon entreprise
          </button>
          <button 
            onClick={() => setCurrentView('btoc-documents')}
            className="w-full flex items-center px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
          >
            <FileText className="w-5 h-5 mr-3" />
            Documents
          </button>
          <button 
            onClick={() => setCurrentView('btoc-ai')}
            className="w-full flex items-center px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
          >
            <MessageSquare className="w-5 h-5 mr-3" />
            Assistant IA
          </button>
          <button 
            onClick={() => setCurrentView('btoc-experts')}
            className="w-full flex items-center px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
          >
            <Calendar className="w-5 h-5 mr-3" />
            Experts
          </button>
          <button className="w-full flex items-center px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-lg">
            <Settings className="w-5 h-5 mr-3" />
            Paramètres
          </button>
        </div>
      </nav>
    </div>
  );

  // Sidebar BtoB
  const BtoBSidebar = () => (
    <div className="bg-white shadow-sm border-r border-gray-200 w-64 fixed h-full lg:relative lg:h-auto">
      <nav className="mt-6 px-4">
        <div className="space-y-2">
          <button 
            onClick={() => setCurrentView('btob-dashboard')}
            className="w-full flex items-center px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
          >
            <Home className="w-5 h-5 mr-3" />
            Tableau de bord
          </button>
          <button 
            onClick={() => setCurrentView('btob-team')}
            className="w-full flex items-center px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
          >
            <Users className="w-5 h-5 mr-3" />
            Équipe
          </button>
          <button 
            onClick={() => setCurrentView('btob-documents')}
            className="w-full flex items-center px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
          >
            <FileText className="w-5 h-5 mr-3" />
            Documents
          </button>
          <button 
            onClick={() => setCurrentView('btob-ai')}
            className="w-full flex items-center px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
          >
            <MessageSquare className="w-5 h-5 mr-3" />
            Assistant IA
          </button>
          <button 
            onClick={() => setCurrentView('btob-marketplace')}
            className="w-full flex items-center px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
          >
            <Target className="w-5 h-5 mr-3" />
            Marketplace
          </button>
          <button className="w-full flex items-center px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-lg">
            <Settings className="w-5 h-5 mr-3" />
            Paramètres
          </button>
        </div>
      </nav>
    </div>
  );

  // Sidebar Admin
  const AdminSidebar = () => (
    <div className="bg-white shadow-sm border-r border-gray-200 w-64 fixed h-full lg:relative lg:h-auto">
      <nav className="mt-6 px-4">
        <div className="space-y-2">
          <button 
            onClick={() => setCurrentView('admin-dashboard')}
            className="w-full flex items-center px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
          >
            <BarChart3 className="w-5 h-5 mr-3" />
            Dashboard
          </button>
          <button 
            onClick={() => setCurrentView('admin-users')}
            className="w-full flex items-center px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
          >
            <Users className="w-5 h-5 mr-3" />
            Utilisateurs
          </button>
          <button 
            onClick={() => setCurrentView('admin-subscriptions')}
            className="w-full flex items-center px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
          >
            <CreditCard className="w-5 h-5 mr-3" />
            Abonnements
          </button>
          <button 
            onClick={() => setCurrentView('admin-revenue')}
            className="w-full flex items-center px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
          >
            <DollarSign className="w-5 h-5 mr-3" />
            Revenus
          </button>
          <button className="w-full flex items-center px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-lg">
            <Settings className="w-5 h-5 mr-3" />
            Paramètres
          </button>
        </div>
      </nav>
    </div>
  );

  // Dashboard BtoC
  const BtoCDashboard = () => (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Bonjour Marie ! 👋</h1>
        <p className="text-gray-600">Voici un aperçu de votre activité entrepreneuriale</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Statut</p>
              <p className="text-2xl font-bold text-green-600">Auto-entrepreneur</p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">CA ce mois</p>
              <p className="text-2xl font-bold text-blue-600">2 340 €</p>
            </div>
            <TrendingUp className="w-8 h-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Prochaine échéance</p>
              <p className="text-2xl font-bold text-orange-600">25 juil.</p>
            </div>
            <Clock className="w-8 h-8 text-orange-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Documents</p>
              <p className="text-2xl font-bold text-purple-600">7</p>
            </div>
            <FileText className="w-8 h-8 text-purple-600" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold mb-4">Tâches à faire</h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
              <div className="flex items-center">
                <AlertCircle className="w-5 h-5 text-yellow-600 mr-3" />
                <span className="text-sm">Déclaration URSSAF</span>
              </div>
              <span className="text-xs text-yellow-600">Dans 3 jours</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
              <div className="flex items-center">
                <FileText className="w-5 h-5 text-blue-600 mr-3" />
                <span className="text-sm">Facture client ABC</span>
              </div>
              <span className="text-xs text-blue-600">À envoyer</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold mb-4">Assistant IA</h2>
          <div className="bg-gray-50 rounded-lg p-4 mb-4">
            <p className="text-sm text-gray-700">
              💡 <strong>Conseil du jour :</strong> N'oubliez pas de déclarer vos revenus avant le 31 juillet pour éviter les pénalités !
            </p>
          </div>
          <button 
            onClick={() => setCurrentView('btoc-ai')}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg text-sm"
          >
            Poser une question
          </button>
        </div>
      </div>
    </div>
  );

  // Création d'entreprise BtoC
  const BtoCCreation = () => (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Créer votre entreprise</h1>
        <p className="text-gray-600">Nous vous accompagnons étape par étape</p>
      </div>

      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Progression</h2>
            <span className="text-sm text-gray-600">3/5 étapes terminées</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div className="bg-blue-600 h-2 rounded-full" style={{width: '60%'}}></div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <CheckCircle className="w-6 h-6 text-green-600 mr-3" />
                <div>
                  <h3 className="font-semibold">Choix du statut</h3>
                  <p className="text-sm text-gray-600">Auto-entrepreneur sélectionné</p>
                </div>
              </div>
              <span className="text-sm text-green-600">Terminé</span>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <CheckCircle className="w-6 h-6 text-green-600 mr-3" />
                <div>
                  <h3 className="font-semibold">Formulaires administratifs</h3>
                  <p className="text-sm text-gray-600">Dossier URSSAF soumis</p>
                </div>
              </div>
              <span className="text-sm text-green-600">Terminé</span>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <CheckCircle className="w-6 h-6 text-green-600 mr-3" />
                <div>
                  <h3 className="font-semibold">Compte bancaire professionnel</h3>
                  <p className="text-sm text-gray-600">Compte ouvert chez Crédit Mutuel</p>
                </div>
              </div>
              <span className="text-sm text-green-600">Terminé</span>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Clock className="w-6 h-6 text-orange-600 mr-3" />
                <div>
                  <h3 className="font-semibold">Obtention du SIRET</h3>
                  <p className="text-sm text-gray-600">En attente de validation INSEE</p>
                </div>
              </div>
              <span className="text-sm text-orange-600">En cours</span>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <AlertCircle className="w-6 h-6 text-gray-400 mr-3" />
                <div>
                  <h3 className="font-semibold">Organisation administrative</h3>
                  <p className="text-sm text-gray-600">Modèles de documents à télécharger</p>
                </div>
              </div>
              <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm">
                Commencer
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // Assistant IA
  const AIAssistant = () => {
    const [messages, setMessages] = useState([
      { type: 'ai', text: 'Bonjour ! Je suis votre assistant IA spécialisé dans l\'entrepreneuriat français. Comment puis-je vous aider aujourd\'hui ?' }
    ]);
    const [inputMessage, setInputMessage] = useState('');

    const handleSendMessage = () => {
      if (inputMessage.trim()) {
        setMessages([...messages, { type: 'user', text: inputMessage }]);
        setTimeout(() => {
          setMessages(prev => [...prev, { 
            type: 'ai', 
            text: 'Excellente question ! En tant qu\'auto-entrepreneur, vous devez déclarer vos revenus mensuellement ou trimestriellement selon votre choix. La date limite est généralement le dernier jour du mois suivant la période déclarée.' 
          }]);
        }, 1000);
        setInputMessage('');
      }
    };

    return (
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Assistant IA</h1>
          <p className="text-gray-600">Posez toutes vos questions sur l'entrepreneuriat</p>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 h-96 flex flex-col">
            <div className="flex-1 p-4 overflow-y-auto">
              {messages.map((message, index) => (
                <div key={index} className={`mb-4 ${message.type === 'user' ? 'text-right' : 'text-left'}`}>
                  <div className={`inline-block p-3 rounded-lg max-w-xs ${
                    message.type === 'user' 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {message.text}
                  </div>
                </div>
              ))}
            </div>
            <div className="p-4 border-t border-gray-200">
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Tapez votre question..."
                  className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button 
                  onClick={handleSendMessage}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
                >
                  Envoyer
                </button>
              </div>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <h3 className="font-semibold mb-2">Questions fréquentes</h3>
              <ul className="space-y-2 text-sm">
                <li><button className="text-blue-600 hover:underline">Comment déclarer mes revenus ?</button></li>
                <li><button className="text-blue-600 hover:underline">Quelles sont mes obligations fiscales ?</button></li>
                <li><button className="text-blue-600 hover:underline">Comment créer une facture ?</button></li>
                <li><button className="text-blue-600 hover:underline">Puis-je embaucher un salarié ?</button></li>
              </ul>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <h3 className="font-semibold mb-2">Ressources utiles</h3>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="text-blue-600 hover:underline">Guide de l'auto-entrepreneur</a></li>
                <li><a href="#" className="text-blue-600 hover:underline">Simulateur de cotisations</a></li>
                <li><a href="#" className="text-blue-600 hover:underline">Modèles de documents</a></li>
                <li><a href="#" className="text-blue-600 hover:underline">Calendrier fiscal</a></li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    );
  };

 // Dashboard BtoB
  const BtoBDashboard = () => (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Tableau de bord entreprise</h1>
        <p className="text-gray-600">TechCorp SARL - Vue d'ensemble</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Équipe</p>
              <p className="text-2xl font-bold text-blue-600">12 membres</p>
            </div>
            <Users className="w-8 h-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">CA mensuel</p>
              <p className="text-2xl font-bold text-green-600">45 200 €</p>
            </div>
            <TrendingUp className="w-8 h-8 text-green-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Projets actifs</p>
              <p className="text-2xl font-bold text-purple-600">8</p>
            </div>
            <Target className="w-8 h-8 text-purple-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Documents</p>
              <p className="text-2xl font-bold text-orange-600">142</p>
            </div>
            <FileText className="w-8 h-8 text-orange-600" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold mb-4">Projets en cours</h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
              <div className="flex items-center">
                <Target className="w-5 h-5 text-blue-600 mr-3" />
                <span className="text-sm">Refonte site web</span>
              </div>
              <span className="text-xs text-blue-600">80% terminé</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <div className="flex items-center">
                <CheckCircle className="w-5 h-5 text-green-600 mr-3" />
                <span className="text-sm">Application mobile</span>
              </div>
              <span className="text-xs text-green-600">Terminé</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold mb-4">Équipe</h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center mr-3">
                  <span className="text-white text-sm font-medium">JD</span>
                </div>
                <span className="text-sm">Jean Dupont - Développeur</span>
              </div>
              <span className="text-xs text-green-600">En ligne</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center mr-3">
                  <span className="text-white text-sm font-medium">SM</span>
                </div>
                <span className="text-sm">Sophie Martin - Designer</span>
              </div>
              <span className="text-xs text-gray-600">Hors ligne</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
