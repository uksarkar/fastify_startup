import { Transporter, createTransport } from 'nodemailer'
import SMTPTransport from 'nodemailer/lib/smtp-transport';
import Config from './Config'

export default class Mail {
    transport: Transporter;
    mailData?: MailData;
    constructor(options?: string | SMTPTransport | SMTPTransport.Options, mail?: MailData) {
        const op = Object.assign({
            // pool: Config.get("mail.pool",true),
            host: Config.get("mail.host", "smtp.mailgun.org"),
            port: Config.get("mail.port", 587),
            secure: Config.get("mail.tls", false),
            auth: {
                user: Config.get("mail.username", ''),
                pass: Config.get("mail.password", '')
            }
        }, options);
        console.log(op);
        // currently only smtp
        this.transport = createTransport(op);

        // init mail data
        this.mailData = mail;
    }

    send(): Promise<string | unknown> {
        return new Promise((resolve, reject) => {
            const data = this.getMialOptions();
            if (typeof data === 'string') return reject(data);

            this.transport.sendMail(data, (err, info) => {
                if (err) return reject(err);
                console.log(err, info);
                return resolve(info);
            });
        });
    }

    subject(sub: string): Omit<Mail, 'subject'> {
        this.mailData = {
            ...this.dumpMailData,
            subject: sub
        }
        return this;
    }

    text(text: string): Omit<Mail, 'text'> {
        this.mailData = {
            ...this.dumpMailData,
            text,
        }
        return this;
    }

    html(html: string): Omit<Mail, 'html'> {
        this.mailData = {
            ...this.dumpMailData,
            html,
        }
        return this;
    }

    cc(cc: string | string[]): Omit<Mail, 'cc'> {
        this.mailData = {
            ...this.dumpMailData,
            cc,
        }
        return this;
    }

    bcc(bcc: string | string[]): Omit<Mail, 'bcc'> {
        this.mailData = {
            ...this.dumpMailData,
            bcc,
        }
        return this;
    }

    attachments(attachments: any): Omit<Mail, 'attachments'> {
        this.mailData = {
            ...this.dumpMailData,
            attachments,
        }
        return this;
    }

    static to(to: string | string[]) {
        const from = Config.get('mail.sender', 'fs@example.com');
        const m = new this();
        const data: MailData = { subject: '', to, from };
        m.mailData = data;
        return m;
    }

    private get dumpMailData(): MailData {
        const from = Config.get('mail.sender', 'fs@example.com');
        return { ...this.mailData, subject: this.mailData?.subject || '', to: this.mailData?.to || '', from }
    }

    private getMialOptions(): string | object {
        if (this.mailData) {
            const to = this.toCommaString(this.mailData.to || '');
            if (!to) return "No Receiver!";
            const cc = this.toCommaString(this.mailData.cc || '') || null;
            const bcc = this.toCommaString(this.mailData.bcc || '') || null;
            if (this.mailData.text?.trim() == '' && this.mailData.html?.trim() == '') return "No Context!";
            return {
                to,
                cc,
                bcc,
                subject: this.mailData.subject,
                text: this.mailData.text,
                html: this.mailData.html,
                attachments: this.mailData.attachments,
                from: this.mailData.from,
            }
        }
        return "Mail data not found!";
    }

    private toCommaString(data: string | string[]): string | boolean {
        const d = Array.isArray(data) ? data.join() : data;
        return d == '' ? false : d;
    }
}

interface MailData {
    from: string;
    to: string | string[];
    cc?: string | string[];
    bcc?: string | string[];
    subject: string;
    text?: string;
    html?: string;
    attachments?: any;
}