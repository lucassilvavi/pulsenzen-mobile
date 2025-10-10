/**
 * Teste para verificar isolamento e persistência de avatares por usuário
 */
import { ProfileService } from './modules/profile/services/ProfileService';

async function testUserAvatarPersistence() {
  console.log('🧪 Testando isolamento e persistência de avatares por usuário...');

  const user1Id = 'user-123';
  const user2Id = 'user-456';
  const avatar1Uri = 'file://path/to/avatar1.jpg';
  const avatar2Uri = 'file://path/to/avatar2.jpg';
  const updatedAvatar1Uri = 'file://path/to/new-avatar1.jpg';

  try {
    // Salvar avatar para usuário 1
    console.log('💾 Salvando avatar para usuário 1...');
    await ProfileService.saveUserAvatar(avatar1Uri, user1Id);

    // Salvar avatar para usuário 2
    console.log('💾 Salvando avatar para usuário 2...');
    await ProfileService.saveUserAvatar(avatar2Uri, user2Id);

    // Verificar isolamento
    console.log('🔍 Verificando isolamento...');
    const retrievedAvatar1 = await ProfileService.getUserAvatar(user1Id);
    const retrievedAvatar2 = await ProfileService.getUserAvatar(user2Id);

    console.log('✅ Avatar usuário 1:', retrievedAvatar1);
    console.log('✅ Avatar usuário 2:', retrievedAvatar2);

    // Verificar que são diferentes
    if (retrievedAvatar1 === avatar1Uri && retrievedAvatar2 === avatar2Uri) {
      console.log('✅ Isolamento OK: Cada usuário tem seu avatar');
    } else {
      console.log('❌ Falha no isolamento');
      return;
    }

    // Simular "logout" - dados gerais são limpos, mas avatares persistem
    console.log('🚪 Simulando logout (avatares devem persistir)...');
    await ProfileService.clearUserData();

    // Verificar persistência após "logout"
    console.log('🔍 Verificando persistência pós-logout...');
    const persistentAvatar1 = await ProfileService.getUserAvatar(user1Id);
    const persistentAvatar2 = await ProfileService.getUserAvatar(user2Id);

    if (persistentAvatar1 === avatar1Uri && persistentAvatar2 === avatar2Uri) {
      console.log('✅ Persistência OK: Avatares mantidos após logout');
    } else {
      console.log('❌ Falha na persistência');
      return;
    }

    // Testar atualização de avatar existente
    console.log('🔄 Testando atualização de avatar...');
    await ProfileService.saveUserAvatar(updatedAvatar1Uri, user1Id);
    const updatedAvatar = await ProfileService.getUserAvatar(user1Id);

    if (updatedAvatar === updatedAvatar1Uri) {
      console.log('✅ Atualização OK: Avatar foi substituído');
    } else {
      console.log('❌ Falha na atualização');
      return;
    }

    // Mostrar todas as chaves de avatar armazenadas
    console.log('📋 Chaves de avatar armazenadas:');
    const avatarKeys = await ProfileService.getAllAvatarKeys();
    avatarKeys.forEach(key => console.log(`  - ${key}`));

    console.log('🎉 Todos os testes passaram!');

    // Limpar dados de teste (opcional)
    console.log('🧹 Limpando dados de teste...');
    await ProfileService.saveUserAvatar(null, user1Id);
    await ProfileService.saveUserAvatar(null, user2Id);

  } catch (error) {
    console.error('❌ Erro no teste:', error);
  }
}

// Descomente para testar:
// testUserAvatarPersistence();

export { testUserAvatarPersistence };