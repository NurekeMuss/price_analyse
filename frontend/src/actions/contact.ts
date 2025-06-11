"use server";

import { z } from "zod";
import nodemailer from "nodemailer";

// Form validation schema
const contactFormSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Please enter a valid email address"),
  subject: z.string().min(1, "Subject is required"),
  message: z.string().min(10, "Message must be at least 10 characters long"),
});

type ContactFormData = z.infer<typeof contactFormSchema>;

// Define the return type for consistency
type FormState = {
  success: boolean;
  message: string;
  errors?: Record<string, string>;
} | null;

export async function sendContactEmail(
  prevState: FormState,
  formData: FormData
): Promise<FormState> {
  try {
    // Extract form data
    const rawData = {
      firstName: formData.get("firstName") as string,
      lastName: formData.get("lastName") as string,
      email: formData.get("email") as string,
      subject: formData.get("subject") as string,
      message: formData.get("message") as string,
    };

    // Validate form data
    const validatedData = contactFormSchema.parse(rawData);

    // Create email transporter
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "helloworldnurik@gmail.com",
        pass: "yvih rvdx bggn cmup",
      },
    });

    // Get current date and time
    const currentDate = new Date().toLocaleString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      timeZoneName: "short",
    });

    // Enhanced email content with professional styling
    const mailOptions = {
      from: `"${validatedData.firstName} ${validatedData.lastName}" <${validatedData.email}>`,
      to: "helloworldnurik@gmail.com",
      subject: `🔔 New Contact Form: ${validatedData.subject}`,
      text: `
NEW CONTACT FORM SUBMISSION
==========================

📅 Date: ${currentDate}
👤 Name: ${validatedData.firstName} ${validatedData.lastName}
📧 Email: ${validatedData.email}
📝 Subject: ${validatedData.subject}

💬 Message:
${validatedData.message}

---
This message was sent from your PriceBot contact form.
You can reply directly to this email to respond to the sender.
      `,
      html: `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>New Contact Form Submission</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8fafc; line-height: 1.6;">
          <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
            
            <!-- Header -->
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px 40px; text-align: center;">
              <h1 style="margin: 0; font-size: 28px; font-weight: 700; letter-spacing: -0.5px;">
                🔔 New Contact Form Submission
              </h1>
              <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">
                Someone reached out through your PriceBot website
              </p>
            </div>

            <!-- Content -->
            <div style="padding: 40px;">
              
              <!-- Alert Banner -->
              <div style="background-color: #dbeafe; border-left: 4px solid #3b82f6; padding: 16px; margin-bottom: 30px; border-radius: 4px;">
                <p style="margin: 0; color: #1e40af; font-weight: 600;">
                  📬 You have a new message waiting for your response!
                </p>
              </div>

              <!-- Contact Information -->
              <div style="background-color: #f8fafc; padding: 25px; border-radius: 8px; margin-bottom: 30px;">
                <h2 style="margin: 0 0 20px 0; color: #1f2937; font-size: 20px; font-weight: 600; border-bottom: 2px solid #e5e7eb; padding-bottom: 10px;">
                  👤 Contact Information
                </h2>
                
                <table style="width: 100%; border-collapse: collapse;">
                  <tr>
                    <td style="padding: 8px 0; font-weight: 600; color: #374151; width: 100px;">
                      <span style="display: inline-block; width: 20px;">👤</span> Name:
                    </td>
                    <td style="padding: 8px 0; color: #1f2937; font-size: 16px;">
                      ${validatedData.firstName} ${validatedData.lastName}
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; font-weight: 600; color: #374151;">
                      <span style="display: inline-block; width: 20px;">📧</span> Email:
                    </td>
                    <td style="padding: 8px 0;">
                      <a href="mailto:${
                        validatedData.email
                      }" style="color: #3b82f6; text-decoration: none; font-weight: 500;">
                        ${validatedData.email}
                      </a>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; font-weight: 600; color: #374151;">
                      <span style="display: inline-block; width: 20px;">📝</span> Subject:
                    </td>
                    <td style="padding: 8px 0; color: #1f2937; font-weight: 500;">
                      ${validatedData.subject}
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; font-weight: 600; color: #374151;">
                      <span style="display: inline-block; width: 20px;">📅</span> Date:
                    </td>
                    <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">
                      ${currentDate}
                    </td>
                  </tr>
                </table>
              </div>

              <!-- Message Content -->
              <div style="margin-bottom: 30px;">
                <h2 style="margin: 0 0 15px 0; color: #1f2937; font-size: 20px; font-weight: 600; border-bottom: 2px solid #e5e7eb; padding-bottom: 10px;">
                  💬 Message
                </h2>
                <div style="background-color: #ffffff; border: 2px solid #e5e7eb; border-radius: 8px; padding: 20px; font-size: 16px; line-height: 1.7; color: #374151;">
                  ${validatedData.message.replace(/\n/g, "<br>")}
                </div>
              </div>

              <!-- Action Buttons -->
              <div style="text-align: center; margin: 30px 0;">
                <a href="mailto:${
                  validatedData.email
                }?subject=Re: ${encodeURIComponent(validatedData.subject)}" 
                   style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px; margin: 0 10px; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);">
                  📧 Reply to ${validatedData.firstName}
                </a>
              </div>

            </div>

            <!-- Footer -->
            <div style="background-color: #f8fafc; padding: 25px 40px; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0 0 10px 0; color: #6b7280; font-size: 14px;">
                This message was sent from your <strong>PriceBot</strong> contact form
              </p>
              <p style="margin: 0; color: #9ca3af; font-size: 12px;">
                You can reply directly to this email to respond to the sender
              </p>
              
              <!-- Quick Stats -->
              <div style="margin-top: 20px; padding-top: 15px; border-top: 1px solid #e5e7eb;">
                <p style="margin: 0; color: #6b7280; font-size: 12px;">
                  📊 <strong>Quick Stats:</strong> 
                  Message length: ${validatedData.message.length} characters | 
                  Response time matters for customer satisfaction
                </p>
              </div>
            </div>

          </div>

          <!-- Mobile Responsive Styles -->
          <style>
            @media only screen and (max-width: 600px) {
              .container {
                width: 100% !important;
                padding: 0 !important;
              }
              .content {
                padding: 20px !important;
              }
              .header {
                padding: 20px !important;
              }
              .button {
                display: block !important;
                width: 100% !important;
                margin: 10px 0 !important;
              }
            }
          </style>
        </body>
        </html>
      `,
    };

    // Send email
    await transporter.sendMail(mailOptions);

    return {
      success: true,
      message: "Your message has been sent successfully!",
    };
  } catch (error) {
    console.error("Error sending email:", error);

    if (error instanceof z.ZodError) {
      // Return validation errors
      return {
        success: false,
        message: "Please check your form inputs",
        errors: error.errors.reduce((acc, curr) => {
          const path = curr.path[0] as string;
          acc[path] = curr.message;
          return acc;
        }, {} as Record<string, string>),
      };
    }

    return {
      success: false,
      message: "Failed to send your message. Please try again later.",
    };
  }
}
