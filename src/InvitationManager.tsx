import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import { toast } from "sonner";
import { WishList } from "./WishList";

export function InvitationManager() {
  const invitations = useQuery(api.invitations.list) ?? [];
  const incomingInvitations = useQuery(api.invitations.listIncoming) ?? [];
  const acceptedInvitations = useQuery(api.invitations.listAccepted) ?? [];
  const createInvitation = useMutation(api.invitations.create);
  const acceptInvitation = useMutation(api.invitations.accept);
  
  const [email, setEmail] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createInvitation({ email });
      setEmail("");
      toast.success("Invitation sent!");
    } catch (error) {
      toast.error("Failed to send invitation");
    }
  };

  return (
    <div className="space-y-8">
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-2xl font-semibold mb-4">Send Invitation</h2>
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter email address"
            className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            required
          />
          <button
            type="submit"
            className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
          >
            Send Invitation
          </button>
        </form>
      </div>

      {incomingInvitations.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-2xl font-semibold mb-4">Incoming Invitations</h2>
          <ul className="space-y-4">
            {incomingInvitations.map((invitation) => (
              <li
                key={invitation._id}
                className="flex items-center justify-between gap-4 p-4 bg-gray-50 rounded-lg"
              >
                <span>From: {invitation.fromUserEmail}</span>
                {invitation.status === "pending" && (
                  <button
                    onClick={async () => {
                      try {
                        await acceptInvitation({ fromUserId: invitation.fromUserId });
                        toast.success("Invitation accepted!");
                      } catch (error) {
                        toast.error("Failed to accept invitation");
                      }
                    }}
                    className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
                  >
                    Accept
                  </button>
                )}
                {invitation.status === "accepted" && (
                  <span className="text-green-600">Accepted</span>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}

      {acceptedInvitations.length > 0 && (
        <div className="space-y-6">
          <h2 className="text-2xl font-semibold">Shared Wishlists</h2>
          {acceptedInvitations.map((invitation) => (
            <WishList
              key={invitation._id}
              userId={invitation.fromUserId}
              ownerName={invitation.fromUserEmail}
            />
          ))}
        </div>
      )}

      {invitations.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-2xl font-semibold mb-4">Sent Invitations</h2>
          <ul className="space-y-4">
            {invitations.map((invitation) => (
              <li
                key={invitation._id}
                className="flex items-center justify-between gap-4 p-4 bg-gray-50 rounded-lg"
              >
                <span>To: {invitation.email}</span>
                <span
                  className={
                    invitation.status === "accepted"
                      ? "text-green-600"
                      : "text-yellow-600"
                  }
                >
                  {invitation.status === "accepted" ? "Accepted" : "Pending"}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
