/**
 * Email Templates
 * Centralized email templates for all system notifications
 */

interface EmailTemplate {
  subject: string;
  html: string;
}

export const emailTemplates = {
  /**
   * Welcome email for new users
   */
  welcome: (data: { firstName: string; loginUrl: string }): EmailTemplate => ({
    subject: 'Velkommen til AK Golf IUP',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2c5530;">Velkommen, ${data.firstName}!</h2>
        <p>Din konto er nå opprettet i AK Golf IUP-plattformen.</p>
        <p>Du kan nå logge inn og begynne å bruke plattformen for å:</p>
        <ul style="line-height: 1.8;">
          <li>Følge din individuelle utviklingsplan (IUP)</li>
          <li>Registrere treningsøkter og tester</li>
          <li>Se din fremgang over tid</li>
          <li>Kommunisere med din trener</li>
        </ul>
        <div style="margin: 30px 0;">
          <a href="${data.loginUrl}"
             style="background: #2c5530; color: white; padding: 12px 24px;
                    text-decoration: none; border-radius: 5px; display: inline-block;">
            Logg inn nå
          </a>
        </div>
        <p style="color: #666; font-size: 14px; margin-top: 30px;">
          Lykke til med treningen!<br>
          Hilsen AK Golf Academy
        </p>
      </div>
    `,
  }),

  /**
   * 2FA enabled confirmation
   */
  twoFactorEnabled: (data: { firstName: string }): EmailTemplate => ({
    subject: 'Tofaktorautentisering aktivert',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2c5530;">🔒 Tofaktorautentisering aktivert</h2>
        <p>Hei ${data.firstName},</p>
        <p>Tofaktorautentisering (2FA) er nå aktivert på din konto.</p>
        <p>Fra nå av vil du bli bedt om å oppgi en 6-sifret kode fra din autentiseringsapp når du logger inn.</p>
        <p style="background: #f0fdf4; border-left: 4px solid #16a34a; padding: 15px; margin: 20px 0;">
          <strong>💡 Tips:</strong> Pass på å ta vare på backup-kodene dine. Du kan bruke dem hvis du mister tilgang til autentiseringsappen.
        </p>
        <p style="color: #666; font-size: 14px; margin-top: 30px;">
          Hvis du ikke aktiverte 2FA, vennligst kontakt support umiddelbart.
        </p>
      </div>
    `,
  }),

  /**
   * Badge earned notification
   */
  badgeEarned: (data: { firstName: string; badgeName: string; badgeDescription: string }): EmailTemplate => ({
    subject: `🏆 Gratulerer! Du har oppnådd: ${data.badgeName}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="text-align: center; padding: 30px 0;">
          <div style="font-size: 64px;">🏆</div>
          <h2 style="color: #2c5530; margin: 20px 0;">Gratulerer, ${data.firstName}!</h2>
        </div>
        <div style="background: #f0fdf4; border-radius: 8px; padding: 20px; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #2c5530;">Du har oppnådd:</h3>
          <p style="font-size: 18px; font-weight: bold; margin: 10px 0;">
            ${data.badgeName}
          </p>
          <p style="color: #666; margin: 10px 0;">
            ${data.badgeDescription}
          </p>
        </div>
        <p>Dette viser din utvikling og dedikasjon til treningen. Fortsett det gode arbeidet!</p>
        <p style="color: #666; font-size: 14px; margin-top: 30px;">
          Se alle dine badges i din profil.<br>
          Hilsen AK Golf Academy
        </p>
      </div>
    `,
  }),

  /**
   * Training plan notification
   */
  trainingPlanAssigned: (data: { firstName: string; planName: string; startDate: string; viewUrl: string }): EmailTemplate => ({
    subject: `Ny treningsplan: ${data.planName}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2c5530;">Ny treningsplan tildelt</h2>
        <p>Hei ${data.firstName},</p>
        <p>Din trener har opprettet en ny treningsplan for deg.</p>
        <div style="background: #f5f5f5; border-radius: 8px; padding: 20px; margin: 20px 0;">
          <p style="margin: 5px 0;"><strong>Plan:</strong> ${data.planName}</p>
          <p style="margin: 5px 0;"><strong>Starter:</strong> ${data.startDate}</p>
        </div>
        <div style="margin: 30px 0;">
          <a href="${data.viewUrl}"
             style="background: #2c5530; color: white; padding: 12px 24px;
                    text-decoration: none; border-radius: 5px; display: inline-block;">
            Se treningsplan
          </a>
        </div>
        <p style="color: #666; font-size: 14px; margin-top: 30px;">
          Lykke til med økten!
        </p>
      </div>
    `,
  }),

  /**
   * Tournament result notification
   */
  tournamentResult: (data: {
    firstName: string;
    tournamentName: string;
    score: number;
    position: number;
    viewUrl: string;
  }): EmailTemplate => ({
    subject: `Turneringsresultat: ${data.tournamentName}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2c5530;">Turneringsresultat registrert</h2>
        <p>Hei ${data.firstName},</p>
        <p>Ditt resultat fra ${data.tournamentName} er nå registrert.</p>
        <div style="background: #f5f5f5; border-radius: 8px; padding: 20px; margin: 20px 0;">
          <p style="margin: 5px 0;"><strong>Turnering:</strong> ${data.tournamentName}</p>
          <p style="margin: 5px 0;"><strong>Score:</strong> ${data.score}</p>
          <p style="margin: 5px 0;"><strong>Plassering:</strong> ${data.position}</p>
        </div>
        <div style="margin: 30px 0;">
          <a href="${data.viewUrl}"
             style="background: #2c5530; color: white; padding: 12px 24px;
                    text-decoration: none; border-radius: 5px; display: inline-block;">
            Se detaljert statistikk
          </a>
        </div>
      </div>
    `,
  }),

  /**
   * Coach message notification
   */
  coachMessage: (data: { firstName: string; coachName: string; subject: string; messagePreview: string; viewUrl: string }): EmailTemplate => ({
    subject: `Ny melding fra ${data.coachName}: ${data.subject}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2c5530;">Ny melding fra din trener</h2>
        <p>Hei ${data.firstName},</p>
        <p>Du har mottatt en ny melding fra ${data.coachName}.</p>
        <div style="background: #f5f5f5; border-radius: 8px; padding: 20px; margin: 20px 0;">
          <p style="margin: 5px 0 10px 0;"><strong>${data.subject}</strong></p>
          <p style="color: #666; margin: 0;">
            ${data.messagePreview}...
          </p>
        </div>
        <div style="margin: 30px 0;">
          <a href="${data.viewUrl}"
             style="background: #2c5530; color: white; padding: 12px 24px;
                    text-decoration: none; border-radius: 5px; display: inline-block;">
            Les melding
          </a>
        </div>
      </div>
    `,
  }),

  /**
   * Test reminder
   */
  testReminder: (data: { firstName: string; testName: string; dueDate: string; viewUrl: string }): EmailTemplate => ({
    subject: `Påminnelse: ${data.testName} forfaller snart`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2c5530;">📋 Påminnelse: Test forfaller snart</h2>
        <p>Hei ${data.firstName},</p>
        <p>Dette er en påminnelse om at følgende test forfaller snart:</p>
        <div style="background: #fff7ed; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0;">
          <p style="margin: 5px 0;"><strong>${data.testName}</strong></p>
          <p style="margin: 5px 0;">Forfaller: ${data.dueDate}</p>
        </div>
        <div style="margin: 30px 0;">
          <a href="${data.viewUrl}"
             style="background: #2c5530; color: white; padding: 12px 24px;
                    text-decoration: none; border-radius: 5px; display: inline-block;">
            Registrer test
          </a>
        </div>
      </div>
    `,
  }),

  /**
   * Password reset email
   */
  passwordReset: (data: { email: string; resetUrl: string }): EmailTemplate => ({
    subject: 'Tilbakestill passord - AK Golf IUP',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2c5530;">Tilbakestill passord</h2>
        <p>Hei,</p>
        <p>Du har bedt om å tilbakestille passordet ditt for AK Golf IUP.</p>
        <p>Klikk på lenken nedenfor for å tilbakestille passordet (gyldig i 1 time):</p>
        <div style="margin: 30px 0;">
          <a href="${data.resetUrl}"
             style="background: #2c5530; color: white; padding: 12px 24px;
                    text-decoration: none; border-radius: 5px; display: inline-block;">
            Tilbakestill passord
          </a>
        </div>
        <p>Eller kopier denne lenken til nettleseren:</p>
        <p style="background: #f5f5f5; padding: 10px; border-radius: 5px; word-break: break-all;">
          ${data.resetUrl}
        </p>
        <p style="color: #666; font-size: 14px; margin-top: 30px;">
          Hvis du ikke ba om dette, kan du trygt ignorere denne e-posten.
        </p>
      </div>
    `,
  }),
};
