#!/usr/bin/env node
/**
 * 查 apimart 余额(单位 USD)
 *
 * Usage:
 *   node api/balance.js          # 查当前 token 用量 + 账户余额
 *   npm run balance
 */
import { getTokenBalance, getUserBalance } from './apimart.js';

try {
  const [token, user] = await Promise.all([getTokenBalance(), getUserBalance()]);

  console.log('💳 apimart 余额');
  console.log('─'.repeat(50));
  console.log(`当前 Token · used: $${token.used_balance.toFixed(4)}`);
  if (token.unlimited_quota) {
    console.log(`            · quota: unlimited ♾`);
  } else {
    console.log(`            · remain: $${token.remain_balance.toFixed(4)}`);
  }
  console.log('');
  console.log(`账户总余额  · used:   $${user.used_balance.toFixed(4)}`);
  console.log(`            · remain: $${user.remain_balance.toFixed(4)}`);

  // 按每张 $0.012 估算剩余张数(gpt-image-2 实测单价)
  const ESTIMATED_PRICE_PER_IMAGE = 0.012;
  if (user.remain_balance > 0) {
    const canGenerate = Math.floor(user.remain_balance / ESTIMATED_PRICE_PER_IMAGE);
    console.log('');
    console.log(`📊 按 gpt-image-2 实测 $${ESTIMATED_PRICE_PER_IMAGE}/张 · 还能生成约 ${canGenerate} 张图`);
  }
} catch (e) {
  console.error(`❌ ${e.message}`);
  process.exit(1);
}
