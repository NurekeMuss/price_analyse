"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Mail,
  MapPin,
  Phone,
  Loader2,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { sendContactEmail } from "@/actions/contact";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

// Submit button with loading state
function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button className="w-full" type="submit" disabled={pending}>
      {pending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Sending...
        </>
      ) : (
        "Send Message"
      )}
    </Button>
  );
}

export default function ContactPage() {
  const [formState, formAction] = useActionState(sendContactEmail, null);
  const [showSuccess, setShowSuccess] = useState(false);

  // Show success message when form is successfully submitted
  useEffect(() => {
    if (formState?.success) {
      setShowSuccess(true);
    }
  }, [formState]);

  // Reset form to show the form again
  const resetForm = () => {
    setShowSuccess(false);
    // Reset form state by reloading or using a different approach
    window.location.reload();
  };

  return (
    <div className="container py-12 px-8">
      <div className="flex flex-col items-center text-center space-y-4 mb-12">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
          Contact Us
        </h1>
        <p className="text-muted-foreground max-w-[700px] md:text-xl/relaxed">
          Have questions or feedback? We'd love to hear from you.
        </p>
      </div>

      <div className="grid gap-8 md:grid-cols-2 lg:gap-12">
        <Card>
          <CardHeader>
            <CardTitle>Send us a message</CardTitle>
            <CardDescription>
              Fill out the form below and we'll get back to you as soon as
              possible.
            </CardDescription>
          </CardHeader>

          {showSuccess ? (
            <CardContent className="flex flex-col items-center justify-center py-10 text-center">
              <CheckCircle2 className="h-12 w-12 text-green-500 mb-4" />
              <h3 className="text-xl font-medium mb-2">Message Sent!</h3>
              <p className="text-muted-foreground mb-4">
                Thank you for reaching out. We'll get back to you as soon as
                possible.
              </p>
              <Button variant="outline" onClick={resetForm}>
                Send Another Message
              </Button>
            </CardContent>
          ) : (
            <form action={formAction}>
              <CardContent className="space-y-4">
                {formState?.success === false && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>{formState.message}</AlertDescription>
                  </Alert>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First name</Label>
                    <Input
                      id="firstName"
                      name="firstName"
                      placeholder="John"
                      aria-invalid={
                        formState?.errors?.firstName ? "true" : "false"
                      }
                    />
                    {formState?.errors?.firstName && (
                      <p className="text-sm text-destructive mt-1">
                        {formState.errors.firstName}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last name</Label>
                    <Input
                      id="lastName"
                      name="lastName"
                      placeholder="Doe"
                      aria-invalid={
                        formState?.errors?.lastName ? "true" : "false"
                      }
                    />
                    {formState?.errors?.lastName && (
                      <p className="text-sm text-destructive mt-1">
                        {formState.errors.lastName}
                      </p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="john@example.com"
                    aria-invalid={formState?.errors?.email ? "true" : "false"}
                  />
                  {formState?.errors?.email && (
                    <p className="text-sm text-destructive mt-1">
                      {formState.errors.email}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="subject">Subject</Label>
                  <Input
                    id="subject"
                    name="subject"
                    placeholder="How can we help you?"
                    aria-invalid={formState?.errors?.subject ? "true" : "false"}
                  />
                  {formState?.errors?.subject && (
                    <p className="text-sm text-destructive mt-1">
                      {formState.errors.subject}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="message">Message</Label>
                  <Textarea
                    id="message"
                    name="message"
                    placeholder="Please provide as much detail as possible..."
                    className="min-h-[120px]"
                    aria-invalid={formState?.errors?.message ? "true" : "false"}
                  />
                  {formState?.errors?.message && (
                    <p className="text-sm text-destructive mt-1">
                      {formState.errors.message}
                    </p>
                  )}
                </div>
              </CardContent>

              <CardFooter>
                <SubmitButton />
              </CardFooter>
            </form>
          )}
        </Card>

        <div className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
              <CardDescription>
                Here's how you can reach us directly
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start space-x-4">
                <Mail className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <h3 className="font-medium">Email</h3>
                  <p className="text-muted-foreground">support@pricebot.com</p>
                  <p className="text-muted-foreground">info@pricebot.com</p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <Phone className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <h3 className="font-medium">Phone</h3>
                  <p className="text-muted-foreground">+1 (555) 123-4567</p>
                  <p className="text-muted-foreground">Mon-Fri, 9am-5pm EST</p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <MapPin className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <h3 className="font-medium">Office</h3>
                  <p className="text-muted-foreground">123 Market Street</p>
                  <p className="text-muted-foreground">
                    San Francisco, CA 94105
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Frequently Asked Questions</CardTitle>
              <CardDescription>
                Quick answers to common questions
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-medium">
                  How does the pricing recommendation work?
                </h3>
                <p className="text-muted-foreground text-sm mt-1">
                  Our AI analyzes market data, competitor prices, and historical
                  trends to suggest optimal pricing for your products.
                </p>
              </div>

              <div>
                <h3 className="font-medium">
                  Can I integrate with my e-commerce platform?
                </h3>
                <p className="text-muted-foreground text-sm mt-1">
                  Yes, we offer integrations with major e-commerce platforms
                  including Shopify, WooCommerce, and Magento.
                </p>
              </div>

              <div>
                <h3 className="font-medium">
                  Is there a free trial available?
                </h3>
                <p className="text-muted-foreground text-sm mt-1">
                  Yes, we offer a 14-day free trial with full access to all
                  features. No credit card required.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
