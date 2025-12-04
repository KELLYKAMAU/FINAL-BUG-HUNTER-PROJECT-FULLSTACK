import { verify } from "crypto";

export const mailTemplate = {
    welcome: (userName: string) => `

        <h1>Welcome, ${userName}!</h1><p>Thank you for registering.</p>
    `,

    verify: (code: string, first_name: string) => `
        <div>
            <h2>Email Verification</h2>
            <p>Hello ${first_name},</p>
            <p>Your verification code is:</p>
            <h3 style="color: blue;">${code}</h3>
            <p>Please enter this code to verify your email address.</p>
        </div>
    `, 
    
    verificationSuccess: (first_name: string) => `
        <div>
            <h2>Email Verified Successfully</h2>
            <p>Congratulations ${first_name}, your email has been verified!</p>
            <p>Thank you for joining us.</p>
        </div>
    `

};