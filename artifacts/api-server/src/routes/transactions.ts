import { Router, type IRouter } from "express";
import { db, walletsTable, transactionsTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";

const router: IRouter = Router();

router.post("/transactions", async (req, res) => {
  try {
    const { hash, type, fromAddress, toAddress, amount, status, networkId, walletAddress } =
      req.body as {
        hash?: string;
        type?: string;
        fromAddress?: string;
        toAddress?: string;
        amount?: string;
        status?: string;
        networkId?: string;
        walletAddress?: string;
      };

    if (!hash || !type || !fromAddress || !toAddress || !amount) {
      res.status(400).json({ error: "hash, type, fromAddress, toAddress, amount are required" });
      return;
    }

    const existing = await db
      .select()
      .from(transactionsTable)
      .where(eq(transactionsTable.hash, hash))
      .limit(1);

    if (existing.length > 0) {
      const [updated] = await db
        .update(transactionsTable)
        .set({ status: status ?? "pending" })
        .where(eq(transactionsTable.hash, hash))
        .returning();
      res.json({ transaction: updated, created: false });
      return;
    }

    let walletId: number | null = null;
    if (walletAddress) {
      const wallets = await db
        .select()
        .from(walletsTable)
        .where(eq(walletsTable.address, walletAddress.toLowerCase()))
        .limit(1);
      if (wallets.length > 0) {
        walletId = wallets[0]!.id;
      }
    }

    const [tx] = await db
      .insert(transactionsTable)
      .values({
        hash,
        type,
        fromAddress: fromAddress.toLowerCase(),
        toAddress: toAddress.toLowerCase(),
        amount,
        status: status ?? "pending",
        networkId: networkId ?? "mainnet",
        walletId,
      })
      .returning();

    res.status(201).json({ transaction: tx, created: true });
  } catch (err) {
    req.log.error({ err }, "Failed to sync transaction");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/transactions", async (req, res) => {
  try {
    const limit = Math.min(Number(req.query["limit"] ?? 50), 200);
    const offset = Number(req.query["offset"] ?? 0);

    const txs = await db
      .select()
      .from(transactionsTable)
      .orderBy(desc(transactionsTable.createdAt))
      .limit(limit)
      .offset(offset);

    res.json({ transactions: txs, count: txs.length });
  } catch (err) {
    req.log.error({ err }, "Failed to list transactions");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/wallets/:address/transactions", async (req, res) => {
  try {
    const { address } = req.params;
    const wallets = await db
      .select()
      .from(walletsTable)
      .where(eq(walletsTable.address, address.toLowerCase()))
      .limit(1);

    if (wallets.length === 0) {
      res.json({ transactions: [] });
      return;
    }

    const txs = await db
      .select()
      .from(transactionsTable)
      .where(eq(transactionsTable.walletId, wallets[0]!.id))
      .orderBy(desc(transactionsTable.createdAt))
      .limit(100);

    res.json({ transactions: txs });
  } catch (err) {
    req.log.error({ err }, "Failed to get wallet transactions");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
