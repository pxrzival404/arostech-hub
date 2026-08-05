import fs from 'fs';
import path from 'path';
import { getDnsTxtRecord, writeHtmlVerificationFile } from '../../../../src/lib/seo/gsc-verify';

jest.mock('fs');

describe('GSC Verification Utility', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  describe('getDnsTxtRecord', () => {
    it('should generate DNS TXT record from parameter code', () => {
      const result = getDnsTxtRecord('xyz123');
      expect(result).toBe('google-site-verification=xyz123');
    });

    it('should fall back to process.env.GSC_VERIFICATION_CODE', () => {
      process.env.GSC_VERIFICATION_CODE = 'envXYZ123';
      const result = getDnsTxtRecord();
      expect(result).toBe('google-site-verification=envXYZ123');
    });

    it('should return null if no code is provided', () => {
      delete process.env.GSC_VERIFICATION_CODE;
      const result = getDnsTxtRecord();
      expect(result).toBeNull();
    });

    it('should return code as-is if it already has verification prefix', () => {
      const result = getDnsTxtRecord('google-site-verification=alreadyhasit');
      expect(result).toBe('google-site-verification=alreadyhasit');
    });
  });

  describe('writeHtmlVerificationFile', () => {
    const mockExistsSync = fs.existsSync as jest.Mock;
    const mockMkdirSync = fs.mkdirSync as jest.Mock;
    const mockWriteFileSync = fs.writeFileSync as jest.Mock;

    it('should create verification file in public directory', () => {
      mockExistsSync.mockReturnValue(true);
      
      const result = writeHtmlVerificationFile('abc987');
      
      expect(result).toContain(path.join('public', 'googleabc987.html'));
      expect(mockWriteFileSync).toHaveBeenCalledWith(
        expect.stringContaining('googleabc987.html'),
        'google-site-verification: googleabc987.html',
        'utf-8'
      );
    });

    it('should parse html extensions and google prefixes gracefully', () => {
      mockExistsSync.mockReturnValue(true);
      
      const result = writeHtmlVerificationFile('googleabc987.html');
      
      expect(result).toContain(path.join('public', 'googleabc987.html'));
      expect(mockWriteFileSync).toHaveBeenCalledWith(
        expect.stringContaining('googleabc987.html'),
        'google-site-verification: googleabc987.html',
        'utf-8'
      );
    });

    it('should create public directory if it does not exist', () => {
      mockExistsSync.mockReturnValue(false);
      
      writeHtmlVerificationFile('abc987');
      
      expect(mockMkdirSync).toHaveBeenCalledWith(expect.stringContaining('public'), { recursive: true });
      expect(mockWriteFileSync).toHaveBeenCalled();
    });

    it('should return null if no code is provided', () => {
      delete process.env.GSC_VERIFICATION_CODE;
      const result = writeHtmlVerificationFile();
      expect(result).toBeNull();
      expect(mockWriteFileSync).not.toHaveBeenCalled();
    });
  });
});
