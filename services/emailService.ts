import type { PendingUser } from '../types';

export interface EmailContent {
    to: string;
    subject: string;
    body: string;
}

/**
 * Generates the content for a welcome/approval email to a newly approved user.
 * This function is now synchronous and does not send an email. It just prepares the content.
 * @param user The user being approved.
 * @param password The temporary password created for the user.
 * @returns An object containing the email's to, subject, and body.
 */
export const generateApprovalEmailContent = (user: PendingUser, password: string): EmailContent => {
  const userName = user.type === 'student-group' ? user.groupName : user.managerName;
  const userEmail = user.email;

  const subject = 'Your Mammoth ReServe Account is Approved!';
  const body = `Hello ${userName},

Your request for the Mammoth ReServe app was accepted. You are now eligible to reserve food donations, and pick them up following the donor instructions.

Here is your contact information:

email: ${userEmail}
password: ${password}

We are pleased to help your food needs and our community!

Mammoth ReServe Team`;
  
  return {
    to: userEmail,
    subject,
    body,
  };
};