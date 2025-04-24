import { useState } from "react";
import { useAuthActions } from "@convex-dev/auth/react";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { SignInFormValues, signInFormSchema } from "@/lib/schemas";

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
import { Separator } from "@/components/ui/separator";

export function AuthForm() {
  const { signIn } = useAuthActions();
  const [flow, setFlow] = useState<"signIn" | "signUp">("signIn");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<SignInFormValues>({
    resolver: zodResolver(signInFormSchema),
    defaultValues: {
      email: "",
      password: "",
      flow: "signIn",
    },
  });

  async function handleSubmit(values: SignInFormValues) {
    setIsSubmitting(true);

    // Update the flow value in the form data
    values.flow = flow;

    const formData = new FormData();
    formData.set("email", values.email);
    formData.set("password", values.password);
    formData.set("flow", flow);

    try {
      await signIn("password", formData);
    } catch (error) {
      const toastTitle =
        flow === "signIn"
          ? "Could not sign in, did you mean to sign up?"
          : "Could not sign up, did you mean to sign in?";
      toast.error(toastTitle, {
        description: `Please check your email and password and try again. ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  const onSubmit = form.handleSubmit((data) => {
    void handleSubmit(data);
  });

  const handleAnonymousSignIn = () => {
    void signIn("anonymous");
  };

  return (
    <Card className="max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl text-center">
          {flow === "signIn" ? "Sign In" : "Sign Up"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form
            // eslint-disable-next-line @typescript-eslint/no-misused-promises
            onSubmit={onSubmit}
            className="space-y-4"
          >
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter your email" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="Enter your password"
                      {...field}
                    />
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
              {flow === "signIn" ? "Sign In" : "Sign Up"}
            </Button>
          </form>
        </Form>

        <div className="mt-4 text-center text-sm text-muted-foreground">
          <span>
            {flow === "signIn"
              ? "Don't have an account? "
              : "Already have an account? "}
          </span>
          <button
            type="button"
            className="text-primary hover:underline cursor-pointer"
            onClick={() => setFlow(flow === "signIn" ? "signUp" : "signIn")}
          >
            {flow === "signIn" ? "Sign up instead" : "Sign in instead"}
          </button>
        </div>

        <div className="flex items-center my-4">
          <Separator className="flex-1" />
          <span className="mx-4 text-muted-foreground">or</span>
          <Separator className="flex-1" />
        </div>

        <Button
          className="w-full"
          variant="outline"
          onClick={handleAnonymousSignIn}
        >
          Sign in anonymously
        </Button>
      </CardContent>
    </Card>
  );
}
