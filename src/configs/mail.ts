import Env from "../core/extendeds/Env";

export default {

    /*
    |--------------------------------------------------------------------------
    | Mail Driver
    |--------------------------------------------------------------------------
    |
    | Currently only SMTP supported
    |
    */

    driver: Env.get<string>("MAIL_DRIVER","smtp")?.toLowerCase(),

    /*
    |--------------------------------------------------------------------------
    | Mail Host
    |--------------------------------------------------------------------------
    |
    | Mail server host URI
    |
    */

    host: Env.get<string>("MAIL_HOST","smtp.mailgun.org")?.trim(),

    /*
    |--------------------------------------------------------------------------
    | Mailing Port
    |--------------------------------------------------------------------------
    |
    | Mail server port
    |
    */

    port: Env.get<number>("MAIL_PORT",587),

    /*
    |--------------------------------------------------------------------------
    | Mail Server username
    |--------------------------------------------------------------------------
    |
    | username to access to mail server
    |
    */

    username: Env.get<string | null>("MAIL_USERNAME", null),

    /*
    |--------------------------------------------------------------------------
    | Mail Server Password
    |--------------------------------------------------------------------------
    |
    | password to access to mail server
    |
    */

    password: Env.get<string | null>("MAIL_PASSWORD", null),

    /*
    |--------------------------------------------------------------------------
    | Mailing encryption
    |--------------------------------------------------------------------------
    |
    | 
    |
    */

    encryption: Env.get<string | null>("MAIL_ENCRYPTION", null),

    /*
    |--------------------------------------------------------------------------
    | Mail From
    |--------------------------------------------------------------------------
    |
    | Mail sender email
    |
    */

    sender: Env.get<string | null>("MAIL_FROM_ADDRESS", 'fastifystartup@example.com'),

    /*
    |--------------------------------------------------------------------------
    | Mailer Name
    |--------------------------------------------------------------------------
    |
    | Mail sender name
    |
    */

    mailer: Env.get<string | null>("MAIL_FROM_NAME", 'FASTIFY'),
}