import { Router, type IRouter } from "express";
import { db, walletsTable, transactionsTable } from "@workspace/db";
import { count, sum, sql, desc } from "drizzle-orm";

const router: IRouter = Router();

router.get("/admin/stats", async (req, res) => {
  try {
    const [walletCount] = await db.select({ count: count() }).from(walletsTable);
    const [txCount] = await db.select({ count: count() }).from(transactionsTable);
    const [volumeResult] = await db
      .select({ total: sql<string>`COALESCE(SUM(CAST(${transactionsTable.amount} AS NUMERIC)), 0)` })
      .from(transactionsTable);

    const dailyTxs = await db
      .select({
        date: sql<string>`DATE(${transactionsTable.createdAt})`,
        count: count(),
        volume: sql<string>`COALESCE(SUM(CAST(${transactionsTable.amount} AS NUMERIC)), 0)`,
      })
      .from(transactionsTable)
      .groupBy(sql`DATE(${transactionsTable.createdAt})`)
      .orderBy(sql`DATE(${transactionsTable.createdAt})`)
      .limit(30);

    const recentWallets = await db
      .select()
      .from(walletsTable)
      .orderBy(desc(walletsTable.createdAt))
      .limit(5);

    const recentTxs = await db
      .select()
      .from(transactionsTable)
      .orderBy(desc(transactionsTable.createdAt))
      .limit(5);

    res.json({
      totalWallets: walletCount?.count ?? 0,
      totalTransactions: txCount?.count ?? 0,
      totalVolume: volumeResult?.total ?? "0",
      dailyTransactions: dailyTxs,
      recentWallets,
      recentTxs,
    });
  } catch (err) {
    req.log.error({ err }, "Failed to fetch admin stats");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
