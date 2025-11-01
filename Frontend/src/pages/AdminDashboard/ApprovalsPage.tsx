import { useEffect, useState } from "react";
import axios from "axios";
import { message } from "antd";
import { Button } from "@/components/ui/button";

type Manager = {
  ID: number;
  Username: string | null;
  Email: string;
  Role: string;
  Status: number;
};

export default function ApprovalsPage() {
  const [items, setItems] = useState<Manager[]>([]);
  const [loading, setLoading] = useState(true);
  const [act, setAct] = useState<number | null>(null);
  const [msgApi, ctx] = message.useMessage();

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get("http://localhost:8787/admin/organizers/pending", { withCredentials: true });
      setItems(data?.users ?? []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const doAction = async (id: number, kind: "approve" | "reject") => {
    setAct(id);
    try {
      await axios.post(`http://localhost:8787/admin/organizers/${id}/${kind}`, {}, { withCredentials: true });
      msgApi.success(kind === "approve" ? "Approved" : "Rejected");
      setItems((prev) => prev.filter((u) => u.ID !== id));
    } catch {
      msgApi.error("Action failed");
    } finally {
      setAct(null);
    }
  };

  return (
    <div className="p-6">
      {ctx}
      <h1 className="mb-4 text-2xl font-semibold text-slate-900">Organizer Approvals</h1>
      <div className="mb-4 flex items-center gap-3">
        <Button onClick={load} disabled={loading}>{loading ? "Loading..." : "Refresh"}</Button>
      </div>
      <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-4 py-3">ID</th>
              <th className="px-4 py-3">Username</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 ? (
              <tr>
                <td className="px-4 py-6 text-slate-500" colSpan={5}>No pending organizer requests</td>
              </tr>
            ) : (
              items.map((u) => (
                <tr key={u.ID} className="border-t">
                  <td className="px-4 py-3">{u.ID}</td>
                  <td className="px-4 py-3">{u.Username ?? "-"}</td>
                  <td className="px-4 py-3">{u.Email}</td>
                  <td className="px-4 py-3">{u.Status}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <Button onClick={() => doAction(u.ID, "approve")} disabled={act === u.ID}>Approve</Button>
                      <Button variant="destructive" onClick={() => doAction(u.ID, "reject")} disabled={act === u.ID}>Reject</Button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
