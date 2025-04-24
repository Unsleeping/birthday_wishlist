import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { WishFormValues, wishFormSchema } from "@/lib/schemas";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button-simple";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function WishForm() {
  const addWish = useMutation(api.wishes.add);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<WishFormValues>({
    resolver: zodResolver(wishFormSchema),
    defaultValues: {
      description: "",
      link: "",
    },
  });

  async function handleSubmit(values: WishFormValues) {
    setIsSubmitting(true);
    try {
      await addWish(values);
      form.reset();
      toast.success("Wish added!");
    } catch (error) {
      toast.error("Failed to add wish", {
        description: `Please check your wish and try again. ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Card className="w-full mb-6">
      <CardHeader>
        <CardTitle className="text-lg">Add a new wish</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form
            // eslint-disable-next-line @typescript-eslint/no-misused-promises
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-4"
          >
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Input placeholder="What do you wish for?" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="link"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Link</FormLabel>
                  <FormControl>
                    <Input placeholder="Link to the item" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button
              type="submit"
              className="w-full"
              variant="default"
              disabled={isSubmitting}
            >
              Add Wish
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
