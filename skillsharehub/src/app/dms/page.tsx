'use client'

import { useEffect, useState, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'


export default function MessagesPage() {
  const bottomRef = useRef<HTMLDivElement>(null)
  const [currentUserId, setCurrentUserId] = useState<number | null>(null)
  const [users, setUsers] = useState<any[]>([])
  const [selectedUser, setSelectedUser] = useState<any | null>(null)
  const [Messages, setMessages] = useState<any[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [chatUsers, setChatUsers] = useState<any[]>([])
  const [showModal, setShowModal] = useState(false)


    useEffect(() => {
        const fetchChatUsers = async () => {
            if (!currentUserId) return

            const { data: messageUsers } = await supabase
            .from('Messages')
            .select('sender_id, receiver_id')
            .or(`sender_id.eq.${currentUserId},receiver_id.eq.${currentUserId}`)

            const userIds = new Set<number>()
            messageUsers?.forEach((msg) => {
            if (msg.sender_id !== currentUserId) userIds.add(msg.sender_id)
            if (msg.receiver_id !== currentUserId) userIds.add(msg.receiver_id)
            })

            if (userIds.size > 0) {
            const { data } = await supabase
                .from('Uporabniki')
                .select('id, email, ime')
                .in('id', Array.from(userIds))

            setChatUsers(data || [])
            }
        }

    fetchChatUsers()
    }, [currentUserId])


  useEffect(() => {
    const fetchUser = async () => {
      const { data: authData } = await supabase.auth.getUser()
      const email = authData.user?.email
      if (!email) return

      const { data } = await supabase
        .from('Uporabniki')
        .select('id')
        .eq('email', email)
        .single()

      if (data) setCurrentUserId(data.id)
    }

    fetchUser()
  }, [])

  useEffect(() => {
    const fetchUsers = async () => {
      const { data } = await supabase.from('Uporabniki').select('id, email, ime')
      setUsers(data || [])
    }

    fetchUsers()
  }, [])

  useEffect(() => {
    if (!selectedUser || !currentUserId) return

    const fetchMessages = async () => {
      const { data } = await supabase
        .from('Messages')
        .select('*')
        .or(
          `and(sender_id.eq.${currentUserId},receiver_id.eq.${selectedUser.id}),and(sender_id.eq.${selectedUser.id},receiver_id.eq.${currentUserId})`
        )
        .order('created_at', { ascending: true })

      setMessages(data || [])
    }

    fetchMessages()
  }, [selectedUser, currentUserId])

  useEffect(() => {
    if (!selectedUser || !currentUserId) return

    const channel = supabase
      .channel('chat-Messages')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'Messages' },
        (payload) => {
          const msg = payload.new
          const relevant =
            (msg.sender_id === currentUserId && msg.receiver_id === selectedUser.id) ||
            (msg.sender_id === selectedUser.id && msg.receiver_id === currentUserId)

          if (relevant) {
            setMessages((prev) => [...prev, msg])
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [selectedUser, currentUserId])

  const sendMessage = async () => {
  if (!newMessage.trim() || !currentUserId || !selectedUser) return;

  const { error } = await supabase.from('Messages').insert([
    {
      sender_id: currentUserId,
      receiver_id: selectedUser.id,
      content: newMessage.trim(),
    },
  ]);

  if (!error) {
    setNewMessage('');
    // Refresh chat users to update the chat list with new contact if needed
    fetchChatUsers();
  }
};

  // ✅ Filter by name or email
  const filteredUsers = searchQuery
  ? users
      .filter((u) => u.id !== currentUserId)
      .filter(
        (u) =>
          u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (u.ime?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false)
      )
  : chatUsers


  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [Messages]);


  const fetchChatUsers = async () => {
  if (!currentUserId) return;

  const { data: messageUsers } = await supabase
    .from('Messages')
    .select('sender_id, receiver_id')
    .or(`sender_id.eq.${currentUserId},receiver_id.eq.${currentUserId}`);

  const userIds = new Set<number>();
  messageUsers?.forEach((msg) => {
    if (msg.sender_id !== currentUserId) userIds.add(msg.sender_id);
    if (msg.receiver_id !== currentUserId) userIds.add(msg.receiver_id);
  });

  if (userIds.size > 0) {
    const { data } = await supabase
      .from('Uporabniki')
      .select('id, email, ime')
      .in('id', Array.from(userIds));

    setChatUsers(data || []);
  }
};
useEffect(() => {
  fetchChatUsers();
}, [currentUserId]);









    return (
      <div className="flex h-screen bg-gray-100">
        {/* Chat List */}
        <aside className="w-1/3 border-r border-gray-300 p-4 overflow-y-auto bg-white">
          <div className="flex justify-between items-center mb-5">
            <h2 className="text-2xl font-bold text-gray-800">
              {selectedUser ? 'Chats' : 'Select Chat'}
            </h2>
            <button
              onClick={() => setShowModal(true)}
              className="text-sm text-blue-600 underline hover:text-blue-800 transition"
              aria-label="Open search modal"
            >
              Search
            </button>
          </div>

          {chatUsers.length === 0 ? (
            <p className="text-gray-500 italic">No chats available.</p>
          ) : (
            chatUsers.map((user) => {
              const isSelected = selectedUser?.id === user.id;
              return (
                <div
                  key={user.id}
                  onClick={() => setSelectedUser(user)}
                  className={`flex items-center gap-3 p-3 mb-3 rounded-lg cursor-pointer transition 
                    ${isSelected
                      ? 'bg-blue-100 text-blue-700 font-semibold shadow-inner'
                      : 'hover:bg-gray-100 hover:shadow-sm'}
                  `}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => { if (e.key === 'Enter') setSelectedUser(user); }}
                >
                  {/* Avatar circle */}
                  <div
                    className={`flex items-center justify-center w-10 h-10 rounded-full text-white font-bold text-lg
                      ${isSelected ? 'bg-blue-600' : 'bg-gray-400'}
                    `}
                  >
                    {user.avatarUrl ? (
                      <img
                        src={user.avatarUrl}
                        alt={`${user.ime || user.email} avatar`}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    ) : (
                      (user.ime || user.email)?.charAt(0).toUpperCase()
                    )}
                  </div>

                  {/* User name/email */}
                  <div className="truncate">
                    {user.ime || user.email}  
                  </div>
                </div>
              );
            })
          )}
        </aside>


        {/* Chat Window */}
        <main className="flex-1 flex justify-center p-6 overflow-hidden">
          <div className="w-full max-w-4xl flex flex-col bg-white shadow-lg rounded-lg p-6 h-full">
            {selectedUser ? (
              <>
                <header className="mb-6 border-b border-gray-200 pb-3">
                  <h2 className="text-xl font-semibold text-gray-900">
                    <Link 
                    href={`/viewprofile/${selectedUser.id}`}
                    className="text-blue-600 hover:underline"
                    passHref>
                    
                      {selectedUser.ime || selectedUser.email}
                    </Link>
                  </h2>
                </header>

                {/* Chat messages */}
                <section
                  className="flex-1 overflow-y-auto border border-gray-300 rounded-lg p-5 bg-gray-50 space-y-4 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100"
                >
                  {Messages.length === 0 ? (
                    <p className="text-gray-400 italic text-center mt-20">
                      Ni sporočil.
                    </p>
                  ) : (
                    Messages.map((msg) => {
                      const isOwnMessage = msg.sender_id === currentUserId;
                      return (
                        <div
                          key={msg.id}
                          className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
                        >
                          <div
                            className={`p-3 rounded-lg max-w-md text-sm shadow 
                              ${isOwnMessage
                                ? 'bg-blue-600 text-white rounded-br-none'
                                : 'bg-gray-200 text-gray-900 rounded-bl-none'}`}
                          >
                            {msg.content}
                            <div className="text-xs text-right text-gray-300 mt-1 select-none">
                              {new Date(msg.created_at).toLocaleTimeString()}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                  <div ref={bottomRef} />
                </section>

                {/* Input area */}
                <footer className="mt-5 flex gap-4">
                  <input
                    className="flex-1 border border-gray-300 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Vpiši sporočilo..."
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') sendMessage()
                    }}
                    aria-label="Type your message"
                  />
                  <button
                    className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
                    onClick={sendMessage}
                    aria-label="Send message"
                  >
                    Pošlji
                  </button>
                </footer>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-gray-500 italic text-lg select-none">
                Izberi osebo za klepet.
              </div>
            )}
          </div>
        </main>

        {/* 🔍 Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg w-full max-w-md shadow-lg">
              <div className="flex justify-between items-center mb-5">
                <h3 className="text-xl font-semibold text-gray-900">Search Users</h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-red-600 hover:text-red-800 transition text-2xl leading-none"
                  aria-label="Close search modal"
                >
                  &times;
                </button>
              </div>

              <input
                type="text"
                placeholder="Search by name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full mb-5 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
                autoFocus
                aria-label="Search users"
              />

              <div className="max-h-64 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                {filteredUsers.length === 0 ? (
                  <div className="text-gray-400 italic text-center py-6 select-none">
                    No users found
                  </div>
                ) : (
                  filteredUsers.map((user) => (
                    <div
                      key={user.id}
                      onClick={() => {
                        setSelectedUser(user);
                        setShowModal(false);
                        setSearchQuery('');
                      }}
                      className="p-3 rounded-md hover:bg-gray-100 cursor-pointer transition"
                    >
                      {user.ime || user.email}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    )


}
