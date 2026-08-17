import { supabase } from '../config/supabase.js';
import { successResponse } from '../utils/response.js';
import { getUserSupabase } from '../utils/supabaseUser.js';

// Cached capability check: the wallets table comes from migration 002. Until
// it is applied, the wallet endpoints answer 503 so the UI hides gracefully
// instead of erroring. Uses the shared anon client - only "does the table
// exist?" matters here, RLS would make the result empty, not error.
let walletCapable = null;
async function hasWalletTable() {
  if (walletCapable !== null) return walletCapable;
  const { error } = await supabase
    .from('wallets')
    .select('user_id')
    .limit(1);
  walletCapable = !error;
  return walletCapable;
}

// GET /api/wallet
// Returns the authenticated user's points balance + recent transactions.
// Users can only ever see their own wallet (RLS).
export const getMyWallet = async (req, res, next) => {
  try {
    if (!(await hasWalletTable())) {
      return res.status(503).json({
        success: false,
        message:
          'The FixKart wallet is not set up yet. Run backend/scripts/migrations/002_engagement.sql in the Supabase SQL editor.',
      });
    }

    const userId = req.user.id;
    const db = getUserSupabase(req);

    const { data: wallet, error: walletError } = await db
      .from('wallets')
      .select('points, lifetime_points, updated_at')
      .eq('user_id', userId)
      .maybeSingle();

    if (walletError) throw walletError;

    const { data: transactions, error: txError } = await db
      .from('wallet_transactions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(20);

    if (txError) throw txError;

    return successResponse(res, {
      wallet: wallet || { points: 0, lifetime_points: 0 },
      transactions: transactions || [],
    });
  } catch (err) {
    return next(err);
  }
};
