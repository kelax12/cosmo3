import React, { useState } from 'react';
import { MessageCircle, Search, MoreHorizontal, Send, Smile, Plus, Check, X, UserPlus, Trash2, ChevronLeft, ChevronRight, Pin, PinOff, Users } from 'lucide-react';
import { useTasks } from '../context/TaskContext';

const MessagingPage: React.FC = () => {
  const { 
    user, 
    messages, 
    friendRequests, 
    isPremium, 
    sendMessage, 
    sendFriendRequest, 
    acceptFriendRequest, 
    rejectFriendRequest 
  } = useTasks();
  
  const [selectedConversation, setSelectedConversation] = useState<string>('user2');
  const [newMessage, setNewMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [searchFriend, setSearchFriend] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showMoreOptions, setShowMoreOptions] = useState(false);
  const [activeTab, setActiveTab] = useState<'messages' | 'friends'>('messages');
  const [showAddFriendForm, setShowAddFriendForm] = useState(false);
  const [showRightSidebar, setShowRightSidebar] = useState(true);
  const [pinnedConversations, setPinnedConversations] = useState<string[]>(['equipe-design']);
  const [deletedConversations, setDeletedConversations] = useState<string[]>([]);
  const [showCreateGroupModal, setShowCreateGroupModal] = useState(false);
  const [selectedFriendsForGroup, setSelectedFriendsForGroup] = useState<string[]>([]);
  const [groupName, setGroupName] = useState('');
  
  // État pour les conversations
  const [allConversations, setAllConversations] = useState([
    { 
      id: 'equipe-design', 
      name: 'Équipe Design', 
      type: 'group',
      members: ['👨‍💻', '👩‍🎨', '👨‍🎨'],
      lastMessage: 'Bonjour à tous ! J\'ai terminé la première version de la maquette pour le dashboard',
      time: '14:34',
      unread: 0,
      online: true
    },
    { 
      id: 'dev-produit', 
      name: 'Développement Produit', 
      type: 'group',
      members: ['👨‍💻', '👩‍💻', '👨‍🔬'],
      lastMessage: 'Marie : Réunion à 15h demain',
      time: '14:34',
      unread: 0,
      online: true
    }
  ]);
  
  // État pour les amis (personnes avec qui on peut discuter)
  const [friendsList, setFriendsList] = useState([
    { 
      id: 'marie-dupont', 
      name: 'Marie Dupont', 
      email: 'marie@example.com', 
      avatar: '👩‍💼',
      online: true,
      role: 'Designer UI/UX'
    },
    { 
      id: 'thomas-laurent', 
      name: 'Thomas Laurent', 
      email: 'thomas@example.com', 
      avatar: '👨‍💻',
      online: false,
      role: 'Développeur Frontend'
    },
    { 
      id: 'sophia-martin', 
      name: 'Sophia Martin', 
      email: 'sophia@example.com', 
      avatar: '👩‍🔬',
      online: true,
      role: 'Data Scientist'
    }
  ]);
  
  // Conversations directes avec les amis
  const [friendConversations, setFriendConversations] = useState([
    {
      friendId: 'marie-dupont',
      lastMessage: 'Dashboard_v1.fig',
      time: '10:24',
      unread: 0
    },
    {
      friendId: 'thomas-laurent',
      lastMessage: 'Pouvez-vous me partager le docum...',
      time: '14:34',
      unread: 0
    },
    {
      friendId: 'sophia-martin',
      lastMessage: 'Merci pour votre aide',
      time: '14:34',
      unread: 0
    }
  ]);

  const [pendingRequests, setPendingRequests] = useState([
    {
      id: '1',
      name: 'Pierre Dupont',
      email: 'pierre@example.com',
      role: 'Développeur Frontend',
      avatar: '👨‍💻',
      timestamp: new Date().toISOString()
    },
    {
      id: '2',
      name: 'Lucas Bernard',
      email: 'lucas@example.com',
      role: 'Chef de projet',
      avatar: '👨‍💼',
      timestamp: new Date().toISOString()
    }
  ]);
  const [conversationMessages, setConversationMessages] = useState([
    {
      id: '1',
      sender: 'Marie',
      avatar: '👩‍💼',
      content: 'Bonjour à tous ! J\'ai terminé la première version de la maquette pour le dashboard',
      time: '10:24',
      isOwn: false
    },
    {
      id: '2',
      sender: 'Vous',
      content: 'Super travail ! J\'aime beaucoup les couleurs utilisées.',
      time: '10:25',
      isOwn: true
    },
    {
      id: '3',
      sender: 'Thomas',
      avatar: '👨‍💻',
      content: 'Avez-vous terminé la maquette pour la section des statistiques aussi ?',
      time: '10:26',
      isOwn: false
    }
  ]);

  if (!user) return null;

  const premium = isPremium();
  
  // Combiner les conversations de groupe et les conversations d'amis
  const allDisplayConversations = [
    ...allConversations,
    ...friendsList.map(friend => {
      const conversation = friendConversations.find(conv => conv.friendId === friend.id);
      return {
        id: friend.id,
        name: friend.name,
        type: 'direct',
        avatar: friend.avatar,
        lastMessage: conversation?.lastMessage || 'Aucun message',
        time: conversation?.time || '',
        unread: conversation?.unread || 0,
        online: friend.online
      };
    })
  ];

  if (!premium) {
    return (
      <div className="p-8">
        <div className="card p-16 text-center">
          <div className="w-16 h-16 bg-yellow-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <MessageCircle size={32} className="text-yellow-600" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900 mb-4">Messagerie Premium</h1>
          <p className="text-xl text-slate-600 mb-8">
            Débloquez Premium pour accéder à la messagerie et aux fonctionnalités collaboratives
          </p>
          <button className="btn-primary text-lg px-8 py-4">
            Débloquer Premium
          </button>
        </div>
      </div>
    );
  }


  // Filtrer les conversations selon leur état
  const activeConversations = allDisplayConversations.filter(conv => 
    !deletedConversations.includes(conv.id)
  );
  
  // Trier les conversations : épinglées en premier, puis les autres
  const sortedConversations = activeConversations.sort((a, b) => {
    const aIsPinned = pinnedConversations.includes(a.id);
    const bIsPinned = pinnedConversations.includes(b.id);
    
    if (aIsPinned && !bIsPinned) return -1;
    if (!aIsPinned && bIsPinned) return 1;
    return 0;
  });

  const activityHistory = [
    {
      id: '1',
      type: 'group_access',
      message: 'Vous avez accepté la demande d\'ami de Sophie Martin',
      time: 'Aujourd\'hui à 14h45',
      icon: '✅'
    },
    {
      id: '2',
      type: 'new_message',
      message: 'Nouveau message dans Équipe Design',
      time: 'Aujourd\'hui à 14h30',
      icon: '💬'
    },
    {
      id: '3',
      type: 'group_created',
      message: 'Vous avez créé le groupe Développement Produit',
      time: 'Hier à 16h20',
      icon: '👥'
    },
    {
      id: '4',
      type: 'friend_request',
      message: 'Vous avez refusé la demande d\'ami de Alex Martin',
      time: 'Hier à 14h15',
      icon: '❌'
    }
  ];


  const currentConversation = allDisplayConversations.find(c => c.id === selectedConversation);

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;
    
    // Créer le nouveau message
    const newMsg = {
      id: Date.now().toString(),
      sender: 'Vous',
      content: newMessage.trim(),
      time: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
      isOwn: true
    };
    
    // Ajouter le message à la conversation
    setConversationMessages(prev => [...prev, newMsg]);
    
    // Envoyer le message via le contexte (pour la persistance)
    sendMessage(selectedConversation, newMessage.trim());
    
    setNewMessage('');
    setShowEmojiPicker(false);
  };

  const handleAcceptRequest = (requestId: string) => {
    // Trouver la demande
    const request = pendingRequests.find(req => req.id === requestId);
    if (request) {
      // Supprimer de la liste des demandes en attente
      setPendingRequests(prev => prev.filter(req => req.id !== requestId));
      
      // Ajouter à la liste des amis
      const newFriend = {
        id: `friend-${Date.now()}`,
        name: request.name,
        email: request.email,
        avatar: request.avatar,
        online: Math.random() > 0.5,
        role: request.role
      };
      
      setFriendsList(prev => [...prev, newFriend]);
      
      // Créer une nouvelle conversation d'ami
      const newFriendConversation = {
        friendId: newFriend.id,
        lastMessage: 'Vous êtes maintenant amis !',
        time: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
        unread: 0
      };
      
      setFriendConversations(prev => [...prev, newFriendConversation]);
      
      // Appeler la fonction du contexte
      acceptFriendRequest(requestId);
    }
  };

  const handleRejectRequest = (requestId: string) => {
    // Trouver la demande
    const request = pendingRequests.find(req => req.id === requestId);
    if (request) {
      // Supprimer de la liste des demandes en attente
      setPendingRequests(prev => prev.filter(req => req.id !== requestId));
      
      // Appeler la fonction du contexte
      rejectFriendRequest(requestId);
    }
  };

  const handleSendFriendRequest = () => {
    if (!searchFriend.trim()) return;
    
    sendFriendRequest(searchFriend);
    setSearchFriend('');
    setShowAddFriendForm(false);
  };

  const handleCreateGroup = () => {
    setShowCreateGroupModal(true);
    setSelectedFriendsForGroup([]);
    setGroupName('');
  };

  const handleArchiveConversation = () => {
    if (!selectedConversation) return;
    
    // Fermer le menu et sélectionner une autre conversation
    setShowMoreOptions(false);
    
    // Sélectionner la première conversation non archivée disponible
    const availableConversations = allDisplayConversations.filter(conv => 
      conv.id !== selectedConversation && 
      !deletedConversations.includes(conv.id)
    );
    
    if (availableConversations.length > 0) {
      setSelectedConversation(availableConversations[0].id);
    } else {
      setSelectedConversation('');
    }
    
  };

  const handleDeleteConversation = () => {
    if (!selectedConversation) return;
    
    if (window.confirm('Êtes-vous sûr de vouloir supprimer définitivement cette conversation ? Cette action est irréversible.')) {
      // Ajouter à la liste des conversations supprimées
      setDeletedConversations(prev => [...prev, selectedConversation]);
      
      // Retirer des conversations épinglées si elle y était
      setPinnedConversations(prev => prev.filter(id => id !== selectedConversation));
      
      // Fermer le menu et sélectionner une autre conversation
      setShowMoreOptions(false);
      
      // Sélectionner la première conversation disponible
      const availableConversations = allDisplayConversations.filter(conv => 
        conv.id !== selectedConversation && 
        !deletedConversations.includes(conv.id)
      );
      
      if (availableConversations.length > 0) {
        setSelectedConversation(availableConversations[0].id);
      } else {
        setSelectedConversation('');
      }
    }
  };

  const handleTogglePin = () => {
    if (!selectedConversation) return;
    
    const isPinned = pinnedConversations.includes(selectedConversation);
    
    if (isPinned) {
      // Désépingler
      setPinnedConversations(prev => prev.filter(id => id !== selectedConversation));
    } else {
      // Épingler
      setPinnedConversations(prev => [...prev, selectedConversation]);
    }
    
    setShowMoreOptions(false);
  };

  // Nouvelle fonction pour épingler depuis la liste (scroll vers la gauche)
  const handleTogglePinFromList = (conversationId: string) => {
    const isPinned = pinnedConversations.includes(conversationId);
    
    if (isPinned) {
      // Désépingler
      setPinnedConversations(prev => prev.filter(id => id !== conversationId));
    } else {
      // Épingler
      setPinnedConversations(prev => [...prev, conversationId]);
    }
  };

  const handleCreateGroupSubmit = () => {
    if (!groupName.trim() || selectedFriendsForGroup.length === 0) {
      alert('Veuillez saisir un nom de groupe et sélectionner au moins un ami');
      return;
    }

    // Créer le nouveau groupe avec un ID unique
    const newGroupId = `group-${Date.now()}`;
    const selectedFriendAvatars = selectedFriendsForGroup.map(friendId => {
      const friend = friendsList.find(f => f.id === friendId);
      return friend?.avatar || '👤';
    });
    
    const newGroup = {
      id: newGroupId,
      name: groupName,
      type: 'group',
      members: ['👤', ...selectedFriendAvatars], // Votre avatar + les amis sélectionnés
      lastMessage: 'Groupe créé',
      time: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
      unread: 0,
      online: true
    };

    // Ajouter le groupe aux conversations
    setAllConversations(prev => [newGroup, ...prev]);
    
    // Sélectionner automatiquement le nouveau groupe
    setSelectedConversation(newGroupId);
    
    // Fermer la modal et réinitialiser
    setShowCreateGroupModal(false);
    setSelectedFriendsForGroup([]);
    setGroupName('');
  };

  const toggleFriendSelection = (friendId: string) => {
    setSelectedFriendsForGroup(prev => 
      prev.includes(friendId) 
        ? prev.filter(id => id !== friendId)
        : [...prev, friendId]
    );
  };

  const handleEmojiSelect = (emoji: string) => {
    console.log('🔍 Emoji sélectionné:', emoji);
    console.log('📝 Message actuel avant ajout:', newMessage);
    setNewMessage(prev => prev + emoji);
    console.log('📝 Message après ajout (devrait être):', newMessage + emoji);
    setShowEmojiPicker(false);
  };

  // Système d'emojis amélioré avec catégories
  const emojiCategories = {
    smileys: ['😀', '😂', '😍', '🤔', '😎', '😊', '😢', '😡', '🤗', '😴'],
    gestures: ['👍', '👎', '👏', '🙌', '👋', '✋', '👌', '🤝', '💪', '🙏'],
    hearts: ['❤️', '💙', '💚', '💛', '🧡', '💜', '🖤', '🤍', '💖', '💕'],
    objects: ['🎉', '🔥', '💯', '⭐', '✨', '🎯', '🚀', '💡', '📝', '📱']
  };

  const [selectedEmojiCategory, setSelectedEmojiCategory] = useState<keyof typeof emojiCategories>('smileys');

  const emojiCategoryLabels = {
    smileys: '😀', gestures: '👍', hearts: '❤️', objects: '🎉'
  };

  const switchToFriendsTab = () => {
    setActiveTab('friends');
  };

  const switchToMessagesTab = () => {
    setActiveTab('messages');
  };

  return (
    <div className="h-screen flex bg-gray-50 dark:bg-slate-900 transition-colors">
      
      {/* Colonne gauche - Liste des conversations */}
      <div className="w-80 bg-white dark:bg-slate-800 border-r border-gray-200 dark:border-slate-700 flex flex-col transition-colors">
        {/* Header avec titre et recherche */}
        <div className="p-4 border-b border-gray-200 dark:border-slate-700 transition-colors">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 bg-blue-500 dark:bg-blue-600 rounded-lg flex items-center justify-center">
              <MessageCircle size={20} className="text-white" />
            </div>
            <h1 className="text-lg font-semibold text-gray-900 dark:text-white">Messagerie</h1>
          </div>
          
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500" />
            <input
              type="text"
              placeholder="Rechercher..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm text-gray-900 dark:text-white transition-colors"
            />
          </div>
        </div>

        {/* Onglets */}
        <div className="flex border-b border-gray-200 dark:border-slate-700 transition-colors">
          <button 
            onClick={switchToMessagesTab}
            className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
              activeTab === 'messages'
                  ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            Messages
          </button>
          <button 
            onClick={switchToFriendsTab}
            className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
              activeTab === 'friends'
                  ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            Amis
          </button>
        </div>

        {/* Section Conversations récentes */}
        <div className="p-4 border-b border-gray-200 dark:border-slate-700 transition-colors">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Conversations récentes
            </h3>
            <button 
              onClick={handleCreateGroup}
              className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 p-1 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors"
              title="Créer un groupe"
            >
              <Plus size={16} />
            </button>
          </div>

          {/* Indicateur des conversations épinglées */}
        </div>

        {/* Liste des conversations */}
        <div className={`flex-1 overflow-y-auto ${activeTab === 'friends' ? 'hidden' : ''}`}>
          {sortedConversations.filter(conv => 
            conv.name.toLowerCase().includes(searchTerm.toLowerCase())
          ).map(conv => {
            const isPinned = pinnedConversations.includes(conv.id);
            
            return (
            <div
              key={conv.id}
              onClick={() => setSelectedConversation(conv.id)}
                className={`p-4 cursor-pointer transition-colors border-l-4 ${
                  selectedConversation === conv.id 
                    ? 'border-blue-500 dark:border-blue-400' 
                    : isPinned 
                      ? 'border-yellow-400 dark:border-yellow-500 conversation-pinned'
                      : 'border-transparent'
                }`}
            >
              <div className="flex items-center gap-3">
                {/* Avatar ou groupe d'avatars */}
                <div className="relative">
                  {conv.type === 'group' ? (<div className="flex -space-x-2">{conv.members?.slice(0, 2).map((member, index) => (<div key={index} className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-lg border-2 border-white">{member}</div>))}</div>) : (<div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-lg relative">{conv.avatar}{conv.online && (<div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>)}</div>)}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium text-gray-900 dark:text-white truncate">{conv.name}</h4>
                      {/* Removed redundant isPinned indicator here */}
                    </div>
                    {/* New clickable pin/unpin button */}
                    <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleTogglePinFromList(conv.id);
                  }}
                  title={isPinned ? "Désépingler" : "Épingler"}
                  className="p-1 rounded-full hover:bg-yellow-50 dark:hover:bg-yellow-900/20 transition-colors"
                >
                  {isPinned ? (
                    <Pin size={16} className="text-yellow-600 dark:text-yellow-500" />
                  ) : (
                    <PinOff size={16} className="text-gray-400 dark:text-gray-500 hover:text-yellow-600 dark:hover:text-yellow-500" />
                  )}
                </button>
                    <span className="text-xs text-gray-500 dark:text-gray-400">{conv.time}</span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 truncate">{conv.lastMessage}</p>
                </div>
                
                {conv.unread > 0 && (
                  <div className="w-5 h-5 bg-blue-500 text-white text-xs rounded-full flex items-center justify-center">
                    {conv.unread}
                  </div>
                )}
              </div>
            </div>
            );
          })}
          
          {/* Message quand aucune conversation */}
          {sortedConversations.filter(conv => 
            conv.name.toLowerCase().includes(searchTerm.toLowerCase())
          ).length === 0 && (
            <div className="text-center text-gray-500 dark:text-gray-400 py-8">
              <MessageCircle size={48} className="mx-auto mb-4 text-gray-300 dark:text-gray-600" />
              <p className="text-lg font-medium">
                Aucune conversation
              </p>
              <p className="text-sm">
                Commencez une nouvelle conversation
              </p>
            </div>
          )}
        </div>

        {/* Liste des amis (quand onglet Amis est actif) */}
        <div className={`flex-1 overflow-y-auto p-4 ${activeTab === 'messages' ? 'hidden' : ''}`}>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Mes amis ({friendsList.length})
              </h3>
              <button 
                onClick={() => setShowAddFriendForm(true)}
                className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 p-1 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors"
                title="Ajouter un ami"
              >
                <UserPlus size={16} />
              </button>
            </div>
            
            {/* Liste des amis */}
            <div className="space-y-2">
              {friendsList.filter(friend => 
                friend.name.toLowerCase().includes(searchTerm.toLowerCase())
              ).map(friend => (
                <div
                  key={friend.id}
                  onClick={() => {
                    setSelectedConversation(friend.id);
                    setActiveTab('messages');
                  }}
                    className="p-3 cursor-pointer transition-colors rounded-lg border border-gray-100 dark:border-slate-600"
                >
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <div className="w-10 h-10 bg-gray-100 dark:bg-slate-600 rounded-full flex items-center justify-center text-lg">
                        {friend.avatar}
                      </div>
                      {friend.online && (
                        <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="font-medium text-gray-900 dark:text-white truncate">{friend.name}</h4>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          friend.online 
                            ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' 
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
                        }`}>
                          {friend.online ? 'En ligne' : 'Hors ligne'}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 truncate">{friend.role}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-500 truncate">{friend.email}</p>
                    </div>
                  </div>
                </div>
              ))}
              
              {friendsList.length === 0 && (
                <div className="text-center text-gray-500 dark:text-gray-400 py-8">
                  <UserPlus size={48} className="mx-auto mb-4 text-gray-300 dark:text-gray-600" />
                  <p className="text-lg font-medium">Aucun ami pour le moment</p>
                  <p className="text-sm">Ajoutez des amis pour commencer à discuter</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Colonne centrale - Zone de chat */}
      <div className="flex-1 flex flex-col bg-white dark:bg-slate-800 transition-colors">
        {currentConversation && !deletedConversations.includes(currentConversation.id) ? (
          <>
            {/* Header de conversation */}
            <div className="p-4 border-b border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {currentConversation.type === 'group' ? (
                    <div className="flex -space-x-2">
                      {currentConversation.members?.slice(0, 3).map((member, index) => (
                        <div key={index} className="w-8 h-8 bg-gray-100 dark:bg-slate-600 rounded-full flex items-center justify-center text-sm border-2 border-white dark:border-slate-800">
                          {member}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="w-8 h-8 bg-gray-100 dark:bg-slate-600 rounded-full flex items-center justify-center text-lg relative">
                      {currentConversation.avatar}
                      {currentConversation.online && (
                        <div className="absolute -bottom-1 -right-1 w-2 h-2 bg-green-500 rounded-full border border-white"></div>
                      )}
                    </div>
                  )}
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-gray-900 dark:text-white">{currentConversation.name}</h3>
                      {pinnedConversations.includes(currentConversation.id) && (
                        <Pin size={16} className="text-yellow-600 dark:text-yellow-500" />
                      )}
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {currentConversation.type === 'group' 
                        ? `${currentConversation.members?.length} membres • 2 en ligne`
                        : currentConversation.online ? 'En ligne' : 'Hors ligne'
                      }
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  {/* Indicateur si la conversation est épinglée */}
                  {pinnedConversations.includes(currentConversation.id) && (
                    <div className="flex items-center gap-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 px-2 py-1 rounded-full text-xs font-medium">
                      <Pin size={12} />
                      Épinglée
                    </div>
                  )}
                  
                  <div className="relative">
                    <button 
                      onClick={() => setShowMoreOptions(!showMoreOptions)}
                      className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                    >
                      <MoreHorizontal size={20} />
                    </button>
                    
                    {/* Menu déroulant des options */}
                    {showMoreOptions && (
                      <div className="absolute right-0 top-12 bg-white dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-lg shadow-lg py-2 w-48 z-10">
                        {pinnedConversations.includes(currentConversation.id) ? (
                          <button
                            onClick={() => {
                              handleTogglePin();
                            }}
                            className="w-full px-4 py-2 text-left text-sm text-yellow-600 dark:text-yellow-500 hover:bg-yellow-50 dark:hover:bg-yellow-900/20 flex items-center gap-2"
                          >
                            <PinOff size={16} />
                            Désépingler
                          </button>
                        ) : (
                          <button
                            onClick={handleTogglePin}
                            className="w-full px-4 py-2 text-left text-sm text-yellow-600 dark:text-yellow-500 hover:bg-yellow-50 dark:hover:bg-yellow-900/20 flex items-center gap-2"
                          >
                            <Pin size={16} />
                            Épingler
                          </button>
                        )}
                        <button
                          onClick={handleDeleteConversation}
                          className="w-full px-4 py-2 text-left text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2"
                        >
                          <Trash2 size={16} />
                          Supprimer
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {conversationMessages.map(message => (
                <div key={message.id} className={`flex ${message.isOwn ? 'justify-end' : 'justify-start'}`}>
                  <div className={`flex items-start gap-3 max-w-xs lg:max-w-md ${message.isOwn ? 'flex-row-reverse' : ''}`}>
                    {!message.isOwn && (
                      <div className="w-8 h-8 bg-gray-100 dark:bg-slate-600 rounded-full flex items-center justify-center text-sm">
                        {message.avatar}
                      </div>
                    )}
                    <div className={`px-4 py-2 rounded-2xl ${
                      message.isOwn 
                        ? 'bg-blue-500 dark:bg-blue-600 text-white rounded-br-md' 
                        : 'bg-gray-100 dark:bg-slate-700 text-gray-900 dark:text-white rounded-bl-md'
                    }`}>
                      {!message.isOwn && (
                        <div className="text-xs font-medium mb-1 text-gray-600 dark:text-gray-400">{message.sender}</div>
                      )}
                      <p className="text-sm">{message.content}</p>
                      <div className={`text-xs mt-1 ${message.isOwn ? 'text-blue-100 dark:text-blue-200' : 'text-gray-500 dark:text-gray-400'}`}>
                        {message.time}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Zone de saisie - Désactivée si conversation archivée */}
            <div className="p-4 border-t border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 transition-colors">
              <div className="flex items-center gap-3">
                <div className="flex-1 relative">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    placeholder="Écrivez votre message..."
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 dark:text-white transition-colors"
                  />
                </div>
                <button
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim()}
                  className="p-3 bg-blue-500 dark:bg-blue-600 text-white rounded-xl hover:bg-blue-600 dark:hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send size={18} />
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-500 dark:text-gray-400">
            <div className="text-center">
              <MessageCircle size={64} className="mx-auto mb-4 text-gray-300 dark:text-gray-600" />
              <p className="text-xl">Sélectionnez une conversation</p>
              <p className="text-sm">Choisissez une conversation pour commencer à discuter</p>
            </div>
          </div>
        )}
      </div>

      {/* Colonne droite - Gestion des amis */}
      <div className={`${showRightSidebar ? 'w-80' : 'w-12'} bg-white dark:bg-slate-800 border-l border-gray-200 dark:border-slate-700 flex flex-col transition-all duration-300`}>
        {/* Header */}
        <div className="p-4 border-b border-gray-200 dark:border-slate-700 flex items-center justify-between transition-colors">
          {showRightSidebar && (
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Gestion des amis</h2>
          )}
          <button
            onClick={() => setShowRightSidebar(!showRightSidebar)}
            className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
            title={showRightSidebar ? 'Fermer la sidebar' : 'Ouvrir la sidebar'}
          >
            {showRightSidebar ? <X size={20} /> : <ChevronLeft size={20} />}
          </button>
        </div>

        {showRightSidebar && (
          <>
            {/* Demandes d'amis */}
            <div className="p-4 border-b border-gray-200 dark:border-slate-700 transition-colors">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">Demandes d'amis ({pendingRequests.length})</h3>
              </div>
              
              <div className="space-y-3">
                {pendingRequests.map(request => (
                  <div key={request.id} className="bg-gray-50 dark:bg-slate-700 rounded-lg p-3 transition-colors">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 bg-gray-100 dark:bg-slate-600 rounded-full flex items-center justify-center text-lg">
                        {request.avatar}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900 dark:text-white text-sm">{request.name}</h4>
                        <p className="text-xs text-gray-600 dark:text-gray-400">{request.role}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleAcceptRequest(request.id)}
                        className="flex-1 bg-blue-500 dark:bg-blue-600 text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-blue-600 dark:hover:bg-blue-700 transition-colors"
                      >
                        Accepter
                      </button>
                      <button
                        onClick={() => handleRejectRequest(request.id)}
                        className="flex-1 bg-gray-200 dark:bg-slate-600 text-gray-700 dark:text-gray-300 px-3 py-2 rounded-lg text-sm font-medium hover:bg-gray-300 dark:hover:bg-slate-500 transition-colors"
                      >
                        Refuser
                      </button>
                    </div>
                  </div>
                ))}
                
                {pendingRequests.length === 0 && (
                  <div className="text-center text-gray-500 dark:text-gray-400 py-4">
                    <p className="text-sm">Aucune demande en attente</p>
                  </div>
                )}
              </div>
            </div>

            {/* Ajouter un ami */}
            <div className="p-4 border-b border-gray-200 dark:border-slate-700 transition-colors">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">Ajouter un ami</h3>
                <button
                  onClick={() => setShowAddFriendForm(!showAddFriendForm)}
                  className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 p-1 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors"
                >
                  <Plus size={16} />
                </button>
              </div>
              
              {showAddFriendForm && (
                <div className="space-y-3">
                  <div className="relative">
                    <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500" />
                    <input
                      type="text"
                      value={searchFriend}
                      onChange={(e) => setSearchFriend(e.target.value)}
                      placeholder="Rechercher par nom ou email"
                      className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm text-gray-900 dark:text-white transition-colors"
                    />
                  </div>
                  <button
                    onClick={handleSendFriendRequest}
                    disabled={!searchFriend.trim()}
                    className="w-full bg-blue-500 dark:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-600 dark:hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Envoyer une demande
                  </button>
                </div>
              )}
            </div>

            {/* Historique d'activité */}
            <div className="flex-1 overflow-y-auto">
              <div className="p-4">
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Historique d'activité</h3>
                <div className="space-y-3">
                  {activityHistory.map(activity => (
                    <div key={activity.id} className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-slate-700 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-600 transition-colors cursor-pointer">
                      <div className="text-lg">{activity.icon}</div>
                      <div className="flex-1">
                        <p className="text-sm text-gray-900 dark:text-white">{activity.message}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{activity.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}

        {/* Version compacte quand la sidebar est fermée */}
        {!showRightSidebar && (
          <div className="flex-1 flex flex-col items-center justify-center p-2">
            <div className="transform -rotate-90 text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">
              Gestion des amis
            </div>
          </div>
        )}
      </div>

      {/* Modal de création de groupe */}
      {showCreateGroupModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl w-full max-w-2xl max-h-[80vh] overflow-y-auto transition-colors">
            <div className="flex justify-between items-center px-6 py-4 border-b border-gray-200 dark:border-slate-700 bg-gradient-to-r from-blue-50 dark:from-blue-900/20 to-purple-50 dark:to-purple-900/20">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Créer un nouveau groupe</h2>
              <button 
                onClick={() => setShowCreateGroupModal(false)}
                className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 p-1 hover:bg-white dark:hover:bg-slate-700 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Nom du groupe */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  👥 Nom du groupe *
                </label>
                <input
                  type="text"
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-slate-700 text-gray-900 dark:text-white transition-colors"
                  placeholder="Ex: Équipe Projet, Amis Proches..."
                  required
                />
              </div>

              {/* Sélection des amis */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                  👤 Sélectionner les membres ({selectedFriendsForGroup.length} sélectionné{selectedFriendsForGroup.length !== 1 ? 's' : ''})
                </label>
                
                {/* Barre de recherche pour les amis */}
                <div className="relative mb-4">
                  <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500" />
                  <input
                    type="text"
                    value={searchFriend}
                    onChange={(e) => setSearchFriend(e.target.value)}
                    placeholder="Rechercher un ami par nom ou email..."
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm bg-white dark:bg-slate-700 text-gray-900 dark:text-white transition-colors"
                  />
                </div>
                
                <div className="bg-gray-50 dark:bg-slate-700 rounded-lg p-4 border border-gray-200 dark:border-slate-600 max-h-64 overflow-y-auto transition-colors">
                  <div className="space-y-3">
                    {friendsList.filter(friend => 
                      friend.name.toLowerCase().includes(searchFriend.toLowerCase()) ||
                      friend.email.toLowerCase().includes(searchFriend.toLowerCase())
                    ).map(friend => (
                      <div 
                        key={friend.id}
                        className={`flex items-center justify-between p-3 rounded-lg border-2 transition-all cursor-pointer ${
                          selectedFriendsForGroup.includes(friend.id)
                            ? 'border-blue-500 dark:border-blue-400 bg-blue-50 dark:bg-blue-900/20'
                            : 'border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-600 hover:border-gray-300 dark:hover:border-slate-500'
                        }`}
                        onClick={() => toggleFriendSelection(friend.id)}
                      >
                        <div className="flex items-center gap-3">
                          <div className="text-2xl">{friend.avatar}</div>
                          <div>
                            <div className="font-medium text-gray-900">{friend.name}</div>
                            <div className="text-sm text-gray-600">{friend.email}</div>
                          </div>
                        </div>
                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                          selectedFriendsForGroup.includes(friend.id)
                            ? 'border-blue-500 bg-blue-500'
                            : 'border-gray-300'
                        }`}>
                          {selectedFriendsForGroup.includes(friend.id) && (
                            <Check size={14} className="text-white" />
                          )}
                        </div>
                      </div>
                    ))}
                    
                    {/* Message si aucun ami trouvé */}
                    {friendsList.filter(friend => 
                      friend.name.toLowerCase().includes(searchFriend.toLowerCase()) ||
                      friend.email.toLowerCase().includes(searchFriend.toLowerCase())
                    ).length === 0 && searchFriend.trim() && (
                      <div className="text-center text-gray-500 py-4">
                        <p className="text-sm">Aucun ami trouvé pour "{searchFriend}"</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Membres sélectionnés */}
              {selectedFriendsForGroup.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 mb-3">
                    ✅ Membres sélectionnés
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedFriendsForGroup.map(friendId => {
                      const friend = friendsList.find(f => f.id === friendId);
                      return friend ? (
                        <div 
                          key={friendId}
                          className="flex items-center gap-2 bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm"
                        >
                          <span>{friend.avatar}</span>
                          <span>{friend.name}</span>
                          <button
                            onClick={() => toggleFriendSelection(friendId)}
                            className="text-blue-600 hover:text-blue-800"
                          >
                            <X size={14} />
                          </button>
                        </div>
                      ) : null;
                    })}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex justify-end gap-4 pt-4 border-t border-gray-200">
                <button
                  onClick={() => setShowCreateGroupModal(false)}
                  className="px-6 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors"
                >
                  Annuler
                </button>
                <button
                  onClick={handleCreateGroupSubmit}
                  disabled={!groupName.trim() || selectedFriendsForGroup.length === 0}
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Users size={16} className="inline mr-2" />
                  Créer le groupe
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Overlay pour fermer les menus déroulants */}
      {(showMoreOptions || showEmojiPicker || showCreateGroupModal) && (
        <div 
          className="fixed inset-0 z-0" 
          onClick={() => {
            setShowMoreOptions(false);
            setShowEmojiPicker(false);
            setShowCreateGroupModal(false);
          }}
        />
      )}
    </div>
  );
};

export default MessagingPage;
