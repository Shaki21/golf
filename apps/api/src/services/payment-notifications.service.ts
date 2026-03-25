/**
 * Payment Notifications Service
 *
 * Handles email notifications for payment-related events
 *
 * Features:
 * - Payment successful notifications
 * - Payment failed alerts
 * - Trial ending reminders
 * - Subscription cancellation confirmations
 * - Subscription renewal notifications
 * - Plan change confirmations
 */

import { PrismaClient } from '@prisma/client';
import Stripe from 'stripe';

interface EmailTemplate {
  subject: string;
  html: string;
  text: string;
}

export class PaymentNotificationsService {
  constructor(private prisma: PrismaClient) {}

  /**
   * Send payment successful notification
   */
  async sendPaymentSuccessfulEmail(
    userEmail: string,
    userName: string,
    amount: number,
    currency: string,
    planType: string,
    invoiceUrl?: string
  ): Promise<void> {
    const template = this.getPaymentSuccessfulTemplate(
      userName,
      amount,
      currency,
      planType,
      invoiceUrl
    );

    await this.sendEmail(userEmail, template);
  }

  /**
   * Send payment failed notification
   */
  async sendPaymentFailedEmail(
    userEmail: string,
    userName: string,
    amount: number,
    currency: string,
    failureReason: string,
    retryDate?: Date
  ): Promise<void> {
    const template = this.getPaymentFailedTemplate(
      userName,
      amount,
      currency,
      failureReason,
      retryDate
    );

    await this.sendEmail(userEmail, template);
  }

  /**
   * Send trial ending reminder
   */
  async sendTrialEndingEmail(
    userEmail: string,
    userName: string,
    planType: string,
    trialEndDate: Date,
    daysRemaining: number
  ): Promise<void> {
    const template = this.getTrialEndingTemplate(
      userName,
      planType,
      trialEndDate,
      daysRemaining
    );

    await this.sendEmail(userEmail, template);
  }

  /**
   * Send subscription canceled notification
   */
  async sendSubscriptionCanceledEmail(
    userEmail: string,
    userName: string,
    planType: string,
    accessEndDate: Date
  ): Promise<void> {
    const template = this.getSubscriptionCanceledTemplate(userName, planType, accessEndDate);

    await this.sendEmail(userEmail, template);
  }

  /**
   * Send subscription renewed notification
   */
  async sendSubscriptionRenewedEmail(
    userEmail: string,
    userName: string,
    amount: number,
    currency: string,
    planType: string,
    nextBillingDate: Date,
    invoiceUrl?: string
  ): Promise<void> {
    const template = this.getSubscriptionRenewedTemplate(
      userName,
      amount,
      currency,
      planType,
      nextBillingDate,
      invoiceUrl
    );

    await this.sendEmail(userEmail, template);
  }

  /**
   * Send plan changed notification
   */
  async sendPlanChangedEmail(
    userEmail: string,
    userName: string,
    oldPlan: string,
    newPlan: string,
    effectiveDate: Date,
    proratedAmount?: number
  ): Promise<void> {
    const template = this.getPlanChangedTemplate(
      userName,
      oldPlan,
      newPlan,
      effectiveDate,
      proratedAmount
    );

    await this.sendEmail(userEmail, template);
  }

  /**
   * Payment Successful Template
   */
  private getPaymentSuccessfulTemplate(
    userName: string,
    amount: number,
    currency: string,
    planType: string,
    invoiceUrl?: string
  ): EmailTemplate {
    const formattedAmount = this.formatCurrency(amount, currency);

    return {
      subject: 'Payment Successful - IUP Master',
      html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
    <h1 style="color: white; margin: 0;">Payment Successful</h1>
  </div>

  <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
    <p style="font-size: 16px;">Hi ${userName},</p>

    <p style="font-size: 16px;">Thank you for your payment! We've successfully processed your payment for your ${planType} subscription.</p>

    <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #667eea;">
      <h3 style="margin-top: 0; color: #667eea;">Payment Details</h3>
      <p style="margin: 10px 0;"><strong>Amount Paid:</strong> ${formattedAmount}</p>
      <p style="margin: 10px 0;"><strong>Plan:</strong> ${planType}</p>
      <p style="margin: 10px 0;"><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
    </div>

    ${
      invoiceUrl
        ? `<p style="text-align: center; margin: 30px 0;">
      <a href="${invoiceUrl}" style="background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">Download Invoice</a>
    </p>`
        : ''
    }

    <p style="font-size: 16px;">If you have any questions, please don't hesitate to contact our support team.</p>

    <p style="font-size: 16px;">Best regards,<br>The IUP Master Team</p>
  </div>

  <div style="text-align: center; padding: 20px; color: #666; font-size: 12px;">
    <p>© ${new Date().getFullYear()} IUP Master. All rights reserved.</p>
  </div>
</body>
</html>`,
      text: `Hi ${userName},

Thank you for your payment! We've successfully processed your payment for your ${planType} subscription.

Payment Details:
- Amount Paid: ${formattedAmount}
- Plan: ${planType}
- Date: ${new Date().toLocaleDateString()}

${invoiceUrl ? `Download your invoice: ${invoiceUrl}` : ''}

If you have any questions, please don't hesitate to contact our support team.

Best regards,
The IUP Master Team`,
    };
  }

  /**
   * Payment Failed Template
   */
  private getPaymentFailedTemplate(
    userName: string,
    amount: number,
    currency: string,
    failureReason: string,
    retryDate?: Date
  ): EmailTemplate {
    const formattedAmount = this.formatCurrency(amount, currency);

    return {
      subject: 'Payment Failed - Action Required',
      html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
    <h1 style="color: white; margin: 0;">Payment Failed</h1>
  </div>

  <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
    <p style="font-size: 16px;">Hi ${userName},</p>

    <p style="font-size: 16px;">We were unable to process your payment for your subscription. Your subscription is still active, but action is required to prevent service interruption.</p>

    <div style="background: #fff3cd; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ffc107;">
      <h3 style="margin-top: 0; color: #856404;">Payment Details</h3>
      <p style="margin: 10px 0;"><strong>Amount Due:</strong> ${formattedAmount}</p>
      <p style="margin: 10px 0;"><strong>Reason:</strong> ${failureReason}</p>
      ${retryDate ? `<p style="margin: 10px 0;"><strong>Retry Date:</strong> ${retryDate.toLocaleDateString()}</p>` : ''}
    </div>

    <p style="text-align: center; margin: 30px 0;">
      <a href="${process.env.FRONTEND_URL}/billing" style="background: #f5576c; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">Update Payment Method</a>
    </p>

    <p style="font-size: 16px;">Please update your payment method as soon as possible to avoid any service interruption.</p>

    <p style="font-size: 16px;">If you have any questions, please contact our support team.</p>

    <p style="font-size: 16px;">Best regards,<br>The IUP Master Team</p>
  </div>

  <div style="text-align: center; padding: 20px; color: #666; font-size: 12px;">
    <p>© ${new Date().getFullYear()} IUP Master. All rights reserved.</p>
  </div>
</body>
</html>`,
      text: `Hi ${userName},

We were unable to process your payment for your subscription. Your subscription is still active, but action is required to prevent service interruption.

Payment Details:
- Amount Due: ${formattedAmount}
- Reason: ${failureReason}
${retryDate ? `- Retry Date: ${retryDate.toLocaleDateString()}` : ''}

Please update your payment method as soon as possible: ${process.env.FRONTEND_URL}/billing

If you have any questions, please contact our support team.

Best regards,
The IUP Master Team`,
    };
  }

  /**
   * Trial Ending Template
   */
  private getTrialEndingTemplate(
    userName: string,
    planType: string,
    trialEndDate: Date,
    daysRemaining: number
  ): EmailTemplate {
    return {
      subject: `Your ${planType} Trial Ends in ${daysRemaining} Days`,
      html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
    <h1 style="color: white; margin: 0;">Trial Ending Soon</h1>
  </div>

  <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
    <p style="font-size: 16px;">Hi ${userName},</p>

    <p style="font-size: 16px;">Your ${planType} trial period is ending soon. You have ${daysRemaining} day${daysRemaining !== 1 ? 's' : ''} remaining.</p>

    <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #667eea;">
      <h3 style="margin-top: 0; color: #667eea;">Trial Details</h3>
      <p style="margin: 10px 0;"><strong>Plan:</strong> ${planType}</p>
      <p style="margin: 10px 0;"><strong>Trial Ends:</strong> ${trialEndDate.toLocaleDateString()}</p>
      <p style="margin: 10px 0;"><strong>Days Remaining:</strong> ${daysRemaining}</p>
    </div>

    <p style="font-size: 16px;">After your trial ends, your subscription will automatically convert to a paid subscription and your payment method will be charged.</p>

    <p style="text-align: center; margin: 30px 0;">
      <a href="${process.env.FRONTEND_URL}/billing" style="background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 0 10px;">Manage Subscription</a>
    </p>

    <p style="font-size: 16px;">If you wish to cancel before your trial ends, you can do so at any time from your account settings.</p>

    <p style="font-size: 16px;">Best regards,<br>The IUP Master Team</p>
  </div>

  <div style="text-align: center; padding: 20px; color: #666; font-size: 12px;">
    <p>© ${new Date().getFullYear()} IUP Master. All rights reserved.</p>
  </div>
</body>
</html>`,
      text: `Hi ${userName},

Your ${planType} trial period is ending soon. You have ${daysRemaining} day${daysRemaining !== 1 ? 's' : ''} remaining.

Trial Details:
- Plan: ${planType}
- Trial Ends: ${trialEndDate.toLocaleDateString()}
- Days Remaining: ${daysRemaining}

After your trial ends, your subscription will automatically convert to a paid subscription and your payment method will be charged.

Manage your subscription: ${process.env.FRONTEND_URL}/billing

If you wish to cancel before your trial ends, you can do so at any time from your account settings.

Best regards,
The IUP Master Team`,
    };
  }

  /**
   * Subscription Canceled Template
   */
  private getSubscriptionCanceledTemplate(
    userName: string,
    planType: string,
    accessEndDate: Date
  ): EmailTemplate {
    return {
      subject: 'Your Subscription Has Been Canceled',
      html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
    <h1 style="color: white; margin: 0;">Subscription Canceled</h1>
  </div>

  <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
    <p style="font-size: 16px;">Hi ${userName},</p>

    <p style="font-size: 16px;">We're sorry to see you go. Your ${planType} subscription has been successfully canceled.</p>

    <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #667eea;">
      <h3 style="margin-top: 0; color: #667eea;">Cancellation Details</h3>
      <p style="margin: 10px 0;"><strong>Plan:</strong> ${planType}</p>
      <p style="margin: 10px 0;"><strong>Access Until:</strong> ${accessEndDate.toLocaleDateString()}</p>
    </div>

    <p style="font-size: 16px;">You'll continue to have access to all ${planType} features until ${accessEndDate.toLocaleDateString()}.</p>

    <p style="font-size: 16px;">You can reactivate your subscription at any time by visiting your account settings.</p>

    <p style="text-align: center; margin: 30px 0;">
      <a href="${process.env.FRONTEND_URL}/pricing" style="background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">Reactivate Subscription</a>
    </p>

    <p style="font-size: 16px;">We'd love to hear your feedback about why you canceled. Your input helps us improve our service.</p>

    <p style="font-size: 16px;">Best regards,<br>The IUP Master Team</p>
  </div>

  <div style="text-align: center; padding: 20px; color: #666; font-size: 12px;">
    <p>© ${new Date().getFullYear()} IUP Master. All rights reserved.</p>
  </div>
</body>
</html>`,
      text: `Hi ${userName},

We're sorry to see you go. Your ${planType} subscription has been successfully canceled.

Cancellation Details:
- Plan: ${planType}
- Access Until: ${accessEndDate.toLocaleDateString()}

You'll continue to have access to all ${planType} features until ${accessEndDate.toLocaleDateString()}.

You can reactivate your subscription at any time: ${process.env.FRONTEND_URL}/pricing

We'd love to hear your feedback about why you canceled. Your input helps us improve our service.

Best regards,
The IUP Master Team`,
    };
  }

  /**
   * Subscription Renewed Template
   */
  private getSubscriptionRenewedTemplate(
    userName: string,
    amount: number,
    currency: string,
    planType: string,
    nextBillingDate: Date,
    invoiceUrl?: string
  ): EmailTemplate {
    const formattedAmount = this.formatCurrency(amount, currency);

    return {
      subject: 'Subscription Renewed Successfully',
      html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
    <h1 style="color: white; margin: 0;">Subscription Renewed</h1>
  </div>

  <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
    <p style="font-size: 16px;">Hi ${userName},</p>

    <p style="font-size: 16px;">Your ${planType} subscription has been successfully renewed. Thank you for continuing with us!</p>

    <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #667eea;">
      <h3 style="margin-top: 0; color: #667eea;">Renewal Details</h3>
      <p style="margin: 10px 0;"><strong>Amount Charged:</strong> ${formattedAmount}</p>
      <p style="margin: 10px 0;"><strong>Plan:</strong> ${planType}</p>
      <p style="margin: 10px 0;"><strong>Next Billing Date:</strong> ${nextBillingDate.toLocaleDateString()}</p>
    </div>

    ${
      invoiceUrl
        ? `<p style="text-align: center; margin: 30px 0;">
      <a href="${invoiceUrl}" style="background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">Download Invoice</a>
    </p>`
        : ''
    }

    <p style="font-size: 16px;">If you have any questions, please don't hesitate to contact our support team.</p>

    <p style="font-size: 16px;">Best regards,<br>The IUP Master Team</p>
  </div>

  <div style="text-align: center; padding: 20px; color: #666; font-size: 12px;">
    <p>© ${new Date().getFullYear()} IUP Master. All rights reserved.</p>
  </div>
</body>
</html>`,
      text: `Hi ${userName},

Your ${planType} subscription has been successfully renewed. Thank you for continuing with us!

Renewal Details:
- Amount Charged: ${formattedAmount}
- Plan: ${planType}
- Next Billing Date: ${nextBillingDate.toLocaleDateString()}

${invoiceUrl ? `Download your invoice: ${invoiceUrl}` : ''}

If you have any questions, please don't hesitate to contact our support team.

Best regards,
The IUP Master Team`,
    };
  }

  /**
   * Plan Changed Template
   */
  private getPlanChangedTemplate(
    userName: string,
    oldPlan: string,
    newPlan: string,
    effectiveDate: Date,
    proratedAmount?: number
  ): EmailTemplate {
    const formattedProration = proratedAmount
      ? this.formatCurrency(proratedAmount, 'nok')
      : null;

    return {
      subject: 'Your Subscription Plan Has Changed',
      html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
    <h1 style="color: white; margin: 0;">Plan Changed</h1>
  </div>

  <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
    <p style="font-size: 16px;">Hi ${userName},</p>

    <p style="font-size: 16px;">Your subscription plan has been successfully changed.</p>

    <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #667eea;">
      <h3 style="margin-top: 0; color: #667eea;">Plan Change Details</h3>
      <p style="margin: 10px 0;"><strong>Previous Plan:</strong> ${oldPlan}</p>
      <p style="margin: 10px 0;"><strong>New Plan:</strong> ${newPlan}</p>
      <p style="margin: 10px 0;"><strong>Effective Date:</strong> ${effectiveDate.toLocaleDateString()}</p>
      ${formattedProration ? `<p style="margin: 10px 0;"><strong>Prorated Amount:</strong> ${formattedProration}</p>` : ''}
    </div>

    <p style="font-size: 16px;">Your new plan features are now available. You can view your updated subscription details in your account.</p>

    <p style="text-align: center; margin: 30px 0;">
      <a href="${process.env.FRONTEND_URL}/billing" style="background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">View Subscription</a>
    </p>

    <p style="font-size: 16px;">If you have any questions, please don't hesitate to contact our support team.</p>

    <p style="font-size: 16px;">Best regards,<br>The IUP Master Team</p>
  </div>

  <div style="text-align: center; padding: 20px; color: #666; font-size: 12px;">
    <p>© ${new Date().getFullYear()} IUP Master. All rights reserved.</p>
  </div>
</body>
</html>`,
      text: `Hi ${userName},

Your subscription plan has been successfully changed.

Plan Change Details:
- Previous Plan: ${oldPlan}
- New Plan: ${newPlan}
- Effective Date: ${effectiveDate.toLocaleDateString()}
${formattedProration ? `- Prorated Amount: ${formattedProration}` : ''}

Your new plan features are now available. View your subscription: ${process.env.FRONTEND_URL}/billing

If you have any questions, please don't hesitate to contact our support team.

Best regards,
The IUP Master Team`,
    };
  }

  /**
   * Send email (placeholder - integrate with your email service)
   */
  private async sendEmail(to: string, template: EmailTemplate): Promise<void> {
    // TODO: Integrate with your email service (SendGrid, AWS SES, etc.)
    console.log(`[Email] To: ${to}`);
    console.log(`[Email] Subject: ${template.subject}`);
    console.log(`[Email] HTML: ${template.html.substring(0, 100)}...`);
    console.log(`[Email] Text: ${template.text.substring(0, 100)}...`);

    // Example integration with SendGrid:
    /*
    const sgMail = require('@sendgrid/mail');
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);

    await sgMail.send({
      to,
      from: process.env.FROM_EMAIL,
      subject: template.subject,
      text: template.text,
      html: template.html,
    });
    */
  }

  /**
   * Format currency
   */
  private formatCurrency(amount: number, currency: string): string {
    return new Intl.NumberFormat('nb-NO', {
      style: 'currency',
      currency: currency.toUpperCase(),
    }).format(amount / 100);
  }
}
