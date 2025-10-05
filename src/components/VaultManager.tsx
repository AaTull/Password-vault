'use client';

import { useState, useEffect } from 'react';
import { ClientEncryption } from '@/lib/encryption';

interface VaultItem {
  _id: string;
  title: string;
  username: string;
  encryptedPassword: string;
  url: string;
  encryptedNotes: string;
}

export default function VaultManager({ userPassword }: { userPassword: string }) {
  const [items, setItems] = useState<VaultItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [editingItem, setEditingItem] = useState<VaultItem | null>(null);

  const [newItem, setNewItem] = useState({
    title: '',
    username: '',
    password: '',
    url: '',
    notes: ''
  });

  const [editForm, setEditForm] = useState({
    title: '',
    username: '',
    password: '',
    url: '',
    notes: ''
  });

  const fetchItems = async () => {
    const token = localStorage.getItem('authToken');
    const response = await fetch('/api/vault', {
      headers: { Authorization: `Bearer ${token}` }
    });
    const data = await response.json();
    setItems(data);
  };

  const openEdit = async (item: VaultItem) => {
    try {
      const decryptedPassword = await ClientEncryption.decrypt(item.encryptedPassword, userPassword);
      const decryptedNotes = item.encryptedNotes
        ? await ClientEncryption.decrypt(item.encryptedNotes, userPassword)
        : '';
      setEditingItem(item);
      setEditForm({
        title: item.title,
        username: item.username,
        password: decryptedPassword,
        url: item.url,
        notes: decryptedNotes,
      });
      setShowEditForm(true);
    } catch (e) {
      console.error('Failed to open edit form', e);
    }
  };

  const updateItem = async () => {
    if (!editingItem) return;
    try {
      const encryptedPassword = await ClientEncryption.encrypt(editForm.password, userPassword);
      const encryptedNotes = await ClientEncryption.encrypt(editForm.notes, userPassword);

      const token = localStorage.getItem('authToken');
      await fetch(`/api/vault/${editingItem._id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: editForm.title,
          username: editForm.username,
          url: editForm.url,
          encryptedPassword,
          encryptedNotes,
        }),
      });

      await fetchItems();
      setShowEditForm(false);
      setEditingItem(null);
    } catch (e) {
      console.error('Error updating item:', e);
    }
  };

  const deleteItem = async (item: VaultItem) => {
    const sure = window.confirm('Delete this item?');
    if (!sure) return;
    try {
      const token = localStorage.getItem('authToken');
      await fetch(`/api/vault/${item._id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      await fetchItems();
    } catch (e) {
      console.error('Error deleting item:', e);
    }
  };

  const addItem = async () => {
    try {
      const encryptedPassword = await ClientEncryption.encrypt(newItem.password, userPassword);
      const encryptedNotes = await ClientEncryption.encrypt(newItem.notes, userPassword);

      const token = localStorage.getItem('authToken');
      await fetch('/api/vault', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          title: newItem.title,
          username: newItem.username,
          encryptedPassword,
          url: newItem.url,
          encryptedNotes
        })
      });

      fetchItems();
      setShowAddForm(false);
      setNewItem({ title: '', username: '', password: '', url: '', notes: '' });
    } catch (error) {
      console.error('Error adding item:', error);
    }
  };

  const copyPassword = async (encryptedPassword: string) => {
    try {
      const decryptedPassword = await ClientEncryption.decrypt(encryptedPassword, userPassword);
      await navigator.clipboard.writeText(decryptedPassword);
      
      // Auto-clear clipboard after ~20 seconds when window is focused
      const clearClipboard = async () => {
        try {
          await navigator.clipboard.writeText('');
        } catch {
          // ignore permission/focus errors
        }
      };
      setTimeout(() => {
        if (document.hasFocus()) {
          void clearClipboard();
        } else {
          const onFocus = () => {
            void clearClipboard();
            window.removeEventListener('focus', onFocus);
          };
          window.addEventListener('focus', onFocus);
        }
      }, 20000);
    } catch (error) {
      console.error('Error copying password:', error);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const filteredItems = items.filter(item =>
    item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.url.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold">Password Vault</h2>
        <button
          onClick={() => setShowAddForm(true)}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-500 transition-colors"
        >
          Add Item
        </button>
      </div>

      <div className="mb-6">
        <input
          type="text"
          placeholder="Search vault items..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full p-3 rounded-lg bg-[var(--card)] border border-[var(--border)] placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      {showAddForm && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4">
          <div className="p-6 rounded-xl max-w-md w-full shadow-xl bg-[var(--card)] border border-[var(--border)]">
            <h3 className="text-lg font-semibold mb-4">Add New Item</h3>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Title"
                value={newItem.title}
                onChange={(e) => setNewItem({...newItem, title: e.target.value})}
                className="w-full p-2 rounded bg-[var(--card)] border border-[var(--border)] placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <input
                type="text"
                placeholder="Username"
                value={newItem.username}
                onChange={(e) => setNewItem({...newItem, username: e.target.value})}
                className="w-full p-2 rounded bg-[var(--card)] border border-[var(--border)] placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <input
                type="password"
                placeholder="Password"
                value={newItem.password}
                onChange={(e) => setNewItem({...newItem, password: e.target.value})}
                className="w-full p-2 rounded bg-[var(--card)] border border-[var(--border)] placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <input
                type="url"
                placeholder="URL"
                value={newItem.url}
                onChange={(e) => setNewItem({...newItem, url: e.target.value})}
                className="w-full p-2 rounded bg-[var(--card)] border border-[var(--border)] placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <textarea
                placeholder="Notes"
                value={newItem.notes}
                onChange={(e) => setNewItem({...newItem, notes: e.target.value})}
                className="w-full p-2 rounded bg-[var(--card)] border border-[var(--border)] placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <div className="flex space-x-2">
                  <button onClick={addItem} className="flex-1 bg-emerald-600 text-white py-2 rounded-lg hover:bg-emerald-500 transition-colors">
                  Save
                </button>
                <button onClick={() => setShowAddForm(false)} className="flex-1 bg-zinc-200 text-zinc-900 py-2 rounded-lg hover:bg-zinc-300 transition-colors dark:bg-zinc-800 dark:text-white dark:hover:bg-zinc-700">
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="grid gap-4">
        {filteredItems.map((item) => (
          <div key={item._id} className="p-4 rounded-xl shadow bg-[var(--card)] border border-[var(--border)]">
            <div className="flex justify-between items-start gap-4">
              <div className="flex-1 min-w-0">
                <h3 className="text-base font-medium">{item.title}</h3>
                <p className="text-[var(--muted)]">{item.username}</p>
                {item.url && (
                  <p className="text-indigo-600 text-sm">{item.url}</p>
                )}
              </div>
              <div className="flex shrink-0 gap-2">
                <button
                  onClick={() => copyPassword(item.encryptedPassword)}
                  className="bg-indigo-600 text-white px-3 py-1 rounded-lg text-sm hover:bg-indigo-500 transition-colors"
                >
                  Copy
                </button>
                <button
                  onClick={() => openEdit(item)}
                  className="bg-zinc-200 text-zinc-900 px-3 py-1 rounded-lg text-sm hover:bg-zinc-300 transition-colors dark:bg-zinc-800 dark:text-white dark:hover:bg-zinc-700"
                >
                  Edit
                </button>
                <button
                  onClick={() => deleteItem(item)}
                  className="bg-red-600 text-white px-3 py-1 rounded-lg text-sm hover:bg-red-500 transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {showEditForm && editingItem && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4">
          <div className="p-6 rounded-xl max-w-md w-full shadow-xl bg-[var(--card)] border border-[var(--border)]">
            <h3 className="text-lg font-semibold mb-4">Edit Item</h3>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Title"
                value={editForm.title}
                onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                className="w-full p-2 rounded bg-[var(--card)] border border-[var(--border)] placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <input
                type="text"
                placeholder="Username"
                value={editForm.username}
                onChange={(e) => setEditForm({ ...editForm, username: e.target.value })}
                className="w-full p-2 rounded bg-[var(--card)] border border-[var(--border)] placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <input
                type="password"
                placeholder="Password"
                value={editForm.password}
                onChange={(e) => setEditForm({ ...editForm, password: e.target.value })}
                className="w-full p-2 rounded bg-[var(--card)] border border-[var(--border)] placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <input
                type="url"
                placeholder="URL"
                value={editForm.url}
                onChange={(e) => setEditForm({ ...editForm, url: e.target.value })}
                className="w-full p-2 rounded bg-[var(--card)] border border-[var(--border)] placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <textarea
                placeholder="Notes"
                value={editForm.notes}
                onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
                className="w-full p-2 rounded bg-[var(--card)] border border-[var(--border)] placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <div className="flex space-x-2">
                <button onClick={updateItem} className="flex-1 bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-500 transition-colors">
                  Save
                </button>
                <button onClick={() => { setShowEditForm(false); setEditingItem(null); }} className="flex-1 bg-zinc-200 text-zinc-900 py-2 rounded-lg hover:bg-zinc-300 transition-colors dark:bg-zinc-800 dark:text-white dark:hover:bg-zinc-700">
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
