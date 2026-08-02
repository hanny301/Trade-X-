// db.js - Shared data layer for all pages
const DB = {
    get(key, def) {
        try { const d = localStorage.getItem('tx_' + key); return d ? JSON.parse(d) : def; } catch { return def; }
    },
    set(key, val) { localStorage.setItem('tx_' + key, JSON.stringify(val)); },

    getUsers() { return this.get('users', []); },
    setUsers(u) { this.set('users', u); },

    getProducts() {
        return this.get('products', [
            { id: 1, name: 'Standard EA', description: 'MT5 Expert Advisor (.ex5) + 1-month support', price: 97,
                type: 'standard', features: ['MT5 EA (.ex5)', '1-month email support', 'Basic setup guide'],
                downloadLink: '#ea-standard' },
            { id: 2, name: 'Pro EA', description: 'Full package with lifetime updates & priority support',
                price: 197, type: 'pro', features: ['MT5 EA (.ex5)', 'Lifetime updates',
                    '6-month priority support', 'Custom settings (.set)', 'Risk calculator tool'
                ], downloadLink: '#ea-pro' },
            { id: 3, name: 'VIP EA', description: 'Everything in Pro + source code & 1-on-1 call', price: 497,
                type: 'vip', features: ['Everything in Pro', '1-on-1 installation call',
                    'Custom parameter tuning', 'Source code (MQL5)'
                ], downloadLink: '#ea-vip' }
        ]);
    },
    setProducts(p) { this.set('products', p); },

    getOrders() { return this.get('orders', []); },
    setOrders(o) { this.set('orders', o); },

    // ============================================================
    //  MESSAGING & CHAT IMPROVEMENTS
    // ============================================================
    getMessages() { return this.get('messages', []); },
    setMessages(m) { this.set('messages', m); },

    /**
     * Add a new message to a conversation with full validation
     * @param {string} conversationId - Unique conversation identifier
     * @param {string} sender - 'user' or 'admin'
     * @param {string} text - Message text content
     * @param {array} attachments - Array of file objects {name, type, data, size}
     * @returns {object} The created message object
     */
    addMessage(conversationId, sender, text, attachments = []) {
        // Validate inputs
        if (!conversationId || typeof conversationId !== 'string') {
            throw new Error('Invalid conversationId');
        }
        if (!['user', 'admin'].includes(sender)) {
            throw new Error('Sender must be "user" or "admin"');
        }
        if (!text && (!attachments || attachments.length === 0)) {
            throw new Error('Message must contain text or attachments');
        }

        const msgs = this.getMessages();
        
        // Create message object with all metadata
        const msg = {
            id: uid(),
            conversationId: conversationId,
            sender: sender,
            text: text.trim(),
            timestamp: new Date().toISOString(),
            read: sender === 'admin' ? true : false,
            attachments: attachments.map(file => ({
                id: uid(),
                name: file.name || 'file',
                type: file.type || 'application/octet-stream',
                data: file.data,
                size: file.size || 0,
                uploadedAt: new Date().toISOString()
            })),
            edited: false,
            editedAt: null
        };

        msgs.push(msg);
        this.setMessages(msgs);
        
        // Trigger event for real-time updates (future expansion)
        window.dispatchEvent(new CustomEvent('messageAdded', { detail: msg }));
        
        return msg;
    },

    /**
     * Edit an existing message
     * @param {string} messageId - Message ID to edit
     * @param {string} newText - New message text
     * @returns {boolean} Success status
     */
    editMessage(messageId, newText) {
        const msgs = this.getMessages();
        const msg = msgs.find(m => m.id === messageId);
        
        if (!msg) {
            throw new Error('Message not found');
        }
        
        // Only allow editing own messages and within 5 minutes
        const timeDiff = (Date.now() - new Date(msg.timestamp).getTime()) / (1000 * 60);
        if (timeDiff > 5) {
            throw new Error('Can only edit messages within 5 minutes of sending');
        }

        msg.text = newText.trim();
        msg.edited = true;
        msg.editedAt = new Date().toISOString();
        
        this.setMessages(msgs);
        window.dispatchEvent(new CustomEvent('messageEdited', { detail: msg }));
        
        return true;
    },

    /**
     * Delete a message
     * @param {string} messageId - Message ID to delete
     * @returns {boolean} Success status
     */
    deleteMessage(messageId) {
        const msgs = this.getMessages();
        const index = msgs.findIndex(m => m.id === messageId);
        
        if (index === -1) {
            throw new Error('Message not found');
        }

        const deletedMsg = msgs[index];
        msgs.splice(index, 1);
        this.setMessages(msgs);
        
        window.dispatchEvent(new CustomEvent('messageDeleted', { detail: deletedMsg }));
        
        return true;
    },

    /**
     * Get messages for a specific conversation
     * @param {string} conversationId - Conversation ID
     * @param {number} limit - Max number of messages to return (for pagination)
     * @param {number} offset - Offset for pagination
     * @returns {array} Sorted messages
     */
    getMessagesForConversation(conversationId, limit = null, offset = 0) {
        let messages = this.getMessages()
            .filter(m => m.conversationId === conversationId)
            .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

        if (limit) {
            messages = messages.slice(offset, offset + limit);
        }

        return messages;
    },

    /**
     * Get conversation list with enhanced metadata
     * @returns {array} Conversations with user info and last message
     */
    getConversations() {
        const msgs = this.getMessages();
        const convIds = [...new Set(msgs.map(m => m.conversationId))];
        
        return convIds
            .map(id => {
                const convMsgs = msgs.filter(m => m.conversationId === id);
                const last = convMsgs[convMsgs.length - 1];
                const unread = convMsgs.filter(m => m.sender === 'user' && !m.read).length;
                const user = this.getUsers().find(u => u.id === id);
                const totalMessages = convMsgs.length;
                const hasAttachments = convMsgs.some(m => m.attachments && m.attachments.length > 0);

                return {
                    userId: id,
                    userName: user ? user.name : 'Guest',
                    userEmail: user ? user.email : 'guest@email.com',
                    lastMsg: last ? (last.text || '📎 File attachment') : '',
                    lastTime: last ? last.timestamp : '',
                    unread: unread,
                    totalMessages: totalMessages,
                    hasAttachments: hasAttachments,
                    createdAt: convMsgs[0] ? convMsgs[0].timestamp : new Date().toISOString()
                };
            })
            .sort((a, b) => new Date(b.lastTime) - new Date(a.lastTime)); // Sort by most recent
    },

    /**
     * Mark conversation as read
     * @param {string} conversationId - Conversation ID
     */
    markConversationRead(conversationId) {
        const msgs = this.getMessages();
        let updated = false;

        msgs.forEach(m => {
            if (m.conversationId === conversationId && m.sender === 'user' && !m.read) {
                m.read = true;
                updated = true;
            }
        });

        if (updated) {
            this.setMessages(msgs);
            window.dispatchEvent(new CustomEvent('conversationRead', { detail: { conversationId } }));
        }
    },

    /**
     * Search messages within a conversation
     * @param {string} conversationId - Conversation ID
     * @param {string} query - Search query
     * @returns {array} Matching messages
     */
    searchMessages(conversationId, query) {
        if (!query || query.trim().length === 0) {
            return [];
        }

        const lowerQuery = query.toLowerCase();
        return this.getMessagesForConversation(conversationId)
            .filter(m => 
                m.text.toLowerCase().includes(lowerQuery) ||
                (m.attachments && m.attachments.some(att => att.name.toLowerCase().includes(lowerQuery)))
            );
    },

    /**
     * Get attachment statistics for a conversation
     * @param {string} conversationId - Conversation ID
     * @returns {object} Statistics about attachments
     */
    getAttachmentStats(conversationId) {
        const msgs = this.getMessagesForConversation(conversationId);
        let stats = {
            totalFiles: 0,
            totalSize: 0,
            byType: {
                images: 0,
                videos: 0,
                documents: 0,
                other: 0
            },
            attachments: []
        };

        msgs.forEach(m => {
            if (m.attachments && m.attachments.length > 0) {
                m.attachments.forEach(att => {
                    stats.totalFiles++;
                    stats.totalSize += att.size || 0;

                    if (att.type.startsWith('image/')) {
                        stats.byType.images++;
                    } else if (att.type.startsWith('video/')) {
                        stats.byType.videos++;
                    } else if (att.type.includes('document') || att.type.includes('pdf') || att.type.includes('word')) {
                        stats.byType.documents++;
                    } else {
                        stats.byType.other++;
                    }

                    stats.attachments.push({
                        ...att,
                        sender: m.sender,
                        messageId: m.id,
                        sentAt: m.timestamp
                    });
                });
            }
        });

        return stats;
    },

    /**
     * Get all attachments for a conversation
     * @param {string} conversationId - Conversation ID
     * @param {string} filterType - 'all', 'images', 'videos', 'documents'
     * @returns {array} Filtered attachments
     */
    getAttachments(conversationId, filterType = 'all') {
        const stats = this.getAttachmentStats(conversationId);
        let filtered = stats.attachments;

        if (filterType === 'images') {
            filtered = filtered.filter(a => a.type.startsWith('image/'));
        } else if (filterType === 'videos') {
            filtered = filtered.filter(a => a.type.startsWith('video/'));
        } else if (filterType === 'documents') {
            filtered = filtered.filter(a => 
                a.type.includes('document') || a.type.includes('pdf') || a.type.includes('word')
            );
        }

        return filtered;
    },

    /**
     * Get unread message count across all conversations
     * @returns {number} Total unread messages
     */
    getUnreadCount() {
        return this.getMessages()
            .filter(m => m.sender === 'user' && !m.read).length;
    },

    /**
     * Get unread count for specific user
     * @param {string} userId - User ID
     * @returns {number} Unread count from that user
     */
    getUnreadCountForUser(userId) {
        return this.getMessages()
            .filter(m => m.conversationId === userId && m.sender === 'user' && !m.read).length;
    },

    /**
     * Delete all messages in a conversation
     * @param {string} conversationId - Conversation ID
     * @returns {boolean} Success status
     */
    deleteConversation(conversationId) {
        const msgs = this.getMessages();
        const originalLength = msgs.length;
        const filtered = msgs.filter(m => m.conversationId !== conversationId);
        
        if (filtered.length === originalLength) {
            throw new Error('Conversation not found');
        }

        this.setMessages(filtered);
        window.dispatchEvent(new CustomEvent('conversationDeleted', { detail: { conversationId } }));
        
        return true;
    },

    /**
     * Export conversation as JSON or text
     * @param {string} conversationId - Conversation ID
     * @param {string} format - 'json' or 'text'
     * @returns {string} Formatted conversation data
     */
    exportConversation(conversationId, format = 'json') {
        const msgs = this.getMessagesForConversation(conversationId);
        const conv = this.getConversations().find(c => c.userId === conversationId);

        if (!conv) {
            throw new Error('Conversation not found');
        }

        if (format === 'json') {
            return JSON.stringify({
                conversation: conv,
                messages: msgs,
                exportedAt: new Date().toISOString()
            }, null, 2);
        } else if (format === 'text') {
            let text = `Conversation with ${conv.userName} (${conv.userEmail})\n`;
            text += `Exported: ${new Date().toLocaleString()}\n`;
            text += `Total Messages: ${msgs.length}\n\n`;
            text += '---\n\n';

            msgs.forEach(m => {
                const date = new Date(m.timestamp).toLocaleString();
                const sender = m.sender === 'user' ? conv.userName : 'Admin';
                text += `[${date}] ${sender}:\n${m.text}\n`;
                if (m.attachments && m.attachments.length > 0) {
                    text += `Attachments: ${m.attachments.map(a => a.name).join(', ')}\n`;
                }
                text += '\n';
            });

            return text;
        }

        throw new Error('Invalid format. Use "json" or "text"');
    },

    /**
     * Get conversation activity timeline
     * @param {string} conversationId - Conversation ID
     * @returns {array} Timeline events
     */
    getConversationTimeline(conversationId) {
        const msgs = this.getMessagesForConversation(conversationId);
        const events = [];

        msgs.forEach((msg, index) => {
            const date = new Date(msg.timestamp);
            const hour = date.getHours();
            const isNight = hour < 6 || hour > 22;

            events.push({
                id: msg.id,
                type: 'message',
                sender: msg.sender,
                timestamp: msg.timestamp,
                date: date.toLocaleDateString(),
                time: date.toLocaleTimeString(),
                hasAttachments: msg.attachments && msg.attachments.length > 0,
                attachmentCount: msg.attachments ? msg.attachments.length : 0,
                isOutOfHours: isNight
            });
        });

        return events;
    },

    // ============================================================
    //  SESSION MANAGEMENT
    // ============================================================
    getSession() { return this.get('session', null); },
    setSession(s) { this.set('session', s); },
    clearSession() { this.set('session', null); }
};

function uid() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 6); }

function getCurrentUser() {
    const sess = DB.getSession();
    if (sess) {
        const users = DB.getUsers();
        return users.find(u => u.id === sess.userId) || null;
    }
    return null;
}

function isAdmin() {
    const user = getCurrentUser();
    return user && user.role === 'admin';
}

function requireAuth() {
    const user = getCurrentUser();
    if (!user) {
        window.location.href = 'login.html';
        return false;
    }
    return true;
}

function requireAdmin() {
    if (!requireAuth()) return false;
    if (!isAdmin()) {
        window.location.href = 'user-dashboard.html';
        return false;
    }
    return true;
}
