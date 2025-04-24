import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import { toast } from "sonner";
import { Id } from "../convex/_generated/dataModel";

interface WishListProps {
  userId?: Id<"users">;
  ownerName?: string;
}

export function WishList({ userId, ownerName }: WishListProps) {
  const wishes = useQuery(api.wishes.list, { userId }) ?? [];
  const addWish = useMutation(api.wishes.add);
  const archiveWish = useMutation(api.wishes.archive);
  
  const [description, setDescription] = useState("");
  const [link, setLink] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addWish({ description, link });
      setDescription("");
      setLink("");
      toast.success("Wish added!");
    } catch (error) {
      toast.error("Failed to add wish");
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-2xl font-semibold mb-4">
        {ownerName ? `${ownerName}'s Wishlist` : "My Wishlist"}
      </h2>

      {!userId && (
        <form onSubmit={handleSubmit} className="mb-6 space-y-4">
          <div>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What do you wish for?"
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              required
            />
          </div>
          <div className="flex gap-2">
            <input
              type="url"
              value={link}
              onChange={(e) => setLink(e.target.value)}
              placeholder="Link to the item"
              className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              required
            />
            <button
              type="submit"
              className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
            >
              Add Wish
            </button>
          </div>
        </form>
      )}

      <ul className="space-y-4">
        {wishes.map((wish) => (
          <li
            key={wish._id}
            className="flex items-center justify-between gap-4 p-4 bg-gray-50 rounded-lg"
          >
            <div className="flex-1">
              <p>{wish.description}</p>
              <a
                href={wish.link}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-indigo-600 hover:text-indigo-800"
              >
                View Item →
              </a>
            </div>
            {!userId && (
              <button
                onClick={async () => {
                  try {
                    await archiveWish({ wishId: wish._id });
                    toast.success("Wish archived!");
                  } catch (error) {
                    toast.error("Failed to archive wish");
                  }
                }}
                className="text-gray-600 hover:text-gray-800"
              >
                Archive
              </button>
            )}
          </li>
        ))}
        {wishes.length === 0 && (
          <p className="text-gray-500 text-center py-4">No wishes yet</p>
        )}
      </ul>
    </div>
  );
}
