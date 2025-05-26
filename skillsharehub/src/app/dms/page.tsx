'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'


export default function MessagesPage() {
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
    if (!newMessage.trim() || !currentUserId || !selectedUser) return

    const { error } = await supabase.from('Messages').insert([
      {
        sender_id: currentUserId,
        receiver_id: selectedUser.id,
        content: newMessage.trim(),
      },
    ])
    console.log(error)

    console.log(newMessage)
    console.log(currentUserId)
    console.log(selectedUser)
    if (!error) setNewMessage('')
  }

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


    return (
        <div className="flex h-screen">
            {/* Chat List */}
            <div className="w-1/3 border-r p-4 overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">
                {selectedUser ? 'Chats' : 'Select Chat'}
                </h2>
                <button
                onClick={() => setShowModal(true)}
                className="text-sm text-blue-600 underline"
                >
                Search
                </button>
            </div>

            {/* List of recent chats */}
            {chatUsers.map((user) => (
                <div
                key={user.id}
                onClick={() => setSelectedUser(user)}
                className={`p-2 rounded cursor-pointer mb-2 ${
                    selectedUser?.id === user.id
                    ? 'bg-blue-200'
                    : 'hover:bg-gray-100'
                }`}
                >
                {user.ime || user.email}
                </div>
            ))}
            </div>

            {/* Chat Window */}
            <div className="flex-1 flex flex-col p-4">
            {selectedUser ? (
                <>
                <h2 className="text-lg font-semibold mb-2">
                    Chat with {selectedUser.ime || selectedUser.email}
                </h2>

                <div className="flex-1 overflow-y-auto border p-4 rounded bg-gray-50">
                    {Messages.map((msg) => (
                    <div
                        key={msg.id}
                        className={`mb-2 p-2 rounded max-w-xs ${
                        msg.sender_id === currentUserId
                            ? 'ml-auto bg-blue-200'
                            : 'mr-auto bg-gray-200'
                        }`}
                    >
                        {msg.content}
                        <div className="text-xs text-gray-500 text-right">
                        {new Date(msg.created_at).toLocaleTimeString()}
                        </div>
                    </div>
                    ))}
                </div>

                <div className="mt-4 flex gap-2">
                    <input
                    className="flex-1 border px-3 py-2 rounded"
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type your message..."
                    />
                    <button
                    className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                    onClick={sendMessage}
                    >
                    Send
                    </button>
                </div>
                </>
            ) : (
                <div className="text-gray-500 text-center mt-20">
                Select a user to start chatting
                </div>
            )}
            </div>

            {/* 🔍 Modal for search */}
            {showModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white p-6 rounded-lg w-full max-w-md">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold">Search Users</h3>
                    <button onClick={() => setShowModal(false)} className="text-red-500">
                    ✕
                    </button>
                </div>

                <input
                    type="text"
                    placeholder="Search by name or email..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full mb-4 p-2 border rounded"
                />

                <div className="max-h-64 overflow-y-auto">
                    {filteredUsers.length === 0 ? (
                    <div className="text-gray-400 italic">No users found</div>
                    ) : (
                    filteredUsers.map((user) => (
                        <div
                        key={user.id}
                        onClick={() => {
                            setSelectedUser(user)
                            setShowModal(false)
                            setSearchQuery('')
                        }}
                        className="p-2 rounded hover:bg-gray-100 cursor-pointer"
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
