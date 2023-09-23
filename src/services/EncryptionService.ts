import { Injectable } from '@nestjs/common';
import { ModeOfOperation } from 'aes-js';

@Injectable()
export class EncryptionService {
  /**
   * Turn data into buffer and add padding to the buffer with null character
   * until it has the length of multiple of 16.
   * @param data string in utf-8
   * @returns Buffer created from data which has the length of multiple of 16
   */
  private pad16(data: string): Buffer {
    const buffer = Buffer.from(data, 'utf-8');
    const paddedBufferContent = [...buffer];
    while (paddedBufferContent.length % 16 != 0) {
      paddedBufferContent.push(0);
    }
    return Buffer.from(paddedBufferContent);
  }

  /**
   * Encrypt data with AES
   * @param data String in utf-8
   * @returns encrypted data with hex encoding
   */
  encrypt(data: string): string {
    // Initialize iv and key and make sure they have the length of 16x
    if (!process.env.ENCRYPTION_KEY) {
      throw new Error("Missing 'ENCRYPTION_KEY' field in .env for AES encryption");
    }
    const seed = process.env.ENCRYPTION_KEY as string;
    const paddedSeedBuffer = this.pad16(seed.slice(0, 16));
    const iv = paddedSeedBuffer;
    const key = paddedSeedBuffer;

    // Pad data until its length is a multiple of 16 and turn it into buffer
    // since aes encryption only accept buffer with length of multiple of 16
    const textBytes = this.pad16(data);

    // Encrypt data
    const aesCbc = new ModeOfOperation.cbc(key, iv);
    const encryptedBytes = aesCbc.encrypt(textBytes);

    // Return encrypted data with hex encoding
    return Buffer.from(encryptedBytes).toString('hex');
  }

  /**
   * Decrypt data with AES
   * @param dataInHex Encrypted data with hex encoding
   * @returns Decrypted data
   */
  decrypt(dataInHex: string): string {
    if (!process.env.ENCRYPTION_KEY) {
      throw new Error("Missing 'ENCRYPTION_KEY' field in .env for AES encryption");
    }
    // Initialize iv and key and make sure they have the length of 16x
    const seed = process.env.ENCRYPTION_KEY as string;
    const paddedSeedBuffer = this.pad16(seed.slice(0, 16));
    const iv = paddedSeedBuffer;
    const key = paddedSeedBuffer;

    // Decrypt
    const aesCbc = new ModeOfOperation.cbc(key, iv);
    const decryptedBytes = aesCbc.decrypt(Buffer.from(dataInHex, 'hex'));

    // Convert our bytes back into text and remove all null characters
    const decryptedText = Buffer.from(decryptedBytes).toString('utf-8').replace(/\0/g, '');
    return decryptedText;
  }
}
