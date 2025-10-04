// Test file to verify CredentialGenerator methods exist
import { CredentialGenerator } from './credentialGenerator';

async function testAccountantMethods() {
  // Test that methods exist
  const hasGenerateId = typeof CredentialGenerator.generateUniqueAccountantId === 'function';
  const hasGenerateCredentials = typeof CredentialGenerator.generateAccountantCredentials === 'function';
  
  console.log('generateUniqueAccountantId exists:', hasGenerateId);
  console.log('generateAccountantCredentials exists:', hasGenerateCredentials);
  
  if (hasGenerateId && hasGenerateCredentials) {
    console.log('✓ Both accountant methods are properly defined');
  } else {
    console.log('✗ Methods are missing');
  }
}

testAccountantMethods();
