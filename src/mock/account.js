/**
 * 账户 Demo 数据
 */

export const ACCOUNT_OVERVIEW = {
  points_balance: 800,
};

// 本地 Mock 登录签发的固定凭据；账号与用户名由登录入参回填。
export const MOCK_LOGIN = {
  access_token: "mock-access-token",
  user_id: 10001,
};

export const POINTS_INFO = {
  points_balance: 800,
  used_points: 120,
  items: [
    { ledger_id: 1003, created_at: "2026-11-09 18:24:10", delta: -30 },
    { ledger_id: 1002, created_at: "2026-11-08 10:02:41", delta: -90 },
    { ledger_id: 1001, created_at: "2026-11-06 09:15:00", delta: 920 },
  ],
};
