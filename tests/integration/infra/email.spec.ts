import { beforeAll, describe, expect, test } from '@jest/globals';
import email from '~/infra/email';
import orchestrator from '~/../tests/orchestrator';

beforeAll(async () => {
  await orchestrator.waitForAllServices();
});

describe('infra/email.ts', () => {
  test('send()', async () => {
    await orchestrator.deleteAllEmails();

    await email.send({
      from: 'Gustavo <contato@gustavogonz.com.br>',
      to: 'contato@gustavogonz.com.br',
      subject: 'Teste de assunto',
      text: 'Teste de corpo.',
    });
    await email.send({
      from: 'Gustavo <contato@gustavogonz.com.br>',
      to: 'contato@gustavogonz.com.br',
      subject: 'Último email enviado',
      text: 'Corpo do último email.',
    });

    const lastEmail = await orchestrator.getLastEmail();

    expect(lastEmail.sender).toBe('<contato@gustavogonz.com.br>');
    expect(lastEmail.recipients[0]).toBe('<contato@gustavogonz.com.br>');
    expect(lastEmail.subject).toBe('Último email enviado');
    expect(lastEmail.text).toBe('Corpo do último email.\r\n');
  });
});
