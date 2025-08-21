'use client'

import { useState, useEffect, useRef, KeyboardEvent } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowLeft, Send, Search, Check, ShoppingBag, User, MoreVertical, X } from 'lucide-react'

interface Contact {
  id: string
  name: string
  avatar: string
  lastMessage: string
  lastMessageTime: string
  isUnread: boolean
  isOnline: boolean
  hasActiveOrder?: boolean
  hasOrders?: boolean
}

interface Message {
  id: string
  from: string
  fromName: string
  avatar: string
  message: string
  timestamp: string
  isCurrentUser: boolean
}

interface Order {
  id: string
  name: string
  amount: number
  createdAt: string
  isActive: boolean
}

export default function MessengerPage() {
  const router = useRouter()
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const chatMessagesRef = useRef<HTMLDivElement>(null)
  
  const [contacts, setContacts] = useState<Contact[]>([])
  const [filteredContacts, setFilteredContacts] = useState<Contact[]>([])
  const [messages, setMessages] = useState<Message[]>([])
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null)
  const [newMessage, setNewMessage] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [showOrders, setShowOrders] = useState(false)
  const [contactOrders, setContactOrders] = useState<Order[]>([])
  const [isMobileView, setIsMobileView] = useState(false)

  useEffect(() => {
    fetchContacts()
    checkMobileView()
    window.addEventListener('resize', checkMobileView)
    return () => window.removeEventListener('resize', checkMobileView)
  }, [])

  useEffect(() => {
    // Check for hash in URL to open specific chat
    const hash = window.location.hash.replace('#', '')
    if (hash && contacts.length > 0 && !selectedContact) {
      const contact = contacts.find(c => c.id === hash)
      if (contact) {
        selectContact(contact)
      }
    }
  }, [contacts.length]) // Only depend on contacts length, not the full array

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    if (searchQuery) {
      const filtered = contacts.filter(c => 
        c.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
      setFilteredContacts(filtered)
    } else {
      setFilteredContacts(contacts)
    }
  }, [searchQuery, contacts])

  const checkMobileView = () => {
    setIsMobileView(window.innerWidth < 768)
  }

  const fetchContacts = async () => {
    try {
      // Mock data - replace with actual API call
      const mockContacts: Contact[] = [
        {
          id: 'trainer1',
          name: 'Maria Mägi',
          avatar: '/images/avatar-1.jpg',
          lastMessage: 'Tere! Kuidas edeneb treening?',
          lastMessageTime: '10:30',
          isUnread: true,
          isOnline: true,
          hasActiveOrder: true,
          hasOrders: true
        },
        {
          id: 'trainer2',
          name: 'Jaan Tamm',
          avatar: '/images/avatar-2.jpg',
          lastMessage: 'Homme kell 17 sobib hästi',
          lastMessageTime: 'Eile',
          isUnread: false,
          isOnline: false,
          hasOrders: true
        },
        {
          id: 'user1',
          name: 'Liisa Kask',
          avatar: '/images/avatar-3.jpg',
          lastMessage: 'Aitäh info eest!',
          lastMessageTime: '2 päeva tagasi',
          isUnread: false,
          isOnline: true
        }
      ]
      
      setContacts(mockContacts)
      setFilteredContacts(mockContacts)
    } catch (error) {
      console.error('Failed to fetch contacts:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchMessages = async (contactId: string) => {
    try {
      // Mock messages - replace with actual API call
      const mockMessages: Message[] = [
        {
          id: '1',
          from: contactId,
          fromName: selectedContact?.name || '',
          avatar: selectedContact?.avatar || '',
          message: 'Tere! Kuidas edeneb treening?',
          timestamp: '10:30',
          isCurrentUser: false
        },
        {
          id: '2',
          from: 'current',
          fromName: 'Sina',
          avatar: '/images/current-user.jpg',
          message: 'Tere! Kõik läheb hästi, tänan küsimast.',
          timestamp: '10:32',
          isCurrentUser: true
        },
        {
          id: '3',
          from: contactId,
          fromName: selectedContact?.name || '',
          avatar: selectedContact?.avatar || '',
          message: 'Super! Kas vajad mingit abi või nõuandeid?',
          timestamp: '10:35',
          isCurrentUser: false
        }
      ]
      
      setMessages(mockMessages)
    } catch (error) {
      console.error('Failed to fetch messages:', error)
    }
  }

  const selectContact = async (contact: Contact) => {
    setSelectedContact(contact)
    await fetchMessages(contact.id)
    
    // Mark as read
    setContacts(prev => prev.map(c => 
      c.id === contact.id ? { ...c, isUnread: false } : c
    ))
    
    // Update URL hash
    window.location.hash = contact.id
  }

  const sendMessage = () => {
    if (!newMessage.trim() || !selectedContact) return
    
    const message: Message = {
      id: Date.now().toString(),
      from: 'current',
      fromName: 'Sina',
      avatar: '/images/current-user.jpg',
      message: newMessage,
      timestamp: new Date().toLocaleTimeString('et-EE', { hour: '2-digit', minute: '2-digit' }),
      isCurrentUser: true
    }
    
    setMessages(prev => [...prev, message])
    setNewMessage('')
    
    // Update last message in contacts
    setContacts(prev => prev.map(c => 
      c.id === selectedContact.id 
        ? { ...c, lastMessage: newMessage, lastMessageTime: 'Nüüd' }
        : c
    ))
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const goBack = () => {
    setSelectedContact(null)
    window.location.hash = ''
  }

  const openOrdersModal = async (contactId: string) => {
    // Mock orders data
    const mockOrders: Order[] = [
      {
        id: '1',
        name: 'Personaaltreening 10x',
        amount: 299,
        createdAt: '15.01.2024',
        isActive: true
      },
      {
        id: '2',
        name: 'Toitumiskava',
        amount: 49,
        createdAt: '10.01.2024',
        isActive: false
      }
    ]
    
    setContactOrders(mockOrders)
    setShowOrders(true)
  }

  const hasUnreadMessages = contacts.some(c => c.isUnread)

  return (
    <div className="h-screen bg-[#2c313a] text-white flex flex-col">
      {/* Header */}
      <header className="bg-[#3e4551] border-b border-[#4d5665] px-4 py-3 flex items-center justify-between">
        <Link href="/dashboard" className="flex items-center gap-3">
          <img src="/images/fitq-logo-new.svg" alt="FitQ" className="h-7" />
        </Link>
        <div className="flex items-center gap-2">
          <span className="text-lg font-semibold">Messenger</span>
          <span className="px-2 py-0.5 bg-[#40b236] text-white text-xs rounded">Beta</span>
        </div>
        <Link href="/settings/personal" className="w-8 h-8 rounded-full bg-[#4d5665] overflow-hidden">
          <img src="/images/current-user.jpg" alt="Profile" className="w-full h-full object-cover" />
        </Link>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* Contacts List */}
        <div className={`${isMobileView && selectedContact ? 'hidden' : 'flex'} flex-col ${isMobileView ? 'w-full' : 'w-80'} border-r border-[#4d5665] bg-[#3e4551]`}>
          <div className="p-4 border-b border-[#4d5665]">
            <h2 className="text-lg font-semibold mb-3">Kontaktid</h2>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Otsi kontakte..."
                className="w-full pl-10 pr-4 py-2 bg-[#2c313a] border border-[#4d5665] rounded-lg focus:outline-none focus:border-[#40b236] transition-colors"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#40b236]"></div>
              </div>
            ) : filteredContacts.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                {searchQuery ? 'Kontakte ei leitud' : 'Sul pole veel kontakte'}
              </div>
            ) : (
              filteredContacts.map(contact => (
                <div
                  key={contact.id}
                  onClick={() => selectContact(contact)}
                  className={`flex items-start gap-3 p-4 hover:bg-[#4d5665] cursor-pointer transition-colors ${
                    selectedContact?.id === contact.id ? 'bg-[#4d5665]' : ''
                  } ${contact.isUnread ? 'bg-[#40b236]/10' : ''}`}
                >
                  <div className="relative">
                    <div className="w-12 h-12 rounded-full bg-[#4d5665] overflow-hidden">
                      {contact.avatar ? (
                        <img src={contact.avatar} alt={contact.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <User className="w-6 h-6 text-gray-400" />
                        </div>
                      )}
                    </div>
                    {contact.isOnline && (
                      <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-[#3e4551]"></div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`font-medium ${contact.isUnread ? 'text-white' : 'text-gray-200'}`}>
                        {contact.name}
                      </span>
                      {contact.hasActiveOrder && <Check className="w-4 h-4 text-green-500" />}
                      {contact.hasOrders && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            openOrdersModal(contact.id)
                          }}
                          className="text-xs text-[#40b236] hover:text-[#60cc56]"
                        >
                          Ostud
                        </button>
                      )}
                    </div>
                    <p className={`text-sm truncate ${contact.isUnread ? 'text-gray-100 font-medium' : 'text-gray-400'}`}>
                      {contact.lastMessage}
                    </p>
                  </div>
                  <span className="text-xs text-gray-400">{contact.lastMessageTime}</span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Chat Area */}
        {selectedContact ? (
          <div className={`flex-1 flex flex-col ${isMobileView && !selectedContact ? 'hidden' : ''}`}>
            {/* Chat Header */}
            <div className="bg-[#3e4551] border-b border-[#4d5665] px-4 py-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                {isMobileView && (
                  <button
                    onClick={goBack}
                    className="p-1 hover:bg-[#4d5665] rounded transition-colors"
                  >
                    <ArrowLeft className={`w-5 h-5 ${hasUnreadMessages ? 'text-[#40b236]' : ''}`} />
                  </button>
                )}
                <div className="w-10 h-10 rounded-full bg-[#4d5665] overflow-hidden">
                  {selectedContact.avatar ? (
                    <img src={selectedContact.avatar} alt={selectedContact.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <User className="w-5 h-5 text-gray-400" />
                    </div>
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">{selectedContact.name}</span>
                    {selectedContact.hasActiveOrder && <Check className="w-4 h-4 text-green-500" />}
                  </div>
                  {selectedContact.isOnline && (
                    <span className="text-xs text-green-400">Võrgus</span>
                  )}
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                {selectedContact.hasOrders && (
                  <button
                    onClick={() => openOrdersModal(selectedContact.id)}
                    className="p-2 hover:bg-[#4d5665] rounded transition-colors"
                  >
                    <ShoppingBag className="w-5 h-5" />
                  </button>
                )}
                <button className="p-2 hover:bg-[#4d5665] rounded transition-colors">
                  <MoreVertical className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div 
              ref={chatMessagesRef}
              className="flex-1 overflow-y-auto p-4 space-y-4"
            >
              {messages.map(message => (
                <div
                  key={message.id}
                  className={`flex gap-3 ${message.isCurrentUser ? 'flex-row-reverse' : ''}`}
                >
                  <div className="w-8 h-8 rounded-full bg-[#4d5665] overflow-hidden flex-shrink-0">
                    {message.avatar ? (
                      <img src={message.avatar} alt={message.fromName} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <User className="w-4 h-4 text-gray-400" />
                      </div>
                    )}
                  </div>
                  <div className={`max-w-[70%] ${message.isCurrentUser ? 'text-right' : ''}`}>
                    <div className={`inline-block px-4 py-2 rounded-lg ${
                      message.isCurrentUser 
                        ? 'bg-[#40b236] text-white' 
                        : 'bg-[#3e4551] text-gray-100'
                    }`}>
                      {message.message}
                    </div>
                    <div className="text-xs text-gray-400 mt-1">{message.timestamp}</div>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <form 
              onSubmit={(e) => {
                e.preventDefault()
                sendMessage()
              }}
              className="bg-[#3e4551] border-t border-[#4d5665] p-4 flex gap-2"
            >
              <textarea
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Kirjuta sõnum..."
                className="flex-1 px-4 py-2 bg-[#2c313a] border border-[#4d5665] rounded-lg resize-none focus:outline-none focus:border-[#40b236] transition-colors"
                rows={1}
              />
              <button
                type="submit"
                disabled={!newMessage.trim()}
                className="p-2 bg-[#40b236] hover:bg-[#60cc56] disabled:bg-gray-600 disabled:cursor-not-allowed rounded-lg transition-colors"
              >
                <Send className="w-5 h-5" />
              </button>
            </form>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-400">
            <div className="text-center">
              <User className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p>Vali kontakt vestluse alustamiseks</p>
            </div>
          </div>
        )}
      </div>

      {/* Orders Modal */}
      {showOrders && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-[#3e4551] rounded-lg p-6 max-w-md w-full">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold">Ostud</h3>
              <button
                onClick={() => setShowOrders(false)}
                className="p-1 hover:bg-[#4d5665] rounded transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-3">
              {contactOrders.map(order => (
                <div key={order.id} className="p-3 bg-[#2c313a] rounded-lg">
                  <div className="flex items-center gap-2 mb-1">
                    {order.isActive && <Check className="w-4 h-4 text-green-500" />}
                    <span className="font-medium">{order.name}</span>
                    <span className="text-[#40b236]">{order.amount}€</span>
                  </div>
                  <p className="text-sm text-gray-400">{order.createdAt}</p>
                </div>
              ))}
            </div>
            
            <button
              onClick={() => setShowOrders(false)}
              className="w-full mt-4 px-4 py-2 bg-[#40b236] hover:bg-[#60cc56] text-white rounded-lg font-medium transition-colors"
            >
              Sulge
            </button>
          </div>
        </div>
      )}
    </div>
  )
}