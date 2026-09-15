import { db } from "./index";
import { companies, users } from "./schema";
import { eq } from "drizzle-orm";
import { hashPassword } from "@/lib/auth";

async function main() {
  const companyId = "seed-company-1";

  const existing = await db.select().from(companies).where(eq(companies.id, companyId));
  if (existing.length === 0) {
    await db.insert(companies).values({
      id: companyId,
      name: "Escritório Modelo Projexa",
      document: "00.000.000/0001-00",
    });
    console.log("Empresa de exemplo criada.");
  } else {
    console.log("Empresa de exemplo já existe, pulando.");
  }

  const existingUser = await db.select().from(users).where(eq(users.email, "admin@projexa.com.br"));
  if (existingUser.length === 0) {
    const passwordHash = await hashPassword("projexa123");
    await db.insert(users).values({
      id: "seed-user-1",
      name: "Administrador",
      email: "admin@projexa.com.br",
      passwordHash,
      role: "ADMIN",
      companyId,
    });
    console.log("Usuário admin de exemplo criado (senha: projexa123).");
  } else {
    console.log("Usuário admin já existe, pulando.");
  }

  process.exit(0);
}

main().catch((err) => {
  console.error("Erro ao rodar seed:", err);
  process.exit(1);
});
