"use client";

import { useEffect, useState } from "react";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Badge } from "../../components/ui/Badge";

type Admin = {
  id: string;
  name: string;
  email: string;
  role: string;
  active: boolean;
};

export function UsersManager() {
  const [users, setUsers] = useState<Admin[]>([]);
  const [msg, setMsg] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "FARM",
  });
  const [permUser, setPermUser] = useState<Admin | null>(null);
  const [matrix, setMatrix] = useState<{
    resources: string[];
    actions: string[];
    grants: string[];
  } | null>(null);
  const [draft, setDraft] = useState<string[]>([]);

  async function load() {
    const res = await fetch("/api/admin/users");
    const data = await res.json();
    if (res.ok) setUsers(data.users);
    else setMsg(data.error ?? "Could not load admins.");
  }

  useEffect(() => {
    load();
  }, []);

  async function create(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    const res = await fetch("/api/admin/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    if (!res.ok) {
      setMsg(data.error ?? "Create failed.");
      return;
    }
    setForm({ name: "", email: "", password: "", role: "FARM" });
    setMsg(`Account created for ${data.email}.`);
    load();
  }

  async function toggleActive(u: Admin) {
    const res = await fetch("/api/admin/users", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: u.id, active: !u.active }),
    });
    const data = await res.json();
    if (!res.ok) setMsg(data.error ?? "Update failed.");
    load();
  }

  async function openPerms(u: Admin) {
    setPermUser(u);
    const res = await fetch(
      `/api/admin/permissions?userId=${encodeURIComponent(u.id)}`
    );
    const data = await res.json();
    if (res.ok) {
      setMatrix(data);
      setDraft(data.grants);
    }
  }

  async function savePerms() {
    if (!permUser) return;
    const res = await fetch("/api/admin/permissions", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: permUser.id, grants: draft }),
    });
    const data = await res.json();
    setMsg(res.ok ? "Permissions saved." : (data.error ?? "Save failed."));
  }

  const flip = (key: string) =>
    setDraft((d) =>
      d.includes(key) ? d.filter((g) => g !== key) : [...d, key]
    );

  return (
    <>
      <Card title="Create admin account">
        <form
          onSubmit={create}
          className="grid gap-3 sm:grid-cols-5 mt-2 items-end"
        >
          <label className="block">
            <span className="block text-sm font-semibold mb-1">Name</span>
            <input
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full border border-ash-400 rounded-[10px] px-3 py-3 outline-none focus:border-lemon-600"
            />
          </label>
          <label className="block">
            <span className="block text-sm font-semibold mb-1">Email</span>
            <input
              required
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full border border-ash-400 rounded-[10px] px-3 py-3 outline-none focus:border-lemon-600"
            />
          </label>
          <label className="block">
            <span className="block text-sm font-semibold mb-1">Password</span>
            <input
              required
              type="password"
              minLength={8}
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="w-full border border-ash-400 rounded-[10px] px-3 py-3 outline-none focus:border-lemon-600"
            />
          </label>
          <label className="block">
            <span className="block text-sm font-semibold mb-1">Role</span>
            <select
              value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value })}
              className="w-full border border-ash-400 rounded-[10px] px-3 py-3 bg-white"
            >
              <option value="FARM">Farm Admin</option>
              <option value="EATERY">Eatery Admin</option>
              <option value="STUDIO">Studio Admin</option>
              <option value="TOP">Top Admin</option>
            </select>
          </label>
          <Button>Create</Button>
        </form>
      </Card>

      <div className="grid gap-2 mt-4">
        {users.map((u) => (
          <div
            key={u.id}
            className="bg-white border border-ash-200 rounded-[10px] p-3 flex flex-wrap items-center gap-2"
          >
            <div>
              <p className="font-bold flex items-center gap-2">
                {u.name}
                {!u.active ? <Badge status="pending">Off</Badge> : null}
              </p>
              <p className="text-sm text-ash-600">
                {u.email} · {u.role}
              </p>
            </div>
            <div className="ml-auto flex gap-1">
              {u.role !== "TOP" ? (
                <Button size="sm" variant="outline" onClick={() => openPerms(u)}>
                  Permissions
                </Button>
              ) : null}
              <Button size="sm" variant="outline" onClick={() => toggleActive(u)}>
                {u.active ? "Deactivate" : "Activate"}
              </Button>
            </div>
          </div>
        ))}
      </div>

      {permUser && matrix ? (
        <Card title={`Permissions — ${permUser.name}`} className="mt-4">
          <div className="overflow-x-auto">
            <table className="text-sm mt-2">
              <thead>
                <tr>
                  <th className="text-left py-1 pr-3">Area</th>
                  {matrix.actions.map((a) => (
                    <th key={a} className="px-2 py-1 text-ash-600">
                      {a}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {matrix.resources.map((r) => (
                  <tr key={r} className="border-t border-ash-100">
                    <td className="py-1 pr-3 font-semibold">{r}</td>
                    {matrix.actions.map((a) => {
                      const key = `${r}:${a}`;
                      return (
                        <td key={a} className="px-2 py-1 text-center">
                          <input
                            type="checkbox"
                            checked={draft.includes(key)}
                            onChange={() => flip(key)}
                            className="w-4 h-4 accent-[#6B9E0E]"
                          />
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Button size="sm" className="mt-3" onClick={savePerms}>
            Save Permissions
          </Button>
        </Card>
      ) : null}
      {msg ? <p className="text-sm font-semibold mt-2">{msg}</p> : null}
    </>
  );
}
