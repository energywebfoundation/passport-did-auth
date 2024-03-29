/* eslint-disable @typescript-eslint/no-explicit-any */
import { SyncRedactor } from 'redact-pii';

const redactor = new SyncRedactor({
  customRedactors: {
    before: [
      {
        regexpPattern: /(?<=0x[a-f0-9-]{3})[a-f0-9-]+/gi,
        replaceWith: '***',
      },
    ],
  },
});

export class Logger {
  static error(message: any) {
    console.error(redactor.redact(message.toString()));
  }

  static warn(message: any) {
    console.warn(redactor.redact(message.toString()));
  }

  static info(message: any) {
    console.log(redactor.redact(message.toString()));
  }
}
