import { Test, TestingModule } from '@nestjs/testing';
import { EncryptionService } from './EncryptionService';
import { ConfigService } from '@nestjs/config';

describe('ConversationService', () => {
  let service: EncryptionService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [EncryptionService, ConfigService],
    }).compile();

    service = module.get<EncryptionService>(EncryptionService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('decrypt(encrypt(data)) == data', () => {
    const data = "I like Paris. Let's go there sometime 😊";
    const encrypted = service.encrypt(data);
    console.log('Encrypted: ', encrypted);
    const decrypted = service.decrypt(encrypted);
    console.log('Decrypted: ', decrypted);
    expect(decrypted).toEqual(data);
  });
});
