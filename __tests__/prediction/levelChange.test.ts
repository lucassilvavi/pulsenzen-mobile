import { handleLevelChange } from '../../modules/prediction/services/levelChange';

describe('handleLevelChange', () => {
  it('notifica quando nível muda', () => {
    const notifications: string[] = [];
    handleLevelChange('low','high', (msg)=>notifications.push(msg));
    expect(notifications).toHaveLength(1);
    expect(notifications[0]).toMatch(/low.*high/);
  });

  it('não notifica quando não há mudança', () => {
    const notifications: string[] = [];
    handleLevelChange('medium','medium', (msg)=>notifications.push(msg));
    expect(notifications).toHaveLength(0);
  });

  it('não notifica quando não havia nível anterior', () => {
    const notifications: string[] = [];
    handleLevelChange(undefined,'medium', (msg)=>notifications.push(msg));
    expect(notifications).toHaveLength(0);
  });
});
