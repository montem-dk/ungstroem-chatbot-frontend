"use client";

import { useEffect, useState, useRef, forwardRef } from "react";
import Navbar from "@/components/Navbar";

interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  created_at?: string;
  uid: string;
}

export default function AdminPanel() {
  const [users, setUsers] = useState<User[]>([]);
  const [fetching, setFetching] = useState(true);
  const [open, setOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [banner, setBanner] = useState<{ type: "success" | "error"; msg: string } | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
  });

  const fetchUsers = async () => {
    setFetching(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/users`);
      const data = await res.json();
      setUsers(data.data ?? []);
    } catch (e) {
      setBanner({ type: "error", msg: "Failed to load users." });
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // close on ESC
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        setEditOpen(false);
        setDeleteOpen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setBanner(null);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok || data.status_code !== 200) {
        throw new Error(data?.error || "Failed to add user");
      }

      setBanner({ type: "success", msg: "User added successfully." });
      setOpen(false);
      setFormData({ name: "", email: "", password: "", phone: "" });
      fetchUsers();
    } catch (err: any) {
      setBanner({ type: "error", msg: err?.message ?? "Failed to add user." });
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditClick = async (id: string) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/user/${id}`);
      const data = await res.json();
      if (data.status_code === 200) {
        setFormData({
          name: data.data.name || "",
          email: data.data.email || "",
          password: "",
          phone: data.data.phone || "",
        });
        setSelectedUser(data.data);
        setEditOpen(true);
      }
    } catch (e) {
      setBanner({ type: "error", msg: "Failed to fetch user details." });
    }
  };

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;
    setSubmitting(true);
    setBanner(null);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/update_user?user_id=${selectedUser.uid}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({...formData }),
      });

      const data = await res.json();
      console.log(data);
      if (data.status_code !== 200) throw new Error(data.error || "Update failed");

      setBanner({ type: "success", msg: "User updated successfully." });
      setEditOpen(false);
      fetchUsers();
    } catch (err: any) {
      setBanner({ type: "error", msg: err?.message ?? "Failed to update user." });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!selectedUser) return;
    if (selectedUser.email === "zohaibmunir32@gmail.com") {
      setBanner({ type: "error", msg: "Admin account cannot be deleted." });
      setDeleteOpen(false);
      return;
    }

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/delete_user?user_id=${selectedUser.uid}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      const data = await res.json();
      if (data.status_code !== 200) throw new Error(data.error || "Failed to delete user");
      setBanner({ type: "success", msg: "User deleted successfully." });
      setDeleteOpen(false);
      fetchUsers();
    } catch (err: any) {
      setBanner({ type: "error", msg: err?.message ?? "Failed to delete user." });
    }
  };

  const dialogRef = useRef<HTMLDivElement>(null);
  const onBackdropClick = (e: React.MouseEvent) => {
    if (e.target === dialogRef.current) {
      setOpen(false);
      setEditOpen(false);
      setDeleteOpen(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f9fafb]">
      <Navbar />
      <main className="px-4 sm:px-6 lg:px-10 py-6">
        <div className="mx-auto max-w-7xl">
          <header className="flex items-center justify-between gap-3">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">Admin Panel</h1>
              <p className="text-sm text-gray-500">Manage users and roles</p>
            </div>
            <button
              onClick={() => setOpen(true)}
              className="inline-flex items-center gap-2 rounded-xl bg-[#153f68] px-4 py-2.5 text-white font-medium shadow-sm hover:opacity-95"
            >
              + Add User
            </button>
          </header>

          {banner && (
            <div
              className={`mt-4 rounded-xl border px-4 py-3 text-sm ${
                banner.type === "success"
                  ? "bg-green-50 text-green-800 border-green-200"
                  : "bg-red-50 text-red-700 border-red-200"
              }`}
            >
              {banner.msg}
            </div>
          )}

          <section className="mt-6 bg-white rounded-2xl shadow-sm border border-gray-100">
            <div className="overflow-x-auto">
              <table className="min-w-full text-left">
                <thead className="bg-gray-50 text-gray-600 text-xs uppercase tracking-wide">
                  <tr>
                    {["Name", "Email", "Phone", "Created At", "Role", "Actions"].map((h) => (
                      <th key={h} className="px-4 sm:px-6 py-3">{h}</th>
                    ))}
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-100 text-sm text-gray-800">
                  {fetching ? (
                    Array.from({ length: 6 }).map((_, i) => (
                      <tr key={i} className="animate-pulse">
                        {Array.from({ length: 6 }).map((__, j) => (
                          <td key={j} className="px-4 sm:px-6 py-4">
                            <div className="h-3 w-40 max-w-full rounded bg-gray-200" />
                          </td>
                        ))}
                      </tr>
                    ))
                  ) : users?.length ? (
                    users.map((u) => (
                      <tr key={u.id} className="hover:bg-gray-50/60">
                        <td className="px-4 sm:px-6 py-4 font-medium">{u.name}</td>
                        <td className="px-4 sm:px-6 py-4">{u.email}</td>
                        <td className="px-4 sm:px-6 py-4">{u.phone}</td>
                        <td className="px-4 sm:px-6 py-4">
                          {u.created_at ? new Date(u.created_at).toLocaleString() : "-"}
                        </td>
                        <td className="px-4 sm:px-6 py-4">{u.role || "—"}</td>
                        <td className="px-4 sm:px-6 py-4 flex gap-2">
                          <button
                            onClick={() => handleEditClick(u.uid)}
                            className="text-blue-600 hover:text-blue-800 text-sm"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => {
                              setSelectedUser(u);
                              setDeleteOpen(true);
                            }}
                            className={`text-red-600 hover:text-red-800 text-sm ${
                              u.email === "zohaibmunir32@gmail.com" ? "opacity-40 cursor-not-allowed" : ""
                            }`}
                            disabled={u.email === "zohaibmunir32@gmail.com"}
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="px-6 py-10 text-center text-gray-500">
                        No users found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      </main>

      {/* Add User Modal */}
      {open && (
        <Modal ref={dialogRef} onBackdropClick={onBackdropClick} title="Add User">
          <UserForm
            formData={formData}
            setFormData={setFormData}
            submitting={submitting}
            onSubmit={handleAddUser}
          />
        </Modal>
      )}

      {/* Edit User Modal */}
      {editOpen && (
        <Modal ref={dialogRef} onBackdropClick={onBackdropClick} title="Edit User">
          <UserForm
            formData={formData}
            setFormData={setFormData}
            submitting={submitting}
            onSubmit={handleUpdateUser}
          />
        </Modal>
      )}

      {/* Delete Confirmation */}
      {deleteOpen && selectedUser && (
        <div
          ref={dialogRef}
          onMouseDown={onBackdropClick}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
        >
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full text-center shadow-xl">
            <h3 className="text-lg font-semibold mb-3">Confirm Deletion</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete <b>{selectedUser.name}</b>?
            </p>
            <div className="flex justify-center gap-3">
              <button
                onClick={handleDeleteUser}
                className="bg-red-600 text-white rounded-lg px-4 py-2 hover:bg-red-700"
              >
                Delete
              </button>
              <button
                onClick={() => setDeleteOpen(false)}
                className="bg-gray-200 text-gray-800 rounded-lg px-4 py-2 hover:bg-gray-300"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Reusable modal wrapper
const Modal = forwardRef(({ children, title, onBackdropClick }: any, ref: any) => (
  <div
    ref={ref}
    onMouseDown={onBackdropClick}
    className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
  >
    <div className="w-full max-w-md rounded-2xl bg-white shadow-xl border border-gray-100 p-6 sm:p-7">
      <div className="flex items-start justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
      </div>
      {children}
    </div>
  </div>
));
Modal.displayName = "Modal";

// Reusable user form
const UserForm = ({ formData, setFormData, submitting, onSubmit }: any) => (
  <form onSubmit={onSubmit} className="mt-2 grid gap-4">
    <Input label="Name" value={formData.name} onChange={(v: string) => setFormData({ ...formData, name: v })} />
    <Input label="Email" type="email" value={formData.email} onChange={(v: string) => setFormData({ ...formData, email: v })} />
    <Input
      label="Password"
      type="password"
      value={formData.password}
      onChange={(v: string) => setFormData({ ...formData, password: v })}
    />
    <Input label="Phone" value={formData.phone} onChange={(v: string) => setFormData({ ...formData, phone: v })} />
    <button
      type="submit"
      disabled={submitting}
      className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#153f68] px-4 py-2.5 text-white font-semibold shadow-sm hover:opacity-95 focus:ring-4 focus:ring-[#153f68]/20"
    >
      {submitting ? "Saving..." : "Save"}
    </button>
  </form>
);

const Input = ({ label, value, onChange, type = "text" }: any) => (
  <div>
    <label className="block text-sm font-medium text-gray-700">{label}</label>
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="mt-1 w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-gray-900 placeholder:text-gray-400 focus:ring-4 focus:ring-[#153f68]/20 focus:border-[#153f68]"
    />
  </div>
);
